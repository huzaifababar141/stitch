# Dispatch: Challenger 2 — Adversarial API & Workflow Verifier

## Identity

- Role: Adversarial API & Workflow Verifier
- Working directory: d:\University\CS 2024-2028\SP\stitch\.agents\challenger_2
- Parent: orchestrator_1 (8696404f-3a2a-4a1e-986b-b5b6e4ea11c5)

## Mandatory Context

Read first:

- `d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md`
- `d:\University\CS 2024-2028\SP\stitch\PROJECT.md`
- `d:\University\CS 2024-2028\SP\stitch\TEST_READY.md`

## Challenge Scope & Instructions

1. Test `/api/products/parse`:
   - Send invalid bodies (empty JSON, missing URL, invalid protocol `ftp://...`, non-URL strings). Verify clean 400 Bad Request responses with descriptive errors and ZERO 500 status codes.
   - Verify unauthenticated / guest parsing works cleanly without database errors.
   - Verify response schema matches contract (`data.gender`, `data.priceOriginal`, `data.images`, `data.currencyOriginal === 'PKR'`, etc.).
2. Test `/new-order` flow synchronization:
   - Verify that parsing a male garment triggers `handleGenderChange('male')`, selecting Ban collar, straight sleeves, P-32 shalwar code, and Men's stitching tiers.
   - Verify that parsing a female garment triggers `handleGenderChange('female')`, selecting neck slit, lace sleeves, T-30 trouser code, and Women's stitching tiers.
3. Write your empirical verdict (`APPROVE` or `CHALLENGE_FAILED`) in `handoff.md` with full evidence.

## 2026-09-11T13:01:53Z

You are challenger_2, a teamwork_preview_challenger subagent.
Your working directory is: d:\University\CS 2024-2028\SP\stitch\.agents\challenger_2
Your parent is orchestrator_1 (conversation ID: 8696404f-3a2a-4a1e-986b-b5b6e4ea11c5).

MANDATORY FIRST STEP:
Read d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md
Also read d:\University\CS 2024-2028\SP\stitch\PROJECT.md
Also read d:\University\CS 2024-2028\SP\stitch\TEST_READY.md
Also read d:\University\CS 2024-2028\SP\stitch\.agents\challenger_2\DISPATCH.md

YOUR MISSION:
Empirically verify the API endpoint and customer /new-order flow synchronization:

1. Test /api/products/parse with invalid requests (bad JSON, invalid URLs, missing URL) to ensure clean 400 status codes with zero 500 crashes.
2. Verify guest / unauthenticated requests execute cleanly and return the full product schema with gender, garmentType, and PKR price.
3. Test /new-order flow logic ensuring handleGenderChange('male') vs ('female') sets appropriate styling defaults, Paicha/trouser codes (P-32 vs T-30), and stitching tiers.
4. Issue your verdict (APPROVE or CHALLENGE_FAILED) in handoff.md with full evidence, and message your parent.
