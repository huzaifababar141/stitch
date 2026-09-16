import { URL } from 'url';
import { ScrapedProduct, TierResult } from '../types';
import {
  brandFromHostname,
  normalizeUrlString,
  titleFromSlug,
} from '../user-agents';
import { detectGenderAndGarment } from '../gender-detector';

/**
 * Tier 5: Clean Structured Error Fallback (Zero 500s Guarantee)
 * Guarantees that even if external sites return 404, 403 (Cloudflare WAF), 500, or network timeouts,
 * the application never crashes and provides actionable structured data inferred from URL slug and domain.
 */
export function executeTier5Fallback(
  url: URL,
  errorMessage?: string
): TierResult {
  const brand = brandFromHostname(url.hostname);
  const title = titleFromSlug(url.pathname);

  // Infer gender and garment from URL path & slug
  const genderResult = detectGenderAndGarment({
    title,
    url: url.toString(),
  });

  const scrapedProduct: ScrapedProduct = {
    title,
    brand,
    priceOriginal: null,
    requiresManualPrice: true,
    currencyOriginal: 'PKR',
    description: `Custom unstitched suit from ${brand}`,
    images: [],
    gender: genderResult.gender,
    garmentType: genderResult.garmentType,
    confidenceScore: 0.4,
    fallbackTier: 5,
    sourceUrl: url.toString(),
    normalizedUrl: normalizeUrlString(url.toString()),
    fabricMaterial: genderResult.fabricMaterial,
    colorTags: [],
    parseSource: `${url.hostname} (Slug Fallback)`,
    parseMetadata: {
      fallbackTier: 5,
      warning:
        'External site protected or blocked. Fallback data inferred from URL slug.',
      errorEncountered: errorMessage,
      matchedGenderTerms: genderResult.matchedTerms,
    },
  };

  return {
    success: true,
    tier: 5,
    data: scrapedProduct,
  };
}
