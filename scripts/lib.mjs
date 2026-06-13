// Shared HTTP fetch helper. Browser UA + sane timeout. Runs in Node 20+.

export async function fetchText(url, opts = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; volleyballtourney-crawler/1.0; +https://github.com/Ideas232/volleyballtourney)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        ...(opts.headers || {}),
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

// Strip all HTML tags from a string and collapse whitespace.
export function stripHtml(html) {
  return (html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/\s+/g, ' ')
    .trim();
}

// Find every href matching a pattern. Returns an array of absolute URLs (as written).
export function findLinks(html, pattern) {
  const out = [];
  const re = /<a[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (pattern.test(m[1])) out.push(m[1]);
  }
  return [...new Set(out)];
}

// Extract a JSON-LD <script type="application/ld+json"> block (returns parsed objects, or []).
export function findJsonLd(html) {
  const out = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(parsed);
    } catch {}
  }
  return out;
}

// Match any of: "August 8", "Aug 8 2026", "8/15/2026", "2026-08-15".
// Returns ISO YYYY-MM-DD or null.
const MONTHS = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
  january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
export function parseDateLoose(s, fallbackYear) {
  if (!s) return null;
  const t = s.trim();
  let m;
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return t;
  m = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    const yr = m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10);
    return `${yr}-${String(parseInt(m[1],10)).padStart(2,'0')}-${String(parseInt(m[2],10)).padStart(2,'0')}`;
  }
  m = t.match(/([A-Za-z]+)\s+(\d{1,2})(?:,\s*(\d{4}))?/);
  if (m) {
    const mn = MONTHS[m[1].toLowerCase()];
    if (mn !== undefined) {
      const day = parseInt(m[2], 10);
      const yr = m[3] ? parseInt(m[3], 10) : fallbackYear ?? new Date(2026, 0, 1).getFullYear();
      return `${yr}-${String(mn + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }
  }
  return null;
}

// Slugify for stable IDs.
export function slug(s) {
  return (s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}
