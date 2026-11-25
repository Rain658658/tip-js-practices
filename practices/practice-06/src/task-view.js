const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

export function createTaskElement(task, category) {
  const li = document.createElement("li");
  li.className = `task-card${task.completed ? " is-completed" : ""}`;
  li.dataset.taskId = String(task.id);

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = PRIORITY_LABELS[task.priority] ?? task.priority;

  const cat = document.createElement("span");
  cat.className = "task-category";
  cat.textContent = category?.name ?? "Без категории";

  meta.append(status, priority, cat);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const btnToggle = document.createElement("button");
  btnToggle.type = "button";
  btnToggle.dataset.action = "toggle";
  btnToggle.innerHTML = '<span class="action-label">Сменить статус</span>';

  const btnEdit = document.createElement("button");
  btnEdit.type = "button";
  btnEdit.dataset.action = "edit";
  btnEdit.innerHTML = '<span class="action-label">Изменить</span>';

  const btnDelete = document.createElement("button");
  btnDelete.type = "button";
  btnDelete.dataset.action = "delete";
  btnDelete.innerHTML = '<span class="action-label">Удалить</span>';

  actions.append(btnToggle, btnEdit, btnDelete);
  li.append(title, meta, actions);
  return li;
}

export function renderTaskList(list, tasks, categories) {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const cards = tasks.map((task) => createTaskElement(task, catMap.get(task.categoryId)));
  list.replaceChildren(...cards);
}