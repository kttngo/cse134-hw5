# HW 5 Part 4: Static Site Generator Exercise with Astro

This folder rebuilds two pages from my portfolio, **Home** and **About**, with [Astro](https://astro.build).
Both pages use one shared footer component, so the footer only has to be written once.

This exercise is separate from the main portfolio. The portfolio at the root of this repository is still the Homework 5 deployment.

## What's inside the Astro Deployment

| Path | Description |
|---|---|
| `src/components/Footer.astro` | The footer used by both pages. |
| `src/pages/index.astro` | Home page (built to `/`) |
| `src/pages/about.astro` | About page (built to `/about/`) |
| `public/` | Files copied over: `styles.css`, `theme.js`, `hello-world.js`, and `images/` |
| `astro.config.mjs` | Astro project configuration |
| `package.json` | Dependencies and the `dev`, `build`, and `preview` scripts |

Both pages import the footer with `import Footer from "../components/Footer.astro";` and place it with `<Footer />`.

## Commands

Run these from inside the `ssg-exercise` folder.

**1. Install dependencies:** (only needed once)

```bash
npm install
```

**2. Build the site:**

```bash
npm run build
```

**3. Preview the built pages locally:**

```bash
npm run preview
```

Then open both pages:

- Home: http://localhost:4321/
- About: http://localhost:4321/about/

Stop it with:

```bash
npx astro preview stop
```

Or control + C

## Checking the shared footer

1. Edit the text in `src/components/Footer.astro`.
2. Run `npm run build` again.
3. Refresh both http://localhost:4321/ and http://localhost:4321/about/. Both footers show the change.