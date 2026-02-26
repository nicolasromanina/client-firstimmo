/**
 * Utilitaires de conversion de devises
 * Taux de change approximatif : 1 EUR = 655 XOF (FCFA)
 */

const XOF_TO_EUR_RATE = 655; // 1 EUR = 655 XOF
const EUR_TO_XOF_RATE = 655; // 1 XOF = 1/655 EUR

/**
 * Convertit un prix de XOF (FCFA) vers EUR
 */
export function xofToEur(xof: number): number {
  return Math.round((xof / XOF_TO_EUR_RATE) * 100) / 100; // Arrondi à 2 décimales
}

/**
 * Convertit un prix de EUR vers XOF (FCFA)
 */
export function eurToXof(eur: number): number {
  return Math.round(eur * EUR_TO_XOF_RATE);
}

/**
 * Formate un prix selon la devise
 * Si la devise est XOF/FCFA, convertit en EUR pour l'affichage
 */
export function formatPrice(
  price: number | null | undefined,
  currency?: string | null
): { value: number; display: string; originalCurrency: string } {
  if (price == null) {
    return { value: 0, display: "Prix sur demande", originalCurrency: currency || "EUR" };
  }

  const normalizedCurrency = (currency || "EUR").toUpperCase();

  // Si XOF/FCFA, convertir en EUR pour l'affichage
  if (normalizedCurrency === "XOF" || normalizedCurrency === "FCFA") {
    const eurValue = xofToEur(price);
    return {
      value: eurValue,
      display: `${eurValue.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
      originalCurrency: "XOF",
    };
  }

  // Sinon, afficher en EUR
  return {
    value: price,
    display: `${price.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
    originalCurrency: normalizedCurrency,
  };
}

/**
 * Convertit un prix d'entrée utilisateur (EUR) vers la devise backend si nécessaire
 * Pour les filtres API, on envoie toujours en EUR (le backend gère la conversion si besoin)
 */
export function convertFilterPriceToBackend(eurPrice: number, targetCurrency?: string): number {
  const normalizedCurrency = (targetCurrency || "EUR").toUpperCase();
  
  // Si le backend attend XOF, convertir EUR → XOF
  if (normalizedCurrency === "XOF" || normalizedCurrency === "FCFA") {
    return eurToXof(eurPrice);
  }
  
  // Sinon, garder en EUR
  return eurPrice;
}

/**
 * Convertit un prix du backend vers EUR pour l'affichage dans les filtres
 */
export function convertBackendPriceToFilter(backendPrice: number, currency?: string): number {
  const normalizedCurrency = (currency || "EUR").toUpperCase();
  
  // Si le backend envoie XOF, convertir XOF → EUR
  if (normalizedCurrency === "XOF" || normalizedCurrency === "FCFA") {
    return xofToEur(backendPrice);
  }
  
  // Sinon, garder tel quel
  return backendPrice;
}
