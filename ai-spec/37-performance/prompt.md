# Task 37: Performance & Core Web Vitals Hardening

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Optimize the MVP without premature infrastructure.

## Requirements

Optimize Next.js rendering, image sizes, caching where safe, CMS/catalog request patterns, search debounce/cancellation, infinite query behavior, bundle size and layout stability.

## Acceptance criteria

[ ] No obvious N+1 frontend request patterns
[ ] Images are appropriately optimized
[ ] Search is debounced
[ ] Loading does not cause major layout shift

## Explicit non-goals

Do not add Redis Cluster/search clusters/Kubernetes for performance.

## Implementation procedure

1. Inspect the current implementation and dependency versions.
2. Identify reusable existing code and official Medusa/Strapi capabilities.
3. Implement only this task and required supporting changes.
4. Add/update tests for behavior introduced by this task.
5. Run lint, typecheck, tests, and production build using the repository's actual commands.
6. Fix all errors introduced by this task.
7. Do not claim a feature is complete if it is only mocked or partially wired.
8. At the end, report changed files, validation results, and anything genuinely blocked.

Do not invent functionality outside the master specification.
