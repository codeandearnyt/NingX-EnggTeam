---
name: backend-architecture
description: Design a backend that holds — layering, request validation at the boundary, authorization placement, error contracts, pagination, migrations, and secrets. Use when adding an endpoint, designing a schema, or reviewing a service before it takes real traffic.
metadata:
  origin: ningx
  layer: craft
---

# Backend Architecture

Four rules carry most of the weight:

1. **Validate at the boundary.** Nothing untrusted reaches the domain.
2. **Authorize on the server, per resource.** Not per route, not in the UI.
3. **Errors are a contract.** One shape, everywhere.
4. **Every list paginates.** No exceptions.

## Layering

```
route / controller      HTTP concerns only: parse, validate, call, respond
service                 business rules, transactions, orchestration
repository              data access, one table or aggregate per repo
domain                  pure types and rules, zero imports from above
```

A route handler should be under 30 lines. If it contains a query, a branch on business rules, and a response shape, it is doing three jobs.

```ts
// routes/invoices.ts
import { z } from 'zod';

const ListQuery = z.object({
  status: z.enum(['draft', 'open', 'paid', 'void']).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listInvoices(req: Request, res: Response) {
  const parsed = ListQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json(errorBody('invalid_query', parsed.error.flatten()));
  }

  const accountId = req.auth.accountId;             // from verified session
  const page = await invoiceService.list(accountId, parsed.data);
  return res.json(page);
}
```

## Validation — the boundary

One schema per input, defined once, used for validation **and** types.

```ts
// features/invoices/schema.ts
import { z } from 'zod';

export const CreateInvoice = z.object({
  customerId: z.string().uuid(),
  currency: z.enum(['usd', 'eur', 'gbp']),
  lineItems: z.array(z.object({
    description: z.string().min(1).max(200),
    quantity:    z.number().int().positive().max(10_000),
    unitAmount:  z.number().int().nonnegative(),   // cents, never float
  })).min(1).max(200),
  dueDate: z.coerce.date().refine(d => d > new Date(), {
    message: 'Due date must be in the future',
  }),
});

export type CreateInvoice = z.infer<typeof CreateInvoice>;
```

Rules:

- **Money is integer cents.** Never `number` for currency. Never floats.
- **Dates are validated as dates**, not strings that happen to look like dates.
- **Array lengths are capped.** An uncapped array is a denial-of-service vector.
- **`safeParse` at the boundary**, then pass the typed result down. The domain never re-validates.

## Authorization — the placement rule

Authorization is not middleware alone. Middleware answers "is this user logged in." It cannot answer "does this user own invoice 8812."

```ts
// WRONG — checks the route, not the resource
router.get('/invoices/:id', requireAuth, getInvoice);

// RIGHT — the service scopes every query to the caller
async function getInvoice(accountId: string, invoiceId: string) {
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, accountId },     // the ownership check IS the query
  });
  if (!invoice) throw new NotFoundError('invoice');
  return invoice;
}
```

**Scope in the query, not in an `if` after it.** An `if (invoice.accountId !== accountId)` after a fetch works until someone adds a code path that forgets it. A `where` clause cannot be forgotten.

For role-based access, resolve the permission set once per request and check per action:

```ts
const can = permissionsFor(req.auth);
if (!can('invoice:write', { accountId, resourceOwnerId: invoice.accountId })) {
  throw new ForbiddenError();
}
```

## Error contract

One shape. Every error. Every endpoint.

```ts
type ApiError = {
  error: {
    code: string;          // machine-readable, stable: 'invalid_query'
    message: string;       // human-readable, safe to show
    details?: unknown;     // field errors, never stack traces
    requestId: string;     // for log correlation
  };
};
```

```ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(what: string) {
    super('not_found', `${what} not found`, 404);
  }
}
export class ForbiddenError extends AppError {
  constructor() { super('forbidden', 'Not allowed', 403); }
}
export class ConflictError extends AppError {
  constructor(msg: string) { super('conflict', msg, 409); }
}
```

The error handler:

