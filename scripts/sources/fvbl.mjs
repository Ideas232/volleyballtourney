// FVBL — Foothill Volleyball League.
//
// Status: NOT auto-crawlable today. FVBL publishes events on Facebook (gated)
// and uses bit.ly → Google Forms for RSVPs. Both are blocked to bots:
//   - Facebook event pages: 403 to non-logged-in clients
//   - bit.ly redirect resolution: 403 from cloud IPs (anti-spam)
//
// Until FVBL publishes a public iCal feed or a public Google Sheet, this
// adapter returns the existing FVBL events from data/events.json so the
// orchestrator's diff doesn't drop them. New FVBL events still need to be
// added by hand (paste a Google Form URL into tools/extract.html, then
// merge the result into data/events.json).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const EVENTS_JSON = resolve(here, '../../data/events.json');

export async function fetchEvents() {
  let existing = [];
  try {
    const raw = JSON.parse(readFileSync(EVENTS_JSON, 'utf8'));
    existing = (raw.events || []).filter(e => e.source === 'fvbl');
  } catch (e) {
    return { events: [], errors: [`fvbl read existing: ${e.message}`] };
  }
  return { events: existing, errors: ['fvbl: passthrough — Facebook/bit.ly not crawlable, see scripts/sources/fvbl.mjs'] };
}
