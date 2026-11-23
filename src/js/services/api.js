export const BASE = "https://jsonplaceholder.typicode.com";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function timeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    delay(ms).then(() => {
      throw new Error("Перевищено час очікування");
    }),
  ]);
}

async function getJson(path, signal) {
  const res = await fetch(`${BASE}${path}`, signal ? { signal } : undefined);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} для ${path}`);
  }
  return res.json();
}

export const loadTransactions = (limit = 10, signal) =>
  getJson(`/posts?_limit=${limit}`, signal);

export const loadAccounts = (signal) => getJson("/users", signal);

export const loadTransactionById = (id, signal) =>
  getJson(`/posts/${id}`, signal);

const comparators = {
  date_desc:   (a, b) => b.date.localeCompare(a.date),
  date_asc:    (a, b) => a.date.localeCompare(b.date),
  amount_asc:  (a, b) => a.amount - b.amount,
  amount_desc: (a, b) => b.amount - a.amount,
};

export const filterAndSortTransactions = (
  source,
  { q, category, showIncome, showExpense, maxAmount, sort }
) => {
  const filtered = source.filter(({ title, category: txCategory, type, amount }) => {
    const byQuery = !q || title.toLowerCase().includes(q) || txCategory.toLowerCase().includes(q);
    const byCat = !category || txCategory === category;
    const byType = (type === "income" && showIncome) || (type === "expense" && showExpense);
    const byAmount = amount <= maxAmount;

    return byQuery && byCat && byType && byAmount;
  });

  return filtered.sort(comparators[sort] ?? comparators.date_desc);
};