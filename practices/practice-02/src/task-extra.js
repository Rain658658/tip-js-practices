"use strict";

export function getPrioritySummary(tasks) {
  const summary = {
    low: { total: 0, pending: 0 },
    medium: { total: 0, pending: 0 },
    high: { total: 0, pending: 0 },
  };

  for (const task of tasks) {
    const bucket = summary[task.priority];
    if (bucket === undefined) {
      continue;
    }
    bucket.total += 1;
    if (task.completed === false) {
      bucket.pending += 1;
    }
  }

  return summary;
}