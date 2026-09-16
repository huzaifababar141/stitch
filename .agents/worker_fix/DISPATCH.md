# Dispatch: Worker Fix — Resolve Victory Audit Test Failures

## Identity

- Role: Remediation Worker
- Working directory: d:\University\CS 2024-2028\SP\stitch\.agents\worker_fix
- Parent: orchestrator_1 (8696404f-3a2a-4a1e-986b-b5b6e4ea11c5)

## Mandatory Integrity Warning

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Context

Read first:

- `d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\victory_auditor_1\handoff.md`
- `d:\University\CS 2024-2028\SP\stitch\src\lib\services\scraper/user-agents.ts`
- `d:\University\CS 2024-2028\SP\stitch\src\lib\services\scraper/tiers/tier4-pattern.ts`
- `d:\University\CS 2024-2028\SP\stitch\src\lib\services\scraper/extractor.ts`
- `d:\University\CS 2024-2028\SP\stitch\tests\scraper/adversarial-stress.test.ts`

## Specific Deficiencies to Fix

1. **Hyphen preservation in `titleFromSlug` (`src/lib/services/scraper/user-agents.ts`)**:
   `tests/scraper/adversarial-stress.test.ts:331` asserts:
   `expect(titleFromSlug('/fabrics/unstitched/3-piece-printed-lawn-suit.html')).toBe('3-Piece Printed Lawn Suit');`
   Currently `titleFromSlug` splits on `[-_]+`, turning `"3-piece"` into `"3 Piece"`.
   Ensure patterns like `(\d+)-piece` or `(\d+)-pc` preserve the hyphen (e.g. `"3-Piece"`, `"2-Piece"`, `"1-Piece"`).

2. **Tier 4 vs Tier 5 Fallback Cascade on Error/Blocked Pages (`src/lib/services/scraper/tiers/tier4-pattern.ts` and `extractor.ts`)**:
   When error/blocked/empty HTML is passed (Cloudflare 403, HTTP 404, HTTP 500 error pages, or HTML with no product data), `executeTier4Pattern` was returning `{ success: true, tier: 4 }` with empty/slug data.
   This prevented cascading to **Tier 5** (`tier5-fallback.ts`), which is the dedicated slug fallback tier!
   In `tier4-pattern.ts`: If no inline script state (`dataLayer`, `ShopifyAnalytics`, `__NEXT_DATA__`), no body price regex, and no AI result was successfully extracted, `executeTier4Pattern` MUST return `{ success: false, tier: 4 }` so that `extractor.ts` cascades to `executeTier5Fallback`!
   This will correctly produce `fallbackTier: 5` for Cloudflare 403, 404, and 500 error pages as expected by `tests/scraper/adversarial-stress.test.ts` lines 370, 391, and 411!

3. **Verification**:
   - Run `npm run test:scraper` and verify ALL 77 tests pass (0 failures).
   - Run `npx tsx scripts/test-scraper.ts` and verify 10/10 benchmark cases pass with 100% completeness and 100% gender accuracy.
   - Run `npx tsc --noEmit` to verify 0 TypeScript errors.
   - Run `npm run build` to verify clean build.
   - Document exact test outputs in `handoff.md` and message parent.
