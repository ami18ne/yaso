Developer setup

1. Install dependencies:

```bash
npm ci
```

2. Run typecheck:

```bash
npm run check
```

3. Run tests (requires dev deps installed):

```bash
npm run test
```

5. Run Playwright E2E (local)

Install browsers (first time):

```bash
npx playwright install --with-deps
```

Run the edit-post e2e test (it stubs supabase calls so it is hermetic):

```bash
npx playwright test e2e/edit-post.spec.ts --project=chromium
```

4. Run dev server:

```bash
npm run dev
```
