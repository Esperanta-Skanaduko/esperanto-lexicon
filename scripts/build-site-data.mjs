#!/usr/bin/env node
/**
 * Writes site/lexicon-lite.json, a compact copy of the dataset for the search page:
 * one array per lemma as [lemma, pos, level, first gloss, parts]. Run after `npm run build`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR, ROOT_DIR } from './lib/paths.mjs';

const records = JSON.parse(readFileSync(join(DATA_DIR, 'lexicon.json'), 'utf-8'));
const lite = records.map((record) => [
  record.lemma,
  record.pos,
  record.level,
  record.senses[0]?.glosses[0] ?? '',
  record.parts ? record.parts.join(' + ') : '',
]);
writeFileSync(join(ROOT_DIR, 'site', 'lexicon-lite.json'), JSON.stringify(lite));
console.log(`site/lexicon-lite.json written (${lite.length} lemmas)`);
