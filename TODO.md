# TODO: Mini-Stock Improvements

## Security & Architecture

- [x] Add API rate limiting middleware for `/api/requests`, `/api/movements`, `/api/requests/:id`
- [x] Add email verification beyond domain check (SPF/DKIM/DMARC validation)
- [x] Implement structured audit logging for admin actions (approvals, rejections, stock changes)
- [x] Sanitize D1 connection error messages (remove internal details from 503 responses)
- [x] Add Cloudflare Access token refresh/revalidation logic

## Data Integrity

- [ ] Enable SQLite foreign key enforcement (`PRAGMA foreign_keys = ON`)
- [ ] Add unique constraints/indexes on `products(sku)` and `products(ref)`
- [ ] Replace `Date.now()` ID generation with UUID or D1 `AUTOINCREMENT`
- [ ] Add optimistic locking / version column on `products` table to prevent race conditions
- [ ] Add database migration versioning strategy (beyond initial migration)
- [ ] Add `CHECK` constraints for stock non-negative values

## UX & Features

- [ ] Add pagination to `GET /api/inventory` (cursor or offset-based)
- [ ] Implement optimistic UI with offline queue / retry mechanism
- [ ] Add keyboard shortcuts for admin actions (approve/reject, open movement panel)
- [ ] Add bulk operations: multi-select approve/reject requests, batch stock adjustments
- [ ] Add search debouncing and virtualized lists for large inventories
- [ ] Add product image fallback/placeholder when image missing
- [ ] Add export functionality (CSV/Excel) for inventory and movements
- [ ] Add real-time updates via WebSockets / Server-Sent Events

## Code Quality

- [x] Add unit tests (Vitest) for composables, utilities, API handlers
- [x] Add integration tests for API endpoints (test D1 operations)
- [ ] Add E2E tests (Playwright) for critical user flows
- [ ] Enable TypeScript strict mode (`strict: true`, `noUncheckedIndexedAccess`, etc.)
- [ ] Add request validation schemas (Zod/Valibot) for all API endpoints
- [ ] Standardize error handling pattern across all endpoints
- [ ] Remove hardcoded `metrics.coverage` data - compute from actual product lines
- [x] Add ESLint + Prettier configuration
- [ ] Add type-safe API client (auto-generated from handlers)

## DevOps

- [ ] Create GitHub Actions CI pipeline (lint, typecheck, test, build)
- [ ] Add preview deployments for PRs (Cloudflare Pages preview URLs)
- [ ] Add production deployment workflow with approval gate
- [ ] Add structured logging (JSON) for server-side operations
- [ ] Add error tracking (Sentry or similar)
- [ ] Add performance monitoring (Web Vitals, API latency)
- [ ] Add database migration CI check (verify migrations apply cleanly)
- [ ] Add dependency update automation (Dependabot/Renovate)
- [ ] Add smoke tests for production deployment verification
