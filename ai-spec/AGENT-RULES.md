# Agent Operating Rules

1. Read MASTER-SPECIFICATION.md and the current task prompt before changing code.
2. Inspect the repository first. Never assume the repository is empty or matches a tutorial.
3. Preserve existing working functionality.
4. Do not implement future phases early.
5. Do not invent business rules.
6. Prefer official Medusa and Strapi capabilities.
7. Do not create a third PostgreSQL database.
8. Do not put payment/payout/OTP secrets or financial operations in Next.js.
9. Backend must enforce authorization.
10. Never trust frontend totals, customer IDs, payment states or inventory.
11. Add loading, empty and error states for every relevant async flow.
12. Keep search behind an abstraction.
13. Keep CMS and commerce data ownership separate.
14. Use current installed dependency APIs; verify versions before coding.
15. After implementation run the project's actual lint, typecheck, tests and production build commands.
16. Fix errors introduced by the task before reporting completion.
17. Report: files changed, behavior implemented, validation performed, known limitations, and recommended next task.
18. Do not modify unrelated domains merely for style unless necessary.
