import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Клиент должен содержать метод requestJson");
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
        if (!isPositiveSafeInteger(value)) throw new TypeError("categoryId должен быть положительным целым числом");
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

  async function getTasks(filters = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", { query });

    if (!payload || !Array.isArray(payload.data)) {
      throw invalidResponse("Ожидался массив задач");
    }

    const tasks = payload.data;
    const seenIds = new Set();
    
    for (const t of tasks) {
      if (!isTask(t)) throw invalidResponse("Неверная схема задачи");
      if (seenIds.has(t.id)) throw invalidResponse("Дублирующийся id задачи");
      seenIds.add(t.id);
    }

    if (!payload.meta || payload.meta.total !== tasks.length) {
      throw invalidResponse("meta.total не совпадает с длиной коллекции");
    }

    return { tasks, meta: payload.meta };
  }

  async function getTaskById(id) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id должен быть положительным целым числом");
    }
    const payload = await client.requestJson(`/tasks/${id}`);
    
    if (!payload || !isTask(payload.data)) {
      throw invalidResponse("Неверная схема задачи");
    }
    return payload.data;
  }

  async function getCategories() {
    const payload = await client.requestJson("/categories");
    
    if (!payload || !Array.isArray(payload.data)) {
      throw invalidResponse("Ожидался массив категорий");
    }
    
    const categories = payload.data;
    const seenIds = new Set();
    
    for (const c of categories) {
      if (!isCategory(c)) throw invalidResponse("Неверная схема категории");
      if (seenIds.has(c.id)) throw invalidResponse("Дублирующийся id категории");
      seenIds.add(c.id);
    }

    if (!payload.meta || payload.meta.total !== categories.length) {
      throw invalidResponse("meta.total не совпадает с длиной коллекции");
    }

    return categories;
  }

  async function loadInitialData(filters = {}) {
    // Запускаем оба запроса до первого await
    const tasksPromise = getTasks(filters);
    const categoriesPromise = getCategories();
    
    // Ждем их параллельно
    const [tasksResult, categories] = await Promise.all([tasksPromise, categoriesPromise]);
    
    return {
      tasks: tasksResult.tasks,
      categories,
      meta: tasksResult.meta
    };
  }

  return { getTasks, getTaskById, getCategories, loadInitialData };
}