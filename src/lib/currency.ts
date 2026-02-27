/**
 * Utilitaires de conversion de devises
 * Taux de change approximatif : 1 EUR = 655 XOF (FCFA)
 */
import { getPreferredCurrency } from "./userPreferences";

const XOF_TO_EUR_RATE = 655; // 1 EUR = 655 XOF
const EUR_TO_XOF_RATE = 655;
const XOF_CODES = new Set(["XOF", "FCFA"]);

const formatEur = (value: number): string =>
  `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const formatXof = (value: number): string =>
  `${Math.round(value).toLocaleString("fr-FR")} FCFA`;

const normalizeSourceCurrency = (currency?: string | null, amount?: number | null): "EUR" | "XOF" => {
  const upper = (currency || "").trim().toUpperCase();
  if (XOF_CODES.has(upper)) return "XOF";
  if (upper === "EUR") return "EUR";
  // Fallback pour anciens projets sans devise explicite
  return (amount ?? 0) >= 10_000 ? "XOF" : "EUR";
};

export function xofToEur(xof: number): number {
  return Math.round((xof / XOF_TO_EUR_RATE) * 100) / 100;
}

export function eurToXof(eur: number): number {
  return Math.round(eur * EUR_TO_XOF_RATE);
}

/**
 * Formate un prix selon la devise préférée utilisateur (Settings).
 */
export function formatPrice(
  price: number | null | undefined,
  currency?: string | null
): { value: number; display: string; originalCurrency: string } {
  if (price == null) {
    return { value: 0, display: "Prix sur demande", originalCurrency: currency || "EUR" };
  }

  const sourceCurrency = normalizeSourceCurrency(currency, price);
  const preferred = getPreferredCurrency();

  if (preferred === "EUR") {
    const eurValue = sourceCurrency === "XOF" ? xofToEur(price) : price;
    return {
      value: eurValue,
      display: formatEur(eurValue),
      originalCurrency: sourceCurrency,
    };
  }

  const xofValue = sourceCurrency === "XOF" ? price : eurToXof(price);
  return {
    value: xofValue,
    display: formatXof(xofValue),
    originalCurrency: sourceCurrency,
  };
}

export function convertFilterPriceToBackend(eurPrice: number, targetCurrency?: string): number {
  const normalizedCurrency = (targetCurrency || "EUR").trim().toUpperCase();
  if (XOF_CODES.has(normalizedCurrency)) return eurToXof(eurPrice);
  return eurPrice;
}

export function convertBackendPriceToFilter(backendPrice: number, currency?: string): number {
  const normalizedCurrency = (currency || "EUR").trim().toUpperCase();
  if (XOF_CODES.has(normalizedCurrency)) return xofToEur(backendPrice);
  return backendPrice;
}

