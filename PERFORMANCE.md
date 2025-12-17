Performance checklist and guidance

This project includes a few built-in optimizations (lazy loading, service worker caching, streaming, and intersection-driven autoplay). To measure and continually improve performance, follow these steps:

Quick local checks

- Run Chrome Lighthouse locally against `http://localhost:5000` after `npm run dev` or the built production server.
- Use `npx lighthouse http://localhost:5000 --output=json --output-path=lh-report.json` (requires Chrome).

Best practices implemented in repo

- Use `loading="lazy"` for non-critical images and `loading="eager"` for LCP assets.
- IntersectionObserver used for `VideoCard` to autoplay/pause videos only when visible.
- Service Worker (`client/public/service-worker.js`) caches static assets and runtime images and limits cache size.
- Media previews use `preload="metadata"` for videos and audio previews.

Next improvements (suggested)

- Audit with Lighthouse in CI (requires a public or dev URL); add `LHCI_URL` env var to the workflow.
- Add responsive image sizes (`srcset`) for large images.
- Implement server-side image resizing / CDN with proper cache headers.
- Add image placeholders (LQIP / blur) to reduce CLS and perceived load time.

CI integration (optional)

- You can add a Lighthouse CI step or use `treosh/lighthouse-ci-action` in CI to fail on regressions. We didn't add a default perf job because it requires a reachable URL; if you want, I can add a workflow that runs only when `LHCI_URL` is provided.

If you'd like, I can add an automated Lighthouse CI workflow that runs against a provided URL or deploy preview and fails the build on regressions. Say the word and I'll add it.