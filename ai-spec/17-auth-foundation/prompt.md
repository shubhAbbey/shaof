# Task 17: OTP Authentication Foundation

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement server-side OTP authentication architecture.

## Requirements

Use mobile number as primary authentication. Integrate Redis for temporary OTP state, expiration, resend and attempt tracking. Integrate an external SMS/OTP provider. Keep secrets server-side and enforce rate limiting.

## Acceptance criteria

[ ] OTP can be generated and sent
[ ] OTP is temporary
[ ] Rate limits exist
[ ] Plaintext OTP is not logged/persisted permanently
[ ] Provider errors are handled

## Explicit non-goals

Do not implement passwords or social login.

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
