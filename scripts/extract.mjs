// Pattern-based extractor — same logic as tools/extract.html, runnable from Node.
// Given a verbose tournament description, returns { description, details[] }
// matching the schema documented in CLAUDE.md.

export function shortDescription(text) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
  let out = '';
  for (const s of sentences) {
    if ((out + ' ' + s).length > 240) break;
    out = out ? out + ' ' + s : s;
  }
  return out || sentences[0] || '';
}

function nearestTime(text, keywordRe, maxDist = 30) {
  const kw = text.match(keywordRe);
  if (!kw) return null;
  const kwStart = kw.index;
  const kwEnd = kwStart + kw[0].length;
  const timeRe = /(\d{1,2}:\d{2}\s*(?:am|pm)?)/gi;
  let best = null, bestDist = Infinity;
  for (const m of text.matchAll(timeRe)) {
    const dist = Math.min(
      Math.abs(m.index - kwEnd),
      Math.abs((m.index + m[0].length) - kwStart)
    );
    if (dist <= maxDist && dist < bestDist) {
      bestDist = dist;
      best = m[1].replace(/\s+/g, '').toLowerCase();
    }
  }
  return best;
}

export function extractSchedule(text) {
  const labels = [
    { label: 'Check-in', re: /\bcheck[-\s]?in\b/i },
    { label: 'Arrive by', re: /\barriv\w*\b/i },
    { label: 'Briefing', re: /\b(?:rules\s+)?briefing\b/i },
    { label: 'First serve', re: /\bfirst\s+serve\b/i },
  ];
  const items = [];
  const seen = new Set();
  for (const p of labels) {
    const t = nearestTime(text, p.re, 30);
    if (t && !seen.has(p.label)) {
      items.push({ label: p.label, value: t });
      seen.add(p.label);
    }
  }
  return items;
}

export function extractPricing(text) {
  const items = [];
  const earlyM =
    text.match(/(?:early[-\s]?bird|early)\s*\$(\d+)(?:\s*\/\s*(player|team|person|pp))?[^.\n]{0,60}?(?:through|thru|by|until)\s+([\d/-]+|[A-Za-z]+\s+\d+)/i) ||
    text.match(/\$(\d+)(?:\s*\/\s*(player|team|person|pp))?[^.\n]{0,40}?early[-\s]?bird[^.\n]{0,60}?(?:through|thru|by|until)\s+([\d/-]+|[A-Za-z]+\s+\d+)/i) ||
    text.match(/\$(\d+)(?:\s*\/\s*(player|team|person|pp))?\s*early(?:[-\s]?bird)?\s*(?:through|thru|by|until)\s+([\d/-]+|[A-Za-z]+\s+\d+)/i);
  if (earlyM) {
    items.push({
      label: 'Early' + (earlyM[3] ? ' (thru ' + earlyM[3] + ')' : ''),
      value: '$' + earlyM[1] + (earlyM[2] ? ' / ' + earlyM[2] : ''),
    });
  }
  const stdM = text.match(/(?:cost|price|fee|entry)[^.\n]{0,40}?\$(\d+)(?:\s*\/\s*(player|team|person|pp))?/i);
  if (stdM && (!earlyM || stdM[1] !== earlyM[1])) {
    items.push({ label: 'Standard', value: '$' + stdM[1] + (stdM[2] ? ' / ' + stdM[2] : '') });
  }
  const lateM =
    text.match(/late[^.\n]{0,40}?\$(\d+)(?:\s*\/\s*(player|team|person|pp))?/i) ||
    text.match(/\$(\d+)(?:\s*\/\s*(player|team|person|pp))?\s+late/i);
  if (lateM) items.push({ label: 'Late', value: '$' + lateM[1] + (lateM[2] ? ' / ' + lateM[2] : '') });
  if (/season\s+pass/i.test(text)) {
    const sp = text.match(/season\s+pass[^.\n]{0,60}?\$(\d+)/i);
    items.push({ label: 'Season Pass', value: sp ? '−$' + sp[1] : 'Discount' });
  }
  if (/junior/i.test(text)) items.push({ label: 'Juniors', value: 'See description' });
  return items;
}

