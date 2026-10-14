import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "../src/task-service.js";
import { demoTasks } from "../src/data.js";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) { passed++; console.log(`✔ ${name}`); }
  else { failed++; console.log(`�’ ${name}`); }
}

const t1 = createTask(1, "Test", "high");
check("createTask ok", t1.ok === true && t1.task.id === 1);
check("createTask bad id", createTask(-1, "x").ok === false);
check("createTask bad title", createTask(1, "").ok === false);
check("createTask bad priority", createTask(1, "x", "urgent").ok === false);

check("findTaskById", findTaskById(demoTasks, 4)?.id === 4);
check("findTaskById absent", findTaskById(demoTasks, 999) === undefined);

check("getPendingTasks count", getPendingTasks(demoTasks).length === 2);
check("getTaskTitles count", getTaskTitles(demoTasks).length === 4);

const stats = getTaskStats(demoTasks);
check("stats.total", stats.total === 4);
check("stats.completed", stats.completed === 2);
check("stats.pending", stats.pending === 2);
check("stats.progress", Math.abs(stats.progress - 50) < 1e-9);

check("addTask ok", addTask(demoTasks, 99, "new").ok === true);
check("addTask duplicate", addTask(demoTasks, 4, "dup").ok === false);

const sc = setTaskCompleted(demoTasks, 4, true);
check("setTaskCompleted ok", sc.ok === true && sc.tasks.find((t) => t.id === 4).completed === true);
check("setTaskCompleted source unchanged", demoTasks.find((t) => t.id === 4).completed === false);
check("setTaskCompleted missing", setTaskCompleted(demoTasks, 999, true).ok === false);
check("setTaskCompleted non-bool", setTaskCompleted(demoTasks, 4, "yes").ok === false);

const rn = renameTask(demoTasks, 4, "  new title  ");
check("renameTask trims", rn.ok && rn.tasks.find((t) => t.id === 4).title === "new title");
check("renameTask missing", renameTask(demoTasks, 999, "x").ok === false);

const rm = removeTask(demoTasks, 4);
check("removeTask ok", rm.ok && rm.tasks.length === 3);
check("removeTask source unchanged", demoTasks.length === 4);
check("removeTask missing", removeTask(demoTasks, 999).ok === false);

console.log("");
console.log(`Всего: ${passed + failed}. Пройдено: ${passed}. Ошибок: ${failed}.`);
if (failed > 0) process.exitCode = 1;