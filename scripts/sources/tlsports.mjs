// TLSports — listing page on tl-sports.com, individual events on volleyballlife.com.
// Strategy: scrape the listing page for VBL event URLs, then parse each.

import { fetchText, findLinks } from '../lib.mjs';
import { parseVblEvent } from './volleyballlife.mjs';

const LISTING = 'https://www.tl-sports.com/tournaments';

export async function fetchEvents() {
  let html;
  try { html = await fetchText(LISTING); }
  catch (e) { return { events: [], errors: [`tlsports listing: ${e.message}`] }; }

  const urls = findLinks(html, /volleyballlife\.com\/(event|tournament)\/\d+/);
  const events = [];
  const errors = [];
  for (const url of urls) {
    const r = await parseVblEvent(url, { source: 'tlsports', sourceHomeUrl: LISTING });
    if (r.error) errors.push(`tlsports ${url}: ${r.error}`);
    else events.push(r);
  }
  return { events, errors };
}
