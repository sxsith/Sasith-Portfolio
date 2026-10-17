# Sasith Portfolio — React Migration Base

This is a React/Vite migration of the supplied Lando Norris clone.

## Important

The supplied ZIP is an HTML/CSS/JavaScript/WebGL/Rive/Webflow-exported site, not a Python application. The migration therefore changes the application shell to React/Vite while preserving the supplied page DOM, CSS, images, fonts, GL/Rive assets and local JavaScript runtime.

## Run

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Structure

- `src/App.jsx` — React shell and runtime loader
- `src/page.html` — original page DOM, with scripts removed so React can mount it safely
- `src/main.jsx` — React entry point
- `src/styles.css` — original stylesheet entry
- `public/images` — original images
- `public/fonts` — original fonts
- `public/gl` — original WebGL/3D assets
- `public/rive` — original Rive assets
- `public/js` — original local JavaScript runtime
- `public/css` — original CSS
- `public/images/projects/<category>` — project images and videos, grouped by matching file names

## Why this approach?

Because the requirement is "do not change the existing site", a full rewrite into many JSX components would alter markup, timing, selectors and animation hooks. This migration keeps the original DOM and runtime intact and puts React around it. It is the safest first React conversion; after visual parity is confirmed, individual sections can be converted into true React components one at a time.

## Adding project media

Add supported image or video files to a category folder inside `public/images/projects`. Files with the same name (ignoring letter case and extension) become the image and video for one project; a file without a matching counterpart still appears on its own. The file name is used as the project title, and category folder names become section headings.

The development server refreshes the gallery when files are added, changed, or removed. Rebuild and redeploy the site to publish media changes in production.
