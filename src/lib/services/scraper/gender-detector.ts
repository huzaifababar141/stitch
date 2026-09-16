import { GenderDetectionResult } from './types';

// Distinct word-boundary token patterns for male classification
export const MALE_DIRECT_TOKENS = [
  /\bmen's\b/i,
  /\bmens\b/i,
  /\bmen\b/i,
  /\bman\b/i,
  /\bgents'\b/i,
  /\bgents\b/i,
  /\bboys'\b/i,
  /\bboys\b/i,
  /\bboy\b/i,
  /\bmale\b/i,
];

export const MALE_GARMENT_TOKENS = [
  /\bshalwar\s+kameez\b/i,
  /\bkameez\s+shalwar\b/i,
  /\bshalwar\s+suit\b/i,
  /\bwaistcoat\b/i,
  /\bwaistcoats\b/i,
  /\bsadri\b/i,
  /\bsherwani\b/i,
  /\bsherwanis\b/i,
  /\bprince\s+coat\b/i,
  /\bnehru\s+jacket\b/i,
  /\bboski\b/i,
  /\blatha\b/i,
  /\blattha\b/i,
  /\bkarandi\s+gents\b/i,
  /\bchuridar\s+pajama\b/i,
  /\bpajama\s+suit\b/i,
  /\bban\s+collar\b/i,
  /\bsherwani\s+ban\b/i,
  /\bgol\s+daman\b/i,
];

// Distinct word-boundary token patterns for female classification
export const FEMALE_DIRECT_TOKENS = [
  /\bwomen's\b/i,
  /\bwomens\b/i,
  /\bwomen\b/i,
  /\bwoman\b/i,
  /\bladies'\b/i,
  /\bladies\b/i,
  /\blady\b/i,
  /\bgirls'\b/i,
  /\bgirls\b/i,
  /\bgirl\b/i,
  /\bfemale\b/i,
];

export const FEMALE_GARMENT_TOKENS = [
  /\b3\s*piece\b/i,
  /\b3-piece\b/i,
  /\b3pc\b/i,
  /\bthree\s*piece\b/i,
  /\bthree-piece\b/i,
  /\b2\s*piece\b/i,
  /\b2-piece\b/i,
  /\b2pc\b/i,
  /\btwo\s*piece\b/i,
  /\btwo-piece\b/i,
  /\b1\s*piece\b/i,
  /\b1-piece\b/i,
  /\b1pc\b/i,
  /\bkurti\b/i,
  /\bkurtis\b/i,
  /\bdupatta\b/i,
  /\bdupattas\b/i,
  /\bshirt\s+dupatta\b/i,
  /\bsuit\s+dupatta\b/i,
  /\bunstitched\s+lawn\b/i,
  /\blawn\s+suit\b/i,
  /\bembroidered\s+lawn\b/i,
  /\bprinted\s+lawn\b/i,
  /\bchiffon\b/i,
  /\bchiffon\s+dupatta\b/i,
  /\borganza\b/i,
  /\bgeorgette\b/i,
  /\bsilk\s+dupatta\b/i,
  /\bjacquard\s+suit\b/i,
  /\bsharara\b/i,
  /\bgharara\b/i,
  /\blehenga\b/i,
  /\blehnga\b/i,
  /\bmaxi\b/i,
  /\bfrock\b/i,
  /\bangrakha\b/i,
  /\banarkali\b/i,
  /\bkaftan\b/i,
  /\bpalazzo\b/i,
  /\bcigarette\s+pants\b/i,
  /\bculottes\b/i,
  /\btulip\s+shalwar\b/i,
  /\bmprints\b/i,
  /\bmahay\b/i,
  /\bmuzlin\b/i,
  /\bluxury\s+pret\b/i,
];

export interface GenderDetectorInput {
  title?: string;
  tags?: string[] | string;
  category?: string;
  url?: string;
  description?: string;
}

/**
 * Accurately detects gender and garment type for Pakistani apparel items.
 */
