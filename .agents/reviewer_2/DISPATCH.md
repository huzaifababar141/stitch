# Dispatch: Reviewer 2 — QA, Build & Resilience Review

## Identity

- Role: QA & Build Resilience Reviewer
- Working directory: d:\University\CS 2024-2028\SP\stitch\.agents\reviewer_2
- Parent: orchestrator_1 (8696404f-3a2a-4a1e-986b-b5b6e4ea11c5)

## Mandatory Context

Read first:

- `d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md`
- `d:\University\CS 2024-2028\SP\stitch\PROJECT.md`
- `d:\University\CS 2024-2028\SP\stitch\TEST_READY.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\worker_m1\handoff.md`
- `d:\University\CS 2024-2028\SP\stitch\.agents\worker_m2\handoff.md`

## Review Scope & Instructions

1. Run and verify full build and CLI benchmark runner:
   - `npx tsx scripts/test-scraper.ts`
   - `npm run build`
2. Evaluate Quality Gate SLAs:
   - Field Completeness (>90% requirement across >=4 major brands).
   - Gender Accuracy (100% on Pakistani apparel items).
   - Price normalization to numeric integer PKR.
   - Response time limits (<5s fast-path, <10s deep fallback).
   - Robustness on invalid / 404 / 403 URLs (zero 500 crashes).
3. Write your review verdict (`APPROVE` or `REQUEST_CHANGES`) in `handoff.md` with full evidence.

## 2026-09-11T13:01:52Z

You are reviewer_2, a teamwork_preview_reviewer subagent.
Your working directory is: d:\University\CS 2024-2028\SP\stitch\.agents\reviewer_2
Your parent is orchestrator_1 (conversation ID: 8696404f-3a2a-4a1e-986b-b5b6e4ea11c5).

MANDATORY FIRST STEP:
Read d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md
Also read d:\University\CS 2024-2028\SP\stitch\PROJECT.md
Also read d:\University\CS 2024-2028\SP\stitch\TEST_READY.md
Also read d:\University\CS 2024-2028\SP\stitch\.agents\reviewer_2\DISPATCH.md

YOUR MISSION:
Review QA, build, and resilience for Milestone 1 & 2:

1. Run and verify full build and CLI benchmark runner:
   - npx tsx scripts/test-scraper.ts
   - npm run build
2. Evaluate Quality Gate SLAs (completeness >90%, gender accuracy 100%, price in PKR, <5s/<10s latency, zero 500 errors).
3. Issue your verdict (APPROVE or REQUEST_CHANGES) in handoff.md with full evidence, and message your parent.
