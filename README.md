<p align="center">
  <strong>Global Rights Management (GRM) Platform</strong><br/>
  <em>Recklass Rekkids — Music product availability by partner and date</em>
</p>

<p align="center">
  <a href="https://github.com/garyvh2/grm-platform/actions/workflows/ci.yml">
    <img src="https://github.com/garyvh2/grm-platform/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <img src="https://img.shields.io/badge/coverage-99%25-brightgreen" alt="Coverage 99%" />
  <img src="https://img.shields.io/badge/tests-332-blue" alt="Tests 332" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" alt="TypeScript strict" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
</p>

---

## Getting Started

```bash
npm install            # install dependencies
npm run dev            # start dev server → http://localhost:5173
```

## How to Use

1. **Upload** a `music-contracts.txt` and a `partner-contracts.txt` file (pipe-delimited).
2. **Select** a distribution partner from the dropdown.
3. **Enter** an effective date (YYYY-MM-DD).
4. **Click Search** — the table shows every music product the partner is licensed to distribute on that date, sorted by artist then title.

Sample data files are available in `public/data/`.

## Running Tests

```bash
npm test                # unit + component + BDD (304 tests)
npm run test:coverage   # same with coverage report
npm run test:e2e        # Playwright browser tests (28 tests)
npm run ci              # full pipeline: typecheck → lint → format → coverage → build
npm run ci:full         # ci + E2E
```

## Implementation

### Pipeline

The app is a four-stage pipeline — each stage is a pure function with no shared mutable state:

```
Upload (text files)
  → Parse (pipe-delimited text → typed arrays)
    → Filter (match partner rights + date range)
      → Display (sorted results table)
```

### Project Structure

```
src/
├── types/index.ts              # Domain interfaces
├── parsers/
│   ├── parseLines.ts           # Line normalization (BOM, NUL, line endings)
│   ├── sanitizeField.ts        # Field cleaning (zero-width, control chars, quotes)
│   ├── parseMusicContracts.ts  # → MusicContract[]
│   └── parsePartnerContracts.ts # → PartnerContract[]
├── engine/
│   └── filterContracts.ts      # Filtering + sorting logic
└── components/
    ├── App/                    # Root — state management, callbacks
    ├── FileUpload/             # Two file inputs
    ├── SearchPanel/            # Partner dropdown + date input
    ├── ResultsGrid/            # Results table with aria-live
    └── shared/                 # 10 reusable primitives
        Badge · Button · Card · EmptyState · FileInput
        FormField · Input · PageHeader · Section · Select
```

### How It Works

**Parsing** — Both parsers use a shared `parseLines` utility that strips BOM, NUL bytes, and normalizes line endings. Each field goes through `sanitizeField` which removes zero-width characters, control characters, non-breaking spaces, and unwrapping quotes. Malformed rows are silently skipped.

**Filtering** — Given a partner name and effective date, the engine looks up the partner's allowed usage types, then checks each music contract for: (1) overlapping usage types, (2) start date ≤ effective date, (3) end date ≥ effective date or no end date. Each matched usage produces a separate result row.

**Date comparison** — YYYY-MM-DD strings are lexicographically orderable, so simple `<=`/`>=` string comparison is used instead of `Date` objects. No timezone issues.

**React optimizations** — `useCallback` for stable handler refs, `useMemo` for derived data, `React.memo` on child components to avoid unnecessary re-renders.

**Accessibility** — WCAG 2.1 AA compliant: skip-to-content link, `<main>` landmark, `<form role="search">` with keyboard submit, `aria-live="polite"` on results, `<caption>` and `scope="col"` on table, focus-visible rings, WCAG-passing color contrast.

### Style

All code follows the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) — named exports only, JSDoc on exported symbols, `interface` over `type`, `import type` for type-only imports, `strict: true` in all tsconfigs.

## License

[MIT](LICENSE) © Gary Valverde

