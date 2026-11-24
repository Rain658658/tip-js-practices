"use strict";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const isEditing = editingId !== null && editingId !== undefined;
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // --- id ---
  let id;
  if (isEditing) {
    if (!Number.isSafeInteger(editingId) || editingId <= 0) {
      errors.id = "Идентификатор редактируемой задачи некорректен";
    } else if (!safeTasks.some((t) => t.id === editingId)) {
      errors.id = "Редактируемая задача не найдена в списке";
    } else {
      id = editingId;
    }
  } else {
    const rawId = draft?.id;
    let parsedId;
    if (typeof rawId === "number") {
      parsedId = rawId;
    } else if (typeof rawId === "string" && rawId.trim() !== "") {
      parsedId = Number(rawId);
    } else {
      parsedId = NaN;
    }
    if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
      errors.id = "Идентификатор должен быть положительным безопасным целым числом";
    } else if (safeTasks.some((t) => t.id === parsedId)) {
      errors.id = `Задача с id ${parsedId} уже существует`;
    } else {
      id = parsedId;
    }
  }

  // --- title ---
  const rawTitle = draft?.title;
  let title;
  if (typeof rawTitle !== "string") {
    errors.title = "Название должно быть строкой";
  } else {
    const cleaned = rawTitle.trim();
    if (cleaned.length < 1) {
      errors.title = "Название не может быть пустым";
    } else if (cleaned.length > 100) {
      errors.title = "Название должно содержать не более 100 символов";
    } else {
      title = cleaned;
    }
  }

  // --- priority ---
  const rawPriority = draft?.priority;
  if (!ALLOWED_PRIORITIES.has(rawPriority)) {
    errors.priority = "Приоритет должен быть low, medium или high";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { id, title, priority: rawPriority } };
}