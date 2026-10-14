"use strict";

import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { findTaskById, setTaskCompleted, removeTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import {
  renderTaskList,
  renderSummary,
  renderEmptyState,
} from "./task-view.js";

const params = new URLSearchParams(window.location.search);
const useVariant = params.get("dataset") === "variant";
const initialTasks =
  useVariant && Array.isArray(variantTasks) && variantTasks.length
    ? variantTasks
    : demoTasks;

let currentTasks = initialTasks.map((task) => ({ ...task }));
let currentFilter = "all";

const listElement = document.querySelector("#task-list");
const summaryElement = document.querySelector("#task-summary");
const messageElement = document.querySelector("#empty-message");
const operationMsg = document.querySelector("#operation-message");
const filtersElement = document.querySelector("#task-filters");

function renderApp() {
  const visible = getVisibleTasks(currentTasks, currentFilter);

  renderTaskList(listElement, visible);
  renderSummary(summaryElement, currentTasks, visible.length);
  renderEmptyState(messageElement, currentTasks.length, visible.length);

  if (filtersElement) {
    filtersElement.querySelectorAll("button[data-filter]").forEach((btn) => {
      const isActive = btn.dataset.filter === currentFilter;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }
}

function restoreTaskFocus(id, action) {
  const card = listElement?.querySelector(`li[data-task-id="${id}"]`);
  if (card) {
    const btn = card.querySelector(`button[data-action="${action}"]`);
    if (btn) { btn.focus(); return; }
  }
  filtersElement
    ?.querySelector(`button[data-filter="${currentFilter}"]`)
    ?.focus();
}

function handleTaskListClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-action]");
  if (!button || !listElement.contains(button)) return;

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete") return;

  const card = button.closest("li[data-task-id]");
  if (!card) return;

  const raw = card.dataset.taskId;
  const id = Number(raw);

  if (!Number.isSafeInteger(id) || id <= 0) {
    operationMsg.textContent = `Некорректный идентификатор задачи: "${raw}"`;
    return;
  }

  const task = findTaskById(currentTasks, id);
  if (!task) {
    operationMsg.textContent = `Задача с идентификатором ${id} не найдена`;
    return;
  }

  const result =
    action === "toggle"
      ? setTaskCompleted(currentTasks, id, !task.completed)
      : removeTask(currentTasks, id);

  if (!result.ok) {
    operationMsg.textContent = result.error;
    return;
  }

  currentTasks = result.tasks;
  operationMsg.textContent = "";
  renderApp();
  restoreTaskFocus(id, action);
}

function handleFilterClick(event) {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-filter]");
  if (!button || !filtersElement.contains(button)) return;

  const filter = button.dataset.filter;
  if (filter !== "all" && filter !== "pending" && filter !== "completed") return;

  currentFilter = filter;
  operationMsg.textContent = "";
  renderApp();
}

listElement?.addEventListener("click", handleTaskListClick);
filtersElement?.addEventListener("click", handleFilterClick);

renderApp();

console.info(`Вариант: ${variantNumber}, источник: ${useVariant ? "variant" : "demo"}`);