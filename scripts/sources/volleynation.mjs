// VolleyNation — events live on volleyballlife.com.
// The volleynation.com homepage links to its VBL event pages; scrape those.

import { fetchText, findLinks } from '../lib.mjs';
import { parseVblEvent } from './volleyballlife.mjs';

const HOME = 'https://volleynation.com';

export async function fetchEvents() {
  let html;
  try { html = await fetchText(HOME); }
  catch (e) { return { events: [], errors: [`volleynation home: ${e.message}`] }; }

  const urls = findLinks(html, /volleyballlife\.com\/(event|tournament)\/\d+/);
  const events = [];
  const errors = [];
  for (const url of urls) {
    const r = await parseVblEvent(url, { source: 'volleynation', sourceHomeUrl: HOME });
    if (r.error) errors.push(`volleynation ${url}: ${r.error}`);
    else events.push(r);
  }
  return { events, errors };
}
