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

/**
 * Tier 3: DOM Heuristics & Microdata Extraction Engine
 * Parses Schema.org JSON-LD, OpenGraph / Twitter cards, and platform-specific selectors (supporting SFCC Khaadi, etc.).
 */
export function executeTier3Dom(
  html: string,
  url: URL,
  options?: ExtractionOptions
): TierResult {
  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    return { success: false, tier: 3, error: 'Empty HTML received' };
  }

  const $ = cheerio.load(html);

  let title = '';
  let brand = '';
  let rawPrice: any = null;
  let description = '';
  let rawImages: string[] = [];
  let category = '';

  // 1. Schema.org JSON-LD Structured Data
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (!content) return;
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed)
        ? parsed
        : parsed['@graph']
          ? parsed['@graph']
          : [parsed];

      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const type = item['@type'];
        const isProduct =
          type === 'Product' ||
          type === 'IndividualProduct' ||
          type === 'ProductGroup' ||
          type === 'ItemPage' ||
          (Array.isArray(type) && type.includes('Product'));

        if (isProduct) {
          if (!title && item.name) {
            title = String(item.name).trim();
          }
          if (!brand && item.brand) {
            brand =
              typeof item.brand === 'string'
                ? item.brand
                : item.brand.name || '';
          }
          if (!description && item.description) {
            description = String(item.description).trim();
          }
          if (!category && item.category) {
            category = String(item.category).trim();
          }

          // Images
          if (item.image) {
            if (Array.isArray(item.image)) {
              for (const img of item.image) {
                if (typeof img === 'string') rawImages.push(img);
                else if (img?.url) rawImages.push(img.url);
                else if (img?.contentUrl) rawImages.push(img.contentUrl);
              }
            } else if (typeof item.image === 'string') {
              rawImages.push(item.image);
            } else if (item.image?.url) {
              rawImages.push(item.image.url);
            }
          }

          // Offers / Price
          if (!rawPrice && item.offers) {
            const offers = Array.isArray(item.offers)
              ? item.offers
              : [item.offers];
            for (const offer of offers) {
              if (offer && (offer.price || offer.lowPrice || offer.highPrice)) {
                rawPrice = offer.price || offer.lowPrice || offer.highPrice;
                break;
              }
            }
          }
        }
      }
    } catch {
      // Ignore JSON parse errors in inline scripts
    }
  });

  // 2. OpenGraph / Twitter Cards / Meta Tags (fill in missing fields)
  if (!title) {
    title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      $('title').text().trim() ||
      '';
    // Clean trailing brand suffix like " | Khaadi" or " - Sana Safinaz"
    title = title
      .replace(
        /\s*[-–|]\s*(?:Khaadi|Sapphire|Sana Safinaz|J\.?|Maria\.?B|Gul Ahmed).*$/i,
        ''
      )
      .trim();
  }

  if (!brand) {
    brand =
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[property="product:brand"]').attr('content') ||
      '';
  }

  if (!rawPrice) {
    rawPrice =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="og:price:amount"]').attr('content') ||
      $('meta[itemprop="price"]').attr('content') ||
      $('meta[name="twitter:data1"]').attr('content') ||
      null;
  }

  if (!description) {
    description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';
  }

  const ogImg =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[property="og:image:secure_url"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content');
  if (ogImg) {
    rawImages.unshift(ogImg);
  }

  // 3. Platform & Store-Specific CSS Selectors (e.g. SFCC Khaadi, Shopify, Magento)
  if (!title) {
    const titleSelectors = [
      'h1.product-title',
      'h1.product__title',
      'h1.page-title',
      'h1.pdp-title',
      'h1[itemprop="name"]',
      '.product-name h1',
      '.product-detail-name',
      '.pdp-details .name',
      'h1',
    ];
    for (const sel of titleSelectors) {
      const el = $(sel).first();
      if (el.length > 0 && el.text().trim()) {
        title = el.text().trim();
        break;
      }
    }
  }

  if (!rawPrice) {
    // Priority: Sale / Discounted price first, then standard price
    const priceSelectors = [
      '.sales .value', // Khaadi SFCC
      '.price-sales',
      '.sales-price',
      '.prices-add-to-cart-actions .price .value',
      '.price-item--sale',
      '.special-price .price',
      '.product__price--sale',
      '[data-product-price]',
      '.price-item--regular',
      '.product-price',
      '.current-price',
      '.pdp-price',
      '.regular-price .price',
      '.price-box .price',
      '.price .money',
      '.value[itemprop="price"]',
      '.price',
    ];

    for (const sel of priceSelectors) {
      const el = $(sel).first();
      if (el.length > 0) {
        const txt = el.text().trim();
        if (txt) {
          rawPrice = txt;
          break;
        }
      }
    }
  }

  // Gallery selectors (Khaadi, Demandware, Shopify)
  const imageSelectors = [
    '.primary-image',
    '.product-carousel img',
    '.product-image img',
    'img.product-thumbnail__image',
    '.pdp-images img',
    '.product-images img',
    '.product__media img',
    '.product-single__photo img',
    '.product-gallery img',
    'img[src*="pk.khaadi.com/dw/image"]',
    'img[src*="cdn.shopify.com"]',
  ];

  for (const sel of imageSelectors) {
    $(sel).each((_, imgEl) => {
      const src =
        $(imgEl).attr('src') ||
        $(imgEl).attr('data-src') ||
        $(imgEl).attr('data-zoom-image');
      if (src) rawImages.push(src);
    });
  }

  // Breadcrumbs / Category
  if (!category) {
    const breadcrumbSelectors = [
      'nav.breadcrumb',
      'ol.breadcrumb',
      '.breadcrumbs',
      '.breadcrumb-item',
      '[aria-label="Breadcrumb"]',
    ];
    for (const sel of breadcrumbSelectors) {
      const el = $(sel).first();
      if (el.length > 0) {
        category = el.text().trim().replace(/\s+/g, ' ');
        break;
      }
    }
  }

  // Final Sanitization
  if (!brand) {
    brand = brandFromHostname(url.hostname);
  }

  if (!title) {
    title = titleFromSlug(url.pathname);
  }

  const priceOriginal = normalizePkrPrice(rawPrice);
  const images = sanitizeAndUpgradeImages(rawImages, url.origin);

  // Clean description HTML tags
  if (description) {
    try {
      description = cheerio
        .load(description)
        .text()
        .trim()
        .replace(/\s+/g, ' ');
    } catch {
      description = description.replace(/<[^>]+>/g, '').trim();
    }
  } else {
    description = `${brand} ${title} unstitched designer garment`;
  }

  // Check whether we have sufficient data to consider Tier 3 successful
  const hasValidTitle =
    title && title.length > 2 && title !== 'Custom Apparel Item';
  const hasValidPrice = priceOriginal !== null;
  const hasValidImages = images.length > 0;

  if (!hasValidTitle && !hasValidPrice && !hasValidImages) {
    return {
      success: false,
      tier: 3,
      error: 'DOM heuristics failed to extract title, price, and images',
    };
  }

  // Gender & Garment classification
  const genderResult = detectGenderAndGarment({
    title,
    category,
    url: url.toString(),
    description,
  });

  // Calculate confidence score
  let confidenceScore = 0.85;
  if (hasValidTitle && hasValidPrice && hasValidImages) {
    confidenceScore = 0.9;
  } else if (!hasValidPrice) {
    confidenceScore = 0.78;
  }

  const scrapedProduct: ScrapedProduct = {
    title,
    brand,
    priceOriginal,
    currencyOriginal: 'PKR',
    description: description.substring(0, 2000),
    images,
    gender: genderResult.gender,
    garmentType: genderResult.garmentType,
    confidenceScore,
    fallbackTier: 3,
    sourceUrl: url.toString(),
    normalizedUrl: normalizeUrlString(url.toString()),
    fabricMaterial: genderResult.fabricMaterial,
    colorTags: [],
    requiresManualPrice: priceOriginal === null,
    parseSource: `${url.hostname} (DOM Heuristics)`,
    parseMetadata: {
      category,
      rawPriceText: typeof rawPrice === 'string' ? rawPrice : undefined,
      matchedGenderTerms: genderResult.matchedTerms,
      imagesFound: images.length,
    },
  };

  return {
    success: true,
    tier: 3,
    data: scrapedProduct,
  };
}
