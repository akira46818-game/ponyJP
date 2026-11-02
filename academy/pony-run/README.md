# ポニーランド・ラン

Buildless static Canvas game at `/academy/pony-run/`. Three short forward-running courses: academy town, flower garden, rainbow road. Six original Ponyland characters, rear-view atlas in `assets/runners.png`. Phone swipes/buttons and keyboard arrows/Space; Escape or tab/window departure pauses. Easy and faster modes; bumps slow briefly without ending the run or removing stars. Every obstacle row leaves a safe lane. All barriers can be jumped.

`model.mjs` owns frame-independent course logic. `art.mjs` draws the perspective environment and sprite atlas; `game.mjs` manages input, UI, sound (off initially), saves, and rewards. Reduced motion disables character bobbing and decorative animation while retaining essential forward motion.

Progress saves at each course finish in browser localStorage `ponyland-run-v1`. An interrupted course restarts from its beginning; completed courses retain stars. All three completions grant one existing MarketGifts ticket `pony-run:<journey-id>:day:1`, protected by the shared Web Lock. Reload/retry is idempotent. Replay creates a new journey; existing cards remain. This uses the existing browser-local reward system and does not issue globally unique serial numbers.

Run `node tests/pony-run.mjs` from the repo root. Serve the repository via a static HTTP server. No build, external game library, or ChatGPT/API runtime required.

Art: rear-view character atlas generated with the built-in image tool from the existing Ponyland character references. Final generation brief is recorded in `assets/prompt.txt`.
