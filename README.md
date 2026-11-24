# CSE 134B Homework 5: Katie Ngo's Portfolio

**Deployed site:** https://cse134-katie-hw5.netlify.app

## Where things are located

| What | Location |
|---|---|
| **Web Component** (`<fact-card>`, live data) | **Useless Facts** in the nav: [`facts.html`](facts.html), with its code in [`fact-card.js`](fact-card.js) |
| Sample-data demo from Part 1 (`<pokemon-card>`) | **Pokémon Component** in the nav: [`pokemon.html`](pokemon.html), with its code in [`pokemon-card.js`](pokemon-card.js) |
| Component styles | The `fact-card` section of [`styles.css`](styles.css) |
| **Static site generator exercise** (Astro) | [`ssg-exercise/`](ssg-exercise/) |

### Static site generator

The Astro exercise is in the **`ssg-exercise/`** folder. It builds two pages from my portfolio that share one footer component (`ssg-exercise/src/components/Footer.astro`):

- **Home**: http://localhost:4321/ (source: `ssg-exercise/src/pages/index.astro`)
- **About**: http://localhost:4321/about/ (source: `ssg-exercise/src/pages/about.astro`)

The commands to install dependencies, build, and preview are in [`ssg-exercise/README.md`](ssg-exercise/README.md).

## Design note: the Useless Fact Finder

### What the visitor wants to do

A visitor wants to quickly read a random useless fact (or today's fact), get another one whenever they like, and look back at the ones they've already seen. They can also choose a viewpoint that hides the extra details, and the site remembers that choice.

### Tracing one action: pressing "Get a fact"

1. **Control.** The visitor picks **Random fact** or **Today's fact** in the labeled select menu and activates the **Get a fact** button inside `<fact-card>` by clicking it. Its click listener calls `requestFact()` in `fact-card.js`.
2. **Loading state.** Before the request starts, `requestFact()`:
   - sets the status line (`role="status"`) to "Loading a random fact…" with a ⏳ icon
   - marks the button `aria-disabled="true"` and disables the select, so a second request can't start
   - sets `aria-busy="true"` on the fact display
3. **API request.** It calls `fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en")`, or `/today` for today's fact, with an `AbortController` that cancels the request after 10 seconds.
4. **Checking the response.**
   - If `response.ok` is false, it reports the HTTP status.
   - `response.json()` is wrapped so invalid JSON is reported instead of crashing.
   - `readFact()` checks that `id` and `text` are non-empty strings, gives `source` and `language` fallbacks, and only keeps `source_url` if it is a real `http(s)` address.
5. **DOM update.** The new fact is added to the component's list of loaded facts, and `showCurrentFact()` updates the page. All remote text goes in with `textContent`:
   - the fact paragraph
   - the Type, Source, and Language details (Source becomes a link only for a safe URL)
   - the Previous and Next buttons, which turn on once there's more than one fact
6. **Finishing.** In a `finally` block, the button and select are re-enabled and `aria-busy` is removed, whether the request succeeded or failed.

### What the visitor sees

- **While waiting:** "Loading a random fact…" with a ⏳ icon. The previous fact stays visible, and the button is dimmed until the request finishes.
- **On success:** the new fact replaces the old one, and the status reads "Loaded a random fact. Showing fact 3 of 3." Requesting today's fact again shows the copy already loaded instead of a duplicate.
- **On failure:** the status turns red with a ✖ icon and explains the problem:
  - "Couldn't reach the fact server. Check your internet connection." when offline
  - "The request took too long." after the timeout
  - the HTTP status, an invalid-JSON message, or a missing-field message for bad responses

  The button changes to **Try again**, and the last good fact stays on screen. Pressing Try again after the connection returns loads a new fact and clears the error, with no page reload. The rest of the portfolio keeps working the whole time.

Screen readers announce each of these status messages because the status line has `role="status"`.

### Saved preference

The **Switch to compact view** button on the page, outside the component, toggles the component's observed `compact` attribute. The choice is saved in `localStorage` under `hw5-fact-card-mode` and restored on reload, with `try`/`catch` so the button still works if storage is blocked.