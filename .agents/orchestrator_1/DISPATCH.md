# Dispatch Record

## 2026-09-11T10:54:18Z

You are the Project Orchestrator for the Stitch project.
Working directory for your metadata: d:\University\CS 2024-2028\SP\stitch\.agents\orchestrator_1
Project workspace: d:\University\CS 2024-2028\SP\stitch
Original Request: Read d:\University\CS 2024-2028\SP\stitch\ORIGINAL_REQUEST.md

Mission:
Build a production-grade, highly resilient e-commerce product link scraper and parser for Pakistani fashion stores that extracts product details, high-resolution imagery, pricing, and gender classification, seamlessly populating the new order workflow with comprehensive fallbacks.

Key Requirements:

1. Multi-Tier Product Extraction Pipeline:
   - Extract title, brand/vendor, original price in PKR, description, and high-resolution gallery from Pakistani apparel e-commerce URLs (Shopify, WooCommerce, custom headless like Khaadi, Sapphire, Junaid Jamshed, Sana Safinaz, Gul Ahmed, Maria.B, LimeLight, Nishat Linen, etc.).
2. Anti-Bot and Cloudflare Resilience:
   - 5-tier fallback:
     1. Native JSON endpoint inspection (/products/<handle>.json & Storefront/collection feeds).
     2. Browser-mimicking HTTP requests with modern user-agent & TLS header impersonation.
     3. DOM heuristics parsing Schema.org JSON-LD microdata, OpenGraph tags, platform-specific selector engines.
     4. Semantic LLM / pattern-based parser fallback for unstructured or dynamic markup.
     5. Clean, structured fallback when external sites aggressively block network requests (no crashes or unhandled 500s).
3. Gender Detection and Order Workflow Synchronization:
   - Detect Men / Women from category breadcrumbs, tags, titles, or descriptions.
   - Automatically select corresponding gender tab, garment pieces, and styling options in customer `/new-order` flow.
4. Automated Verification Test Suite:
   - Standalone executable test suite testing representative live and mock product URLs across major Pakistani apparel domains (evaluating success rate, response time, field completeness).
5. Acceptance Criteria:
   - Test suite parses URLs across >= 4 major brands with >90% field completeness.
   - Gender accurately determined for male and female garments.
   - Prices normalized to numeric PKR values.
   - Image URLs deduplicated and validated as absolute HTTP/HTTPS addresses.
   - Robust error handling for invalid/404/blocked URLs (<5s fast-path, <10s deep fallback).
   - API endpoint `/api/products/parse` with Zod validation.
   - Customer `/new-order` interface automatically populates parsed data and dynamically sets gender.
   - Next.js type check (`npx tsc --noEmit`) and build (`npm run build`) pass cleanly.
