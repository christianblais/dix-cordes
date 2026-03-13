# AGENTS.md — Dix-Cordes

## Project Overview

Browser-based voice chat rooms. No accounts, no install, no build step.
Three static files (`index.html`, `style.css`, `app.js`) deployed to Cloudflare Pages.
Single runtime dependency: Supabase Realtime (loaded via CDN `<script>` tag).

## Build / Deploy / Test

There is **no build step**, no bundler, no transpiler. Files are served as-is.

```bash
# Deploy to Cloudflare Pages
npx wrangler pages deploy . --project-name=dix-cordes

# Local dev — any static file server works
python3 -m http.server 8000
# or
npx serve .
```

**No test framework exists.** No linter, no formatter, no CI pipeline.
Manual browser testing is the only verification method. Open `index.html` in a
browser, create/join rooms, and verify audio/video/chat functionality.

## Architecture

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | ~75 | Markup. Three views: landing, room, error. All hidden by default. |
| `style.css` | ~585 | All styles. Modern CSS with `light-dark()`, native nesting, custom properties. |
| `app.js` | ~1200 | All logic. Single file, no modules. Supabase via `window.supabase`. |

### Key Patterns

- **Hash-based routing:** Room name is the URL hash. `hashchange` event drives navigation.
- **View switching:** Three views toggled via `hidden` attribute.
- **Perfect negotiation:** Polite/impolite peers determined by UUID comparison (`peerId < otherPeerId`).
- **ICE candidate buffering:** Candidates buffered until `remoteDescription` is set.
- **Per-peer audio:** Each peer gets its own `GainNode` for volume control (0–200%).
- **Programmatic chimes:** Join/leave sounds via `OscillatorNode`.
- **localStorage:** Display name, mute state, theme, starred rooms, recent rooms — all prefixed `dix-cordes-`.

## Design Principles

These are non-negotiable. Every change must respect them:

1. **Simple.** Modern browser APIs only. No polyfills, no backwards compat.
2. **No dependencies.** Adding one must be strongly justified. Supabase is the sole exception.
3. **Static.** No server, no build, no bundler.
4. **Less code = less bugs.** After every change, ask if the whole thing can be simplified.

## Code Style

### Formatting

- **2-space indentation** in all files (HTML, CSS, JS).
- **Single quotes** for JS strings.
- **Semicolons** always.
- **Trailing commas** in multi-line object/array literals.
- **No hard line length limit** — aim for ~100-120 characters.
- **Blank lines** between logical sections, not between tightly related declarations.

### JavaScript

- **No comments.** Code is self-documenting. Comments were deliberately removed.
- **No classes.** Plain functions + a single `state` object.
- **No modules/imports.** Single script file. Supabase accessed via `window.supabase`.
- **`camelCase`** for variables and functions: `createPeerConnection`, `channelSend`.
- **`UPPER_SNAKE_CASE`** for constants: `ICE_SERVERS`, `ADJECTIVES`, `VAD_THRESHOLD`.
- **`function` keyword** for named top-level declarations.
- **Arrow functions** for short inline callbacks and event handlers.
- **`async/await`** for all async operations. No raw `.then()` chains.
- **`const`** by default. `let` only when reassignment is needed. Never `var`.
- **Template literals** for string interpolation.
- **`for...of`** loops over arrays. No `.forEach()`.
- **DOM shorthand:** `const $ = (sel) => document.querySelector(sel);` is available.
- **Imperative DOM:** `document.createElement()` + `replaceChildren()`. No `innerHTML` except for SVG icons.

### Error Handling

- **`try/catch`** around Supabase channel operations (track, untrack, send, removeChannel).
- **`console.warn`** for non-fatal errors (failed sends, failed presence tracking).
- **`console.error`** for critical errors (mic denied, signaling failures).
- **Silent `catch {}`** only for truly ignorable errors (clipboard, display media cancel, audio play, page unload cleanup).
- **No user-facing error toasts.** The only user-facing error is the "Microphone Required" view.

### CSS

- **Modern CSS only:** `light-dark()`, native nesting (`& {}`), `100dvh`, `:fullscreen`.
- **Custom properties** for all colors — defined in `:root`.
- **Theming:** `color-scheme: light dark` with `light-dark()` for every color value.
- **System font stack:** `system-ui, -apple-system, sans-serif`.
- **No media queries** except `@media (hover: hover)` for hover-only interactions.
- **No CSS preprocessor.** Plain CSS.

### HTML

- **Semantic, minimal markup.** Buttons have `aria-label` but no text content (icons injected by JS).
- **All views start `hidden`** — JS controls visibility.

## Commit Messages

Lowercase, imperative style. Optional prefix for category:

```
fix: star button in recent rooms uses gold hover instead of red
simplify: remove all comments, extract shared cleanup helpers
add M key mute toggle, persist recent rooms
show starred rooms in recent list too
```

Prefixes used: `fix:`, `simplify:`, `add`, or plain descriptive (no prefix).

## Common Pitfalls

- **No build step means no safety net.** Syntax errors break the entire app. Test in browser after every change.
- **Supabase keys are hardcoded** in `app.js` (publishable/anon key — this is intentional for a client-only app).
- **WebRTC state is complex.** Peer connections have lifecycle constraints. Always check `connectionState` before operating on a peer.
- **ICE candidates must be buffered** until `remoteDescription` is set — don't skip this.
- **`replaceChildren()`** is used to re-render lists. Don't mix with incremental DOM updates.
- **The `state` object is the single source of truth.** Don't create parallel state.
- **`hidden` attribute drives view visibility.** Don't use CSS `display: none` for view switching.

## File Inventory

```
index.html      — Markup (3 views: landing, room, error)
style.css       — Styles (light-dark theming, CSS nesting)
app.js          — All logic (WebRTC, Supabase, DOM, state)
favicon.png     — Browser tab icon
logo.webp       — App logo
AGENTS.md       — This file
```
