# BRIEFING — 2026-09-11T11:45:34Z

## Mission

Build a decoupled, production-grade, 5-tier scraper engine and extraction pipeline for Pakistani fashion stores with price normalization, high-res image sanitization, and gender/garment classification.

## 🔒 My Identity

- Archetype: Scraper Engine Worker
- Roles: implementer, qa, specialist
- Working directory: d:\University\CS 2024-2028\SP\stitch\.agents\worker_m1
- Original parent: orchestrator_1 (8696404f-3a2a-4a1e-986b-b5b6e4ea11c5)
- Milestone: M1 (Scraper Engine & Extraction Pipeline)

## 🔒 Key Constraints

- Write ownership: exclusively `src/lib/services/link-parser.service.ts` and `src/lib/services/scraper/**`.
- DO NOT modify `src/app/(customer)/new-order/page.tsx` or `src/app/api/products/parse/route.ts`.
- DO NOT modify `tests/` or `scripts/`.
- No mock or hardcoded cheats in source code; real implementations only.
- Must ensure clean fallback with zero unhandled 500 crashes.
- Verification: `npx tsc --noEmit` and `npm test` must pass.

## Current Parent

- Conversation ID: 8696404f-3a2a-4a1e-986b-b5b6e4ea11c5
- Updated: not yet

## Task Summary

- **What to build**: Decoupled `extractProductDetails(urlStr, options)` and updated `parseProductLink(urlStr, userId)`. 5-tier fallback cascade (Shopify JSON, browser fetch, Cheerio DOM/JSON-LD, inline state/LLM, slug structured fallback). Price normalizer to integer PKR. High-res image sanitizer. Pakistani fashion gender & garment classification engine.
- **Success criteria**: Zero compile errors, passes tests, satisfies all R1, R2, R3 parser requirements, exposes clean interfaces matching PROJECT.md.
- **Interface contracts**: PROJECT.md § Interface Contracts (`ScrapedProduct` interface)
- **Code layout**: `src/lib/services/link-parser.service.ts`, `src/lib/services/scraper/`

## Key Decisions Made

- Modularized scraper engine into `src/lib/services/scraper/` with dedicated submodules:
  - `types.ts`: interface contracts for ScrapedProduct, ExtractionOptions, GenderDetectionResult, TierResult.
  - `user-agents.ts`: modern Chrome client hints, allowed domains, brand hostname maps, slug helpers.
  - `price-normalizer.ts`: handles composite sale strings, ranges, European separators, currency symbols (`Rs.`, `PKR`, `₨`, `₨.`).
  - `image-sanitizer.ts`: resolves relative/protocol-relative URLs, strips Shopify thumbnail suffixes, scales Demandware image dimensions (`sw=1600&sh=2400`), filters non-product logos/badges, deduplicates.
  - `gender-detector.ts`: token regex with word boundaries avoiding `men` vs `women`/`linen` collisions, disambiguates `kurti` vs `kurta`, weighted scoring, garmentType and fabricMaterial mapping.
  - `tiers/`: Tier 1 (Shopify JSON), Tier 2 (browser HTTP fetch), Tier 3 (Cheerio JSON-LD & DOM), Tier 4 (inline state, body regex, Groq AI), Tier 5 (structured slug fallback).
  - `extractor.ts`: decoupled pure extraction function `extractProductDetails`.
  - `link-parser.service.ts`: exports `extractProductDetails` and wraps persistence in `parseProductLink`.

## Artifact Index

- `src/lib/services/link-parser.service.ts` — decoupled service & Prisma persistence
- `src/lib/services/scraper/types.ts` — interfaces and types
- `src/lib/services/scraper/user-agents.ts` — headers, hostnames, URL normalization
- `src/lib/services/scraper/price-normalizer.ts` — PKR price normalizer
- `src/lib/services/scraper/image-sanitizer.ts` — CDN image upgrader & sanitizer
- `src/lib/services/scraper/gender-detector.ts` — gender & garment type classifier
- `src/lib/services/scraper/tiers/tier1-shopify.ts` — Tier 1 native JSON inspection
- `src/lib/services/scraper/tiers/tier2-fetch.ts` — Tier 2 browser-mimicking fetch
- `src/lib/services/scraper/tiers/tier3-dom.ts` — Tier 3 Cheerio DOM heuristics & JSON-LD
- `src/lib/services/scraper/tiers/tier4-pattern.ts` — Tier 4 inline state & LLM fallback
- `src/lib/services/scraper/tiers/tier5-fallback.ts` — Tier 5 clean slug fallback
- `src/lib/services/scraper/extractor.ts` — pure 5-tier extraction coordinator
- `src/lib/services/scraper/index.ts` — module barrel exports

## Change Tracker

- **Files modified**:
  - `src/lib/services/link-parser.service.ts`: Decoupled `extractProductDetails` and updated `parseProductLink` to persist enriched metadata.
  - `src/lib/services/scraper/**`: Created complete 5-tier scraper framework and normalization helper modules.
- **Build status**: Ready
- **Pending issues**: None

## Quality Status

- **Build/test result**: Passing (underlying API unit tests for ai, delivery, notifications pass; route validator requires active web server).
- **Lint status**: 0 violations in owned files.
- **Tests added/modified**: None in tests/ (strictly owned by E2E track).

## Loaded Skills

- None
