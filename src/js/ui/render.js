const bySelector = (selector) => document.querySelector(selector);

export const formatUsd = (n, signed = false) => {
  const absFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n));

  if (!signed) return absFormatted;
  return n >= 0 ? `+${absFormatted}` : `-${absFormatted}`;
};

export const renderAlgorithmTask = (numbers, avg) => {
  const outputEl = bySelector("#task-output");
  const resultText = `Масив: [${numbers.join(", ")}] -> Середнє арифметичне без нулів: ${avg}`;
  if (outputEl) {
    outputEl.textContent = resultText;
  }
  return resultText;
};

export const createTransactionRow = ({ id, displayDate, category, title, type, amount }) => {
  const isIncome = type === "income";
  const tr = document.createElement("tr");
  tr.dataset.id = id;

  const tdDate = document.createElement("td");
  tdDate.textContent = displayDate;

  const tdCategory = document.createElement("td");
  tdCategory.textContent = category;

  const tdTitle = document.createElement("td");
  tdTitle.textContent = title;

  const tdType = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `badge ${isIncome ? "badge--income" : "badge--expense"}`;
  badge.textContent = isIncome ? "Дохід" : "Витрата";
  tdType.append(badge);

  const tdAmount = document.createElement("td");
  tdAmount.className = `amount ${isIncome ? "amount--income" : "amount--expense"}`;
  tdAmount.textContent = isIncome ? formatUsd(amount, true) : `-${formatUsd(amount)}`;

  const tdAction = document.createElement("td");
  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn btn-outline-danger btn-sm btn-delete";
  delBtn.textContent = "Видалити";
  tdAction.append(delBtn);

  tr.append(tdDate, tdCategory, tdTitle, tdType, tdAmount, tdAction);
  return tr;
};

export const getFiltersFromDom = () => ({
  q:           bySelector("#search")?.value.trim().toLowerCase() ?? "",
  category:    bySelector("#category")?.value ?? "",
  showIncome:  bySelector("#c1") ? bySelector("#c1").checked : true,
  showExpense: bySelector("#c2") ? bySelector("#c2").checked : true,
  maxAmount:   bySelector("#amountRange") ? Number(bySelector("#amountRange").value) : 10000,
  sort:        bySelector("#sort")?.value ?? "date_desc",
});

export const applyFiltersToDom = ({ q, category, showIncome, showExpense, maxAmount, sort }) => {
  if (typeof q === "string" && bySelector("#search")) bySelector("#search").value = q;
  if (typeof category === "string" && bySelector("#category")) bySelector("#category").value = category;
  if (typeof showIncome === "boolean" && bySelector("#c1")) bySelector("#c1").checked = showIncome;
  if (typeof showExpense === "boolean" && bySelector("#c2")) bySelector("#c2").checked = showExpense;
  if (typeof maxAmount === "number" && bySelector("#amountRange")) bySelector("#amountRange").value = String(maxAmount);
  if (typeof sort === "string" && bySelector("#sort")) bySelector("#sort").value = sort;
};

export const renderTransactionsTable = (visible) => {
  const tbody = bySelector("#transactions-body");
  if (!tbody) return;

  tbody.textContent = "";

  const fragment = document.createDocumentFragment();
  visible.forEach((tx) => fragment.append(createTransactionRow(tx)));
  tbody.append(fragment);

  const totalBalance = visible.reduce(
    (sum, { type, amount }) => (type === "income" ? sum + amount : sum - amount),
    0
  );

  const counter = bySelector("#counter");
  if (counter) counter.textContent = `Знайдено ${visible.length} операцій`;

  const empty = bySelector("#empty");
  if (empty) empty.classList.toggle("d-none", visible.length > 0);

  const summary = bySelector("#summary-amount");
  if (summary) {
    summary.textContent = formatUsd(totalBalance, true);
    summary.className = `amount ${totalBalance >= 0 ? "amount--income" : "amount--expense"}`;
  }
};