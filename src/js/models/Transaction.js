export default class Transaction {
  #id;
  static DEFAULT_CURRENCY = "USD";

  constructor({
    id,
    date = new Date().toISOString().slice(0, 10),
    displayDate = "",
    category = "Інше",
    title,
    type = "expense",
    amount = 0,
  }) {
    if (!title || !String(title).trim()) {
      throw new TypeError("Опис транзакції є обов’язковим");
    }

    this.#id = id;
    this.date = date;
    this.displayDate = displayDate || date.split("-").reverse().join(".");
    this.category = category;
    this.title = String(title).trim();
    this.type = type === "income" ? "income" : "expense";
    this.amount = Math.abs(Number(amount)) || 0;
  }

  get id() {
    return this.#id;
  }

  get signedAmount() {
    return this.type === "income" ? this.amount : -this.amount;
  }

  matches(query) {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      this.title.toLowerCase().includes(q) ||
      this.category.toLowerCase().includes(q)
    );
  }

  toString() {
    const sign = this.type === "income" ? "+" : "-";
    return `${this.displayDate} | ${this.title} (${this.category}): ${sign}$${this.amount.toFixed(2)}`;
  }

  static fromRecord(record) {
    return new Transaction(record);
  }

  static fromApi(dto) {
    const isIncome = dto.id % 2 === 1;
    const rawDate = new Date(Date.now() - dto.id * 86400000);
    const isoDate = rawDate.toISOString().slice(0, 10);
    const displayDate = isoDate.split("-").reverse().join(".");

    return new Transaction({
      id: dto.id,
      date: isoDate,
      displayDate,
      category: isIncome ? "Зарплата" : "Продукти",
      title: dto.title,
      type: isIncome ? "income" : "expense",
      amount: Number(dto.amount ?? dto.id * 25),
    });
  }
}

export class RecurringTransaction extends Transaction {
  constructor(data, interval = "monthly") {
    super(data);
    this.interval = interval;
  }

  toString() {
    return `${super.toString()} [регулярно: ${this.interval}]`;
  }
}

export const initialTransactions = [
  new Transaction({ id: 1, date: "2026-10-24", displayDate: "24.10.2026", category: "Зарплата",   title: "Acme Co. Payroll",        type: "income",  amount: 4850.00 }),
  new Transaction({ id: 2, date: "2026-10-23", displayDate: "23.10.2026", category: "Продукти",   title: "Супермаркет «Сільпо»",    type: "expense", amount: 120.50  }),
  new Transaction({ id: 3, date: "2026-10-21", displayDate: "21.10.2026", category: "Транспорт",  title: "Заправка АЗС",            type: "expense", amount: 65.00   }),
  new Transaction({ id: 4, date: "2026-10-19", displayDate: "19.10.2026", category: "Розваги",    title: "Квитки у кінотеатр",      type: "expense", amount: 35.00   }),
  new Transaction({ id: 5, date: "2026-10-18", displayDate: "18.10.2026", category: "Зарплата",   title: "Фріланс-бонус",           type: "income",  amount: 950.00  }),
  new Transaction({ id: 6, date: "2026-10-16", displayDate: "16.10.2026", category: "Комунальні", title: "Оплата електроенергії",   type: "expense", amount: 145.00  }),
  new Transaction({ id: 7, date: "2026-10-14", displayDate: "14.10.2026", category: "Продукти",   title: "Ринок — овочі та фрукти", type: "expense", amount: 82.40   }),
  new Transaction({ id: 8, date: "2026-10-12", displayDate: "12.10.2026", category: "Розваги",    title: "Підписка на музику",      type: "expense", amount: 12.99   }),
  new RecurringTransaction(
    { id: 9, date: "2026-10-10", displayDate: "10.10.2026", category: "Комунальні", title: "Інтернет-провайдер", type: "expense", amount: 19.99 },
    "monthly"
  ),
];

export const averageWithoutZeros = (arr) => {
  const nonZero = arr.filter((num) => num !== 0);
  if (nonZero.length === 0) return 0;

  const sum = nonZero.reduce((acc, num) => acc + num, 0);
  return sum / nonZero.length;
};