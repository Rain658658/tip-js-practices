"use strict";

const totalTasks = 12;
const completedTasks = 5;
const dailyLimit = 3;

let errorMessage = "";

if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  errorMessage = "Ошибка: вместо числа передана строка.";
} else if (Number.isNaN(totalTasks) || Number.isNaN(completedTasks)) {
  errorMessage = "Ошибка: недопустимое числовое значение.";
} else if (!Number.isFinite(totalTasks) || !Number.isFinite(completedTasks)) {
  errorMessage = "Ошибка: недопустимое числовое значение.";
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  errorMessage = "Ошибка: дробное количество.";
} else if (totalTasks < 0 || completedTasks < 0) {
  errorMessage = "Ошибка: отрицательное количество.";
} else if (totalTasks > 1000) {
  errorMessage = "Ошибка: превышена верхняя граница.";
} else if (completedTasks > totalTasks) {
  errorMessage = "Ошибка: выполнено больше, чем существует.";
} else if (typeof dailyLimit !== "number") {
  errorMessage = "Ошибка: дневная норма задана строкой.";
} else if (Number.isNaN(dailyLimit) || !Number.isFinite(dailyLimit)) {
  errorMessage = "Ошибка: недопустимое числовое значение дневной нормы.";
} else if (!Number.isInteger(dailyLimit)) {
  errorMessage = "Ошибка: дробной дневной нормы быть не должно.";
} else if (dailyLimit < 1) {
  errorMessage = "Ошибка: дневная норма должна быть не меньше 1.";
} else if (dailyLimit > 1000) {
  errorMessage = "Ошибка: превышена верхняя граница нормы.";
}

if (errorMessage) {
  console.log(errorMessage);
} else {
  let remainingTasks = totalTasks - completedTasks;

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены.");
    console.log("Потребуется дней: 0");
  } else {
    console.log(`Осталось задач: ${remainingTasks}`);

    let day = 0;

    while (remainingTasks > 0) {
      day += 1;

      const tasksToday = Math.min(dailyLimit, remainingTasks);
      remainingTasks = remainingTasks - tasksToday;

      console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
    }

    console.log(`Потребуется дней: ${day}`);
  }
}