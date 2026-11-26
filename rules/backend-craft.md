---
name: backend-craft
alwaysApply: true
description: Server rules — validation at the boundary, authorization placement, error contract, pagination, transactions, migrations, secrets. Applies to any server route, service, or schema file.
---

# Backend Craft Rules

## Layering

```
route       HTTP only: parse, validate, call, respond — under 30 lines
service     business rules, transactions, orchestration
repository  data access, one aggregate per repo
domain      pure types, zero imports from above
```

A route handler containing a query, a business branch, and a response shape is doing three jobs.

## R1 — Validate at the boundary

One schema per input. Used for runtime validation and the TypeScript type.

```ts
const parsed = CreateInvoice.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json(errorBody('invalid_body', parsed.error.flatten()));
}
```

Nothing untrusted reaches the domain. The domain never re-validates.

## R2 — Money is integer cents

Never `number` for currency. Never floats. Never `parseFloat` on a price.

## R3 — Every array is capped

```ts
z.array(Item).min(1).max(200)   // the .max() is not optional
```

An uncapped array is a denial-of-service vector.

## R4 — Authorization is scoped in the query

```ts
// RIGHT — the ownership check IS the query
const invoice = await db.invoice.findFirst({
  where: { id: invoiceId, accountId },
});

// WRONG — works until someone adds a path that forgets it
const invoice = await db.invoice.findUnique({ where: { id } });
if (invoice.accountId !== accountId) throw new Forbidden();
```

A `where` clause cannot be forgotten. An `if` can.

## R5 — One error shape

```ts
type ApiError = {
  error: {
    code: string;       // stable, machine-readable
    message: string;    // safe to show a user
    details?: unknown;  // field errors, never stacks
    requestId: string;
  };
};
```

Status codes: 400 malformed, 401 unauthenticated, 403 unauthorized, 404 missing, 409 conflict, 422 semantically invalid, 429 rate limited, 500 our fault.

Stack traces never reach the client. Ever.

## R6 — Every list paginates

Cursor-based for anything that changes. `take: limit + 1` to detect more without a count query.

Offset pagination skips and repeats rows when inserts happen.

## R7 — Multi-row writes are transactional

```ts
await db.transaction(async (tx) => {
  const invoice = await tx.invoice.create({ data });
  await tx.ledgerEntry.createMany({ data: … });
  return invoice;
});
```

Never make a network call inside a transaction — it holds a lock for the duration.

## R8 — Migrations are additive-first and reversible

1. Add column nullable → deploy → backfill → add constraint. Never a `NOT NULL` without a default in one step.
2. Never rename in place. Add, dual-write, backfill, switch reads, drop. Four deploys.
3. Never drop a column the running code still reads.
4. Every migration has a rollback plan or is reversible by construction.
5. Test at production data size, not on 100 rows.

## R9 — Env validated at boot

```ts
const Env = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});
export const env = Env.parse(process.env);   // throws at startup, not at 3am
```

## R10 — Secrets never reach the client

Anything prefixed `VITE_`, `NEXT_PUBLIC_`, `PUBLIC_`, or `REACT_APP_` is public. Full stop.

Rotate on exposure. Do not "check whether it was used."

## R11 — Rate limit auth and write paths

Return `429` with `Retry-After`. Never silently drop.

## R12 — Health and readiness

```ts
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/ready', async (_req, res) => {
  const db = await checkDb();
  res.status(db ? 200 : 503).json({ db });
});
```

## R13 — One structured log line per request

Method, path, status, duration, requestId, accountId. Not a paragraph. Redact `authorization`, `cookie`, `password`, `token`.
