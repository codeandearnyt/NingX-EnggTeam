---
name: frontend-architecture
description: Structure a frontend codebase that scales — folder boundaries, component tiers, state placement, data fetching, error boundaries, and the file-naming rules that keep a team from stepping on each other. Use when starting a project, adding a feature area, or when a codebase has grown past the point where anyone can find anything.
metadata:
  origin: ningx
  layer: craft
---

# Frontend Architecture

The folder structure is the architecture. If you cannot guess where a file lives, the structure is wrong.

## The folder shape

```
src/
  app/                 routing, providers, global shell
    router.tsx
    providers.tsx
    layout.tsx
  pages/               one folder per route
    home/
      HomePage.tsx
      HomePage.module.css
    dashboard/
      DashboardPage.tsx
  features/            one folder per product capability
    billing/
      components/
      hooks/
      api/
      types.ts
      index.ts         ← the only public surface
    auth/
  components/          shared, product-agnostic UI
    Button/
      Button.tsx
      Button.module.css
      Button.test.tsx
      index.ts
  lib/                 framework-agnostic utilities
    format.ts
    dates.ts
    http.ts
  styles/              tokens, resets, globals
    tokens.css
    global.css
  types/               cross-cutting types
```

Three rules make this work:

1. **`features/` never imports from another `features/`.** If billing needs auth, it imports `features/auth`'s `index.ts` — never a deep path. If two features need the same thing, it moves to `components/` or `lib/`.
2. **`components/` never imports from `features/`.** Shared UI knows nothing about the product.
3. **`lib/` has zero React imports.** If it imports a component, it is not a lib.

## Component tiers

| Tier | Location | Rules |
|---|---|---|
| **Primitive** | `components/ui/` | No business logic. Props only. No data fetching. |
| **Composite** | `components/` | Combines primitives. Still no business logic. |
| **Feature** | `features/*/components/` | Owns business logic and data. Not reused outside its feature. |
| **Page** | `pages/*/` | Composes features. Handles routing and layout. Thin. |

A page component over 80 lines is doing feature work. Move it.

## File naming

Pick one and enforce it:

```
PascalCase.tsx      for components      Button.tsx
camelCase.ts        for everything else useDebounce.ts
kebab-case.css      for styles          button.module.css
SCREAMING_SNAKE.md  for docs            API.md
```

The choice matters less than the consistency. Add it to the lint config so it is not a review comment.

## State — where each kind lives

This is the decision that ruins frontends. Four kinds of state, four homes:

| Kind | Example | Home |
|---|---|---|
| **Server state** | The user's orders | A data-fetching library (TanStack Query, SWR). Never `useState`. |
| **URL state** | Current filter, page, tab | The URL. `searchParams`. Shareable, back-button-safe. |
| **Form state** | Input values, validation | Local to the form. `useState` or a form library. |
| **UI state** | Modal open, sidebar collapsed | Nearest common ancestor. `useState` or context. |

**Global state is the last resort.** Before adding a store, check:

- Can it live in the URL? → URL
- Can it come from the server? → query cache
- Can it live in one component? → `useState`
- Does it cross exactly two siblings? → lift to their parent

Only when none of those work does a store earn its place.

## Data fetching

```ts
// features/billing/api/useInvoices.ts
import { useQuery } from '@tanstack/react-query';

export function useInvoices(accountId: string) {
  return useQuery({
    queryKey: ['invoices', accountId],
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/accounts/${accountId}/invoices`, { signal });
      if (!res.ok) {
        throw new Error(`Failed to load invoices (${res.status})`);
      }
      return res.json() as Promise<Invoice[]>;
    },
    staleTime: 30_000,
  });
}
```

Rules:

- **Query keys are arrays**, ordered from general to specific: `['invoices', accountId, { status }]`
- **Always pass `signal`** to `fetch` so the request cancels on unmount
- **Throw on non-2xx.** A silent `return res.json()` on a 500 is a bug factory.
- **`staleTime` set explicitly.** The default of 0 refetches constantly.

## Error boundaries

Every route gets one. Every async subtree that can fail gets one.

```tsx
import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback: (error: Error, reset: () => void) => ReactNode; }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[boundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}
```

Error boundaries catch render errors, not event handler errors, not async errors. Event handlers need try/catch; async needs a rejection handler. Know the difference or you will ship a boundary that catches nothing.

## Loading and empty states

Every list has four states, not one:

```tsx
function InvoiceList({ accountId }: { accountId: string }) {
  const { data, isLoading, isError, error, refetch } = useInvoices(accountId);

  if (isLoading) return <InvoiceListSkeleton rows={3} />;
  if (isError)   return <ErrorState message={error.message} onRetry={refetch} />;
  if (!data?.length) return <EmptyState
    title="No invoices yet"
    body="Invoices appear here once a payment method is added."
    action={{ label: 'Add a payment method', href: '/billing/methods' }}
  />;

  return (
    <ul>
      {data.map(inv => <InvoiceRow key={inv.id} invoice={inv} />)}
    </ul>
  );
}
```

The empty state is not an afterthought. It is the first thing a new user sees. It must explain what to do next.

## The `index.ts` boundary

```ts
// features/billing/index.ts
export { BillingPage } from './components/BillingPage';
export { useInvoices } from './api/useInvoices';
export type { Invoice, InvoiceStatus } from './types';

// deliberately NOT exported: internal components, hooks, helpers
```

Everything not exported here is private. This is what lets a feature be refactored without touching the rest of the app.

## Imports — enforce the direction

```jsonc
// eslint config
"no-restricted-imports": ["error", {
  "patterns": [
    { "group": ["../features/*"], "message": "Import features via their index.ts" },
    { "group": ["**/features/**/components/*"], "message": "Use the feature's public API" }
  ]
}]
```

Or with `eslint-plugin-boundaries` for a proper dependency graph.

## Performance boundaries

Split at route boundaries first, then at interaction boundaries:

```tsx
const Dashboard = lazy(() => import('./pages/dashboard/DashboardPage'));

// heavy, below the fold, only when opened
const Chart = lazy(() => import('./features/reports/Chart'));
```

Do not split a 20-line component. The request costs more than the bytes.

## The review checklist for a new feature

Before a feature folder is considered done:

- [ ] `index.ts` exports exactly what other features need
- [ ] No imports from other `features/` deep paths
- [ ] Server state uses the query library, not `useState` + `useEffect`
- [ ] Filters and pagination live in the URL
- [ ] All four list states implemented: loading, error, empty, data
- [ ] An error boundary wraps the route
- [ ] Loading uses a skeleton that matches the real layout
- [ ] No `any` in the public types
- [ ] The feature's tests live next to its code

## Self-check before reporting

- [ ] Folder structure matches the shape above
- [ ] Feature boundaries enforced by lint, not convention
- [ ] No `lib/` file imports a component
- [ ] State placed by kind: server / URL / form / UI
- [ ] No global store without a written justification
- [ ] Every route has an error boundary
- [ ] Every list has loading, error, empty, and data states
- [ ] Route-level code splitting in place
- [ ] File naming consistent and lint-enforced
