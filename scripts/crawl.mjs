#!/usr/bin/env node
// Daily crawl orchestrator.
//
// Fetches events from every adapter in scripts/sources/, merges with the
// existing data/events.json by stable id (new events appended, existing
// ones field-merged with the fresh fetch winning), and writes back.
//
// Run locally:        node scripts/crawl.mjs
// Run dry (no write): node scripts/crawl.mjs --dry
//
// Exit codes: 0 on success (even with per-source errors logged), 2 on
// fatal/unhandled error.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import * as tlsports from './sources/tlsports.mjs';
import * as volleynation from './sources/volleynation.mjs';
import * as armada from './sources/armada.mjs';
import * as nagva from './sources/nagva.mjs';
import * as noattitudes from './sources/noattitudes.mjs';
import * as sfdynasty from './sources/sfdynasty.mjs';
import * as fvbl from './sources/fvbl.mjs';

const SOURCES = [
  ['tlsports', tlsports],
  ['volleynation', volleynation],
  ['armada', armada],
  ['nagva', nagva],
  ['noattitudes', noattitudes],
  ['sfdynasty', sfdynasty],
  ['fvbl', fvbl],
];

const here = dirname(fileURLToPath(import.meta.url));
const EVENTS_JSON = resolve(here, '../data/events.json');
const dry = process.argv.includes('--dry');

const log = (...a) => console.log('[crawl]', ...a);

async function run() {
  const existing = JSON.parse(readFileSync(EVENTS_JSON, 'utf8'));
  const byId = new Map((existing.events || []).map(e => [e.id, e]));
  const allErrors = [];
  let added = 0, updated = 0, fetched = 0;

  for (const [name, mod] of SOURCES) {
    log(`fetching ${name}…`);
    let result;
    try { result = await mod.fetchEvents(); }
    catch (e) {
      allErrors.push(`${name} threw: ${e.stack || e.message}`);
      continue;
    }
    const errors = result.errors || [];
    const evs = (result.events || []).filter(e => e && e.id && e.startDate);
    log(`  ${name}: ${evs.length} events, ${errors.length} errors`);
    fetched += evs.length;
    for (const ev of evs) {
      const old = byId.get(ev.id);
      if (!old) { byId.set(ev.id, ev); added++; }
      else {
        // Field-merge: fresh fetch wins for non-empty fields, but preserve
        // any fields the fetch didn't include (e.g. manually-curated notes).
        const merged = { ...old };
        for (const [k, v] of Object.entries(ev)) {
          if (v == null) continue;
          if (Array.isArray(v) && v.length === 0) continue;
          if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) continue;
          merged[k] = v;
        }
        if (JSON.stringify(merged) !== JSON.stringify(old)) {
          byId.set(ev.id, merged);
          updated++;
        }
      }
    }
    allErrors.push(...errors);
  }

  const next = {
    updatedAt: new Date().toISOString(),
    events: [...byId.values()].sort((a, b) => (a.startDate || '').localeCompare(b.startDate || '')),
  };

  log(`fetched ${fetched} events from ${SOURCES.length} sources — added ${added}, updated ${updated}`);
  if (allErrors.length) {
    log(`errors:`);
    for (const e of allErrors) log(`  - ${e}`);
  }

  if (dry) { log('dry run — no write.'); return; }

  const before = readFileSync(EVENTS_JSON, 'utf8');
  const after = JSON.stringify(next, null, 2) + '\n';
  if (before === after) { log('no change to events.json'); return; }

  writeFileSync(EVENTS_JSON, after);
  log('wrote', EVENTS_JSON);
}

run().catch(e => { console.error('[crawl] FATAL', e); process.exit(2); });
