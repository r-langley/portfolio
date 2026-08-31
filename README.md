# Ross Langley — Portfolio

Product design director portfolio. Static, dependency-free, content-model-driven, with a hand-written WebGL2 / physics hero.

## Stack

No framework, no build deps. `build.mjs` (Node, ESM) reads the content model in `content/` and the hand-written CSS/JS in `assets/`, and emits a single self-contained `dist/index.html` (every page is a section; a tiny client router maps the URLs). The physics hero and the WebGL ring tunnel are original, library-free.

## Layout

```
build.mjs            # the whole build — templates + assembly
content/
  site.mjs           # nav, hero, ticker, principles, contact, footer
  cases.mjs          # case studies (the content graph)
assets/
  site.css           # design system + all styles
  site.js            # nav, theme, accordion, ⌘K, CTA blob
  hero.js            # gravity hero — custom 2D physics solver
  rings.js           # WebGL2 ceramic ring tunnel (POV section)
.github/workflows/   # build + deploy to GitHub Pages
dist/                # build output (git-ignored, built by CI)
```

## Develop

```bash
npm run build        # -> dist/
npm run serve        # http://localhost:8099  (serves dist/)
# or: npm run dev     (build + serve)
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`: it runs `node build.mjs`
and publishes `dist/` to GitHub Pages. No secrets or dependencies required.

The site ships with `noindex`, so it stays out of search results even though
GitHub Pages URLs are public. `robots.txt` disallows general/search crawlers but
allows the link-preview bots (Slack, X, LinkedIn, Facebook, iMessage/Applebot, …)
so shared links still unfurl with an Open Graph card. The `og:image` and
canonical/`og:url` are absolute — see `SITE_URL` in `build.mjs`, which must be
updated if a custom domain is pointed at the site.

## Editing content

Everything readable lives in `content/`. Case studies are objects in
`content/cases.mjs`; `TK` markers render as amber chips for anything still to write.
Per-case images will live under `assets/cases/<slug>/` and be referenced from the
case object (Phase 1).

## Roadmap

- **Phase 1** — per-case asset folders + an image build step (resize/webp).
- **Phase 3** — optional migration to React + Tailwind so the Subframe CLI bridge
  can sync UI primitives, with the physics/WebGL kept as custom components; then a
  git- or headless-CMS over the same content model, and an AI-native content layer.

Design source of truth in the interim: the Subframe project (via MCP), kept in
sync by hand.
