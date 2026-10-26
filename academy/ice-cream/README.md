# にじいろアイス屋さん

Buildless, original Ponyland game for preschool and early elementary ages.
Serve Lumina, Flare, Aqua, Mewmew the cat, Terra and Storm.

- Order mode: two flavors in the requested bottom-to-top order and one decoration.
- Creative mode: up to four scoops; any combination can be served.
- No timer, purchases, ads or login. Undo, visual hints, optional Japanese speech and sound.
- Six distinct fulfilled orders earn one ticket through the existing MarketGifts store.
  The round ID makes retry/reload issuance idempotent. Creative mode does not grant tickets.
- Progress uses ponyland-ice-cream-v1 in localStorage. Storage failures are visible.
  This is browser-local persistence, not an authoritative shared reward ledger.
- Existing Ponyland transparent art is reused without alteration; cone, ice and shop
  decorations are original SVG/CSS. No screenshots or assets from the reference games are used.
- The gifts backup includes this game's progress under iceCream.

Run from the repository root with any static HTTP server. Open /academy/ice-cream/.
ES modules require HTTP hosting; opening index.html directly as a file is unsupported.

Checks: node tests/ice-cream.mjs and node tests/market-gifts.cjs.
Manual QA: all six customer orders, incorrect order and undo, reload persistence,
one clear ticket after reload, creative four-scoop serving, 390px mobile layout,
and no captured browser console errors.