export function extractRatings(text) {
  const items = [];
  const seen = new Set();
  const re = /\b(Open|AA|A|BB|B)\b\s*\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const k = m[1];
    if (seen.has(k)) continue;
    const v = m[2].trim();
    if (/no\s+cap|≤|<=|\d|advanced|intermediate|proficient|beginner/i.test(v)) {
      items.push({ label: k, value: v });
      seen.add(k);
    }
  }
  const order = { B: 0, BB: 1, A: 2, AA: 3, Open: 4 };
  items.sort((x, y) => (order[x.label] ?? 99) - (order[y.label] ?? 99));
  return items;
}

export function extractFormat(text) {
  const items = [];
  const capM = text.match(/(\d+)\s+(?:total\s+)?teams/i);
  if (capM) items.push({ label: 'Team cap', value: capM[1] });
  const playersM =
    text.match(/(?:up\s+to\s+|max(?:imum)?\s+)?(\d+)\s+players?\s+(?:per\s+team|max)/i) ||
    text.match(/(\d+)\s+players?\s+max/i);
  if (playersM) items.push({ label: 'Players / team', value: playersM[1] });
  if (/rally\s+scor/i.test(text)) items.push({ label: 'Scoring', value: 'Rally' });
  else if (/side[-\s]?out\s+scor/i.test(text)) items.push({ label: 'Scoring', value: 'Side-out' });
  const bM = text.match(/best[-\s]of[-\s](\d)\s*(?:\(([^)]+)\))?/i);
  if (bM) items.push({ label: 'Brackets', value: 'Best-of-' + bM[1] + (bM[2] ? ' (' + bM[2] + ')' : '') });
  if (/pool\s+play\s*(?:\+|and|&)\s*(?:single[-\s]?elim|playoff|bracket)/i.test(text)) {
    items.push({ label: 'Format', value: 'Pool + playoffs' });
  }
  return items;
}

export function extractContacts(text) {
  const items = [];
  const re1 = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*\(\s*([\w._%+-]+@[\w.-]+\.\w{2,})(?:\s*[\/,]\s*([\d\s.\-()]{7,}))?\s*\)/g;
  const re2 = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})[\s:]+([\w._%+-]+@[\w.-]+\.\w{2,})(?:\s*[\/,]\s*([\d\s.\-()]{7,}))?/g;
  const seen = new Set();
  for (const re of [re1, re2]) {
    let m;
    while ((m = re.exec(text)) !== null) {
      const name = m[1].trim();
      if (seen.has(name)) continue;
      const email = m[2];
      const phone = (m[3] || '').replace(/\s+/g, ' ').trim();
      const item = { label: name, email };
      if (phone) item.phone = phone;
      items.push(item);
      seen.add(name);
    }
  }
  if (items.length === 0) {
    const emailM = text.match(/([\w._%+-]+@[\w.-]+\.\w{2,})/);
    const phoneM = text.match(/(?:^|[^\d])(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
    if (emailM || phoneM) {
      const item = { label: 'Organizer' };
      if (emailM) item.email = emailM[1];
      if (phoneM) item.phone = phoneM[1].replace(/[-.\s]/g, '-');
      items.push(item);
    }
  }
  return items;
}

// Build the typed `details` array from a raw description.
export function extractDetails(description) {
  if (!description) return [];
  const sections = [];
  const contact = extractContacts(description);
  if (contact.length) sections.push({ heading: 'Contact', type: 'contacts', items: contact });
  const rating = extractRatings(description);
  if (rating.length) sections.push({ heading: 'Ratings', type: 'ratings', axisLow: 'Beginner', axisHigh: 'Open', items: rating });
  const sched = extractSchedule(description);
  if (sched.length) sections.push({ heading: 'Schedule', items: sched });
  const price = extractPricing(description);
  if (price.length) sections.push({ heading: 'Pricing', items: price });
  const format = extractFormat(description);
  if (format.length) sections.push({ heading: 'Format', items: format });
  return sections;
}
