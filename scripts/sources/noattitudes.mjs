// No Attitudes Beach Volleyball — Santa Cruz monthly grass/sand tournaments.
// Site: https://www.noattitudesbvb.com
//
// Strategy: scrape the events listing for tournament titles + dates,
// fall back to JSON-LD when present.

import { fetchText, stripHtml, findJsonLd, parseDateLoose, slug } from '../lib.mjs';
import { extractDetails, shortDescription } from '../extract.mjs';

const HOME = 'https://www.noattitudesbvb.com';

export async function fetchEvents() {
  let html;
  try { html = await fetchText(HOME); }
  catch (e) { return { events: [], errors: [`noattitudes home: ${e.message}`] }; }

  const ld = findJsonLd(html).filter(o => /event/i.test(o['@type'] || ''));
  if (ld.length) {
    return { events: ld.map(o => fromLd(o)), errors: [] };
  }

  const text = stripHtml(html);
  // Heuristic — every event seems to follow "Spiketacular <Theme>" or similar
  // and includes a "Saturday <Month> <Day>" date string.
  const re = /([A-Z][A-Za-z' ]+(?:Spiketacular|Classic|Open|Solstice|Stripes|Summer|Halloween|Digs)[^.\n]{0,80}?)(Saturday|Sunday)\s+([A-Za-z]+)\s+(\d{1,2})/g;
  const events = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1].trim().replace(/[—\-]\s*$/, '').trim();
    const startDate = parseDateLoose(`${m[3]} ${m[4]}`, 2026);
    if (!startDate) continue;
    events.push({
      id: `noattitudes-${slug(name)}-${startDate.slice(0, 7)}`,
      source: 'noattitudes',
      sourceUrl: HOME,
      name,
      startDate,
      location: { venue: 'Main Beach Santa Cruz', city: 'Santa Cruz', state: 'CA' },
      divisions: ['Coed Novice', 'Coed Intermediate', "Women's", "Men's"],
      format: '2s',
      surface: 'sand',
      details: [],
    });
  }
  return { events, errors: [] };
}

function fromLd(o) {
  const name = o.name || 'No Attitudes event';
  const startDate = (o.startDate || '').slice(0, 10);
  const endDate = (o.endDate || '').slice(0, 10);
  const loc = o.location || {};
  const venue = loc.name || null;
  const addr = loc.address || {};
  const out = {
    id: `noattitudes-${slug(name)}-${startDate.slice(0, 7) || 'tbd'}`,
    source: 'noattitudes',
    sourceUrl: o.url || HOME,
    name,
    startDate,
    location: {
      ...(venue ? { venue } : { venue: 'Main Beach Santa Cruz' }),
      ...(addr.addressLocality ? { city: addr.addressLocality } : { city: 'Santa Cruz' }),
      ...(addr.addressRegion ? { state: addr.addressRegion } : { state: 'CA' }),
    },
    divisions: [],
    surface: 'sand',
    description: o.description || '',
  };
  if (endDate && endDate !== startDate) out.endDate = endDate;
  if (out.description) out.details = extractDetails(out.description);
  return out;
}
