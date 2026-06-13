// SF Dynasty — https://www.sfvbdynasty.com
//
// Strategy: scrape JSON-LD events when present, otherwise regex over the
// rendered page for tournament titles + dates.

import { fetchText, stripHtml, findJsonLd, parseDateLoose, slug } from '../lib.mjs';
import { extractDetails } from '../extract.mjs';

const HOME = 'https://www.sfvbdynasty.com';

export async function fetchEvents() {
  let html;
  try { html = await fetchText(HOME); }
  catch (e) { return { events: [], errors: [`sfdynasty home: ${e.message}`] }; }

  const ld = findJsonLd(html).filter(o => /event/i.test(o['@type'] || ''));
  if (ld.length) return { events: ld.map(o => fromLd(o)), errors: [] };

  const text = stripHtml(html);
  // Conservative: title in title-case followed by month+day.
  const re = /([A-Z][A-Za-z' ]{4,40}(?:Coed|Men's|Women's|Open|Mini|Classic|Doubles|Triples|Quads|6s|6'?s|9 ?Man))\b[^.\n]{0,60}?([A-Za-z]+)\s+(\d{1,2})(?:[,\s]+(\d{4}))?/g;
  const events = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1].trim();
    const startDate = parseDateLoose(`${m[2]} ${m[3]}${m[4] ? ', ' + m[4] : ''}`, 2026);
    if (!startDate) continue;
    events.push({
      id: `sfdynasty-${slug(name)}-${startDate.slice(0, 7)}`,
      source: 'sfdynasty',
      sourceUrl: HOME,
      name,
      startDate,
      location: { city: 'San Francisco', state: 'CA' },
      divisions: [],
      details: [],
    });
  }
  return { events, errors: [] };
}

function fromLd(o) {
  const name = o.name || 'SF Dynasty event';
  const startDate = (o.startDate || '').slice(0, 10);
  const endDate = (o.endDate || '').slice(0, 10);
  const loc = o.location || {};
  const venue = loc.name || null;
  const addr = loc.address || {};
  const out = {
    id: `sfdynasty-${slug(name)}-${startDate.slice(0, 7) || 'tbd'}`,
    source: 'sfdynasty',
    sourceUrl: o.url || HOME,
    name,
    startDate,
    location: {
      ...(venue ? { venue } : {}),
      ...(addr.addressLocality ? { city: addr.addressLocality } : { city: 'San Francisco' }),
      ...(addr.addressRegion ? { state: addr.addressRegion } : { state: 'CA' }),
    },
    divisions: [],
    description: o.description || '',
  };
  if (endDate && endDate !== startDate) out.endDate = endDate;
  if (out.description) out.details = extractDetails(out.description);
  return out;
}
