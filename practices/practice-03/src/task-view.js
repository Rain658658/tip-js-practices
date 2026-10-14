"use strict";

import { getTaskStats } from "./task-service.js";

const PRIORITY_LABELS = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-card";
    li.dataset.taskId = String(task.id);
    if (task.completed) li.classList.add("is-completed");

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const status = document.createElement("p");
    status.className = "task-status";
    status.textContent = task.completed ? "Выполнена" : "В работе";

    const priority = document.createElement("p");
    priority.className = "task-priority";
    priority.textContent = PRIORITY_LABELS[task.priority] ?? "—";

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.append(status, priority);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.dataset.action = "toggle";
    toggleBtn.setAttribute("aria-pressed", task.completed ? "true" : "false");
    const toggleLabel = document.createElement("span");
    toggleLabel.className = "action-label";
    toggleLabel.textContent = "Выполнена";
    toggleBtn.append(toggleLabel);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.dataset.action = "delete";
    const deleteLabel = document.createElement("span");
    deleteLabel.className = "action-label";
    deleteLabel.textContent = "Удалить";
    deleteBtn.append(deleteLabel);

    actions.append(toggleBtn, deleteBtn);
    li.append(title, status, priority, actions);
    return li;
}

export function renderTaskList(listElement, tasks) {
  if (!listElement) return;
  const cards = tasks.map(createTaskElement);
  listElement.replaceChildren(...cards);
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  if (!summaryElement) return;

  const stats = getTaskStats(tasks);

  const setText = (statName, value) => {
    const el = summaryElement.querySelector(`[data-stat="${statName}"]`);
    if (el) el.textContent = String(value);
  };

  setText("total", stats.total);
  setText("completed", stats.completed);
  setText("pending", stats.pending);
  setText("progress", `${stats.progress.toFixed(1)}%`);
  setText("visible", visibleCount);
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if (!messageElement) return;

  if (visibleCount > 0) {
    messageElement.textContent = "";
    messageElement.hidden = true;
    return;
  }

  if (total === 0) {
    messageElement.textContent = "Список задач пуст.";
  } else {
    messageElement.textContent = "Нет задач по выбранному фильтру.";
  }
  messageElement.hidden = false;
}