"use strict";

// --- Варіант 6: Середнє арифметичне елементів масиву без урахування нулів ---
const numbers = [10, 0, 25, 0, 15, 30, 0];

function averageWithoutZeros(arr) {
  const nonZero = arr.filter((num) => num !== 0);
  if (nonZero.length === 0) return 0;

  const sum = nonZero.reduce((acc, num) => acc + num, 0);
  return sum / nonZero.length;
}

const avg = averageWithoutZeros(numbers);
const resultText = `Масив: [${numbers.join(", ")}] -> Середнє арифметичне без нулів: ${avg}`;

console.log(resultText);

const outputEl = document.querySelector("#task-output");
if (outputEl) {
  outputEl.textContent = resultText;
}

// --- Кроки 2–5: Динамічне формування, фільтрація, сортування та видалення транзакцій ---
const transactions = [
  { id: 1, date: "2026-10-24", displayDate: "24.10.2026", category: "Зарплата",   title: "Acme Co. Payroll",        type: "income",  amount: 4850.00 },
  { id: 2, date: "2026-10-23", displayDate: "23.10.2026", category: "Продукти",   title: "Супермаркет «Сільпо»",    type: "expense", amount: 120.50  },
  { id: 3, date: "2026-10-21", displayDate: "21.10.2026", category: "Транспорт",  title: "Заправка АЗС",            type: "expense", amount: 65.00   },
  { id: 4, date: "2026-10-19", displayDate: "19.10.2026", category: "Розваги",    title: "Квитки у кінотеатр",      type: "expense", amount: 35.00   },
  { id: 5, date: "2026-10-18", displayDate: "18.10.2026", category: "Зарплата",   title: "Фріланс-бонус",           type: "income",  amount: 950.00  },
  { id: 6, date: "2026-10-16", displayDate: "16.10.2026", category: "Комунальні", title: "Оплата електроенергії",   type: "expense", amount: 145.00  },
  { id: 7, date: "2026-10-14", displayDate: "14.10.2026", category: "Продукти",   title: "Ринок — овочі та фрукти", type: "expense", amount: 82.40   },
  { id: 8, date: "2026-10-12", displayDate: "12.10.2026", category: "Розваги",    title: "Підписка на музику",      type: "expense", amount: 12.99   },
];

const TX_STORAGE_KEY = "financemanager:txFilters";
const bySelector = (selector) => document.querySelector(selector);

const formatUsd = (n, signed = false) => {
  const absFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));

  if (!signed) return absFormatted;
  return n >= 0 ? `+${absFormatted}` : `-${absFormatted}`;
};

function createTransactionRow(tx) {
  const tr = document.createElement("tr");
  tr.dataset.id = tx.id;

  const tdDate = document.createElement("td");
  tdDate.textContent = tx.displayDate;

  const tdCategory = document.createElement("td");
  tdCategory.textContent = tx.category;

  const tdTitle = document.createElement("td");
  tdTitle.textContent = tx.title;

  const tdType = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `badge ${tx.type === "income" ? "badge--income" : "badge--expense"}`;
  badge.textContent = tx.type === "income" ? "Дохід" : "Витрата";
  tdType.append(badge);

  const tdAmount = document.createElement("td");
  tdAmount.className = `amount ${tx.type === "income" ? "amount--income" : "amount--expense"}`;
  tdAmount.textContent = tx.type === "income" ? formatUsd(tx.amount, true) : `-${formatUsd(tx.amount)}`;

  const tdAction = document.createElement("td");
  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn btn-outline-danger btn-sm btn-delete";
  delBtn.textContent = "Видалити";
  tdAction.append(delBtn);

  tr.append(tdDate, tdCategory, tdTitle, tdType, tdAmount, tdAction);
  return tr;
}

function getFilters() {
  return {
    q:           bySelector("#search")?.value.trim().toLowerCase() ?? "",
    category:    bySelector("#category")?.value ?? "",
    showIncome:  bySelector("#c1") ? bySelector("#c1").checked : true,
    showExpense: bySelector("#c2") ? bySelector("#c2").checked : true,
    maxAmount:   bySelector("#amountRange") ? Number(bySelector("#amountRange").value) : 10000,
    sort:        bySelector("#sort")?.value ?? "date_desc",
  };
}

