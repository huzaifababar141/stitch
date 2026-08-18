import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/utils/errors';
import { URL } from 'url';

export const ALLOWED_DOMAINS = [
  'khaadi.com',
  'gulahmedshop.com',
  'sapphireonline.pk',
  'sanasafinaz.com',
  'junaidjamshed.com',
  'alkaramstudio.com',
  'mariab.pk',
  'limelight.pk',
  'asimjofa.com',
  'baroque.pk',
  'nishatlinen.com',
  'charizma.pk',
  'crossstitch.pk',
  'zelbury.com',
  'ethnic.pk',
  'bonanzasatrangi.com',
  'beechtree.pk',
  'sohaib.pk',
  'edenrobe.com',
  'generation.com.pk',
  'zarashahjahan.com',
];

export function validateUrl(urlStr: string): URL {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlStr);
  } catch (e) {
    throw AppError.badRequest('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw AppError.badRequest('URL must use HTTP or HTTPS protocol');
  }

  const hostname = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();

  const isAllowed = ALLOWED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
  if (!isAllowed) {
    logger.warn(
      `Domain ${hostname} not in strict allowlist, attempting fallback parse`
    );
  }

  return parsedUrl;
}

function normalizeUrl(parsedUrl: URL): string {
  // Remove tracking parameters
  parsedUrl.search = '';
  parsedUrl.hash = '';
  return parsedUrl.toString();
}

export async function parseProductLink(urlStr: string, userId: string) {
  const parsedUrl = validateUrl(urlStr);
  const normalized = normalizeUrl(parsedUrl);

  // 1. Check Cache
  const existingProduct = await prisma.product.findFirst({
    where: { normalizedUrl: normalized },
  });

  if (existingProduct) {
    logger.info(`Product link parsed from cache: ${normalized}`);
    return existingProduct;
  }

  // 2. Fetch HTML
  logger.info(`Fetching product from URL: ${normalized}`);
  let html: string;
  try {
    const response = await fetch(urlStr, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    html = await response.text();
  } catch (error: any) {
    logger.error(`Failed to fetch product URL ${urlStr}: ${error.message}`);
    throw AppError.badRequest(
      'Failed to fetch product page. Ensure the link is publicly accessible.'
    );
  }

  // 3. Parse with Cheerio
  const $ = cheerio.load(html);

  // Generic OpenGraph/Meta parsing
  const title =
    $('meta[property="og:title"]').attr('content') || $('title').text() || '';
  let description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    '';
  const image = $('meta[property="og:image"]').attr('content');
  const brand =
    $('meta[property="og:site_name"]').attr('content') || parsedUrl.hostname;

  let images: string[] = [];
  if (image) {
    images.push(image);
  }

  // Find price (basic heuristic)
  let priceOriginal = null;
  let currency = 'PKR';

  // Example for scraping schema.org product metadata (often present in Shopify/Magento)
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      if (
        data['@type'] === 'Product' ||
        data['@type'] === 'IndividualProduct'
      ) {
        if (data.name) description = data.name;
        if (data.image) {
          if (Array.isArray(data.image)) {
            images = [...images, ...data.image];
          } else if (typeof data.image === 'string') {
            images.push(data.image);
          }
        }
        if (data.offers) {
          const offer = Array.isArray(data.offers)
            ? data.offers[0]
            : data.offers;
          if (offer && offer.price) {
            priceOriginal = parseFloat(offer.price);
            currency = offer.priceCurrency || currency;
          }
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  });

  // Fallback image search
  if (images.length === 0) {
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (
        src &&
        src.startsWith('http') &&
        (src.includes('product') ||
          src.includes('cdn') ||
          src.includes('media'))
      ) {
        images.push(src);
      }
    });
  }

  // Clean duplicate images
  images = Array.from(new Set(images)).slice(0, 5);

  // 4. Save to Database
  const productData = {
    sourceUrl: urlStr,
    normalizedUrl: normalized,
    name: title.substring(0, 500) || 'Custom Unstitched Suit',
    brand: brand.substring(0, 200) || 'Pakistani Brand',
    description: description || 'Custom unstitched suit garment',
    images: images,
    priceOriginal: priceOriginal ? priceOriginal : undefined,
    currencyOriginal: currency,
    parseSource: parsedUrl.hostname,
    parsedAt: new Date(),
    createdById: userId,
    garmentType: 'full_suit' as any,
  };

  const savedProduct = await prisma.product.create({
    data: productData,
  });

  logger.info(`Successfully parsed and saved product ${savedProduct.id}`);
  return savedProduct;
}