```ts
app.use((err: unknown, req, res, _next) => {
  const requestId = req.id;

  if (err instanceof AppError) {
    logger.warn({ requestId, code: err.code }, err.message);
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details, requestId },
    });
  }

  // never leak internals
  logger.error({ requestId, err }, 'unhandled');
  return res.status(500).json({
    error: { code: 'internal', message: 'Something went wrong', requestId },
  });
});
```

Status codes: 400 malformed, 401 unauthenticated, 403 unauthorized, 404 missing, 409 conflict, 422 semantically invalid, 429 rate limited, 500 our fault.

## Pagination

Cursor-based for anything that changes. Offset-based only for static, small sets.

```ts
async function list(accountId: string, { status, cursor, limit }: ListQuery) {
  const rows = await db.invoice.findMany({
    where: {
      accountId,
      ...(status && { status }),
      ...(cursor && { id: { lt: cursor } }),     // keyset
    },
    orderBy: { id: 'desc' },
    take: limit + 1,                             // one extra to detect more
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}
```

`take: limit + 1` is the standard trick — one query, no count query, correct `hasMore`.

Offset pagination breaks when rows are inserted: page 2 skips or repeats rows. Cursor pagination does not.

## Transactions

Wrap anything that writes more than one row.

```ts
await db.transaction(async (tx) => {
  const invoice = await tx.invoice.create({ data: {...} });
  await tx.ledgerEntry.createMany({
    data: invoice.lineItems.map(li => ({ invoiceId: invoice.id, ...li })),
  });
  return invoice;
});
```

Rules:

- **Never** make a network call inside a transaction. It holds a lock for the duration.
- **Set an isolation level deliberately** where it matters. Default `READ COMMITTED` allows lost updates.
- **Retry on serialization failure** (`40001`) with exponential backoff.

## Migrations

```
migrations/
  20260115_001_add_invoice_status.sql
  20260115_002_backfill_status.sql
  20260116_001_drop_legacy_column.sql
```

Rules that prevent outages:

1. **Additive first.** Add a column nullable, deploy, backfill, then add the constraint. Never add a `NOT NULL` column without a default in one step on a live table.
2. **Never rename in place.** Add new, dual-write, backfill, switch reads, drop old. Four deploys.
3. **Never drop a column the running code still reads.** Drop after the deploy that stopped reading it.
4. **Every migration is reversible** or has a written rollback plan.
5. **Test against a copy of production data** at production size.

## Secrets

```bash
# .env is gitignored, always
.env
.env.local
.env.*.local

# committed, with keys and no values
.env.example
```

```ts
// validate at boot, fail fast
import { z } from 'zod';

const Env = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  STRIPE_KEY: z.string().startsWith('sk_'),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

export const env = Env.parse(process.env);   // throws at startup, not at 3am
```

Rules:

- Secrets never reach the client bundle. Anything in `VITE_` / `NEXT_PUBLIC_` is public.
- Rotate on exposure, do not "check whether it was used."
- Log scrubbing: redact `authorization`, `cookie`, `password`, `token` keys before logging.

## Rate limiting

```ts
// per-IP for unauthenticated, per-account for authenticated
const limiter = rateLimit({
  windowMs: 60_000,
  limit: (req) => req.auth ? 600 : 60,
  keyGenerator: (req) => req.auth?.accountId ?? req.ip,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
```

Return `429` with `Retry-After`. Never silently drop.

## Health and observability

```ts
app.get('/health', (_req, res) => res.json({ ok: true }));          // liveness
app.get('/ready', async (_req, res) => {                            // readiness
  const db = await db.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  res.status(db ? 200 : 503).json({ db });
});
```

Log one structured line per request: method, path, status, duration, requestId, accountId. Not a paragraph.

## Self-check before reporting

- [ ] Every endpoint validates input with a schema at the boundary
- [ ] Money stored and passed as integer cents
- [ ] Authorization scoped in the query, not checked after the fetch
- [ ] One error shape across every endpoint
- [ ] Stack traces never reach the client
- [ ] Every list endpoint paginates, cursor-based where data changes
- [ ] Multi-row writes wrapped in a transaction
- [ ] Migrations are additive-first and reversible
- [ ] Env validated at boot, fails fast
- [ ] No secret in a client-visible variable
- [ ] Rate limiting on auth and write paths
- [ ] Health and readiness endpoints exist
- [ ] Structured request logging with a request ID
