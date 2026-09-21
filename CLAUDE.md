# Habitats — Document Library

A static HTML/CSS/vanilla-JS mockup of the **habitats** platform's Document Library
feature — including uploading a document with a multi-shape Area of Interest (AOI)
drawn on a map. Built to match the real production app's design language and
interaction patterns exactly (verified against screenshots and a screen recording
of the live app).

## Stack & constraints

- **Plain HTML/CSS/vanilla JS. No build step, no framework, no npm packages.**
  Do not introduce React/Vue/a bundler/TypeScript/Tailwind unless explicitly asked.
- Every page is a standalone `.html` file that links `assets/style.css` and the
  relevant `assets/*.js` files directly via `<script src="...">` / `<link>`.
- Run locally with a static server (VS Code "Live Server", or
  `python -m http.server 8000`). Opening a file straight from inside an
  unextracted `.zip` breaks CSS/JS loading — always extract/clone first.

## File map

- `index.html` — redirects to `document-library.html`.
- `document-library.html` — the Document Library list (category chips, search,
  table + live map preview panel with Hide/Show Map) and the Add/Edit Document
  modal wizard.
- `asset-plan-site-documents.html` — the *other* place documents get uploaded
  (the Asset Plan creation stepper's "Site Documents" step). Its own simpler
  "Add details" modal, with an optional "+ Link a location on the map" field
  that reuses the same map component.
- `assets/style.css` — all shared styles (design tokens, components, modal
  chrome, map pill toolbar). One file, no CSS modules/scoping — class names are
  the contract.
- `assets/shell.js` — renders the sidebar nav + page header. Every page calls
  `initShell(activeNavKey, title, subtitle?)` (or `renderSidebar(key)` alone if
  it doesn't want the standard page header).
- `assets/aoi-map.js` — `AOIMap.mount(containerEl, opts)`: the reusable
  Point/Line/Polygon map-drawing step, shared by both upload flows. See
  "AOIMap component" below before touching map/geometry code.

## Design language

### Colors (CSS custom properties, defined in `style.css :root`)
- `--teal-900: #0c3630`, `--teal-active: #0e3d37` — primary dark teal (sidebar
  active state, primary buttons, map pill toolbar background).
- `--green-accent: #2fae82` — brand accent (icons, links, focus borders,
  polygon shapes, success states).
- `--text-dark: #1f2937`, `--text-gray: #4b5563`, `--text-mute: #9ca3af`.
- `--border: #e5e7eb` — the one border color used everywhere.
- Status pill colors (`--pill-*-bg`/`--pill-*-fg`) for pending/approved/
  rejected/etc. — reuse these, don't invent new status colors.
- Geometry type colors (not CSS vars, used directly): polygon `#2fae82`
  (green), line `#2f5fa8` (blue), point `#7c4fd6` (purple). Consistent
  everywhere a shape type needs a color — chips, icons, map strokes.

### Typography
System font stack (`"Segoe UI", Roboto, -apple-system, ...`). Page titles
26px/700, card titles 16px/700, body 14px, muted/helper text 12.5–13.5px in
`--text-mute`.

### Core components (all in `style.css` — reuse, don't re-invent)
- `.card` / `.card-title` / `.card-desc` — the standard content panel.
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger-outline` — buttons.
- `.chip` / `.chip-all` / `.chip-ghost` — category/status filter pills.
- `.form-group`, `.form-label`, `.form-input`, `.form-select`, `.split-grid`
  (2-col form layout) — every form uses these.
- `.radio-cards` / `.radio-card` (+ `.cols-2`) — the two-option "choose how to
  proceed" cards (e.g. "Draw on Map" vs "Upload file"). Matches the real app's
  "Choose starting point" / "Link to location?" screens exactly — reuse this
  for any future either/or choice, don't build a new pattern.
- `.dropzone` / `.dropzone-file` — file upload drop area + selected-file row.
- `.table-card`, `table`, `.item-cell` — standard data tables.
- `.modal-overlay` / `.modal-card` (+ `.modal-wide` for the map step) /
  `.modal-head` / `.modal-body` (+ `.no-pad` when a map fills it edge-to-edge)
  / `.modal-foot` — every modal in the app uses this exact chrome. A modal is
  a `<div class="modal-overlay">` appended once per page and re-rendered via
  `innerHTML` swaps per wizard step (see `document-library.html`'s `modal`
  object pattern) — not a component library, just template strings.
- `.aoi-pill` / `.status` / `.access-tag` — small colored status/count pills.
- `.icon-btn-sm` — small square icon-only buttons (edit/delete on table rows,
  chip actions).

### Icons
Inline SVG only, no icon font/library. Convention:
`<svg width="H" height="H" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">...</svg>`.
Each page keeps its own small `ICON` map of path strings and an `svg(inner, size)`
helper — copy this pattern rather than adding an icon dependency.

## The AOIMap component (`assets/aoi-map.js`)

This is the one piece of real interaction logic in the app — read it before
changing anything geometry-related.

- `AOIMap.mount(containerEl, { shapes, onChange, confirmDeleteMessage? })`
  renders a self-contained map step into `containerEl`: search bar overlay
  (decorative), zoom controls (decorative), the dark rounded **pill toolbar**
  at the bottom-center with Point/Line/Polygon tools (this exact visual — a
  dark pill, active tool gets a white background — matches the real app's map
  screen; don't redesign it), and shape "chips" showing what's been drawn so
  far with a remove (×) button on each.
- **Multiple shapes per document is a first-class feature**, not an edge
  case — a document's AOI can be any mix of polygons/lines/points. The tool
  stays selected after committing a shape so users can draw several of the
  same type in a row. There is deliberately **no limit** on shape count.
- Because early testing showed users didn't realize multiple shapes were
  possible, the mount includes an upfront tip banner ("You're not limited to
  one shape...") and the host page's Next/Continue button should show a live
  count (see `nextBtnLabel()` in `document-library.html`) — keep this pattern
  for any new entry point into AOIMap.
- Deleting a shape **always confirms first** via `window.confirm`. Pass
  `confirmDeleteMessage(shape, remainingCount)` to customize the message
  (return `null`/falsy to fall back to the generic one). `document-library.html`
  uses this to give a **single combined warning** when the shape being deleted
  is the document's last one — the message says upfront that the whole
  document will also be deleted, so there is only one dialog, not two. Keep
  it that way; don't split it back into "delete shape?" then "delete doc?".
- `asset-plan-site-documents.html` does **not** pass `confirmDeleteMessage`
  and does **not** cascade-delete anything when its optional location is
  cleared — that page's location is optional metadata on a real uploaded
  file, so removing a pin should never delete the file. Keep that asymmetry;
  it's intentional, not an oversight.

## Editing an existing document

Opening **Edit** on a document that already has shapes must land the user
**directly on the map step**, not on the details form with the locations
hidden behind a "Change" link — this was a real bug fixed after user
feedback. A document with zero shapes still opens on the details form (there's
nothing to show on an empty map). See `openAddDocumentModal()` in
`document-library.html` for the reference implementation
(`step: hasShapes ? 2 : 3`) if adding a similar edit entry point elsewhere.

## Data model (mock, in-memory — no backend)

Each page keeps its documents in a plain JS array (`DOCS` in
`document-library.html`, `SITE_DOCS` in `asset-plan-site-documents.html`).
A document/site-doc record shape:
```js
{ code, name, cat, scope, size, uploaded, summary, shapes: [{id, type, points}] }
```
`shapes` is the array `AOIMap` reads/writes. There is no persistence — state
resets on page reload. Don't add localStorage/a backend unless asked;
this is a design prototype, not the production app.

## Testing changes

There's no automated test suite. Verify changes by actually running the page:
serve the folder (`python -m http.server`) and drive it with Playwright
(`page.goto`, click through the flow, `page.screenshot`) before calling
something done, especially for anything involving the map/modal — headless
verification has caught real bugs here (e.g. a point commit that updated
state but never called `render()`). Check the browser console for errors too.

## What NOT to do

- Don't reintroduce a full-page upload flow — uploading/editing a document is
  a **modal**, matching the real app exactly. This was rebuilt once already
  after diverging from the real design; don't regress it.
- Don't duplicate the Data Transfer / Approvals / My Requests screens into
  this repo — those belong to the separate `nishadevar/Data-Transfer` repo.
  This repo is scoped to the Document Library feature only.
- Don't add a build step, package.json, or framework dependency.
