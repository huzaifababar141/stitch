import { URL } from 'url';
import { ExtractionOptions } from '../types';
import { BROWSER_HEADERS } from '../user-agents';
import { logger } from '@/lib/utils/logger';

export interface FetchHtmlResult {
  success: boolean;
  html?: string;
  status?: number;
  error?: string;
}

/**
 * Tier 2: Browser-Mimicking HTTP Fetch Engine
 * Provides realistic browser headers, client hints (sec-ch-ua), and timeouts.
 */
export async function executeTier2Fetch(
  url: URL,
  options?: ExtractionOptions
): Promise<FetchHtmlResult> {
  // If HTML is pre-supplied via options (e.g. Offline fixtures / tests), use directly
  if (options?.html) {
    return {
      success: true,
      html: options.html,
      status: 200,
    };
  }

  const timeoutMs = options?.timeoutMs || 4000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    logger.info(
      `[Scraper Tier 2] Fetching HTML with browser mimicry: ${url.toString()}`
    );
    const res = await fetch(url.toString(), {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const status = res.status;
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      logger.warn(`[Scraper Tier 2] HTTP status ${status} for ${url.hostname}`);
      return {
        success: false,
        status,
        error: `HTTP ${status}: ${res.statusText}`,
      };
    }

    if (
      !contentType.includes('text/html') &&
      !contentType.includes('application/xhtml')
    ) {
      logger.warn(`[Scraper Tier 2] Unexpected content type: ${contentType}`);
    }

    const html = await res.text();
    return {
      success: true,
      html,
      status,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout =
      err.name === 'AbortError' || err.message?.includes('aborted');
    const msg = isTimeout
      ? `Request timed out after ${timeoutMs}ms`
      : err.message || String(err);
    logger.warn(`[Scraper Tier 2] Fetch failed: ${msg}`);
    return {
      success: false,
      error: msg,
    };
  }
}
