# ENA Landing

The landing page for ENA — built with Vite, React 19, Tailwind 4 and Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build to dist/
```

Design system: see [DESIGN.md](./DESIGN.md).
Pages: `/` (hero · features · FAQ · footer), `#/changelog`, `#/privacy`, `#/terms`.

Before launch: set `GITHUB_REPO` in `src/components/Changelog.tsx` and the two GitHub
links (navbar, footer) to the real repository.
