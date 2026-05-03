# alanywu.github.io

Personal site. Astro + Tailwind + p5.js. Theme: **emergence**. One becoming many.

## Local

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview
```

## Add content

Drop a Markdown/MDX file in the right folder; it auto-shows up.

| Section | Folder | Filename pattern |
|---|---|---|
| Project case study | `src/content/projects/` | `slug.mdx` |
| Weekly update | `src/content/updates/` | `YYYY-Www.mdx` |
| Blog post | `src/content/blog/` | `slug.mdx` |

Each file needs frontmatter; see existing entries for the schema, or check `src/content.config.ts`.

## p5.js sketches

Live in `src/sketches/`. Mounted via `<P5Sketch sketch="name" />`. They lazy-load, pause off-screen, and respect `prefers-reduced-motion`.

- `gameOfLife`: home page background; mouse seeds new cells
- `boids`: projects page; flock follows your cursor
- `neuron`: about page; hover nodes to fire pulses

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys on push to `main`.

One-time setup on GitHub:

1. Create a public repo named **`alanywu.github.io`** under the `alanywu` account.
2. Push this directory to it.
3. Repo **Settings → Pages → Source: GitHub Actions**.
4. Push to `main`. Action runs, site goes live at https://alanywu.github.io.

## Layout

```
src/
  layouts/Layout.astro      # html shell + nav/footer
  components/               # Nav, Footer, P5Sketch
  sketches/                 # p5 modules (gameOfLife, boids, neuron)
  content/                  # mdx for projects, updates, blog
  pages/                    # routes
  styles/global.css         # tailwind + design tokens
```
