# Lean Gain — Muscle Gain Tracker

A fully offline personal nutrition and training tracker. No backend, no build step,
no internet connection required — just open `index.html` in a browser.

## Running

Open `index.html` directly, or serve the folder with any static file server, e.g.:

```
python3 -m http.server 8420
```

then visit `http://localhost:8420`.

## Data

All logged data (weight, water, habits, grocery checks) is stored in the browser's
`localStorage` under the `leangain:` prefix and never leaves your device.

## Structure

- `index.html` — app shell and tab navigation
- `css/styles.css` — design system, layout, dark mode, print styles
- `js/data.js` — profile targets, meal templates, 30-day plan, recipes, grocery lists, workout plan
- `js/storage.js` — localStorage persistence helpers
- `js/charts.js` — dependency-free canvas chart renderer
- `js/app.js` — tab routing, rendering, event wiring
