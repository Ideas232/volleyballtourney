// NAGVA — North American Gay Volleyball Association tournaments.
// Site: https://nagva.com  (also https://nagva.com/tournaments)
//
// Strategy: scrape the tournament listing page; each event has a name,
// dates, and host city. Site is a custom CMS, not Wix.

import { fetchText, stripHtml, findJsonLd, parseDateLoose, slug } from '../lib.mjs';
import { extractDetails } from '../extract.mjs';

const LISTING = 'https://nagva.com/tournaments';

export async function fetchEvents() {
  let html;
  try { html = await fetchText(LISTING); }
  catch (e) { return { events: [], errors: [`nagva listing: ${e.message}`] }; }

  // Try JSON-LD events first (most reliable).
  const ld = findJsonLd(html).filter(o => /event/i.test(o['@type'] || ''));
  if (ld.length) {
    const events = ld.map(o => buildFromLd(o));
    return { events, errors: [] };
  }

  // Fallback: regex over rendered text for "Tournament — City — Month Day, Year"
  // patterns. Conservative — refine once we observe real markup.
  const text = stripHtml(html);
  const re = /(?:^|\.\s+)([A-Z][\w' &]+(?:Tournament|Classic|Cup|Open|Ball)[^.\n]*?)\s+(?:—|-|in)\s+([A-Z][\w' ]+?)(?:\s+(?:—|-|on)\s+([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?))?/g;
  const events = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1].trim();
    const city = m[2].trim();
    const dateStr = m[3];
    const startDate = dateStr ? parseDateLoose(dateStr, 2026) : null;
    if (!startDate) continue;
    events.push({
      id: `nagva-${slug(name)}-${startDate.slice(0, 7)}`,
      source: 'nagva',
      sourceUrl: LISTING,
      name,
      startDate,
      location: { city, state: '' },
      divisions: [],
      details: [],
    });
  }
  return { events, errors: [] };
}

function buildFromLd(o) {
  const name = o.name || 'NAGVA event';
  const startDate = (o.startDate || '').slice(0, 10);
  const endDate = (o.endDate || '').slice(0, 10);
  const loc = o.location || {};
  const venue = loc.name || null;
  const addr = loc.address || {};
  const out = {
    id: `nagva-${slug(name)}-${startDate.slice(0, 7) || 'tbd'}`,
    source: 'nagva',
    sourceUrl: o.url || LISTING,
    name,
    startDate,
    location: {
      ...(venue ? { venue } : {}),
      ...(addr.addressLocality ? { city: addr.addressLocality } : {}),
      ...(addr.addressRegion ? { state: addr.addressRegion } : {}),
    },
    divisions: [],
    description: o.description || '',
  };
  if (endDate && endDate !== startDate) out.endDate = endDate;
  if (out.description) out.details = extractDetails(out.description);
  return out;
}
