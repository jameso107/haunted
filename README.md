# Hotel Alice Lloyd — 3D Walkthrough

A first-person 3D walkthrough (schematic scale) of the **Hotel Alice Lloyd** haunted house, Alice Lloyd Hall, Halloween 2026. Dean Alice Crocker Lloyd, proprietor, narrates your stay through four suites named for the hall's houses and the legendary Michigan women behind them: **Angell, Palmer, Hinsdale, and Kleinstueck**.

Walk the route before you build it, on a laptop or in a Meta Quest headset. Built with [Three.js](https://threejs.org/) r128 and WebXR.

## Controls

| Key | Action |
| --- | --- |
| `W A S D` / arrows | Walk |
| Mouse / click-drag | Look |
| `Q` `E` | Turn |
| `Shift` | Run |
| `Tab` | Bird's-eye plan view |
| `L` | House lights: see the rooms as they really are, with the fluorescents on |
| `V` | Dean Lloyd's voice on/off (captions stay) |
| `G` | Toggle route arrows |
| `H` | Hide help |
| `Enter` | Use (open a suite door, ring the bell) |

Best experienced on desktop Chrome / Edge / Firefox, with headphones.

## VR (Meta Quest 2 / 3)

Open the site in the Quest's built-in **Meta Quest Browser** and press **Enter VR** (on the start screen, or bottom-right once you're walking). WebXR needs HTTPS, so use the Vercel URL rather than a LAN IP.

| Controller | Action |
| --- | --- |
| Left thumbstick | Walk (head-relative) |
| Left thumbstick click | House lights |
| Right thumbstick ←/→ | Snap turn 30° |
| Right trigger or **A** | Use (open a suite door, ring the bell) |
| **B** | Toggle route arrows |
| **Y** | Dean Lloyd's voice on/off |
| **X** | Toggle the wrist map (left controller) |

Captions, station names, and scares appear on a panel just below your line of sight. Sound is spatial, so turn your head toward whispers. Play standing or seated: seated players are raised to standing eye height when the session starts.

To test on the headset against a local copy, connect it over USB and forward the port so the page loads as `localhost` (a secure context): `adb reverse tcp:8000 tcp:8000`, then open http://localhost:8000 in the Quest browser.

## Project structure

A static site with no build step.

- `index.html`: markup, HUD styles, and the script list
- `js/three.min.js`: vendored Three.js r128, so there's no runtime CDN dependency
- `js/engine.js`: the walkthrough engine, exposed as `window.HOTEL`. It covers rendering, the WebXR rig and controls, collision, spatial audio, trigger zones, the narrator, the HUD, the minimap, feeds and mirrors, and the bird's-eye view.
- `js/hotel/building.js`: the real building (flow-map walls, window, elevator car, columns, dorm doors, fixtures seen in the Oct 2025 walkthrough video)
- `js/hotel/route.js`: the guest route (stairs or accessible elevator → lobby → Rooms 1–4 → check-out), stations, and route arrows
- `js/hotel/<area>.js`: one file per area of the show
- `vercel.json`: Vercel static-hosting config (clean URLs; only `three.min.js` is cached as immutable)

### The `HOTEL` API in brief

Plan coordinates `(x, z)` are flow-map units (`HOTEL.SC` = 0.04 m each). Heights and sizes are in meters.

- **Build:** `wall`, `curtain`, `column`, `door`, `gate` (a barrier that opens on cue), `box`, `cyl`, `ball`, `plane`, `sign`, `floorPatch`, `ceilPatch`, `group`, `figure`
- **Look:** `mat.*`, `lam`, `glow`, `tex.*` (painted block, sheeting folds, VCT), `textTexture`, `canvasTex`, `screen` (animated canvas texture), `fixture` (lit only with house lights)
- **Light:** `plight`, `spot`. Keep the whole show at or under `HOTEL.budget.lights` (24) for Quest 2.
- **Camera tricks:** `feed` + `monitor` (CCTV), `mirror`, and `feedOnly(obj)` for ghosts that exist only on camera or in the glass. The player has a stand-in that only feeds and mirrors see.
- **Story:** `say(lines, {who})`, `narrate({x1,z1,x2,z2, lines})`, `cap(stageDirection)`, `scare(text)`, `station({n,x,z,name,desc})`, `route(path)`
- **Sound:** `sfx.noise | tone | bell | ring | whisper | typewriter | heartbeat | thunder | sting | loop`, and `ambience({...})` for spatial loops. Pass `{x, z}` to place a sound in the room.
- **Logic:** `zone({x1,z1,x2,z2, enter, exit, during, once, when})`, `onUpdate(fn(dt,t))`, `onBegin`, `onSkip`, `near(x,z,r)`, `inBox`, `player()`, `startAt`, `teleport`

## Run locally

Serve the directory with any static file server:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

### Testing

- `?debug` in the URL exposes `window.HAUNT`. It includes `go(x,z,yaw)`, `look(yaw,pitch)`, `state()`, `lights()`, and `walkRoute()`. `walkRoute()` walks the route arrows through the real collision code and reports every spot where a guest would get stuck.
- To try VR without a headset, load Meta's [IWER](https://www.npmjs.com/package/iwer) emulator before the page boots:

  ```js
  const m = await import('https://unpkg.com/iwer@2.5.0/build/iwer.module.min.js');
  new m.XRDevice(m.metaQuest2).installRuntime({forceInstall: true});
  ```

## Deploy to Vercel

- **Via the dashboard:** import this repository at [vercel.com/new](https://vercel.com/new). Framework preset: **Other**. No build command or output directory is needed.
- **Via the CLI:**

  ```sh
  npx vercel        # preview deployment
  npx vercel --prod # production deployment
  ```
