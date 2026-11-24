"use strict";

export const STORAGE_VERSION = 1;

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

function isValidTask(task) {
  if (typeof task !== "object" || task === null) return false;
  const { id, title, completed, priority } = task;
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) return false;
  if (typeof title !== "string") return false;
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 100) return false;
  if (title !== trimmed) return false; // нормализация при чтении не выполняется
  if (typeof completed !== "boolean") return false;
  if (!ALLOWED_PRIORITIES.has(priority)) return false;
  return true;
}

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const task of value) {
    if (!isValidTask(task)) return false;
    if (ids.has(task.id)) return false;
    ids.add(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallbackCopy = fallbackTasks.map((task) => ({ ...task }));

  try {
    const raw = storage.getItem(key);

    if (raw === null) {
      return { ok: true, source: "initial", tasks: fallbackCopy };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackCopy,
        error: "Не удалось разобрать сохранённые данные (повреждённый JSON).",
      };
    }

    if (typeof parsed !== "object" || parsed === null) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackCopy,
        error: "Некорректный формат сохранённых данных.",
      };
    }

    if (parsed.version !== STORAGE_VERSION) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackCopy,
        error: "Неизвестная версия сохранённых данных.",
      };
    }

    if (!isValidTaskList(parsed.tasks)) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackCopy,
        error: "Сохранённые задачи не соответствуют схеме.",
      };
    }

    return {
      ok: true,
      source: "storage",
      tasks: parsed.tasks.map((task) => ({ ...task })),
    };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: `Ошибка чтения хранилища: ${error.message}`,
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач некорректен и не был сохранён." };
  }

  try {
    storage.setItem(
      key,
      JSON.stringify({ version: STORAGE_VERSION, tasks })
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Не удалось сохранить данные: ${error.message}`,
    };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Не удалось удалить сохранённые данные: ${error.message}`,
    };
  }
}