"use strict";

function validateId(id) {
  if (typeof id !== "number") {
    return { ok: false, error: "Идентификатор должен быть числом" };
  }
  if (Number.isNaN(id) || !Number.isFinite(id)) {
    return { ok: false, error: "Идентификатор должен быть числом" };
  }
  if (!Number.isSafeInteger(id) || id <= 0) {
    return {
      ok: false,
      error: "Идентификатор должен быть положительным безопасным целым числом",
    };
  }
  return { ok: true };
}

function validateTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название должно быть строкой" };
  }
  const cleaned = title.trim();
  if (cleaned.length < 1 || cleaned.length > 100) {
    return {
      ok: false,
      error: "Название должно содержать от 1 до 100 символов",
    };
  }
  return { ok: true, title: cleaned };
}

function validatePriority(priority) {
  if (priority !== "low" && priority !== "medium" && priority !== "high") {
    return { ok: false, error: "Приоритет должен быть low, medium или high" };
  }
  return { ok: true };
}

export function createTask(id, title, priority = "medium") {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) return titleCheck;

  const priorityCheck = validatePriority(priority);
  if (!priorityCheck.ok) return priorityCheck;

  return {
    ok: true,
    task: {
      id,
      title: titleCheck.title,
      completed: false,
      priority,
    },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  let completed = 0;

  for (const task of tasks) {
    if (task.completed === true) {
      completed += 1;
    }
  }

  const pending = total - completed;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  if (tasks.some((task) => task.id === id)) {
    return { ok: false, error: `Задача с id ${id} уже существует` };
  }

  const created = createTask(id, title, priority);
  if (!created.ok) return created;

  return { ok: true, tasks: [...tasks, created.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  if (typeof completed !== "boolean") {
    return {
      ok: false,
      error: "Признак выполнения должен быть true или false",
    };
  }

  if (!tasks.some((task) => task.id === id)) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  const nextTasks = tasks.map((task) =>
    task.id === id ? { ...task, completed } : task
  );

  return { ok: true, tasks: nextTasks };
}

export function renameTask(tasks, id, title) {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) return titleCheck;

  if (!tasks.some((task) => task.id === id)) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  const nextTasks = tasks.map((task) =>
    task.id === id ? { ...task, title: titleCheck.title } : task
  );

  return { ok: true, tasks: nextTasks };
}

export function removeTask(tasks, id) {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  if (!tasks.some((task) => task.id === id)) {
    return { ok: false, error: `Задача с id ${id} не найдена` };
  }

  return {
    ok: true,
    tasks: tasks.filter((task) => task.id !== id),
  };
}