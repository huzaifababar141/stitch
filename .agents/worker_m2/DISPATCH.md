# Dispatch: Milestone 2 — API Route & Customer /new-order Workflow Synchronization

## Identity

- Role: Full-Stack Integration Worker
- Working directory: d:\University\CS 2024-2028\SP\stitch\.agents\worker_m2
- Parent: orchestrator_1 (8696404f-3a2a-4a1e-986b-b5b6e4ea11c5)

## Mandatory Integrity Warning

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Context

Read first:

- `d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md`
- `d:\University\CS 2024-2028\SP\stitch\PROJECT.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_1\survey_codebase.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_1\handoff.md`
- `d:\University\CS 2024-2028\SP\stitch\src\lib\services\link-parser.service.ts`

## Write Ownership

You exclusively own:

- `src/app/api/products/parse/route.ts`
- `src/app/(customer)/new-order/page.tsx`
  DO NOT modify `src/lib/services/link-parser.service.ts` or `src/lib/services/scraper/**` (completed in M1).
  DO NOT modify `tests/` or `scripts/` (completed in E2E track).

## Scope & Implementation Requirements

1. **Update `src/app/api/products/parse/route.ts`**:
   - Ensure Zod schema validation `{ url: z.string().url() }`.
   - Update auth handling: Allow optional authentication so unauthenticated visitors / preview tests can parse products. If user is logged in via `getAuthUser()`, use `user.id` to persist in DB via `parseProductLink(url, user.id)`; if unauthenticated, use `extractProductDetails(url)` directly without requiring DB login!
   - Ensure consistent JSON response format:
     ```json
     {
       "success": true,
       "data": {
         "name": string,
         "title": string,
         "brand": string,
         "priceOriginal": number | null,
         "currencyOriginal": "PKR",
         "description": string,
         "images": string[],
         "gender": "male" | "female",
         "garmentType": string,
         "fabricMaterial": string | null,
         "fallbackTier": number,
         "confidenceScore": number,
         "requiresManualPrice": boolean
       },
       "message": "Product parsed successfully"
     }
     ```
   - On invalid URLs or domains, return clean 400 response with helpful message; NEVER throw unhandled 500 errors!

2. **Update `src/app/(customer)/new-order/page.tsx`**:
   - In `handleParseUrl`:
     - Inspect parsed product `prod` (from `json.data || json`).
     - If `prod.gender` is `'male'` or `'female'`, immediately call `handleGenderChange(prod.gender)`! This automatically switches the gender tab, selects male default styles (Ban collar, straight sleeves, pockets, round daman, P-32 shalwar, men's stitching tiers) or female default styles (round neck slit, lace trim sleeves, straight daman, T-30 trousers, women's stitching tiers).
     - If `prod.garmentType` is provided and is a valid garment type for that gender, update garment type state (`setGarmentType`).
     - Populate `setManualTitle(prod.name || prod.title)`, `setManualBrand(prod.brand)`, and `setManualPrice(Number(prod.priceOriginal) || 0)`.
     - Update toast feedback to clearly show: `"Product Parsed: Detected ${prod.gender.toUpperCase()} apparel (${prod.brand})"` and provide an informative description.

3. **Verification**:
   - Run type-check (`npx tsc --noEmit`) to verify clean compilation with zero TypeScript errors.
   - Run tests (`npm run test:scraper` and `npm test`).
   - Deliver `handoff.md` with verification commands & results, and message your parent.
