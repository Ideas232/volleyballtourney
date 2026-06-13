// VolleyballLife event-page parser.
// Covers any event whose registrationUrl looks like:
//   https://volleyballlife.com/event/<id>
//   https://tls.volleyballlife.com/event/<id>
//   https://volleyballlife.com/tournament/<id>
//
// Used by tlsports.mjs, volleynation.mjs, armada.mjs — each of those
// modules supplies its own list of event URLs and a `source` key, then
// calls `parseVblEvent(url, { source, ... })` here.

import { fetchText, stripHtml, findJsonLd, parseDateLoose, slug } from '../lib.mjs';
import { extractDetails, shortDescription } from '../extract.mjs';

const FORMAT_RE = /\b(2|3|4|6|9)\s*s\b/i;
const SURFACE_RE = /\b(grass|sand|beach|indoor)\b/i;

export async function parseVblEvent(url, { source, sourceHomeUrl, idHint } = {}) {
  let html;
  try {
    html = await fetchText(url);
  } catch (e) {
    return { error: `fetch ${url} failed: ${e.message}` };
  }
  const text = stripHtml(html);
  const ld = findJsonLd(html).find(o => /event/i.test(o['@type'] || ''));

  const name = (ld?.name) || pickName(html) || 'Untitled tournament';
  const startDate = (ld?.startDate || '').slice(0, 10) || null;
  const endDate = (ld?.endDate || '').slice(0, 10) || null;
  const location = pickLocation(ld, text);
  const fmtM = (name + ' ' + text).match(FORMAT_RE);
  const surfM = (name + ' ' + text).match(SURFACE_RE);
  const surface = surfM ? surfM[1].toLowerCase().replace('beach', 'sand') : null;
  const fee = pickFee(text);
  const deadline = pickDeadline(text);
  const divisions = pickDivisions(text);
  const description = (ld?.description || pickDescription(html) || '').trim();

  const id = idHint || `${source}-${slug(name)}-${(startDate || '').slice(0, 7)}`;
  const out = {
    id,
    source,
    sourceUrl: sourceHomeUrl || url,
    name,
    startDate: startDate || parseDateLoose(text),
    location,
    divisions,
    format: fmtM ? `${fmtM[1]}s` : null,
    surface,
    registrationUrl: url,
    description,
  };
  if (endDate && endDate !== startDate) out.endDate = endDate;
  if (fee != null) out.feeUSD = fee;
  if (deadline) out.registrationDeadline = deadline;
  // Drop nulls — keep events.json clean.
  for (const k of Object.keys(out)) if (out[k] == null || out[k] === '') delete out[k];
  if (description) out.details = extractDetails(description);
  return out;
}

function pickName(html) {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1];
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return title ? title[1].split('|')[0].trim() : null;
}

function pickDescription(html) {
  const og = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1];
  const md = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  return md ? md[1] : null;
}

function pickLocation(ld, text) {
  const loc = ld?.location;
  if (loc) {
    const venue = loc.name || null;
    const addr = loc.address || {};
    return {
      ...(venue ? { venue } : {}),
      ...(addr.addressLocality ? { city: addr.addressLocality } : {}),
      ...(addr.addressRegion ? { state: addr.addressRegion } : {}),
    };
  }
  // Fallback: try to find "City, ST" near "at" or "@"
  const m = text.match(/(?:\bat\b|@)\s+([A-Z][\w' ]+?)(?:,\s*([A-Z]{2}))?(?=[\s.\d])/);
  if (m) return { city: m[1].trim(), ...(m[2] ? { state: m[2] } : {}) };
  return { city: 'Bay Area', state: 'CA' };
}

function pickFee(text) {
  const m = text.match(/\$(\d{1,4})\s*\/\s*team\b/i) || text.match(/team\s*fee[^$]{0,20}\$(\d{1,4})/i);
  return m ? parseInt(m[1], 10) : null;
}

function pickDeadline(text) {
  const m = text.match(/registration\s+(?:closes|deadline|ends)\s+(?:on\s+)?([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i);
  return m ? parseDateLoose(m[1], 2026) : null;
}

function pickDivisions(text) {
  const out = new Set();
  const re = /\b((?:Men's|Women's|Coed|Reverse Coed|Mixed|Boys|Girls)(?:\s+(?:Open|AA|A|BB|B|Novice|Intermediate|Advanced))?)\b/gi;
  let m;
  while ((m = re.exec(text)) !== null) out.add(m[1].replace(/\s+/g, ' '));
  return [...out];
}
