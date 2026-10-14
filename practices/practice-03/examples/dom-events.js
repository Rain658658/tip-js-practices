"use strict";

const log = (...args) => console.log("[exp]", ...args);

/* ===== 1. Отсутствующий элемент и пустая коллекция ===== */
document.querySelector("#run-missing")?.addEventListener("click", () => {
  const missing = document.querySelector("#missing-element");
  const empty = document.querySelectorAll(".missing-class");
  log("missing:", missing);
  log("empty.length:", empty.length);
  try {
    missing.textContent = "test";
  } catch (err) {
    log("Ошибка при обращении к null:", err.message);
  }
});

/* ===== 2. dataset.taskId ===== */
document.querySelector("#dataset-btn")?.addEventListener("click", (event) => {
  const raw = event.currentTarget.dataset.taskId;
  log("dataset.taskId →", raw, "typeof:", typeof raw);
  const num = Number(raw);
  log("Number(raw) →", num, "typeof:", typeof num);
});

/* ===== 3. Статическая NodeList и повторный запрос ===== */
const initialItems = document.querySelectorAll("#items li");
log("Сохранённая initialItems.length:", initialItems.length);

document.querySelector("#add-item")?.addEventListener("click", () => {
  const ul = document.querySelector("#items");
  if (!ul) return;
  const li = document.createElement("li");
  li.textContent = `Элемент ${ul.children.length + 1}`;
  ul.append(li);
  log(
    "Сохранённая initialItems.length:",
    initialItems.length,
    "| новый querySelectorAll:",
    document.querySelectorAll("#items li").length
  );
});

/* ===== 4. textContent и HTML ===== */
document.querySelector("#change-title")?.addEventListener("click", () => {
  const target = document.querySelector("#title-target");
  if (!target) return;
  const value = '<strong>Проверка</strong> & "кавычки"';
  target.textContent = value;
  log("textContent установлен:", target.textContent);
  log("Дочерних элементов внутри h3:", target.children.length);
});

/* ===== 5. Всплытие ===== */
const journal = document.querySelector("#journal");
const journalPush = (text) => {
  if (!journal) return;
  const div = document.createElement("div");
  div.textContent = text;
  journal.append(div);
  journal.scrollTop = journal.scrollHeight;
};

const outer = document.querySelector("#outer");
const btn = document.querySelector("#bubble-btn");
const span = document.querySelector("#bubble-span");

const describe = (event) => ({
  phase: event.eventPhase,
  target: event.target.id || event.target.tagName,
  currentTarget: event.currentTarget.id || event.currentTarget.tagName,
});

outer?.addEventListener("click", (event) => {
  journalPush(
    `[фаза ${describe(event).phase}] outer | target=${describe(event).target} currentTarget=${describe(event).currentTarget}`
  );
}, true);

btn?.addEventListener("click", (event) => {
  journalPush(
    `[фаза ${describe(event).phase}] button | target=${describe(event).target} currentTarget=${describe(event).currentTarget}`
  );
});

outer?.addEventListener("click", (event) => {
  journalPush(
    `[фаза ${describe(event).phase}] outer (bubble) | target=${describe(event).target} currentTarget=${describe(event).currentTarget}`
  );
});

span?.addEventListener("click", () => {
  // эта подписка нужна только для демонстрации, чтобы клик по span всплывал к button и outer
});

document.querySelector("#clear-journal")?.addEventListener("click", () => {
  if (journal) journal.replaceChildren();
});