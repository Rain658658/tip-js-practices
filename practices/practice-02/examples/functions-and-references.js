"use strict";

function sum(a, b) {
  return a + b;
}

console.log("Эксперимент 1:");
console.log("sum(2, 3) =", sum(2, 3), "| тип:", typeof sum(2, 3));
console.log('sum("2", 3) =', sum("2", 3), "| тип:", typeof sum("2", 3));
console.log('sum("2", "3") =', sum("2", "3"), "| тип:", typeof sum("2", "3"));

const square = (value) => {
  return value * value;
};

console.log("\nЭксперимент 2:");
console.log("square(4) =", square(4), "| тип:", typeof square(4));

const original = { title: "Черновик", published: false };
const alias = original;
alias.published = true;

console.log("\nЭксперимент 3:");
console.log("original.published =", original.published);
console.log("alias.published =", alias.published);
console.log("original === alias:", original === alias);

const originalTasks = [
  { id: 1, title: "Первая" },
  { id: 2, title: "Вторая" },
];
const copiedTasks = [...originalTasks];
copiedTasks[0].title = "Изменённая";

console.log("\nЭксперимент 4:");
console.log("originalTasks[0].title =", originalTasks[0].title);
console.log("copiedTasks[0].title =", copiedTasks[0].title);
console.log("originalTasks === copiedTasks:", originalTasks === copiedTasks);
console.log("originalTasks[0] === copiedTasks[0]:", originalTasks[0] === copiedTasks[0]);

const oldBook = { id: 12, title: "Черновик", available: false };
const newBookFirst = { ...oldBook, available: true };
const newBookLast = { available: true, ...oldBook };

console.log("\nЭксперимент 5:");
console.log("oldBook.available =", oldBook.available);
console.log("newBookFirst.available =", newBookFirst.available);
console.log("newBookLast.available =", newBookLast.available);
console.log("oldBook === newBookFirst:", oldBook === newBookFirst);

function makeCaption(text = "Без названия") {
  return text;
}

console.log("\nЭксперимент 6:");
console.log("makeCaption() =", makeCaption());
console.log("makeCaption(undefined) =", makeCaption(undefined));
console.log("makeCaption(null) =", makeCaption(null));
console.log('makeCaption("") =', makeCaption(""));