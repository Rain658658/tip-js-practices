"use strict";

import assert from "node:assert/strict";
import { demoTasks } from "./src/data.js";
import {
  addTask,
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskStats,
  getTaskTitles,
  removeTask,
  renameTask,
  setTaskCompleted,
} from "./src/task-service.js";

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`OK ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(`     ${error.message}`);
    failed += 1;
  }
}

function cloneTasks(tasks) {
  return tasks.map((task) => ({ ...task }));
}

runTest("createTask: успешное создание", () => {
  const result = createTask(20, "Новая задача", "high");
  assert.equal(result.ok, true);
  assert.deepEqual(result.task, {
    id: 20,
    title: "Новая задача",
    completed: false,
    priority: "high",
  });
});

runTest("createTask: приоритет по умолчанию", () => {
  const result = createTask(21, "Без приоритета");
  assert.equal(result.ok, true);
  assert.equal(result.task.priority, "medium");
});

runTest("createTask: приоритет undefined", () => {
  const result = createTask(21, "Приоритет undefined", undefined);
  assert.equal(result.ok, true);
  assert.equal(result.task.priority, "medium");
});

runTest("createTask: нормализация названия", () => {
  const result = createTask(22, "  Проверить  данные  ", "low");
  assert.equal(result.ok, true);
  assert.equal(result.task.title, "Проверить  данные");
});

runTest("createTask: название длиной 1", () => {
  const result = createTask(23, "A");
  assert.equal(result.ok, true);
  assert.equal(result.task.title.length, 1);
});

runTest("createTask: название длиной 100", () => {
  const result = createTask(24, "A".repeat(100));
  assert.equal(result.ok, true);
  assert.equal(result.task.title.length, 100);
});

runTest("createTask: пустое название отклонено", () => {
  const result = createTask(25, "");
  assert.equal(result.ok, false);
  assert.equal(typeof result.error, "string");
});

runTest("createTask: пробельное название отклонено", () => {
  const result = createTask(25, "   ");
  assert.equal(result.ok, false);
});

runTest("createTask: название 101 отклонено", () => {
  const result = createTask(26, "A".repeat(101));
  assert.equal(result.ok, false);
});

runTest("createTask: название типа number отклонено", () => {
  const result = createTask(27, 42);
  assert.equal(result.ok, false);
});

runTest("createTask: название null отклонено", () => {
  const result = createTask(27, null);
  assert.equal(result.ok, false);
});

runTest("createTask: название undefined отклонено", () => {
  const result = createTask(27, undefined);
  assert.equal(result.ok, false);
});

runTest("createTask: id 0 отклонён", () => {
  assert.equal(createTask(0, "T").ok, false);
});

runTest("createTask: id -1 отклонён", () => {
  assert.equal(createTask(-1, "T").ok, false);
});

runTest("createTask: id 1.5 отклонён", () => {
  assert.equal(createTask(1.5, "T").ok, false);
});

runTest("createTask: id строковый отклонён", () => {
  assert.equal(createTask("4", "T").ok, false);
});

runTest("createTask: id NaN отклонён", () => {
  assert.equal(createTask(NaN, "T").ok, false);
});

runTest("createTask: id Infinity отклонён", () => {
  assert.equal(createTask(Infinity, "T").ok, false);
});

runTest("createTask: id null отклонён", () => {
  assert.equal(createTask(null, "T").ok, false);
});

runTest("createTask: id undefined отклонён", () => {
  assert.equal(createTask(undefined, "T").ok, false);
});

runTest("createTask: id MAX_SAFE_INTEGER успех", () => {
  const result = createTask(Number.MAX_SAFE_INTEGER, "T");
  assert.equal(result.ok, true);
});

runTest("createTask: id MAX_SAFE_INTEGER + 1 отклонён", () => {
  const result = createTask(Number.MAX_SAFE_INTEGER + 1, "T");
  assert.equal(result.ok, false);
});

runTest("createTask: приоритет urgent отклонён", () => {
  assert.equal(createTask(30, "T", "urgent").ok, false);
});

runTest("createTask: приоритет HIGH отклонён", () => {
  assert.equal(createTask(30, "T", "HIGH").ok, false);
});

runTest("createTask: приоритет с пробелами отклонён", () => {
  assert.equal(createTask(30, "T", " high ").ok, false);
});

runTest("createTask: приоритет null отклонён", () => {
  assert.equal(createTask(30, "T", null).ok, false);
});

runTest("createTask: приоритет число отклонён", () => {
  assert.equal(createTask(30, "T", 1).ok, false);
});

runTest("createTask: два вызова дают разные объекты", () => {
  const a = createTask(31, "T").task;
  const b = createTask(31, "T").task;
  assert.deepEqual(a, b);
  assert.notEqual(a, b);
});

runTest("findTaskById: найден по id", () => {
  const task = findTaskById(demoTasks, 4);
  assert.ok(task);
  assert.equal(task.id, 4);
});

runTest("findTaskById: отсутствующий id", () => {
  assert.equal(findTaskById(demoTasks, 777), undefined);
});

runTest("findTaskById: строковый id не совпадает", () => {
  assert.equal(findTaskById(demoTasks, "4"), undefined);
});

runTest("findTaskById: пустой список", () => {
  assert.equal(findTaskById([], 4), undefined);
});

runTest("getPendingTasks: фильтрация demoTasks", () => {
  const pending = getPendingTasks(demoTasks);
  assert.deepEqual(
    pending.map((task) => task.id),
    [4, 7]
  );
});

runTest("getPendingTasks: пустой список", () => {
  assert.deepEqual(getPendingTasks([]), []);
});

runTest("getPendingTasks: всё выполнено", () => {
  const all = [
    { id: 1, title: "A", completed: true, priority: "low" },
    { id: 2, title: "B", completed: true, priority: "low" },
  ];
  assert.deepEqual(getPendingTasks(all), []);
});

runTest("getPendingTasks: ничего не выполнено", () => {
  const none = [
    { id: 1, title: "A", completed: false, priority: "low" },
    { id: 2, title: "B", completed: false, priority: "high" },
  ];
  const pending = getPendingTasks(none);
  assert.equal(pending.length, 2);
});

runTest("getTaskTitles: названия demoTasks", () => {
  assert.deepEqual(getTaskTitles(demoTasks), [
    "Изучить функции",
    "Подготовить модель задач",
    "Проверить методы массивов",
    "Оформить README",
  ]);
});

runTest("getTaskTitles: пустой список", () => {
  assert.deepEqual(getTaskTitles([]), []);
});

runTest("getTaskStats: общий набор", () => {
  assert.deepEqual(getTaskStats(demoTasks), {
    total: 4,
    completed: 2,
    pending: 2,
    progress: 50,
  });
});

runTest("getTaskStats: пустой список", () => {
  assert.deepEqual(getTaskStats([]), {
    total: 0,
    completed: 0,
    pending: 0,
    progress: 0,
  });
});

runTest("getTaskStats: ничего не выполнено", () => {
  const tasks = [
    { id: 1, title: "A", completed: false, priority: "low" },
    { id: 2, title: "B", completed: false, priority: "low" },
  ];
  const stats = getTaskStats(tasks);
  assert.equal(stats.progress, 0);
  assert.equal(stats.pending, 2);
});

runTest("getTaskStats: всё выполнено", () => {
  const tasks = [
    { id: 1, title: "A", completed: true, priority: "low" },
    { id: 2, title: "B", completed: true, priority: "low" },
  ];
  const stats = getTaskStats(tasks);
  assert.equal(stats.progress, 100);
  assert.equal(stats.pending, 0);
});

runTest("getTaskStats: три задачи, одна выполнена", () => {
  const tasks = [
    { id: 1, title: "A", completed: true, priority: "low" },
    { id: 2, title: "B", completed: false, priority: "low" },
    { id: 3, title: "C", completed: false, priority: "low" },
  ];
  const stats = getTaskStats(tasks);
  assert.ok(Math.abs(stats.progress - 33.3333333333) < 0.0001);
});

runTest("addTask: успешное добавление", () => {
  const original = cloneTasks(demoTasks);
  const result = addTask(demoTasks, 20, "Добавить проверку", "high");
  assert.equal(result.ok, true);
  assert.equal(result.tasks.length, 5);
  assert.equal(result.tasks[4].id, 20);
  assert.deepEqual(demoTasks, original);
});

runTest("addTask: добавление в пустой массив", () => {
  const result = addTask([], 1, "Первая задача");
  assert.equal(result.ok, true);
  assert.equal(result.tasks.length, 1);
});

runTest("addTask: дубликат id", () => {
  const result = addTask(demoTasks, 4, "Дубликат", "low");
  assert.equal(result.ok, false);
  assert.equal(typeof result.error, "string");
});

runTest("addTask: некорректный id", () => {
  assert.equal(addTask(demoTasks, "20", "T").ok, false);
  assert.equal(addTask(demoTasks, 0, "T").ok, false);
  assert.equal(addTask(demoTasks, -1, "T").ok, false);
});

runTest("addTask: некорректный title", () => {
  assert.equal(addTask(demoTasks, 20, 42).ok, false);
  assert.equal(addTask(demoTasks, 20, "   ").ok, false);
  assert.equal(addTask(demoTasks, 20, "A".repeat(101)).ok, false);
});

runTest("addTask: некорректный приоритет", () => {
  assert.equal(addTask(demoTasks, 20, "T", "urgent").ok, false);
});

runTest("setTaskCompleted: успешное изменение", () => {
  const original = cloneTasks(demoTasks);
  const result = setTaskCompleted(demoTasks, 4, true);
  assert.equal(result.ok, true);
  const updated = result.tasks.find((task) => task.id === 4);
  assert.equal(updated.completed, true);
  assert.deepEqual(demoTasks, original);
});

runTest("setTaskCompleted: изменяется только completed", () => {
  const result = setTaskCompleted(demoTasks, 4, true);
  const before = demoTasks.find((task) => task.id === 4);
  const after = result.tasks.find((task) => task.id === 4);
  assert.equal(after.title, before.title);
  assert.equal(after.priority, before.priority);
  assert.equal(after.id, before.id);
});

runTest("setTaskCompleted: неверный тип string", () => {
  assert.equal(setTaskCompleted(demoTasks, 4, "true").ok, false);
});

runTest("setTaskCompleted: неверный тип number", () => {
  assert.equal(setTaskCompleted(demoTasks, 4, 1).ok, false);
  assert.equal(setTaskCompleted(demoTasks, 4, 0).ok, false);
});

runTest("setTaskCompleted: неверный тип null", () => {
  assert.equal(setTaskCompleted(demoTasks, 4, null).ok, false);
});

runTest("setTaskCompleted: неверный тип undefined", () => {
  assert.equal(setTaskCompleted(demoTasks, 4, undefined).ok, false);
});

runTest("setTaskCompleted: отсутствующая задача", () => {
  assert.equal(setTaskCompleted(demoTasks, 777, true).ok, false);
});

runTest("setTaskCompleted: повторная установка — успех", () => {
  const result = setTaskCompleted(demoTasks, 1, true);
  assert.equal(result.ok, true);
  const updated = result.tasks.find((task) => task.id === 1);
  const original = demoTasks.find((task) => task.id === 1);
  assert.notEqual(updated, original);
});

runTest("renameTask: успешное переименование", () => {
  const original = cloneTasks(demoTasks);
  const result = renameTask(demoTasks, 10, "Подготовить инструкцию запуска");
  assert.equal(result.ok, true);
  const renamed = result.tasks.find((task) => task.id === 10);
  assert.equal(renamed.title, "Подготовить инструкцию запуска");
  assert.equal(renamed.completed, true);
  assert.equal(renamed.priority, "medium");
  assert.deepEqual(demoTasks, original);
});

runTest("renameTask: нормализация названия", () => {
  const result = renameTask(demoTasks, 10, "  Инструкция  запуска  ");
  const renamed = result.tasks.find((task) => task.id === 10);
  assert.equal(renamed.title, "Инструкция  запуска");
});

runTest("renameTask: некорректное название", () => {
  assert.equal(renameTask(demoTasks, 10, 42).ok, false);
  assert.equal(renameTask(demoTasks, 10, "   ").ok, false);
  assert.equal(renameTask(demoTasks, 10, "A".repeat(101)).ok, false);
});

runTest("renameTask: отсутствующая задача", () => {
  assert.equal(renameTask(demoTasks, 777, "T").ok, false);
});

runTest("renameTask: некорректный id", () => {
  assert.equal(renameTask(demoTasks, "10", "T").ok, false);
});

runTest("removeTask: успешное удаление", () => {
  const original = cloneTasks(demoTasks);
  const result = removeTask(demoTasks, 7);
  assert.equal(result.ok, true);
  assert.deepEqual(
    result.tasks.map((task) => task.id),
    [1, 4, 10]
  );
  assert.deepEqual(demoTasks, original);
});

runTest("removeTask: удаление единственной задачи", () => {
  const one = [{ id: 1, title: "A", completed: false, priority: "low" }];
  const result = removeTask(one, 1);
  assert.equal(result.ok, true);
  assert.deepEqual(result.tasks, []);
});

runTest("removeTask: отсутствующая задача", () => {
  assert.equal(removeTask(demoTasks, 777).ok, false);
});

runTest("removeTask: удаление из пустого массива", () => {
  assert.equal(removeTask([], 1).ok, false);
});

runTest("removeTask: некорректный id", () => {
  assert.equal(removeTask(demoTasks, "7").ok, false);
});

runTest("removeTask: порядок сохранён", () => {
  const result = removeTask(demoTasks, 4);
  assert.deepEqual(
    result.tasks.map((task) => task.id),
    [1, 7, 10]
  );
});

console.log();
console.log(`Пройдено: ${passed}`);
console.log(`Провалено: ${failed}`);

if (failed > 0) {
  process.exitCode = 1;
}