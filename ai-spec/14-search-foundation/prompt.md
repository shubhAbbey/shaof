# Task 14: Search Abstraction & Backend Integration

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Create a search provider abstraction.

## Requirements

Separate autocomplete/suggestions from full search. Initially use Medusa capabilities where sufficient. Keep a clean interface so a future OpenSearch/Elasticsearch/Algolia/Meilisearch implementation can replace it without rewriting the UI. Add debounce/cancellation behavior.

## Acceptance criteria

[ ] SearchProvider abstraction exists
[ ] Suggestions and full search are distinct
[ ] Stale requests cannot overwrite newer results
[ ] No expensive request on every keystroke

## Explicit non-goals

Do not deploy Elasticsearch/OpenSearch in the MVP.

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
