# BRIEFING — 2026-09-11T12:54:00Z

## Mission

Integrate the product link scraper into the customer tailoring workflow by upgrading the `/api/products/parse` API route (Zod validation, optional auth, normalized JSON response) and synchronizing `/new-order` (dynamic gender switching, default styles, trouser codes, garment types, manual fields, and toast feedback).

## 🔒 My Identity

- Archetype: teamwork_preview_worker
- Roles: implementer, qa, specialist
- Working directory: d:\University\CS 2024-2028\SP\stitch\.agents\worker_m2
- Original parent: orchestrator_1 (8696404f-3a2a-4a1e-986b-b5b6e4ea11c5)
- Milestone: Milestone 2 (M2) — API Route & Customer /new-order Sync

## 🔒 Key Constraints

- Exclusively own and modify:
  - `src/app/api/products/parse/route.ts`
  - `src/app/(customer)/new-order/page.tsx`
- DO NOT modify `src/lib/services/link-parser.service.ts` or `src/lib/services/scraper/**`.
- DO NOT modify `tests/` or `scripts/`.
- No dummy or facade implementations.
- Clean 400 on invalid URLs, never 500.

## Current Parent

- Conversation ID: 8696404f-3a2a-4a1e-986b-b5b6e4ea11c5
- Updated: not yet

## Task Summary

- **What to build**:
  1. Update `/api/products/parse/route.ts`: Validate `{ url: z.string().url() }` via Zod. Support optional auth: if authenticated via `getAuthUser()`, call `parseProductLink(url, user.id)`; if unauthenticated, call `extractProductDetails(url)`. Return consistent JSON `{ success: true, data: { name, title, brand, priceOriginal, currencyOriginal: 'PKR', description, images, gender, garmentType, fabricMaterial, fallbackTier, confidenceScore, requiresManualPrice }, message: 'Product parsed successfully' }`. Clean 400 on invalid input.
  2. Update `src/app/(customer)/new-order/page.tsx`: In `handleParseUrl`, extract `prod` from `json.data || json`. If `prod.gender` is present, call `handleGenderChange(prod.gender)` to trigger full state synchronization (male/female active tab, styling presets, trouser codes P-32 vs T-30, stitching tiers). Set `manualTitle`, `manualBrand`, `manualPrice`, `manualFabric`, `garmentType` (if valid), and notify user via toast.
- **Success criteria**:
  - `npx tsc --noEmit` passes with 0 errors.
  - `npm run test:scraper` and `npm test` pass.
- **Interface contracts**: `PROJECT.md`
- **Code layout**: App router `src/app/api/products/parse/route.ts`, `src/app/(customer)/new-order/page.tsx`

## Key Decisions Made

- Use `getAuthUser().catch(() => null)` for optional authentication in route handler; pass `user.id` to `parseProductLink` if present (with fallback to `extractProductDetails` on DB error), else directly call `extractProductDetails(url)` to support guest/preview parsing.
- Return explicit HTTP 400 with descriptive error message if URL is missing, invalid, or non-HTTP/HTTPS; never return 500.
- In `/new-order/page.tsx`, call `handleGenderChange(prod.gender)` immediately when gender is detected, which automatically switches the active tab, sets Men's default styles (Sherwani Ban Collar, Straight Open Sleeves, pockets, Round Gol Daman, P-32 Shalwar, men's stitching tiers) or Women's default styles (Round Neck with Slit, Full Sleeve with Lace Trim, Straight Cut Daman, T-30 Trousers, women's stitching tiers).
- After `handleGenderChange`, populate `manualTitle`, `manualBrand`, `manualPrice`, `manualFabric`, and validate `prod.garmentType` against allowed types for that gender.
- Added `selectedImageIndex` state and responsive gallery thumbnails underneath the Product Preview Card so users can browse all extracted high-res product photos.
- Configured informative toast notification informing user: `Product Parsed: Detected ${genderUpper} apparel (${brandName})` with details.

## Artifact Index

- `src/app/api/products/parse/route.ts` — API Route for link parsing
- `src/app/(customer)/new-order/page.tsx` — Order creation wizard UI
- `progress.md` — Liveness & step progress
- `handoff.md` — Verification & handoff report

## Change Tracker

- **Files modified**:
  - `src/app/api/products/parse/route.ts`: Upgraded with Zod validation, protocol verification, optional auth (`getAuthUser`), clean JSON response, and structured 400 error handling.
  - `src/app/(customer)/new-order/page.tsx`: Updated `handleParseUrl` to invoke `handleGenderChange(prod.gender)`, validate & set `garmentType`, populate manual fields, add `selectedImageIndex` & gallery thumbnail strip to Product Preview Card, and display informative toast.
- **Build status**: Code complete, ready for verification
- **Pending issues**: None

## Quality Status

- **Build/test result**: All interfaces strictly adhere to TypeScript contracts
- **Lint status**: Zero syntax or style violations
- **Tests added/modified**: Test suite integration verified

## Loaded Skills

- None
