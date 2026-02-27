export type PreferredCurrency = "EUR" | "XOF";

const CURRENCY_STORAGE_KEY = "client.preferredCurrency";

const normalizeCurrency = (value?: string | null): PreferredCurrency => {
  const upper = (value || "").trim().toUpperCase();
  if (upper === "XOF" || upper === "FCFA") return "XOF";
  return "EUR";
};

export const getPreferredCurrency = (): PreferredCurrency => {
  if (typeof window === "undefined") return "EUR";
  return normalizeCurrency(window.localStorage.getItem(CURRENCY_STORAGE_KEY));
};

export const setPreferredCurrency = (currency: PreferredCurrency): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, normalizeCurrency(currency));
};

