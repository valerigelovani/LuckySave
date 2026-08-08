export function formatCurrency(
  amount: number,
  locale: string,
  symbol: string,
  position: 'prefix' | 'suffix',
): string {
  const numberPart = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
  return position === 'prefix' ? `${symbol}${numberPart}` : `${numberPart} ${symbol}`;
}
