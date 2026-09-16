import { URL } from 'url';
import { AppError } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';

export const ALLOWED_DOMAINS: string[] = [
  'khaadi.com',
  'gulahmedshop.com',
  'sapphireonline.pk',
  'sanasafinaz.com',
  'junaidjamshed.com',
  'alkaramstudio.com',
  'mariab.pk',
  'mbasics.pk',
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

export const BRAND_HOSTNAMES: Record<string, string> = {
  'junaidjamshed.com': 'J. (Junaid Jamshed)',
  'sapphireonline.pk': 'Sapphire',
  'pk.sapphireonline.pk': 'Sapphire',
  'khaadi.com': 'Khaadi',
  'pk.khaadi.com': 'Khaadi',
  'sanasafinaz.com': 'Sana Safinaz',
  'mariab.pk': 'Maria.B',
  'mbasics.pk': 'Maria.B',
  'gulahmedshop.com': 'Gul Ahmed (Ideas)',
  'ideas.com.pk': 'Gul Ahmed (Ideas)',
  'limelight.pk': 'LimeLight',
  'nishatlinen.com': 'Nishat Linen',
  'alkaramstudio.com': 'Alkaram Studio',
  'baroque.pk': 'Baroque',
  'asimjofa.com': 'Asim Jofa',
  'charizma.pk': 'Charizma',
  'crossstitch.pk': 'Cross Stitch',
  'zelbury.com': 'Zelbury',
  'ethnic.pk': 'Ethnic',
  'bonanzasatrangi.com': 'Bonanza Satrangi',
  'beechtree.pk': 'Beechtree',
  'edenrobe.com': 'Edenrobe',
  'generation.com.pk': 'Generation',
  'zarashahjahan.com': 'Zara Shahjahan',
  'sohaib.pk': 'Sohaib',
};

export const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Cache-Control': 'max-age=0',
  'Sec-Ch-Ua':
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

export const JSON_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8',
  'Sec-Ch-Ua':
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
};

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

export function normalizeUrlString(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return urlStr.split('?')[0].split('#')[0];
  }
}

export function brandFromHostname(hostname: string): string {
  const cleanHost = hostname.replace(/^www\./, '').toLowerCase();
  if (BRAND_HOSTNAMES[cleanHost]) {
    return BRAND_HOSTNAMES[cleanHost];
  }
  for (const [domain, brand] of Object.entries(BRAND_HOSTNAMES)) {
    if (cleanHost === domain || cleanHost.endsWith(`.${domain}`)) {
      return brand;
    }
  }

  // Fallback: capitalize main domain label
  const firstPart = cleanHost.split('.')[0] || 'Designer Brand';
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
}

export function titleFromSlug(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || 'unstitched-suit';
  let cleanSlug: string;
  try {
    cleanSlug = decodeURIComponent(last);
  } catch {
    cleanSlug = last;
  }
  cleanSlug = cleanSlug
    .replace(/\.html?$/i, '')
    .replace(/\.php$/i, '')
    .replace(/\.json$/i, '');

  // Preserve hyphenation for garment descriptors like 3-piece, 2-piece, 1-piece, 4-piece, 3-pc
  cleanSlug = cleanSlug.replace(
    /\b(\d+)(?:[-_](?:pieces?|pc)|pc)\b/gi,
    'TOKENPIECE$1'
  );

  const words = cleanSlug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => {
      if (w.startsWith('TOKENPIECE')) {
        const num = w.replace('TOKENPIECE', '');
        return `${num}-Piece`;
      }
      const lower = w.toLowerCase();
      // Keep acronyms like 3pc, 2pc, pc, pk, ss clean
      if (/^\d+pc$/i.test(lower)) {
        return lower.replace('pc', '-Piece');
      }
      if (/^(3|2|1)pc$/i.test(lower)) {
        return lower.toUpperCase();
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

  return words.join(' ') || 'Custom Apparel Item';
}
