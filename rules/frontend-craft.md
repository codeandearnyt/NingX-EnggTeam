---
name: frontend-craft
alwaysApply: true
description: Component, state, and data-fetching rules for the client. Applies to any .tsx, .jsx, .vue, .svelte, or component-level CSS.
---

# Frontend Craft Rules

## Folder boundaries

```
src/
  app/        routing, providers, shell
  pages/      one folder per route
  features/   one folder per capability, each with an index.ts
  components/ shared, product-agnostic UI
  lib/        framework-agnostic utilities, zero component imports
  styles/     tokens, reset, globals
```

Three rules, enforced by lint:

1. `features/` never imports another `features/` deep path — only its `index.ts`.
2. `components/` never imports from `features/`.
3. `lib/` imports zero components.

## Component tiers

| Tier | Lives in | Contains |
|---|---|---|
| Primitive | `components/ui/` | Props only, no data, no business logic |
| Composite | `components/` | Combines primitives, still no business logic |
| Feature | `features/*/components/` | Owns data and business rules |
| Page | `pages/*/` | Composes features, thin, under 80 lines |

## State placement

| Kind | Example | Home |
|---|---|---|
| Server state | Orders, invoices | Query library. Never `useState`. |
| URL state | Filter, page, tab | The URL. Shareable, back-button safe. |
| Form state | Input values | Local to the form |
| UI state | Modal open | Nearest common ancestor |

Global store is the last resort. Before adding one, check URL → query cache → `useState` → lift to parent. Only then a store, with a written justification.

## The four list states

Every list renders loading, error, empty, and data. Not three of four.

```tsx
if (isLoading) return <ListSkeleton rows={3} />;
if (isError)   return <ErrorState message={error.message} onRetry={refetch} />;
if (!data?.length) return <EmptyState title="…" body="…" action={{…}} />;
return <ul>{data.map(…)}</ul>;
```

The skeleton must match the real layout height or it is a layout shift with extra steps.

## Data fetching

```ts
useQuery({
  queryKey: ['invoices', accountId, { status }],
  queryFn: async ({ signal }) => {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`Failed (${res.status})`);
    return res.json();
  },
  staleTime: 30_000,
});
```

- Query keys are arrays, general → specific.
- Always pass `signal`.
- Throw on non-2xx. A silent `return res.json()` on a 500 is a bug factory.
- `staleTime` explicit. The default refetches constantly.

## Hard fails

| Rule | Consequence |
|---|---|
| `<div onclick>` | Use `<button>`. |
| `outline: none` with no replacement | Keyboard users lose the page. |
| `transition: all` | Animates layout properties. |
| Animation with no `prefers-reduced-motion` path | Vestibular trigger. |
| Image without `width`/`height` | CLS. |
| Input without `<label for>` | Screen readers announce nothing. |
| `useEffect` for a render-time derivation | Extra render, extra bug. |
| Fetch without `AbortSignal` | State updates after unmount. |
| `any` in an exported type | The type system stops working here. |
| Emoji as an icon | Not an icon. |

## Error boundaries

Every route gets one. They catch render errors — not event handler errors, not async rejections. Those need try/catch and `.catch()` respectively. Know the difference or ship a boundary that catches nothing.

## Performance defaults

- Split at route boundaries first, then interaction boundaries.
- Never split a 20-line component — the request costs more than the bytes.
- `loading="lazy"` below the fold only, never on the LCP image.
- Anything over 30KB gzipped in the initial bundle needs a justification.
