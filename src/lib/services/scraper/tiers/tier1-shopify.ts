import * as cheerio from 'cheerio';
import { URL } from 'url';
import { ExtractionOptions, ScrapedProduct, TierResult } from '../types';
import {
  JSON_HEADERS,
  brandFromHostname,
  normalizeUrlString,
} from '../user-agents';
import { normalizePkrPrice } from '../price-normalizer';
import { sanitizeAndUpgradeImages } from '../image-sanitizer';
import { detectGenderAndGarment } from '../gender-detector';
import { logger } from '@/lib/utils/logger';

/**
 * Tier 1: Fast-Path Native Shopify JSON Endpoint Inspection (<800ms)
 * Used by ~85% of Pakistani fashion stores (J., Sapphire, Sana Safinaz, Maria.B, Gul Ahmed, LimeLight, Nishat Linen, etc.).
 */
export async function executeTier1Shopify(
  url: URL,
  options?: ExtractionOptions
): Promise<TierResult> {
  // If mock JSON is provided via options (e.g. In unit tests), process immediately
  if (options?.mockJson) {
    return processShopifyJson(options.mockJson, url);
  }

  // Check if URL has a product handle
  const pathname = url.pathname;
  const productMatch = pathname.match(/\/products\/([a-zA-Z0-9-_]+)/);
  if (!productMatch || !productMatch[1]) {
    return {
      success: false,
      tier: 1,
      error: 'URL path does not match Shopify /products/<handle> pattern',
    };
  }

  const handle = productMatch[1];
  const jsonUrl = `${url.origin}/products/${handle}.json`;

  const timeoutMs = options?.timeoutMs || 3000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    logger.info(`[Scraper Tier 1] Querying Shopify JSON endpoint: ${jsonUrl}`);
    const res = await fetch(jsonUrl, {
      headers: JSON_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        success: false,
        tier: 1,
        error: `Shopify endpoint returned HTTP ${res.status}`,
      };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        success: false,
        tier: 1,
        error: `Expected application/json but received ${contentType}`,
      };
    }

    const json = await res.json();
    if (!json || !json.product) {
      return {
        success: false,
        tier: 1,
        error: 'Response JSON did not contain "product" object',
      };
    }

    return processShopifyJson(json, url);
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      tier: 1,
      error: `Tier 1 Shopify error: ${err.message || String(err)}`,
    };
  }
}

export function processShopifyJson(json: any, url: URL): TierResult {
  const p = json.product;
  if (!p) {
    return { success: false, tier: 1, error: 'Missing product in JSON' };
  }

  const title = (p.title || '').trim();
  const brand = (p.vendor || brandFromHostname(url.hostname)).trim();

  // Price
  const rawPrice = p.variants?.[0]?.price;
  const priceOriginal = normalizePkrPrice(rawPrice);

  // Description
  let description = '';
  if (p.body_html) {
    try {
      description = cheerio
        .load(p.body_html)
        .text()
        .trim()
        .replace(/\s+/g, ' ');
    } catch {
      description = String(p.body_html)
        .replace(/<[^>]+>/g, '')
        .trim();
    }
  }
  if (!description) {
    description = `${brand} ${title} unstitched designer garment`;
  }

  // Images
  const rawImages = Array.isArray(p.images)
    ? p.images
        .map((img: any) => (typeof img === 'string' ? img : img.src))
        .filter(Boolean)
    : [];
  const images = sanitizeAndUpgradeImages(rawImages, url.origin);

  // Tags & Categories for Gender Detection
  const tags = p.tags || [];
  const category = p.product_type || '';

  const genderResult = detectGenderAndGarment({
    title,
    tags,
    category,
    url: url.toString(),
    description,
  });

  const scrapedProduct: ScrapedProduct = {
    title,
    brand,
    priceOriginal,
    currencyOriginal: 'PKR',
    description: description.substring(0, 2000),
    images,
    gender: genderResult.gender,
    garmentType: genderResult.garmentType,
    confidenceScore: 0.95,
    fallbackTier: 1,
    sourceUrl: url.toString(),
    normalizedUrl: normalizeUrlString(url.toString()),
    fabricMaterial: genderResult.fabricMaterial,
    colorTags: [],
    requiresManualPrice: priceOriginal === null,
    parseSource: `${url.hostname} (Shopify Native JSON)`,
    parseMetadata: {
      shopifyId: p.id,
      handle: p.handle,
      productType: p.product_type,
      tags: Array.isArray(tags)
        ? tags.slice(0, 20)
        : String(tags).split(',').slice(0, 20),
      matchedGenderTerms: genderResult.matchedTerms,
      variantsCount: Array.isArray(p.variants) ? p.variants.length : 1,
    },
  };

  return {
    success: true,
    tier: 1,
    data: scrapedProduct,
  };
}
