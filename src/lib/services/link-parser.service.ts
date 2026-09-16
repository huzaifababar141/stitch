import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import {
  ScrapedProduct,
  ExtractionOptions,
  extractProductDetails,
  ALLOWED_DOMAINS,
  validateUrl,
  normalizeUrlString,
} from './scraper';

// Re-export core extractor and types for consumers
export {
  extractProductDetails,
  ALLOWED_DOMAINS,
  validateUrl,
  normalizeUrlString,
};
export type { ScrapedProduct, ExtractionOptions };

const VALID_FABRIC_TYPES = [
  'cotton',
  'lawn',
  'chiffon',
  'silk',
  'linen',
  'khaddar',
  'karandi',
  'organza',
];

/**
 * Parses an e-commerce product link and persists the extracted details to the database.
 * Uses the decoupled 5-tier extraction engine under the hood.
 */
export async function parseProductLink(urlStr: string, userId?: string) {
  const parsedUrl = validateUrl(urlStr);
  const normalized = normalizeUrlString(urlStr);

  // 1. Check Database Cache
  const existingProduct = await prisma.product.findFirst({
    where: { normalizedUrl: normalized },
  });

  if (existingProduct) {
    logger.info(`Product link retrieved from cache: ${normalized}`);
    const meta = (existingProduct.parseMetadata as Record<string, any>) || {};
    return {
      ...existingProduct,
      title: existingProduct.name || 'Custom Garment',
      gender: (meta.gender as 'male' | 'female') || 'female',
      garmentType:
        (existingProduct.garmentType as string) ||
        meta.garmentType ||
        'full_suit',
      confidenceScore: meta.confidenceScore ?? 0.95,
      fallbackTier: meta.fallbackTier ?? 1,
      requiresManualPrice:
        meta.requiresManualPrice ?? existingProduct.priceOriginal === null,
    };
  }

  // 2. Extract product details via decoupled multi-tier engine
  const scraped = await extractProductDetails(urlStr);

  // 3. Match fabric type to Prisma enum if valid
  const fabricTypeEnum =
    scraped.fabricMaterial &&
    VALID_FABRIC_TYPES.includes(scraped.fabricMaterial)
      ? (scraped.fabricMaterial as any)
      : undefined;

  // 4. Persist to Prisma Database
  const productData = {
    sourceUrl: scraped.sourceUrl,
    normalizedUrl: scraped.normalizedUrl,
    name: scraped.title.substring(0, 500),
    brand: scraped.brand.substring(0, 200),
    description: scraped.description || 'Custom unstitched suit garment',
    images: scraped.images,
    priceOriginal:
      scraped.priceOriginal !== null ? scraped.priceOriginal : undefined,
    currencyOriginal: scraped.currencyOriginal,
    parseSource:
      scraped.parseSource ||
      `${parsedUrl.hostname} (Tier ${scraped.fallbackTier})`,
    parsedAt: new Date(),
    createdById: userId || undefined,
    garmentType: (scraped.garmentType || 'full_suit') as any,
    fabricType: fabricTypeEnum,
    colorTags: scraped.colorTags || [],
    parseMetadata: {
      fallbackTier: scraped.fallbackTier,
      confidenceScore: scraped.confidenceScore,
      gender: scraped.gender,
      garmentType: scraped.garmentType,
      fabricMaterial: scraped.fabricMaterial,
      requiresManualPrice: scraped.requiresManualPrice,
      ...(scraped.parseMetadata || {}),
    },
  };

  const savedProduct = await prisma.product.create({
    data: productData,
  });

  logger.info(
    `Successfully parsed and saved product ${savedProduct.id} (Tier ${scraped.fallbackTier})`
  );

  return {
    ...savedProduct,
    title: savedProduct.name || scraped.title,
    gender: scraped.gender,
    garmentType: scraped.garmentType,
    fallbackTier: scraped.fallbackTier,
    confidenceScore: scraped.confidenceScore,
    requiresManualPrice: scraped.requiresManualPrice,
  };
}
