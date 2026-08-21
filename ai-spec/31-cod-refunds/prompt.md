# Task 31: COD Refund Methods

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement server-side COD refund method abstraction.

## Requirements

Support refund method choices: UPI, bank transfer/IMPS, store credit. Next.js collects choice; backend validates ownership/eligibility/amount and invokes the configured payout integration. Track method, provider, reference, status, failure reason and timestamps. Store sensitive data only when necessary and securely.

## Acceptance criteria

[ ] COD refund method selection works
[ ] Server validates all refund requests
[ ] Store credit path is separated from payout path
[ ] UPI/bank provider boundary is explicit
[ ] Duplicate payouts are prevented

## Explicit non-goals

Do not put payout credentials or financial logic in the browser. Do not invent a banking provider.

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
