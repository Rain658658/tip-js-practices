"use strict";

export function getVisibleTasks(tasks, filter = "all") {
  if (!Array.isArray(tasks)) return [];

  switch (filter) {
    case "pending":
      return tasks.filter((t) => t.completed === false);
    case "completed":
      return tasks.filter((t) => t.completed === true);
    case "all":
    default:
      return tasks.slice();
  }
}