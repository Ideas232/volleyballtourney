// Armada — listed under volleyballlife.com. The volleyballlife.com search/listing
// for the "armada" host is the discovery point.

import { fetchText, findLinks } from '../lib.mjs';
import { parseVblEvent } from './volleyballlife.mjs';

// Best-effort discovery URL. If volleyballlife.com has a host-specific page
// (e.g. /h/armada), use it; otherwise this falls back to the global listing.
const LISTING = 'https://volleyballlife.com/tournaments';

export async function fetchEvents() {
  let html;
  try { html = await fetchText(LISTING); }
  catch (e) { return { events: [], errors: [`armada listing: ${e.message}`] }; }

  // Heuristic: only count events whose page mentions "Armada" host. We over-fetch
  // and post-filter inside parseVblEvent against the description/host text.
  const urls = findLinks(html, /volleyballlife\.com\/(event|tournament)\/\d+/);
  const events = [];
  const errors = [];
  for (const url of urls) {
    const r = await parseVblEvent(url, { source: 'armada', sourceHomeUrl: LISTING });
    if (r.error) { errors.push(`armada ${url}: ${r.error}`); continue; }
    if (/armada/i.test(r.description || '') || /armada/i.test(r.name || '')) {
      events.push(r);
    }
  }
  return { events, errors };
}
