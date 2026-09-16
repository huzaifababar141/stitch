import * as cheerio from 'cheerio';
import { URL } from 'url';
import { ExtractionOptions, ScrapedProduct, TierResult } from '../types';
import {
  brandFromHostname,
  normalizeUrlString,
  titleFromSlug,
} from '../user-agents';
import { normalizePkrPrice } from '../price-normalizer';
import { sanitizeAndUpgradeImages } from '../image-sanitizer';
import { detectGenderAndGarment } from '../gender-detector';
import { AiClient } from '@/lib/services/ai/client';
import { logger } from '@/lib/utils/logger';

/**
 * Tier 4: Pattern-Based / Inline State / Semantic LLM Extraction Engine
 * Inspects inline JS (dataLayer, ShopifyAnalytics, __NEXT_DATA__) and body regex, with Groq AI fallback.
 */
export async function executeTier4Pattern(
  html: string,
  url: URL,
  partialData?: Partial<ScrapedProduct>,
  options?: ExtractionOptions
): Promise<TierResult> {
  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    return { success: false, tier: 4, error: 'Empty HTML received' };
  }

  let title = '';
  let brand = '';
  let rawPrice: any = null;
  let description = partialData?.description || '';
  let images: string[] = partialData?.images || [];
  let category = '';

  let hasPatternData = false;

  if (
    partialData?.priceOriginal !== null &&
    partialData?.priceOriginal !== undefined
  ) {
    rawPrice = partialData.priceOriginal;
    hasPatternData = true;
  }

  const $ = cheerio.load(html || '');

  // 1. Inspect Inline JS State & Analytics Objects
  const scriptContents = $('script:not([src])')
    .map((_, el) => $(el).html() || '')
    .get()
    .join('\n');

  // A. ShopifyAnalytics object
  if (!title || !rawPrice) {
    const shopifyMetaMatch = scriptContents.match(
      /window\.ShopifyAnalytics\.meta\.product\s*=\s*(\{.*?\});/s
    );
    if (shopifyMetaMatch && shopifyMetaMatch[1]) {
      try {
        const meta = JSON.parse(shopifyMetaMatch[1]);
        if (!title && meta.type) {
          title = meta.type;
          hasPatternData = true;
        }
        if (!rawPrice && meta.variants?.[0]?.price) {
          rawPrice = meta.variants[0].price;
          hasPatternData = true;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  }

  // B. Google Tag Manager / dataLayer
  if (!title || !rawPrice) {
    const dataLayerMatches = scriptContents.match(
      /dataLayer\.push\((.*?)\);/gs
    );
    if (dataLayerMatches) {
      for (const dlSnippet of dataLayerMatches) {
        try {
          const jsonStr = dlSnippet
            .replace(/^dataLayer\.push\(/, '')
            .replace(/\);$/, '')
            .trim();
          const dlObj = JSON.parse(jsonStr);
          const prod =
            dlObj.ecommerce?.detail?.products?.[0] ||
            dlObj.ecommerce?.items?.[0] ||
            dlObj.product;
          if (prod) {
            if (!title && prod.name) {
              title = prod.name;
              hasPatternData = true;
            }
            if (!brand && prod.brand) {
              brand = prod.brand;
              hasPatternData = true;
            }
            if (!rawPrice && prod.price) {
              rawPrice = prod.price;
              hasPatternData = true;
            }
            if (!category && prod.category) category = prod.category;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  // C. Next.js __NEXT_DATA__
  const nextDataEl = $('#__NEXT_DATA__');
  if (nextDataEl.length > 0) {
    try {
      const nextJson = JSON.parse(nextDataEl.html() || '{}');
      const pageProps = nextJson.props?.pageProps;
      const productObj = pageProps?.product || pageProps?.initialState?.product;
      if (productObj) {
        if (!title && productObj.name) {
          title = productObj.name;
          hasPatternData = true;
        }
        if (!brand && productObj.brand) {
          brand = productObj.brand;
          hasPatternData = true;
        }
        if (!rawPrice && productObj.price) {
          rawPrice = productObj.price;
          hasPatternData = true;
        }
      }
    } catch {
      // Ignore Next.js parse errors
    }
  }

  // 2. Deterministic Body Text Currency Regex
  if (!rawPrice) {
    const bodyText = $('body').text().replace(/\s+/g, ' ');
    const pkrPriceRegex =
      /(?:PKR|Rs\.?|₨\.?)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]{3,6})/gi;
    const matches = Array.from(bodyText.matchAll(pkrPriceRegex));
    for (const m of matches) {
      const parsed = normalizePkrPrice(m[1]);
      if (parsed && parsed >= 500 && parsed <= 500000) {
        rawPrice = parsed;
        hasPatternData = true;
        break;
      }
    }
  }

  // Fallback image extraction from img tags
  if (images.length === 0) {
    const candidateImgs: string[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (
        src &&
        !src.includes('.svg') &&
        (src.includes('product') ||
          src.includes('cdn') ||
          src.includes('media'))
      ) {
        candidateImgs.push(src);
      }
    });
    images = sanitizeAndUpgradeImages(candidateImgs, url.origin);
  }

  // 3. Optional Semantic Groq AI Fallback
  const groqApiKey = process.env.GROQ_API_KEY;
  const hasValidGroqKey = groqApiKey && !groqApiKey.includes('dummy_key');

  if (!options?.skipAi && hasValidGroqKey && (!title || !rawPrice)) {
    try {
      logger.info(
        `[Scraper Tier 4] Attempting Groq AI extraction for ${url.hostname}`
      );
      const textSample = $('body')
        .text()
        .replace(/\s+/g, ' ')
        .substring(0, 2000);
      const prompt = `Extract Pakistani apparel product details as strict JSON from this page snippet:
Title: ${$('title').text()}
URL: ${url.toString()}
Text: ${textSample}

Respond ONLY with valid JSON in this structure:
{
  "title": string,
  "brand": string,
  "price": number,
  "gender": "male" | "female",
  "garmentType": "full_suit" | "kurta" | "kameez_only" | "trouser_only" | "other"
}`;

      const aiResponse = await AiClient.executeWithLogging(
        { feature: 'scraper_tier4_fallback' },
        {
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        },
        2500
      );

      const parsedAi = JSON.parse(
        aiResponse.choices?.[0]?.message?.content || '{}'
      );
      if (!title && parsedAi.title) {
        title = parsedAi.title;
        hasPatternData = true;
      }
      if (!brand && parsedAi.brand) {
        brand = parsedAi.brand;
        hasPatternData = true;
      }
      if (!rawPrice && parsedAi.price) {
        rawPrice = parsedAi.price;
        hasPatternData = true;
      }
    } catch (aiErr: any) {
      logger.warn(
        `[Scraper Tier 4] Groq AI fallback bypassed: ${aiErr.message}`
      );
    }
  }

  // If no pattern extracted valid product data, fail Tier 4
  if (!hasPatternData) {
    return {
      success: false,
      tier: 4,
      error:
        'Tier 4 pattern extraction found no inline analytics, body price, or AI product data',
    };
  }

  // Fallbacks for missing fields
  if (!brand) brand = partialData?.brand || brandFromHostname(url.hostname);
  if (!title) title = partialData?.title || titleFromSlug(url.pathname);

  const priceOriginal = normalizePkrPrice(rawPrice);

  const genderResult = detectGenderAndGarment({
    title,
    category,
    url: url.toString(),
    description,
  });

  const scrapedProduct: ScrapedProduct = {
    title,
    brand,
    priceOriginal,
    currencyOriginal: 'PKR',
    description: description || `${brand} ${title} unstitched suit`,
    images,
    gender: genderResult.gender,
    garmentType: genderResult.garmentType,
    confidenceScore: 0.7,
    fallbackTier: 4,
    sourceUrl: url.toString(),
    normalizedUrl: normalizeUrlString(url.toString()),
    fabricMaterial: genderResult.fabricMaterial,
    colorTags: [],
    requiresManualPrice: priceOriginal === null,
    parseSource: `${url.hostname} (Pattern Extraction)`,
    parseMetadata: {
      matchedGenderTerms: genderResult.matchedTerms,
    },
  };

  return {
    success: true,
    tier: 4,
    data: scrapedProduct,
  };
}
