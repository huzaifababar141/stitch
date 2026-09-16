export interface ScrapedProduct {
  title: string;
  brand: string;
  priceOriginal: number | null; // numeric PKR value (integer) or null if manual required
  currencyOriginal: 'PKR';
  description: string;
  images: string[]; // absolute high-res URLs, deduplicated
  gender: 'male' | 'female';
  garmentType?:
    'full_suit' | 'kurta' | 'kameez_only' | 'trouser_only' | 'other';
  confidenceScore: number; // 0.0 - 1.0
  fallbackTier: 1 | 2 | 3 | 4 | 5;
  sourceUrl: string;
  normalizedUrl: string;
  fabricMaterial?: string;
  colorTags?: string[];
  requiresManualPrice?: boolean;
  parseSource?: string;
  parseMetadata?: Record<string, any>;
}

export interface ExtractionOptions {
  timeoutMs?: number;
  skipAi?: boolean;
  forceTier?: number;
  html?: string; // Optional pre-loaded HTML for offline fixtures / tests
  mockJson?: any; // Optional pre-loaded JSON for offline fixtures / tests
}

export interface GenderDetectionResult {
  gender: 'male' | 'female';
  confidence: number; // 0.0 to 1.0
  matchedTerms: string[];
  garmentType: 'full_suit' | 'kurta' | 'kameez_only' | 'trouser_only' | 'other';
  source: 'path' | 'tags' | 'category' | 'title' | 'description' | 'default';
  fabricMaterial?: string;
}

export interface TierResult {
  success: boolean;
  tier: 1 | 2 | 3 | 4 | 5;
  data?: Partial<ScrapedProduct>;
  error?: string;
}
