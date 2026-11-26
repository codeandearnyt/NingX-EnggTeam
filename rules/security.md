---
name: security
alwaysApply: true
description: Client and server security rules — injection, XSS, authorization, secrets, redirects, uploads, dependencies. Applies to any code that touches user input.
---

# Security Rules

## R1 — Nothing untrusted reaches a sink

Validate at the boundary, once. After that the value is typed and trusted.

```ts
const parsed = CreateUser.safeParse(req.body);
if (!parsed.success) return res.status(400).json(errorBody('invalid_body'));
// parsed.data is now the only input the domain sees
```

## R2 — No unsafe HTML rendering

```tsx
// FAIL
<div dangerouslySetInnerHTML={{ __html: comment.body }} />

// PASS — sanitised, with an allowlist
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.body) }} />

// BEST — never render HTML from a user
<p>{comment.body}</p>
```

Same rule for `v-html`, `innerHTML`, `insertAdjacentHTML`, `document.write`.

## R3 — SQL is parameterised

```ts
// FAIL
db.query(`SELECT * FROM users WHERE email = '${email}'`);

// PASS
db.query('SELECT * FROM users WHERE email = $1', [email]);
```

No string concatenation into a query. No exceptions, including "internal" endpoints.

## R4 — Authorization per resource

```ts
const invoice = await db.invoice.findFirst({ where: { id, accountId } });
```

Middleware answers "is this user logged in." It cannot answer "does this user own invoice 8812." That check belongs in the query.

## R5 — Open redirects

```ts
// FAIL — ?next= can be //evil.com
res.redirect(req.query.next);

// PASS
const next = req.query.next;
const safe = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//');
res.redirect(safe ? next : '/dashboard');
```

## R6 — Secrets never reach the client

Anything in `VITE_`, `NEXT_PUBLIC_`, `PUBLIC_`, `REACT_APP_`, or `NUXT_PUBLIC_` is shipped to the browser. API keys, database URLs, and signing secrets never carry those prefixes.

## R7 — Env validated at boot

Fail at startup, not at 3am on the first request that needs the missing key.

## R8 — Cookies

```ts
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: '/',
});
```

`httpOnly` always. `secure` always in production. `sameSite: 'lax'` minimum — `'none'` requires `secure` and a reason.

## R9 — CSRF on state-changing requests

SameSite cookies cover most of it. For the rest, a double-submit token or an `Origin` header check on every `POST`/`PUT`/`PATCH`/`DELETE`.

## R10 — File uploads

- Validate the MIME type **and** the magic bytes — never trust the extension or the `Content-Type` header alone
- Cap the size before reading the body
- Store outside the webroot, or in object storage with a signed URL
- Never execute an uploaded file
- Generate the stored filename; never use the client's

## R11 — Rate limit auth and writes

Login, register, password reset, and any write path. Return `429` with `Retry-After`.

## R12 — No secrets in logs

Redact `authorization`, `cookie`, `set-cookie`, `password`, `token`, `secret`, `api_key` before logging. Structured logs with an explicit allowlist beat string concatenation.

## R13 — Dependencies

```bash
npm audit --audit-level=high
```

A high or critical advisory blocks the ship. Pin the lockfile. Review a new dependency's install scripts before adding it.

## R14 — Error messages leak nothing

The client sees `{ code, message, requestId }`. It never sees a stack trace, a query, a file path, or a framework version.

## R15 — Subresource integrity for third-party scripts

```html
<script src="https://cdn.example/lib.js"
        integrity="sha384-…" crossorigin="anonymous"></script>
```

If the vendor cannot provide an SRI hash, self-host the file.

## Enforcement

`hooks/ui-guard.py` blocks `dangerouslySetInnerHTML` without `DOMPurify`, `innerHTML =` with a variable, `eval(`, `document.write`, and hardcoded `sk_live_`/`AKIA`/`ghp_` patterns.
