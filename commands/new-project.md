---
description: Scaffold a new project the NingX-EnggTeam way — folder structure, token layer, lint enforcement, CI, and the first page with its UI type named.
argument-hint: <project name and one line about what it is>
---

# /new-project

A project that starts right does not need to be fixed later.

## Step 1 — Decide the shape

```
Framework:     <Next.js app router | Vite + React | Astro | plain HTML>
Rendering:     <static | SSR | client> per route
Pages:         <list>
UI types:      <one per page>
Backend:       <none | API routes | separate service>
Database:      <none | Postgres | SQLite | other>
```

State it before creating a file. If the brief does not determine a choice, pick the simplest that works and say so in one line.

## Step 2 — The folder structure

```
src/
  app/                 routing, providers, shell
  pages/               one folder per route
    home/
      HomePage.tsx
  features/            one folder per capability, each with index.ts
  components/
    ui/                primitives, props only
  lib/                 framework-agnostic, zero component imports
  styles/
    tokens.css         the only file with raw values
    global.css         reset + base
  types/
```

## Step 3 — The token layer

Run `/design-tokens` with the brand color. Three layers, dark mode, contrast verified.

## Step 4 — The enforcement

```jsonc
// .stylelintrc.json
{
  "rules": {
    "color-no-hex": [true, { "ignoreFiles": ["**/tokens.css"] }],
    "declaration-property-value-disallowed-list": {
      "transition": ["/\\ball\\b/"],
      "outline": ["none"]
    }
  }
}
```

```jsonc
// .eslintrc.json — boundary enforcement
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        { "group": ["../features/*"], "message": "Import features via their index.ts" },
        { "group": ["**/features/**/components/*"], "message": "Use the feature's public API" }
      ]
    }]
  }
}
```

## Step 5 — The base layout

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{PAGE}} — {{PROJECT}}</title>
  <meta name="description" content="{{120-155 chars, specific}}">
  <link rel="canonical" href="https://{{DOMAIN}}{{PATH}}">
  <link rel="stylesheet" href="/styles/tokens.css">
  <link rel="stylesheet" href="/styles/global.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header>…</header>
  <main id="main">…</main>
  <footer>…</footer>
</body>
</html>
```

## Step 6 — The first page

Run `/build-page` for the home route. It gets a named UI type, a direction block, and an anti-slop verdict before it counts as done.

## Step 7 — CI

```yaml
name: quality
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - run: npx lighthouse-ci autorun --collect.staticDistDir=dist \
             --assert.assertions.categories:performance=0.9
```

## Step 8 — Report

```
PROJECT — <name>
Framework:    <choice>, <why in six words>
Pages:        <n>, each with a named UI type
Tokens:       three layers, dark mode, contrast verified
Enforcement:  stylelint color-no-hex, eslint boundaries
CI:           lint → typecheck → build → lighthouse
First page:   /build-page run, anti-slop PASS
```
