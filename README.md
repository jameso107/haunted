# Alice Lloyd Haunt 2026 — 3D Walkthrough

A first-person 3D walkthrough (schematic scale) of the Alice Lloyd Haunt haunted-house build for Halloween 2026, rendered with [Three.js](https://threejs.org/).

Walk the route before you build it: the elevator strike, Arrival 1950, the Promenade, the Portrait Gallery, the Dean's Office, Pepper's Ghost, the Bulletin, Whisper Hall, the Bust, the Tomb, and back to 2026.

## Controls

| Key | Action |
| --- | --- |
| `W A S D` / arrows | Walk |
| Mouse / click-drag | Look |
| `Q` `E` | Turn |
| `Shift` | Run |
| `Tab` | Bird's-eye view |
| `G` | Toggle route arrows |
| `H` | Hide help |
| `Enter` | Skip the elevator ride |

Best experienced on desktop Chrome / Edge / Firefox, with headphones.

## Project structure

This is a fully static site — no build step required.

- `index.html` — the entire app (markup, styles, and scene/game code)
- `js/three.min.js` — vendored Three.js r128, served locally so the app has no runtime CDN dependency
- `vercel.json` — Vercel static-hosting config (clean URLs, cache headers)

## Run locally

Serve the directory with any static file server, e.g.:

```sh
npx serve .
# or
python3 -m http.server 8000
```

Then open http://localhost:8000 (or the port `serve` prints).

## Deploy to Vercel

- **Via the dashboard:** import this repository at [vercel.com/new](https://vercel.com/new). Framework preset: **Other**; no build command or output directory needed.
- **Via the CLI:**

  ```sh
  npx vercel        # preview deployment
  npx vercel --prod # production deployment
  ```
