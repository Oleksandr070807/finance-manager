import Transaction, { initialTransactions, averageWithoutZeros } from "./models/Transaction.js";
import { saveFilters, loadFilters } from "./services/storage.js";
import {
  loadTransactions,
  loadAccounts,
  loadTransactionById,
  timeout,
  filterAndSortTransactions,
} from "./services/api.js";
import {
  renderAlgorithmTask,
  getFiltersFromDom,
  applyFiltersToDom,
  renderTransactionsTable,
} from "./ui/render.js";
import { notifyInfo, notifyWarn } from "./ui/notify.js";

const numbers = [10, 0, 25, 0, 15, 30, 0];
const avg = averageWithoutZeros(numbers);
const taskMessage = renderAlgorithmTask(numbers, avg);
notifyInfo(taskMessage);

let transactions = [...initialTransactions];

const debounce = (fn, delayMs = 300) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delayMs);
  };
};

const setLoadingState = (isLoading) => {
  const counter = document.querySelector("#counter");
  if (counter && isLoading) {
    counter.textContent = "Завантаження даних...";
  }
};

const showLoadError = (message) => {
  notifyWarn(message);
  const empty = document.querySelector("#empty");
  if (empty) {
    empty.textContent = message;
    empty.classList.remove("d-none");
  }
};

const updateTransactionsView = () => {
  const filters = getFiltersFromDom();
  const visible = filterAndSortTransactions(transactions, filters);
  renderTransactionsTable(visible);
  saveFilters(filters);
};

const restoreSavedFilters = () => {
  try {
    const saved = loadFilters();
    applyFiltersToDom(saved);
  } catch (err) {
    notifyWarn(`Не вдалося відновити фільтри транзакцій: ${err.message}`);
  }
};

const bindEvents = (tbody) => {
  const debouncedSearch = debounce(updateTransactionsView, 300);

  document.querySelector("#search")?.addEventListener("input", debouncedSearch);
  document.querySelector("#category")?.addEventListener("change", updateTransactionsView);
  document.querySelector("#sort")?.addEventListener("change", updateTransactionsView);
  document.querySelector("#c1")?.addEventListener("change", updateTransactionsView);
  document.querySelector("#c2")?.addEventListener("change", updateTransactionsView);
  document.querySelector("#amountRange")?.addEventListener("input", updateTransactionsView);
  document.querySelector("#applyFiltersBtn")?.addEventListener("click", updateTransactionsView);

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-delete");
    if (!btn) return;

    const row = btn.closest("[data-id]");
    const id = Number(row?.dataset.id);
    const idx = transactions.findIndex((tx) => tx.id === id);
    if (idx !== -1) {
      transactions.splice(idx, 1);
      updateTransactionsView();
    }
  });
};

async function loadDetails(ids) {
  const results = await Promise.allSettled(ids.map((id) => loadTransactionById(id)));
  const ok = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  const fail = results.filter((r) => r.status === "rejected");
  notifyInfo(`Деталі завантажено: ${ok.length}, помилок: ${fail.length}`);
  return ok;
}

async function init() {
  const tbody = document.querySelector("#transactions-body");
  if (!tbody) return;

  restoreSavedFilters();
  bindEvents(tbody);

  setLoadingState(true);
  try {
    const [rawTransactions, accounts] = await Promise.all([
      timeout(loadTransactions(8)),
      timeout(loadAccounts()),
    ]);

    const apiTransactions = rawTransactions.map((dto) => Transaction.fromApi(dto));
    transactions = apiTransactions.length > 0 ? apiTransactions : [...initialTransactions];
    notifyInfo(`Рахунків/користувачів завантажено: ${accounts.length}`);
  } catch (err) {
    console.error(err);
    showLoadError(`Не вдалося завантажити дані з API: ${err.message}. Використано локальні дані.`);
    transactions = [...initialTransactions];
  } finally {
    setLoadingState(false);
    updateTransactionsView();
  }
}

document.addEventListener("DOMContentLoaded", init);