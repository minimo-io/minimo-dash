export function formatCurrency(amount: number, currency?: string) {
  // Round the number to 2 decimal places (example for prices)
  const roundedAmount = Math.round(amount * 100) / 100;

  // Format the number with 1k separator (dot) and currency symbol (e.g., R$ for Brazil)
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
    minimumFractionDigits: 2, // Ensures two decimals are shown
    maximumFractionDigits: 2,
  }).format(roundedAmount);
}
