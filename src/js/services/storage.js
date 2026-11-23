export const TX_STORAGE_KEY = "financemanager:txFilters";

export const saveFilters = (filters) => {
  localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(filters));
};

export const loadFilters = () => {
  try {
    return JSON.parse(localStorage.getItem(TX_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};