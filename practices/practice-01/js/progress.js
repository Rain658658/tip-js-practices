"use strict";

const totalTasks = 12;
const completedTasks = 5;

let errorMessage = "";

if (typeof totalTasks !== "number" || typeof completedTasks !== "number") {
  errorMessage = "Ошибка: вместо числа передана строка.";
} else if (
  Number.isNaN(totalTasks) ||
  Number.isNaN(completedTasks) ||
  !Number.isFinite(totalTasks) ||
  !Number.isFinite(completedTasks)
) {
  errorMessage = "Ошибка: недопустимое числовое значение.";
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  errorMessage = "Ошибка: дробное количество.";
} else if (totalTasks < 0 || completedTasks < 0) {
  errorMessage = "Ошибка: отрицательное количество.";
} else if (totalTasks > 1000) {
  errorMessage = "Ошибка: превышена верхняя граница.";
} else if (completedTasks > totalTasks) {
  errorMessage = "Ошибка: выполнено больше, чем существует.";
}

if (errorMessage) {
  console.log(errorMessage);
} else if (totalTasks === 0 && completedTasks === 0) {
  console.log("Задач пока нет.");
} else {
  const remainingTasks = totalTasks - completedTasks;
  const progress = (completedTasks / totalTasks) * 100;

  let status;
  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  } else {
    status = "В работе";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${progress.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}