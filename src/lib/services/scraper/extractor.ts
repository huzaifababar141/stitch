import { URL } from 'url';
import { ExtractionOptions, ScrapedProduct } from './types';
import { validateUrl } from './user-agents';
import { executeTier1Shopify, processShopifyJson } from './tiers/tier1-shopify';
import { executeTier2Fetch } from './tiers/tier2-fetch';
import { executeTier3Dom } from './tiers/tier3-dom';
import { executeTier4Pattern } from './tiers/tier4-pattern';
import { executeTier5Fallback } from './tiers/tier5-fallback';
import { logger } from '@/lib/utils/logger';

/**
 * Pure Scraper Engine: Decoupled from database persistence.
 * Implements 5-Tier Fallback Cascade across all Pakistani fashion storefronts.
 */
export async function extractProductDetails(
  urlStr: string,
  options?: ExtractionOptions
): Promise<ScrapedProduct> {
  if (!urlStr || typeof urlStr !== 'string') {
    return executeTier5Fallback(
      new URL('https://unknown-store.pk/products/unstitched-suit'),
      'Missing or invalid URL parameter'
    ).data as ScrapedProduct;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = validateUrl(urlStr.trim());
  } catch (urlErr: any) {
    logger.warn(
      `[Scraper] Invalid URL format for "${urlStr}": ${urlErr.message}`
    );
    try {
      // Try best-effort recovery if missing protocol
      const prefixed = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
      parsedUrl = new URL(prefixed);
    } catch {
      // If completely unparseable, return safe Tier 5 fallback
      return {
        title: 'Custom Unstitched Garment',
        brand: 'Pakistani Brand',
        priceOriginal: null,
        requiresManualPrice: true,
        currencyOriginal: 'PKR',
        description: 'Custom unstitched suit from linked store',
        images: [],
        gender: 'female',
        garmentType: 'full_suit',
        confidenceScore: 0.2,
        fallbackTier: 5,
        sourceUrl: urlStr,
        normalizedUrl: urlStr,
        parseSource: 'Fallback Heuristic',
        parseMetadata: {
          warning: 'Invalid URL format provided. Manual price entry required.',
          fallbackTier: 5,
        },
      };
    }
  }

  // 1. Direct Mock/Fixture Short-Circuits (for offline testing & evaluation)
  if (options?.mockJson) {
    const res = processShopifyJson(options.mockJson, parsedUrl);
    if (res.success && res.data) {
      return res.data as ScrapedProduct;
    }
  }

  if (options?.html) {
    const domRes = executeTier3Dom(options.html, parsedUrl, options);
    if (
      domRes.success &&
      domRes.data &&
      domRes.data.priceOriginal !== null &&
      (domRes.data.images?.length || 0) > 0
    ) {
      return domRes.data as ScrapedProduct;
    }
    const tier4Res = await executeTier4Pattern(
      options.html,
      parsedUrl,
      domRes.data,
      options
    );
    if (tier4Res.success && tier4Res.data) {
      return tier4Res.data as ScrapedProduct;
    }
    if (
      domRes.success &&
      domRes.data &&
      (domRes.data.images?.length || 0) > 0
    ) {
      return domRes.data as ScrapedProduct;
    }
    return executeTier5Fallback(
      parsedUrl,
      tier4Res.error || 'HTML contained no parseable product data'
    ).data as ScrapedProduct;
  }

  // 2. Tier 1: Fast-Path Shopify JSON (<800ms)
  if (
    options?.forceTier === 1 ||
    (!options?.forceTier && parsedUrl.pathname.includes('/products/'))
  ) {
    try {
      const tier1Res = await executeTier1Shopify(parsedUrl, options);
      if (tier1Res.success && tier1Res.data) {
        logger.info(
          `[Scraper] Successfully parsed via Tier 1 Shopify JSON: ${parsedUrl.hostname}`
        );
        return tier1Res.data as ScrapedProduct;
      }
      logger.info(
        `[Scraper] Tier 1 did not complete: ${tier1Res.error}, cascading to Tier 2`
      );
    } catch (t1Err: any) {
      logger.warn(`[Scraper] Tier 1 error: ${t1Err.message}`);
    }
  }

  if (options?.forceTier === 1) {
    return executeTier5Fallback(parsedUrl, 'Force Tier 1 failed')
      .data as ScrapedProduct;
  }

  // 3. Tier 2: Browser-Mimicking HTTP Fetch
  const fetchRes = await executeTier2Fetch(parsedUrl, options);

  if (fetchRes.success && fetchRes.html) {
    // 4. Tier 3: Cheerio DOM Heuristics (JSON-LD, OpenGraph, Selectors)
    const domRes = executeTier3Dom(fetchRes.html, parsedUrl, options);

    if (
      domRes.success &&
      domRes.data &&
      domRes.data.priceOriginal !== null &&
      (domRes.data.images?.length || 0) > 0
    ) {
      logger.info(
        `[Scraper] Successfully parsed via Tier 3 DOM Heuristics: ${parsedUrl.hostname}`
      );
      return domRes.data as ScrapedProduct;
    }

    // 5. Tier 4: Inline Script State & Pattern / LLM Fallback
    try {
      const tier4Res = await executeTier4Pattern(
        fetchRes.html,
        parsedUrl,
        domRes.data,
        options
      );
      if (tier4Res.success && tier4Res.data) {
        logger.info(
          `[Scraper] Parsed via Tier 4 Pattern/LLM: ${parsedUrl.hostname}`
        );
        return tier4Res.data as ScrapedProduct;
      }
    } catch (t4Err: any) {
      logger.warn(`[Scraper] Tier 4 error: ${t4Err.message}`);
    }

    // If DOM heuristics produced at least title or images, return that over pure slug fallback
    if (
      domRes.success &&
      domRes.data &&
      (domRes.data.images?.length || 0) > 0
    ) {
      return domRes.data as ScrapedProduct;
    }
  }

  // 6. Tier 5: Clean Structured Slug Fallback (Zero 500s Guarantee)
  logger.info(
    `[Scraper] Cascading to Tier 5 Clean Fallback for ${parsedUrl.hostname}`
  );
  const tier5Res = executeTier5Fallback(
    parsedUrl,
    fetchRes.error || `HTTP ${fetchRes.status || 'unknown'}`
  );

  return tier5Res.data as ScrapedProduct;
}