export function detectGenderAndGarment(
  input: GenderDetectorInput
): GenderDetectionResult {
  let maleScore = 0;
  let femaleScore = 0;
  const matchedTerms: string[] = [];
  let primarySource: GenderDetectionResult['source'] = 'default';

  // Normalize string tags
  let tagList: string[] = [];
  if (Array.isArray(input.tags)) {
    tagList = input.tags.map((t) => String(t).toLowerCase());
  } else if (typeof input.tags === 'string') {
    tagList = input.tags
      .toLowerCase()
      .split(/[,;]/)
      .map((t) => t.trim());
  }
  const tagString = tagList.join(' ');

  // 1. Check URL Path (Weight: 4x) - High confidence indicator
  if (input.url) {
    try {
      const pathname = new URL(
        input.url,
        'https://example.com'
      ).pathname.toLowerCase();
      // Test URL segments
      if (
        /\/(men|mens|man|gents|eastern-men|men-unstitched|boys)\b/i.test(
          pathname
        )
      ) {
        maleScore += 4;
        matchedTerms.push(`url:${pathname}`);
        primarySource = 'path';
      }
      if (
        /\/(women|womens|woman|ladies|unstitched-woman|pret-women|girls)\b/i.test(
          pathname
        )
      ) {
        femaleScore += 4;
        matchedTerms.push(`url:${pathname}`);
        primarySource = 'path';
      }
    } catch {
      // Ignore URL parse errors
    }
  }

  // 2. Check Tags (Weight: 3x)
  if (tagString) {
    for (const regex of MALE_DIRECT_TOKENS) {
      if (regex.test(tagString)) {
        maleScore += 3;
        matchedTerms.push(`tag:${regex.source}`);
        if (primarySource === 'default') primarySource = 'tags';
      }
    }
    for (const regex of FEMALE_DIRECT_TOKENS) {
      if (regex.test(tagString)) {
        femaleScore += 3;
        matchedTerms.push(`tag:${regex.source}`);
        if (primarySource === 'default') primarySource = 'tags';
      }
    }
    for (const regex of MALE_GARMENT_TOKENS) {
      if (regex.test(tagString)) {
        maleScore += 2;
        matchedTerms.push(`tag:${regex.source}`);
        if (primarySource === 'default') primarySource = 'tags';
      }
    }
    for (const regex of FEMALE_GARMENT_TOKENS) {
      if (regex.test(tagString)) {
        femaleScore += 2;
        matchedTerms.push(`tag:${regex.source}`);
        if (primarySource === 'default') primarySource = 'tags';
      }
    }
  }

  // 3. Check Category / Breadcrumbs (Weight: 3x)
  if (input.category) {
    const cat = input.category.toLowerCase();
    for (const regex of MALE_DIRECT_TOKENS) {
      if (regex.test(cat)) {
        maleScore += 3;
        matchedTerms.push(`cat:${regex.source}`);
        if (primarySource === 'default') primarySource = 'category';
      }
    }
    for (const regex of FEMALE_DIRECT_TOKENS) {
      if (regex.test(cat)) {
        femaleScore += 3;
        matchedTerms.push(`cat:${regex.source}`);
        if (primarySource === 'default') primarySource = 'category';
      }
    }
  }

  // 4. Check Product Title (Weight: 2x)
  const title = (input.title || '').toLowerCase();
  if (title) {
    for (const regex of MALE_DIRECT_TOKENS) {
      if (regex.test(title)) {
        maleScore += 2.5;
        matchedTerms.push(`title:${regex.source}`);
        if (primarySource === 'default') primarySource = 'title';
      }
    }
    for (const regex of FEMALE_DIRECT_TOKENS) {
      if (regex.test(title)) {
        femaleScore += 2.5;
        matchedTerms.push(`title:${regex.source}`);
        if (primarySource === 'default') primarySource = 'title';
      }
    }
    for (const regex of MALE_GARMENT_TOKENS) {
      if (regex.test(title)) {
        maleScore += 2;
        matchedTerms.push(`title:${regex.source}`);
        if (primarySource === 'default') primarySource = 'title';
      }
    }
    for (const regex of FEMALE_GARMENT_TOKENS) {
      if (regex.test(title)) {
        femaleScore += 2;
        matchedTerms.push(`title:${regex.source}`);
        if (primarySource === 'default') primarySource = 'title';
      }
    }

    // Disambiguation for "Kurti" vs "Kurta"
    if (/\bkurti\b/i.test(title) || /\bkurtis\b/i.test(title)) {
      femaleScore += 3;
      matchedTerms.push('title:kurti');
    } else if (/\bkurta\b/i.test(title) || /\bkurtas\b/i.test(title)) {
      // Kurta alone: check surrounding words
      if (
        /\b(lawn|chiffon|dupatta|printed|embroidered|3pc|2pc|women|ladies)\b/i.test(
          title
        )
      ) {
        femaleScore += 2;
        matchedTerms.push('title:kurta_female_context');
      } else if (
        /\b(men|man|gents|boys|latha|boski|cotton|waistcoat|shalwar)\b/i.test(
          title
        )
      ) {
        maleScore += 2;
        matchedTerms.push('title:kurta_male_context');
      } else {
        // Kurta with no other context defaults slightly to male in traditional Pakistani tailoring
        maleScore += 1;
        matchedTerms.push('title:kurta_standalone');
      }
    }
  }

  // 5. Check Description (Weight: 1x)
  const desc = (input.description || '').toLowerCase();
  if (desc) {
    for (const regex of MALE_DIRECT_TOKENS) {
      if (regex.test(desc)) {
        maleScore += 1;
        matchedTerms.push(`desc:${regex.source}`);
      }
    }
    for (const regex of FEMALE_DIRECT_TOKENS) {
      if (regex.test(desc)) {
        femaleScore += 1;
        matchedTerms.push(`desc:${regex.source}`);
      }
    }
    for (const regex of MALE_GARMENT_TOKENS) {
      if (regex.test(desc)) {
        maleScore += 1;
        matchedTerms.push(`desc:${regex.source}`);
      }
    }
    for (const regex of FEMALE_GARMENT_TOKENS) {
      if (regex.test(desc)) {
        femaleScore += 1;
        matchedTerms.push(`desc:${regex.source}`);
      }
    }
  }

  // Determine Winner
  let gender: 'male' | 'female';
  let confidence: number;

  if (maleScore > femaleScore) {
    gender = 'male';
    const total = maleScore + femaleScore;
    confidence =
      total > 0 ? Math.min(1.0, Number((maleScore / total).toFixed(2))) : 0.85;
  } else {
    gender = 'female';
    const total = maleScore + femaleScore;
    confidence =
      total > 0
        ? Math.min(1.0, Number((femaleScore / total).toFixed(2)))
        : 0.85;
    // Default fallback when zero score is female (75%+ market share of custom tailoring)
    if (total === 0) {
      confidence = 0.75;
    }
  }

  // Determine Garment Type
  const combinedText = `${title} ${tagString} ${desc}`.toLowerCase();
  let garmentType: GenderDetectionResult['garmentType'] = 'full_suit';

  if (
    /\b(waistcoat|sadri|sherwani|prince\s+coat|nehru\s+jacket|maxi|frock|lehenga|gharara|sharara|kaftan)\b/i.test(
      combinedText
    )
  ) {
    garmentType = 'other';
  } else if (
    /\b(trouser\s+only|shalwar\s+only|cigarette\s+pants|tulip\s+shalwar|culottes|pajama\s+only)\b/i.test(
      combinedText
    )
  ) {
    garmentType = 'trouser_only';
  } else if (
    /\b(kurti|shirt\s+only|kameez\s+only|1\s*piece|1-piece|1pc)\b/i.test(
      combinedText
    ) &&
    !/\b(3\s*piece|3pc|2\s*piece|2pc|shalwar\s+kameez)\b/i.test(combinedText)
  ) {
    garmentType = 'kameez_only';
  } else if (
    /\b(kurta|kurtas)\b/i.test(combinedText) &&
    !/\b(3\s*piece|3pc|2\s*piece|2pc|shalwar\s+kameez|kameez\s+shalwar|suit)\b/i.test(
      combinedText
    )
  ) {
    garmentType = 'kurta';
  } else {
    garmentType = 'full_suit';
  }

  // Detect Fabric Material
  const fabricMaterial = detectFabricMaterial(combinedText);

  return {
    gender,
    confidence,
    matchedTerms,
    garmentType,
    source: primarySource,
    fabricMaterial,
  };
}

/**
 * Identifies standard Pakistani fabric material from text.
 */
export function detectFabricMaterial(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/\blawn\b/i.test(lower)) return 'lawn';
  if (/\bchiffon\b/i.test(lower)) return 'chiffon';
  if (/\bcotton\b/i.test(lower)) return 'cotton';
  if (/\bsilk\b/i.test(lower)) return 'silk';
  if (/\blinen\b/i.test(lower)) return 'linen';
  if (/\bkhaddar\b/i.test(lower)) return 'khaddar';
  if (/\bkarandi\b/i.test(lower)) return 'karandi';
  if (/\borganza\b/i.test(lower)) return 'organza';
  if (/\bboski\b/i.test(lower)) return 'boski';
  if (/\blatha\b/i.test(lower)) return 'latha';
  if (/\bjacquard\b/i.test(lower)) return 'jacquard';
  return undefined;
}
