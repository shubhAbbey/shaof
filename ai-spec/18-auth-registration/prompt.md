# Task 18: Existing Login & New Registration

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement the exact OTP login/registration flow.

## Requirements

Existing user: mobile -> lookup -> OTP -> verify -> session. New user: mobile -> registration form (name/email/mobile) -> OTP -> verify -> Medusa customer/session. No address, age or referral code in registration.

## Acceptance criteria

[ ] Existing user login works
[ ] New user registration works
[ ] OTP verification is required
[ ] Intended destination is preserved
[ ] Logout works

## Explicit non-goals

Do not add referral codes, passwords or address fields.

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
