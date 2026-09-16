/**
 * Normalizes varied Pakistani e-commerce price strings into integer numeric PKR.
 * Examples:
 *   "Rs. 4,950" -> 4950
 *   "PKR 12,450.00" -> 12450
 *   "₨ 7,990" -> 7990
 *   "Rs 3.490,00" -> 3490
 *   "Sale price Rs. 3,500 Regular price Rs. 5,000" -> 3500
 *   "PKR 4,500 - PKR 6,500" -> 4500
 */
export function normalizePkrPrice(rawPrice: unknown): number | null {
  if (typeof rawPrice === 'number') {
    if (isNaN(rawPrice) || rawPrice <= 0) return null;
    const rounded = Math.round(rawPrice);
    return rounded >= 100 && rounded <= 1_000_000 ? rounded : null;
  }

  if (rawPrice === null || rawPrice === undefined) {
    return null;
  }

  let text = String(rawPrice).trim();
  if (!text) return null;

  // 1. Handle composite "Sale price Rs. X Regular price Rs. Y"
  if (/sale|special|now|discount|current/i.test(text)) {
    const saleMatch = text.match(
      /(?:sale(?:\s+price)?|special(?:\s+price)?|now|current(?:\s+price)?)[:\s]*(?:PKR|Rs\.?|₨\.?)?\s*([0-9,.]+(?:\.[0-9]{2})?)/i
    );
    if (saleMatch && saleMatch[1]) {
      text = saleMatch[1];
    }
  }

  // 2. Handle ranges like "PKR 4,500 - PKR 6,500" or "4,500 - 6,500" -> take first price
  if (text.includes('-') || text.toLowerCase().includes(' to ')) {
    const parts = text.split(/[-–—]|(?:\s+to\s+)/i);
    if (parts.length > 0 && parts[0].trim()) {
      text = parts[0].trim();
    }
  }

  // 3. Handle European number format (e.g. 3.490,00)
  if (/\b\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?\b/.test(text)) {
    text = text.replace(/\./g, '').replace(/,/g, '.');
  }

  // 4. Strip currency symbols and letters
  const sanitized = text
    .replace(/(?:PKR|Rs\.?|₨\.?|pkr|rs)/gi, '')
    .replace(/,/g, '')
    .trim();

  // 5. Extract first valid numeric decimal or integer sequence
  const match = sanitized.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  if (!match || !match[1]) {
    return null;
  }

  const parsed = parseFloat(match[1]);
  if (isNaN(parsed) || parsed <= 0) {
    return null;
  }

  const finalPrice = Math.round(parsed);

  // Plausibility check for Pakistani clothing items (PKR 100 to PKR 1,000,000)
  if (finalPrice < 100 || finalPrice > 1_000_000) {
    return null;
  }

  return finalPrice;
}
