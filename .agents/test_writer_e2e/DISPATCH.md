# Dispatch: E2E Testing Track

## Identity

- Role: E2E Test Writer
- Working directory: d:\University\CS 2024-2028\SP\stitch\.agents\test_writer_e2e
- Parent: orchestrator_1 (8696404f-3a2a-4a1e-986b-b5b6e4ea11c5)

## Mandatory Context

Read first:

- `d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md`
- `d:\University\CS 2024-2028\SP\stitch\PROJECT.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_3\survey_tests.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_3\handoff.md`

## Write Ownership

You exclusively own:

- `TEST_INFRA.md` (at project root)
- `TEST_READY.md` (at project root, publish when suite is complete)
- `tests/fixtures/scraper/` (all fixture files: shopify json, html for Khaadi/SFCC, edge cases)
- `tests/scraper/link-parser.test.ts`
- `scripts/test-scraper.ts`
- Adding test scripts in `package.json` (`"test:scraper"` and `"benchmark:scraper"`)

## Scope & Deliverables

1. **`TEST_INFRA.md`**: Create per the template in `PROJECT.md` and `ORIGINAL_REQUEST.md`.
2. **Offline Fixtures**:
   - `tests/fixtures/scraper/shopify/sapphire.json`
   - `tests/fixtures/scraper/shopify/junaid-jamshed.json`
   - `tests/fixtures/scraper/shopify/sana-safinaz.json`
   - `tests/fixtures/scraper/shopify/maria-b.json`
   - `tests/fixtures/scraper/html/khaadi-sfcc.html` (Salesforce Commerce Cloud with JSON-LD / OG tags)
   - `tests/fixtures/scraper/edge-cases/cloudflare-403.html`
3. **Jest Test Suite (`tests/scraper/link-parser.test.ts`)**:
   - Testing 4-tier methodology:
     - Tier 1: Feature Coverage (>=5 per feature: Title, Brand, Price in PKR, Images, Gender).
     - Tier 2: Boundary & Corner Cases (empty/malformed prices, Unicode symbols `₨`, `Rs.`, missing fields, protocol-relative images `//`).
     - Tier 3: Cross-Feature Combinations (male kurta with unstitched tags, female 3-piece with sale price, etc.).
     - Tier 4: Real-world representative brands (Sapphire, J., Khaadi, Sana Safinaz, Maria.B).
   - Error handling: 404, 403, and invalid URLs must return structured responses and never throw 500s.
4. **Standalone CLI Benchmark Runner (`scripts/test-scraper.ts`)**:
   - Executable with `npx tsx scripts/test-scraper.ts`.
   - Tests mock fixtures (and optionally live URLs with `--live`).
   - Calculates Field Completeness (>90% threshold).
   - Calculates Gender Detection Accuracy (100% threshold).
   - Measures latency (<5s fast-path, <10s deep fallback).
   - Prints formatted ASCII dashboard table with pass/fail exit codes.
5. **Add Package Scripts**: In `package.json`, add:
   - `"test:scraper": "jest --runInBand tests/scraper"`
   - `"benchmark:scraper": "npx tsx scripts/test-scraper.ts"`
6. Run tests to verify they compile and execute.
7. Publish `TEST_READY.md` summarizing test counts, runner commands, and coverage matrix.
8. Deliver `handoff.md` and message parent when complete.

## 2026-09-11T11:45:34Z

You are test_writer_e2e, a teamwork_preview_test_writer subagent for the Stitch project.
Your working directory is: d:\University\CS 2024-2028\SP\stitch\.agents\test_writer_e2e
Your parent is orchestrator_1 (conversation ID: 8696404f-3a2a-4a1e-986b-b5b6e4ea11c5).

MANDATORY FIRST STEP:
Read d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md
Also read d:\University\CS 2024-2028\SP\stitch\PROJECT.md
Also read d:\University\CS 2024-2028\SP\stitch\.agents\test_writer_e2e\DISPATCH.md
Also read d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_3\survey_tests.md
Also read d:\University\CS 2024-2028\SP\stitch\.agents\explorer_survey_3\handoff.md

WRITE OWNERSHIP:
You exclusively own:

- TEST_INFRA.md (at project root)
- TEST_READY.md (at project root, create when suite is ready)
- tests/fixtures/scraper/ (all fixture files)
- tests/scraper/link-parser.test.ts
- scripts/test-scraper.ts
- adding test scripts to package.json

YOUR MISSION:

1. Create TEST_INFRA.md at project root adhering to the 4-tier test design methodology (Category-Partition, BVA, Pairwise Combinations, Real-World Workloads).
2. Create offline mock fixtures in tests/fixtures/scraper/ for at least 4 major Pakistani brands (Sapphire, Junaid Jamshed, Khaadi SFCC, Sana Safinaz / Maria.B) and edge cases (Cloudflare 403, 404, invalid input).
3. Implement the Jest test suite in tests/scraper/link-parser.test.ts testing field completeness (>90%), gender accuracy (100%), price normalization, image deduplication, and error resilience.
4. Implement the standalone executable CLI benchmark runner in scripts/test-scraper.ts (runnable with `npx tsx scripts/test-scraper.ts`) that evaluates the scraper and renders a clean ASCII dashboard with latency, completeness, and accuracy metrics.
5. Add `"test:scraper": "jest --runInBand tests/scraper"` and `"benchmark:scraper": "npx tsx scripts/test-scraper.ts"` to package.json.
6. Verify your test scripts run with jest and tsx.
7. Create TEST_READY.md at project root when complete.
8. Deliver handoff.md in your working directory and message your parent.
