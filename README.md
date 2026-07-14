# Don Cuddihee — Portfolio

A build-free portfolio for software, AI systems, technical support, networking, and visual design. It includes responsive light/dark themes and a lightweight, theme-aware translucent visual system built entirely with HTML and CSS.

## Run locally

```powershell
npm start
```

Then open `http://localhost:8080`. You can also serve the repository directly with `python -m http.server 8080`.

## Verify

```powershell
npm run check
```

The site is plain HTML, CSS, and JavaScript, so it can be deployed from the repository root with GitHub Pages without a build step.

## Structure

- `index.html` — content and semantic structure
- `src/css/style.css` — responsive visual system and motion
- `src/js/app.js` — theme control, navigation, and reveal effects
- `Resume_Cuddihee.pdf` — current software and AI résumé

## Deployment

For GitHub Pages, set the publishing source to the repository's `main` branch and `/ (root)` directory. All asset paths are relative so the site also works from the existing `/portfolio/` project path.
