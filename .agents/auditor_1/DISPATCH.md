# Dispatch: Forensic Auditor — Integrity Verification

## Identity

- Role: Forensic Integrity Auditor
- Working directory: d:\University\CS 2024-2028\SP\stitch\.agents\auditor_1
- Parent: orchestrator_1 (8696404f-3a2a-4a1e-986b-b5b6e4ea11c5)

## Mandatory Context

Read first:

- `d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md`
- `d:\University\CS 2024-2028\SP\stitch\PROJECT.md`
- `d:\University\CS 2024-2028\SP\stitch\TEST_READY.md`

## Forensic Audit Instructions

Perform an exhaustive forensic integrity audit on all newly created and modified code:

1. **Source Code vs Test Integrity**:
   - Inspect `src/lib/services/link-parser.service.ts`, `src/lib/services/scraper/**`, `src/app/api/products/parse/route.ts`, and `src/app/(customer)/new-order/page.tsx`.
   - Check for hardcoded test URLs, hardcoded test strings, expected return values tailored to specific test fixtures, or dummy facade implementations.
   - Verify that extraction logic genuinely implements:
     - Tier 1: Shopify JSON endpoint fetching & handle resolution.
     - Tier 2: Real HTTP requests with browser headers.
     - Tier 3: Cheerio DOM heuristics parsing JSON-LD and CSS selectors.
     - Tier 4: Pattern matching on inline script state & AI fallback.
     - Tier 5: Clean structured slug fallback.
     - Price normalization: General regex rules, not hardcoded mappings.
     - Gender detection: General token lexicon, not hardcoded domain/URL checks.
2. **Verification Execution**:
   - Run `npm run test:scraper` and verify it runs authentic checks against fixtures and extractor logic.
   - Run `npx tsc --noEmit` to verify type safety.
3. **Verdict**:
   - Report `CLEAN` if no integrity violations are found.
   - Report `INTEGRITY VIOLATION` if any hardcoded cheats, dummy facades, or shortcuts are discovered.
4. Record your full audit findings in `handoff.md`.

## 2026-09-11T13:01:53Z

You are auditor_1, a teamwork_preview_auditor subagent.
Your working directory is: d:\University\CS 2024-2028\SP\stitch\.agents\auditor_1
Your parent is orchestrator_1 (conversation ID: 8696404f-3a2a-4a1e-986b-b5b6e4ea11c5).

MANDATORY FIRST STEP:
Read d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md
Also read d:\University\CS 2024-2028\SP\stitch\PROJECT.md
Also read d:\University\CS 2024-2028\SP\stitch\TEST_READY.md
Also read d:\University\CS 2024-2028\SP\stitch\.agents\auditor_1\DISPATCH.md

YOUR MISSION:
Perform an exhaustive forensic integrity audit across all changes:

1. Check for cheats: hardcoded test URLs, test-specific responses, fake facades, dummy mocks disguised as production code.
2. Verify authentic logic in:
   - 5-tier fallback cascade (Shopify JSON, HTTP fetch, Cheerio DOM/JSON-LD, pattern/analytics, slug fallback).
   - Word-boundary gender classifier.
   - Numeric PKR price normalizer.
   - High-res image sanitizer.
   - API route with Zod validation.
   - /new-order flow gender synchronization.
3. Run npm run test:scraper and npx tsc --noEmit to verify execution and type safety.
4. Issue your verdict (CLEAN or INTEGRITY VIOLATION) in handoff.md with full evidence, and message your parent.
