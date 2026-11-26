---
description: Review a diff for correctness, security, data integrity, performance, and craft. Severity-ranked findings with file and line, then APPROVE or REQUEST CHANGES.
argument-hint: <branch, commit range, or "staged">
---

# /review-diff

Read the whole diff before commenting on any part of it.

## Step 1 — Scope

```bash
git diff --stat HEAD
git diff HEAD -- <path>        # read it, all of it
```

State what the change claims to do. If the commit message and the diff disagree, that is a finding.

## Step 2 — Correctness

- Does it do what the task said?
- Boundary conditions: empty, one, many, zero, negative, max?
- Is the error path real, or does it swallow?
- Async: awaited, cancelled, raced correctly?
- Off-by-one in loops, slices, pagination?

## Step 3 — Security

- Input validated at the boundary?
- Authorization scoped per resource, or only per route?
- SQL / command / template injection possible?
- Secret in a client-visible variable (`VITE_`, `NEXT_PUBLIC_`, `PUBLIC_`)?
- `dangerouslySetInnerHTML`, `v-html`, `innerHTML` without sanitizing?
- Open redirect from a user-supplied URL?
- Upload validated by magic bytes, not extension?

## Step 4 — Data integrity

- Multi-row write without a transaction?
- Money as a float?
- Timezone handled or ignored?
- `null` vs `undefined` vs absent distinguished?
- Migration reversible and additive-first?
- Index on the filtered column?

## Step 5 — Performance

- O(n²) where O(n) exists?
- N+1 query in a loop?
- Layout thrashing in a render loop?
- Dependency over 20KB added without justification?
- Layout property in a transition?

## Step 6 — Craft

- Matches the surrounding patterns?
- Names accurate?
- Dead code, commented-out code, `console.log` left behind?
- Tests test behaviour, not implementation?
- Diff larger than the task required?
- Any hex literal outside `tokens.css`?

## Step 7 — The five questions

1. What happens on empty input?
2. What happens when the network fails?
3. What happens on the second call?
4. What happens at 10× the data?
5. What happens when the user is not the owner?

If the diff does not answer one, that is a finding.

## Step 8 — Verdict

```
REVIEW — <branch or task>

Verdict: APPROVE | REQUEST CHANGES

Critical: 0
High:     1
Medium:   2
Low:      3

[HIGH] src/features/billing/api/useInvoices.ts:24
The query filters by id but not accountId — any authenticated user can
read any invoice.
Fix: add accountId to the where clause.

[MEDIUM] src/components/Card.module.css:14
border-radius: 12px is a raw value.
Fix: var(--radius-md).

What is good:
  - The error shape matches the rest of the API.
  - The transaction wraps both writes correctly.
```

Severity is honest. A nit is a nit. A data-loss bug is critical. No finding without a reason — "I would have done it differently" is not one.
