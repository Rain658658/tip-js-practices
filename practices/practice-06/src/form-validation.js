const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, categories) {
  const errors = {};
  let title = "";
  let priority = "";
  let categoryId = null;

  if (typeof draft.title !== "string" || draft.title.trim().length === 0 || draft.title.trim().length > 100) {
    errors.title = "Название должно быть от 1 до 100 символов.";
  } else {
    title = draft.title.trim();
  }

  if (!ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Выберите корректный приоритет.";
  } else {
    priority = draft.priority;
  }

  const parsedCategoryId = Number(draft.categoryId);
  if (!Number.isSafeInteger(parsedCategoryId) || parsedCategoryId <= 0) {
    errors.categoryId = "Выберите категорию.";
  } else if (!Array.isArray(categories) || !categories.some((c) => c.id === parsedCategoryId)) {
    errors.categoryId = "Выбранная категория не найдена.";
  } else {
    categoryId = parsedCategoryId;
  }

  const valid = Object.keys(errors).length === 0;
  return {
    valid,
    value: valid ? { title, priority, categoryId } : null,
    errors
  };
}