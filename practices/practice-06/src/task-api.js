import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1 && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId)
  );
}

export function isCategory(value) {
  return Boolean(
    value && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1 && value.name.trim().length <= 100
  );
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Клиент должен содержать requestJson");
  }

  function normalizeFilters(filters = {}) {
    if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
      throw new TypeError("Фильтры должны быть объектом");
    }
    const result = {};
    for (const [key, value] of Object.entries(filters)) {
      if (!ALLOWED_FILTERS.has(key)) throw new TypeError(`Неизвестный фильтр: ${key}`);
      if (key === "completed") {
        if (typeof value !== "boolean") throw new TypeError("completed должен быть boolean");
        result.completed = value;
      } else if (key === "priority") {
        if (!ALLOWED_PRIORITIES.has(value)) throw new TypeError("Неверный priority");
        result.priority = value;
      } else if (key === "categoryId") {
        if (!isPositiveSafeInteger(value)) throw new TypeError("categoryId должен быть > 0");
        result.categoryId = value;
      } else if (key === "q") {
        if (typeof value !== "string") throw new TypeError("q должен быть строкой");
        const trimmed = value.trim();
        if (trimmed.length > 100) throw new TypeError("q слишком длинный");
        if (trimmed.length > 0) result.q = trimmed;
      }
    }
    return result;
  }

  async function getTasks(filters = {}, { signal } = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { query, signal });

    if (!payload || !Array.isArray(payload.data)) throw invalidResponse("Ожидался массив задач");
    const tasks = payload.data;
    const seen = new Set();
    for (const t of tasks) {
      if (!isTask(t)) throw invalidResponse("Неверная схема задачи");
      if (seen.has(t.id)) throw invalidResponse("Дублирующийся id задачи");
      seen.add(t.id);
    }
    if (!payload.meta || payload.meta.total !== tasks.length) {
      throw invalidResponse("meta.total не совпадает");
    }
    return { tasks, meta: payload.meta };
  }

  async function getTaskById(id, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("id должен быть > 0");
    const payload = await client.requestJson(`/tasks/${id}`, { signal });
    if (!payload || !isTask(payload.data)) throw invalidResponse("Неверная схема задачи");
    return payload.data;
  }

  async function getCategories({ signal } = {}) {
    const payload = await client.requestJson("/categories", { signal });
    if (!payload || !Array.isArray(payload.data)) throw invalidResponse("Ожидался массив категорий");
    const categories = payload.data;
    const seen = new Set();
    for (const c of categories) {
      if (!isCategory(c)) throw invalidResponse("Неверная схема категории");
      if (seen.has(c.id)) throw invalidResponse("Дублирующийся id категории");
      seen.add(c.id);
    }
    if (!payload.meta || payload.meta.total !== categories.length) {
      throw invalidResponse("meta.total не совпадает");
    }
    return categories;
  }

  async function loadInitialData(filters = {}, options = {}) {
    const [tasksRes, categories] = await Promise.all([
      getTasks(filters, options),
      getCategories(options)
    ]);
    return { tasks: tasksRes.tasks, categories, meta: tasksRes.meta };
  }

  async function createTask(draft, { signal } = {}) {
    const payload = await client.requestJson("/tasks", { method: "POST", body: draft, signal });
    if (!payload || !isTask(payload.data)) throw invalidResponse("Неверная схема созданной задачи");
    return payload.data;
  }

  async function updateTask(id, changes, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("id должен быть > 0");
    const payload = await client.requestJson(`/tasks/${id}`, { method: "PATCH", body: changes, signal });
    if (!payload || !isTask(payload.data)) throw invalidResponse("Неверная схема обновлённой задачи");
    return payload.data;
  }

  async function setTaskCompleted(id, completed, { signal } = {}) {
    if (typeof completed !== "boolean") throw new TypeError("completed должен быть boolean");
    return updateTask(id, { completed }, { signal });
  }

  async function deleteTask(id, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) throw new TypeError("id должен быть > 0");
    const response = await client.requestJson(`/tasks/${id}`, { method: "DELETE", signal });
    if (response !== null) throw invalidResponse("Ожидался пустой ответ 204 при удалении");
    return null;
  }

  async function resetDemoData({ signal } = {}) {
    const payload = await client.requestJson("/debug/reset", { method: "POST", signal });
    return payload.data;
  }

  return { getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask, setTaskCompleted, deleteTask, resetDemoData };
}