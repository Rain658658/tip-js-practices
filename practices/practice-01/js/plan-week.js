"use strict";

const totalTasks = 56;
const completedTasks = 6;
const dailyLimit = 5;

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
    console.log("Рабочих дней с задачами: 0");
    console.log("Календарных дней: 0");
  } else {
    console.log(`Осталось задач: ${remainingTasks}`);

    let calendarDay = 0;
    let workingDays = 0;

    while (remainingTasks > 0) {
      calendarDay += 1;

      // 1 — понедельник, ..., 7 — воскресенье
      const dayOfWeekIndex = (calendarDay - 1) % 7 + 1;

      let dayName = "";
      switch (dayOfWeekIndex) {
        case 1: dayName = "Понедельник"; break;
        case 2: dayName = "Вторник"; break;
        case 3: dayName = "Среда"; break;
        case 4: dayName = "Четверг"; break;
        case 5: dayName = "Пятница"; break;
        case 6: dayName = "Суббота"; break;
        case 7: dayName = "Воскресенье"; break;
      }

      const isWeekend = dayOfWeekIndex === 6 || dayOfWeekIndex === 7;

      if (isWeekend) {
        console.log(`День ${calendarDay} (${dayName}, выходной): выполнено 0, осталось ${remainingTasks}`);
      } else {
        const tasksToday = Math.min(dailyLimit, remainingTasks);
        remainingTasks -= tasksToday;
        workingDays += 1;

        console.log(`День ${calendarDay} (${dayName}, рабочий): выполнено ${tasksToday}, осталось ${remainingTasks}`);
      }
    }

    console.log(`Рабочих дней с задачами: ${workingDays}`);
    console.log(`Календарных дней: ${calendarDay}`);
  }
}
