# CLAUDE.md — Volleyball Tournaments

This is the developer guide for any AI coding session working on this repo. It exists so the same conventions are applied when new tournament events are imported in the future, without re-deriving them from scratch each time.

## What this app is

Static, single-file site (`index.html`) deployed to Vercel. Calendar + event-list view of Bay Area volleyball tournaments, with a detail sheet that opens per event. Data lives in `data/events.json`. There is no build step (`vercel.json` skips install + build and serves the root directly).

## The non-negotiable rule for new events

When adding/crawling a new tournament, **do NOT just save a verbose description and ship it**. The detail sheet renders text-heavy descriptions poorly, and the user has called this out repeatedly ("you had to do it for all all the time when we import new one too", "i just dont like seeing text after text"). Always populate a typed `details` array alongside the raw description.

The full original brain-dump still goes into `event.description` — it renders at the bottom of the sheet under a "NOTES" divider. The structured `details` carry the parsed bits; the description carries everything the regex can't capture (history, refund policies, t-shirt notes, fundraiser context, etc.).

## The `details` schema

Each event's `details` is `SectionObject[]`. Each section uses one of these typed shapes (renderers live in `index.html`'s `openSheet`):

- **Schedule** — clock-badge rendering. Values must look like `\d{1,2}:\d{2}\s*(am|pm)?`:
  ```json
  { "heading": "Schedule", "items": [
      { "label": "Check-in", "value": "8:30am" },
      { "label": "Arrive by", "value": "8:30am" },
      { "label": "Briefing", "value": "9:00am" },
      { "label": "First serve", "value": "9:00am" }
  ]}
  ```

- **Divisions** — auto-built from `event.divisions`. Renders one row per gender with skill chips and a gender icon. Only add manually if you want to override.

- **Pricing** — tier cards (first one highlighted black). `$`-prefixed values render as tiers; non-`$` items render as small extra-rows below:
  ```json
  { "heading": "Pricing", "items": [
      { "label": "Early (thru 6/10)", "value": "$35 / player" },
      { "label": "Late", "value": "$40 / player" },
      { "label": "Season Pass", "value": "−$5" }
  ]}
  ```

- **Ratings** — segmented horizontal bar (low → high skill). Sort items B → BB → A → AA → Open:
  ```json
  { "heading": "Ratings", "type": "ratings", "axisLow": "Beginner", "axisHigh": "Open", "items": [
      { "label": "B", "value": "≤ 4.25" },
      { "label": "BB", "value": "≤ 4.75" },
      { "label": "A", "value": "≤ 5.5" },
      { "label": "Open", "value": "no cap" }
  ]}
  ```

- **Format** — small volleyball-court SVG (player dots derived from `event.format`: 2s/3s/4s/6s) + hero stats:
  ```json
  { "heading": "Format", "items": [
      { "label": "Team cap", "value": "60" },
      { "label": "Scoring", "value": "Rally" },
      { "label": "Brackets", "value": "Best-of-3 (21/21/15, no caps)" }
  ]}
  ```

- **Contact** — one row per person with name + Email/Call pill buttons. Phone optional:
  ```json
  { "heading": "Contact", "type": "contacts", "items": [
      { "label": "Mark Reuter", "email": "mreuter@volleynation.com", "phone": "925-457-5037" }
  ]}
  ```

Section order is enforced by JS priority (`Schedule → Divisions → Pricing → Ratings → Format → Contact`), so the JSON order doesn't matter.

## Extraction gotchas (learned the hard way)

1. **Schedule times must be matched in both directions.** Phrasings like `"9:00 AM first serve"` put the time *before* the keyword; forward-only regex grabs the wrong time (e.g. `"wrapping around 3:30 PM"` → `"First serve: 3:30pm"`). Use a nearest-time-to-keyword scan within ~30 chars in either direction.

2. **Revco detection has to check the event name, not just `divisions[]`.** Some events have plain `["Coed AA","Coed A"]` divisions but `"Reverse Coed"` in the name. Match both `/reverse\s*coed/i` against each division AND `/reverse\s*coed|\brev\s*co\b/i` against `event.name`. Otherwise the calendar chip shows `2s grass` instead of `Revco 2s grass`.

3. **Per-player fees should NOT set `event.feeUSD`.** The legacy data model assumes per-team and the older renderer labels it `$X / team`. Leave `feeUSD` unset and put the per-player breakdown in the Pricing section instead.

4. **Don't skip the Contact section if no proper-noun name was found.** When the extractor only finds an org email (e.g. `info@tl-sports.com`) and a phone number, fall back to `{ label: "Organizer", email, phone }`.

## Tooling

- `tools/extract.html` — in-browser regex extractor. Paste a raw description, get suggested `description` + `details` JSON.
- For batch updates over `data/events.json`, run the same patterns as a Node one-liner — see git history for the script that processed all 25 events at once (`Auto-extract structured details across all 25 events with descriptions`).

## Deploy

`vercel.json` sets `framework: null`, `buildCommand: null`, `installCommand: null`, `outputDirectory: "."`. Vercel auto-deploys on push to `main`. No build, no npm install. To verify locally: `python3 -m http.server 8000` from the repo root.

## Related repo memory

- **Revco rules** (also in `~/.claude` global memory):
  - Max format is **4s** — Revco never displays the "Revco" prefix on 6s+ events even if the divisions/name say Reverse Coed.
  - **Revco 2s** is always **grass**.
  - **Revco 4s** is **grass** or **indoor** (never sand).
  - Detection: name regex `/reverse\s*coed|\brev\s*co\b/i` OR any division matching `/reverse\s*coed/i`, gated by `format ≤ 4s`.
