/**
 * Formatting and calculation utilities for KHP POS V4
 */

export function formatRupiah(amount: number = 0): string {
  if (isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function formatNumber(value: number = 0, decimals: number = 0): string {
  if (isNaN(value)) return '0';
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDate(timestamp: number | string | Date): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(timestamp: number | string | Date): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateTime(timestamp: number | string | Date): string {
  const d = new Date(timestamp);
  return `${formatDate(d)}, ${formatTime(d)}`;
}

export function generateInvoiceNumber(prefix: string = 'INV'): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomPart}`;
}

/**
 * Calculates recommended selling price given HPP and desired Margin %
 * Formula: Price = COGS / (1 - Margin%)
 */
export function calculatePriceFromMargin(cogs: number, targetMarginPercent: number): number {
  if (cogs <= 0) return 0;
  if (targetMarginPercent >= 100) return cogs * 2;
  const marginDecimal = targetMarginPercent / 100;
  const price = cogs / (1 - marginDecimal);
  // Round to nearest 500 or 1000 for friendly retail pricing
  return Math.ceil(price / 500) * 500;
}

/**
 * Calculates Gross Margin % from Price and COGS
 * Formula: ((Price - COGS) / Price) * 100
 */
export function calculateGrossMarginPercent(price: number, cogs: number): number {
  if (price <= 0) return 0;
  return Math.round(((price - cogs) / price) * 100 * 10) / 10;
}

/**
 * Calculates Markup % from Price and COGS
 * Formula: ((Price - COGS) / COGS) * 100
 */
export function calculateMarkupPercent(price: number, cogs: number): number {
  if (cogs <= 0) return 0;
  return Math.round(((price - cogs) / cogs) * 100 * 10) / 10;
}

/**
 * Break-Even Point (BEP) in Units & IDR
 */
export function calculateBEP(fixedCosts: number, averagePrice: number, averageCogs: number) {
  const contributionMarginPerUnit = averagePrice - averageCogs;
  if (contributionMarginPerUnit <= 0) {
    return { bepUnits: 0, bepRevenue: 0, contributionRatio: 0 };
  }
  const bepUnits = Math.ceil(fixedCosts / contributionMarginPerUnit);
  const contributionRatio = contributionMarginPerUnit / averagePrice;
  const bepRevenue = Math.ceil(fixedCosts / contributionRatio);
  return { bepUnits, bepRevenue, contributionRatio: Math.round(contributionRatio * 100) };
}
