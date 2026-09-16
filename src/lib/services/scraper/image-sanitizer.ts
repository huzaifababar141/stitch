import { URL } from 'url';

const ASSET_EXCLUSION_KEYWORDS = [
  'logo',
  'icon',
  'badge',
  'payment',
  'cart',
  'visa',
  'mastercard',
  'easypaisa',
  'jazzcash',
  'banner',
  'placeholder',
  'avatar',
  'rating',
  'star',
  'loader',
  'spinner',
  'trust',
  'size-guide',
  'size_chart',
  'sizechart',
  'arrow',
  'close',
  'search',
  'pixel',
  'facebook',
  'instagram',
  'whatsapp',
  'apple-pay',
  'google-pay',
];

/**
 * Checks whether an image URL matches non-garment UI icons, badges, logos, or tracking assets.
 */
export function isNonProductAsset(url: string): boolean {
  const lower = url.toLowerCase();

  // Exclude data URIs
  if (lower.startsWith('data:')) return true;

  // Exclude SVGs (usually icons)
  if (lower.includes('.svg')) return true;

  // Exclude 1x1 tracking GIFs / pixels
  if (
    lower.includes('1x1') ||
    lower.includes('/pixel.') ||
    lower.includes('/beacon.')
  )
    return true;

  return ASSET_EXCLUSION_KEYWORDS.some((term) => lower.includes(term));
}

/**
 * Strips Shopify thumbnail suffixes and upgrades images to master / 2048px resolution.
 * e.g., "https://cdn.shopify.com/s/files/.../img_compact.jpg?v=123" -> "https://cdn.shopify.com/s/files/.../img.jpg?v=123"
 */
export function upgradeShopifyImageUrl(rawUrl: string): string {
  let url = rawUrl;

  // Remove thumbnail dimension suffixes before file extension:
  // e.g. _100x100.jpg, _compact.jpg, _medium.jpg, _small.jpg, _large.jpg, _grande.jpg, _1024x1024.jpg
  url = url.replace(
    /_(?:pico|icon|thumb|small|compact|medium|large|grande|master|\d+x\d+)(\.[a-zA-Z0-9]+)(?:(\?.*))?$/i,
    (_match, ext, query) => `${ext}${query || ''}`
  );

  // If URL has query parameters with width / height sizing restrictions, upscale or remove
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('width')) {
      const widthVal = parseInt(parsed.searchParams.get('width') || '0', 10);
      if (widthVal < 1200) {
        parsed.searchParams.set('width', '2048');
      }
    }
    if (parsed.searchParams.has('height')) {
      const heightVal = parseInt(parsed.searchParams.get('height') || '0', 10);
      if (heightVal < 1200) {
        parsed.searchParams.delete('height');
      }
    }
    url = parsed.toString();
  } catch {
    // Leave URL as is if parsing fails
  }

  return url;
}

/**
 * Upgrades Salesforce Commerce Cloud (Demandware) image URLs (e.g. Khaadi) to high-res.
 * e.g. "https://pk.khaadi.com/dw/image/v2/.../img.jpg?sw=400&sh=600&sm=fit" -> "?sw=1600&sh=2400&sm=fit"
 */
export function upgradeDemandwareImageUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.searchParams.has('sw')) {
      parsed.searchParams.set('sw', '1600');
    }
    if (parsed.searchParams.has('sh')) {
      parsed.searchParams.set('sh', '2400');
    }
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Resolves relative and protocol-relative URLs into absolute HTTPS URLs.
 */
export function resolveAbsoluteImageUrl(
  url: string,
  baseUrl?: string
): string | null {
  if (!url || typeof url !== 'string') return null;
  let clean = url.trim();

  // Strip leading/trailing quotes or brackets
  clean = clean.replace(/^['"\(]+|['"\)]+$/g, '');

  if (clean.startsWith('//')) {
    clean = `https:${clean}`;
  } else if (clean.startsWith('/') && baseUrl) {
    try {
      clean = new URL(clean, baseUrl).toString();
    } catch {
      return null;
    }
  }

  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return null;
  }

  // Upgrade HTTP to HTTPS for known Pakistani apparel CDNs
  if (clean.startsWith('http://')) {
    clean = clean.replace('http://', 'https://');
  }

  return clean;
}

/**
 * Normalizes, upgrades, deduplicates, and filters a list of image URLs.
 */
export function sanitizeAndUpgradeImages(
  rawImages: (string | unknown)[],
  baseUrl?: string,
  maxImages: number = 8
): string[] {
  if (!Array.isArray(rawImages)) return [];

  const seenKeys = new Set<string>();
  const sanitized: string[] = [];

  for (const item of rawImages) {
    let candidate = '';
    if (typeof item === 'string') {
      candidate = item;
    } else if (item && typeof item === 'object') {
      candidate =
        (item as any).src ||
        (item as any).url ||
        (item as any).contentUrl ||
        '';
    }

    if (!candidate) continue;

    const absUrl = resolveAbsoluteImageUrl(candidate, baseUrl);
    if (!absUrl) continue;

    if (isNonProductAsset(absUrl)) continue;

    let upgradedUrl = absUrl;
    if (
      upgradedUrl.includes('cdn.shopify.com') ||
      upgradedUrl.includes('/cdn/shop/')
    ) {
      upgradedUrl = upgradeShopifyImageUrl(upgradedUrl);
    } else if (
      upgradedUrl.includes('/dw/image/v2/') ||
      upgradedUrl.includes('khaadi.com')
    ) {
      upgradedUrl = upgradeDemandwareImageUrl(upgradedUrl);
    }

    // Canonical key for deduplication (strip transient cache-buster query params like ?v=...)
    const dedupKey = upgradedUrl
      .split('?')[0]
      .replace(/_[0-9]+x[0-9]*\./, '.')
      .toLowerCase();

    if (!seenKeys.has(dedupKey)) {
      seenKeys.add(dedupKey);
      sanitized.push(upgradedUrl);
    }

    if (sanitized.length >= maxImages) {
      break;
    }
  }

  return sanitized;
}