function applyFilters(source, filters) {
  const filtered = source.filter((tx) => {
    const byQuery = !filters.q ||
      tx.title.toLowerCase().includes(filters.q) ||
      tx.category.toLowerCase().includes(filters.q);
    const byCat = !filters.category || tx.category === filters.category;
    const byType = (tx.type === "income" && filters.showIncome) ||
                   (tx.type === "expense" && filters.showExpense);
    const byAmount = tx.amount <= filters.maxAmount;

    return byQuery && byCat && byType && byAmount;
  });

  const comparators = {
    date_desc:   (a, b) => b.date.localeCompare(a.date),
    date_asc:    (a, b) => a.date.localeCompare(b.date),
    amount_asc:  (a, b) => a.amount - b.amount,
    amount_desc: (a, b) => b.amount - a.amount,
  };

  return filtered.sort(comparators[filters.sort] ?? comparators.date_desc);
}

function renderTransactions() {
  const tbody = bySelector("#transactions-body");
  if (!tbody) return;

  const filters = getFilters();
  const visible = applyFilters(transactions, filters);

  tbody.textContent = "";

  const fragment = document.createDocumentFragment();
  visible.forEach((tx) => fragment.append(createTransactionRow(tx)));
  tbody.append(fragment);

  const totalBalance = visible.reduce((sum, tx) => {
    return tx.type === "income" ? sum + tx.amount : sum - tx.amount;
  }, 0);

  const counter = bySelector("#counter");
  if (counter) counter.textContent = `Знайдено ${visible.length} операцій`;

  const empty = bySelector("#empty");
  if (empty) empty.classList.toggle("d-none", visible.length > 0);

  const summary = bySelector("#summary-amount");
  if (summary) {
    summary.textContent = formatUsd(totalBalance, true);
    summary.className = `amount ${totalBalance >= 0 ? "amount--income" : "amount--expense"}`;
  }

  localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(filters));
}

function restoreFilters() {
  try {
    const saved = JSON.parse(localStorage.getItem(TX_STORAGE_KEY) ?? "{}");
    if (typeof saved.q === "string" && bySelector("#search")) bySelector("#search").value = saved.q;
    if (typeof saved.category === "string" && bySelector("#category")) bySelector("#category").value = saved.category;
    if (typeof saved.showIncome === "boolean" && bySelector("#c1")) bySelector("#c1").checked = saved.showIncome;
    if (typeof saved.showExpense === "boolean" && bySelector("#c2")) bySelector("#c2").checked = saved.showExpense;
    if (typeof saved.maxAmount === "number" && bySelector("#amountRange")) bySelector("#amountRange").value = String(saved.maxAmount);
    if (typeof saved.sort === "string" && bySelector("#sort")) bySelector("#sort").value = saved.sort;
  } catch (e) {
    console.warn("Не вдалося відновити фільтри транзакцій:", e.message);
  }
}

if (bySelector("#transactions-body")) {
  bySelector("#search")?.addEventListener("input", renderTransactions);
  bySelector("#category")?.addEventListener("change", renderTransactions);
  bySelector("#sort")?.addEventListener("change", renderTransactions);
  bySelector("#c1")?.addEventListener("change", renderTransactions);
  bySelector("#c2")?.addEventListener("change", renderTransactions);
  bySelector("#amountRange")?.addEventListener("input", renderTransactions);
  bySelector("#applyFiltersBtn")?.addEventListener("click", renderTransactions);

  bySelector("#transactions-body").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-delete");
    if (!btn) return;

    const row = btn.closest("[data-id]");
    const id = Number(row?.dataset.id);
    const idx = transactions.findIndex((tx) => tx.id === id);
    if (idx !== -1) {
      transactions.splice(idx, 1);
      renderTransactions();
    }
  });

  restoreFilters();
  renderTransactions();
}