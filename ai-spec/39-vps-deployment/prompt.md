# Task 39: Single VPS Deployment

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Deploy the MVP to a single low-cost VPS.

## Requirements

Configure reverse proxy, DNS/Cloudflare as appropriate, HTTPS, firewall, Docker Compose, domain routing for storefront/API/CMS/admin, service restarts and environment variables.

## Acceptance criteria

[ ] HTTPS works
[ ] Storefront reachable
[ ] Medusa API reachable only as intended
[ ] Strapi/Medusa admin secured
[ ] Postgres/Redis private

## Explicit non-goals

Do not add load balancers/autoscaling/Kubernetes.

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
