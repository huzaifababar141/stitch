import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { Prisma } from '@prisma/client';
import { db } from '../../config/database';
import { AppError } from '../../shared/errors/AppError';
import { logger } from '../../config/logger';

export const ALLOWED_DOMAINS = [
  'khaadi.com',
  'gul-ahmed.com',
  'alkaram.com',
  'limelight.pk',
  'sapphireonline.pk',
  'sanasafinaz.com',
  'generation.com.pk',
  'elan.com.pk',
];

export class LinkParserService {
  /**
   * Validate URL format, HTTPS scheme, domain whitelist & SSRF protection
   */
  validateUrl(inputUrl: string): URL {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(inputUrl);
    } catch {
      throw AppError.badRequest('Invalid URL format');
    }

    // 1. Must be HTTPS scheme
    if (parsedUrl.protocol !== 'https:') {
      throw AppError.badRequest('Only HTTPS URLs are allowed');
    }

    // 2. Path traversal & SSRF check
    if (inputUrl.includes('..') || inputUrl.includes('%2e%2e')) {
      throw AppError.badRequest('Invalid URL path traversal detected');
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // 3. Reject IP address hostnames (IPv4 & IPv6) & localhost for SSRF prevention
    const isIpAddress =
      /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
      hostname.includes(':') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0';

    if (isIpAddress) {
      throw AppError.forbidden('IP addresses and localhost URLs are forbidden for SSRF security');
    }

    // 4. Whitelist domain check
    const isAllowedDomain = ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isAllowedDomain) {
      throw AppError.forbidden(
        `Domain '${hostname}' is not supported. Allowed domains: ${ALLOWED_DOMAINS.join(', ')}`
      );
    }

    return parsedUrl;
  }

  /**
   * Normalize URL to prevent duplicate parses (stripping tracking query parameters)
   */
  normalizeUrl(parsedUrl: URL): string {
    const cleanUrl = new URL(parsedUrl.origin + parsedUrl.pathname);
    return cleanUrl.toString().toLowerCase().replace(/\/$/, '');
  }

  /**
   * Infer brand name from domain hostname
   */
  private inferBrand(hostname: string): string {
    if (hostname.includes('khaadi')) return 'Khaadi';
    if (hostname.includes('gul-ahmed')) return 'Gul Ahmed';
    if (hostname.includes('alkaram')) return 'AlKaram Studio';
    if (hostname.includes('limelight')) return 'Limelight';
    if (hostname.includes('sapphire')) return 'Sapphire';
    if (hostname.includes('sanasafinaz')) return 'Sana Safinaz';
    if (hostname.includes('generation')) return 'Generation';
    if (hostname.includes('elan')) return 'Elan';
    return 'Pakistani Fashion Brand';
  }

  /**
   * Parse product details from web link
   */
  async parseProductLink(rawUrl: string, userId?: string) {
    const parsedUrl = this.validateUrl(rawUrl);
    const normalizedUrl = this.normalizeUrl(parsedUrl);

    // Check if URL was already parsed and cached
    const existingProduct = await db.product.findFirst({
      where: { normalizedUrl },
    });

    if (existingProduct) {
      logger.info(`Returning cached product for URL: ${normalizedUrl}`);
      return existingProduct;
    }

    // Log parse attempt to AuditLog
    await db.auditLog.create({
      data: {
        userId: userId ?? null,
        action: 'parse_product_link_start',
        entityType: 'Product',
        newData: { rawUrl, normalizedUrl, domain: parsedUrl.hostname },
      },
    });

    let htmlData = '';
    try {
      const response = await axios.get(rawUrl, {
        timeout: 5000, // 5000ms timeout
        maxContentLength: 1024 * 1024, // 1MB limit
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      htmlData = response.data;
    } catch (error: any) {
      logger.error(`Failed to fetch product URL ${rawUrl}:`, error.message);
      throw AppError.badRequest(`Could not fetch product page: ${error.message}`);
    }

    const $ = cheerio.load(htmlData);

    // Extract OpenGraph / Meta tags & CSS selectors
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('h1.product-single__title').text().trim() ||
      $('h1').first().text().trim() ||
      $('title').text().trim() ||
      'Unstitched Suit Product';

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('.product-single__description').text().trim() ||
      null;

    const mainImageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('img[itemprop="image"]').attr('src') ||
      null;

    const images: string[] = [];
    if (mainImageUrl) {
      const absoluteImgUrl = mainImageUrl.startsWith('//')
        ? `https:${mainImageUrl}`
        : mainImageUrl;
      images.push(absoluteImgUrl);
    }

    // Secondary product images check
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && (src.includes('/products/') || src.includes('/catalog/')) && images.length < 5) {
        const fullSrc = src.startsWith('//') ? `https:${src}` : src;
        if (!images.includes(fullSrc)) {
          images.push(fullSrc);
        }
      }
    });

    // Price extraction
    const rawPriceStr =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="og:price:amount"]').attr('content') ||
      $('.price-item--regular').first().text() ||
      $('.product__price').first().text() ||
      $('.price').first().text() ||
      '';

    const priceMatch = rawPriceStr.replace(/,/g, '').match(/(\d+(\.\d+)?)/);
    const parsedPrice = priceMatch ? parseFloat(priceMatch[1]) : null;

    const brand = this.inferBrand(parsedUrl.hostname);

    // Save product to DB
    const product = await db.product.create({
      data: {
        sourceUrl: rawUrl,
        normalizedUrl,
        name: title,
        brand,
        description: description ? description.substring(0, 1000) : null,
        images,
        priceOriginal: parsedPrice ? new Prisma.Decimal(parsedPrice) : null,
        currencyOriginal: 'PKR',
        parseSource: parsedUrl.hostname,
        parsedAt: new Date(),
        parseMetadata: {
          rawPriceStr,
          scrapedAt: new Date().toISOString(),
        },
        createdById: userId ?? null,
      },
    });

    // Log completion audit
    await db.auditLog.create({
      data: {
        userId: userId ?? null,
        action: 'parse_product_link_success',
        entityType: 'Product',
        entityId: product.id,
        newData: { productId: product.id, title, brand, parsedPrice },
      },
    });

    return product;
  }

  /**
   * Get product details by ID
   */
  async getProductById(productId: string) {
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw AppError.notFound('Product not found');
    }

    return product;
  }
}

export const linkParserService = new LinkParserService();
