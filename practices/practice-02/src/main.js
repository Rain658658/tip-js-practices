"use strict";

import { demoTasks, variantTasks, variantNumber } from "./data.js";
import {
  addTask,
  getPendingTasks,
  getTaskStats,
  getTaskTitles,
  removeTask,
  renameTask,
  setTaskCompleted,
} from "./task-service.js";
import { getPrioritySummary } from "./task-extra.js";

function printTasks(label, tasks) {
  console.log(`${label}:`);
  for (const { id, title, completed, priority } of tasks) {
    console.log(`  [${id}] ${title} | completed=${completed} | priority=${priority}`);
  }
}

function printStats(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`${label}: всего ${total}; выполнено ${completed}; осталось ${pending}`);
  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

function printPrioritySummary(label, tasks) {
  const summary = getPrioritySummary(tasks);
  console.log(`${label}:`);
  for (const priority of ["low", "medium", "high"]) {
    const { total, pending } = summary[priority];
    console.log(`  ${priority}: всего ${total}, осталось ${pending}`);
  }
}

console.log("=== Общий сценарий ===");
printTasks("Исходные задачи", demoTasks);
console.log("Названия:", getTaskTitles(demoTasks));
printTasks("Невыполненные", getPendingTasks(demoTasks));
printStats("Сводка", demoTasks);

let currentTasks = demoTasks;

const addResult = addTask(currentTasks, 20, "Добавить проверку", "high");
if (addResult.ok) {
  currentTasks = addResult.tasks;
  console.log("\nДобавлена задача id=20");
} else {
  console.error(`Ошибка: ${addResult.error}`);
}

const completeResult = setTaskCompleted(currentTasks, 4, true);
if (completeResult.ok) {
  currentTasks = completeResult.tasks;
  console.log("Задача id=4 отмечена выполненной");
} else {
  console.error(`Ошибка: ${completeResult.error}`);
}

const renameResult = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (renameResult.ok) {
  currentTasks = renameResult.tasks;
  console.log("Задача id=10 переименована");
} else {
  console.error(`Ошибка: ${renameResult.error}`);
}

const removeResult = removeTask(currentTasks, 7);
if (removeResult.ok) {
  currentTasks = removeResult.tasks;
  console.log("Задача id=7 удалена");
} else {
  console.error(`Ошибка: ${removeResult.error}`);
}

const duplicateResult = addTask(currentTasks, 20, "Дубликат", "low");
if (duplicateResult.ok) {
  currentTasks = duplicateResult.tasks;
} else {
  console.log(`\nОжидаемый отказ: ${duplicateResult.error}`);
}

console.log();
printTasks("Итоговые задачи", currentTasks);
printStats("Итоговая сводка", currentTasks);
console.log("Идентификаторы:", currentTasks.map((task) => task.id));

console.log("\nИсходный demoTasks не изменён:");
printTasks("demoTasks", demoTasks);

console.log(`\n=== Вариант ${variantNumber} ===`);
printTasks("Исходные задачи варианта", variantTasks);
printStats("Сводка варианта", variantTasks);

let variantCurrent = variantTasks;

const vAdd = addTask(variantCurrent, 80, "Провести финальную проверку интерфейса", "low");
if (vAdd.ok) {
  variantCurrent = vAdd.tasks;
  console.log("\nДобавлена задача id=80");
} else {
  console.error(`Ошибка: ${vAdd.error}`);
}

const vComplete = setTaskCompleted(variantCurrent, 11, true);
if (vComplete.ok) {
  variantCurrent = vComplete.tasks;
  console.log("Задача id=11 отмечена выполненной");
} else {
  console.error(`Ошибка: ${vComplete.error}`);
}

const vRename = renameTask(variantCurrent, 23, "Уточнить план учебного проекта");
if (vRename.ok) {
  variantCurrent = vRename.tasks;
  console.log("Задача id=23 переименована");
} else {
  console.error(`Ошибка: ${vRename.error}`);
}

const vRemove = removeTask(variantCurrent, 37);
if (vRemove.ok) {
  variantCurrent = vRemove.tasks;
  console.log("Задача id=37 удалена");
} else {
  console.error(`Ошибка: ${vRemove.error}`);
}

const vDuplicate = addTask(variantCurrent, 80, "Повтор", "low");
if (vDuplicate.ok) {
  variantCurrent = vDuplicate.tasks;
} else {
  console.log(`\nОжидаемый отказ: ${vDuplicate.error}`);
}

console.log();
printTasks("Итоговые задачи варианта", variantCurrent);
printStats("Итоговая сводка варианта", variantCurrent);
console.log("Идентификаторы:", variantCurrent.map((task) => task.id));

console.log("\nИсходный variantTasks не изменён:");
printTasks("variantTasks", variantTasks);

console.log("\n=== Сводка по приоритетам ===");
printPrioritySummary("demoTasks", demoTasks);
printPrioritySummary("variantTasks", variantTasks);