#!/usr/bin/env node
/**
 * Builds data/lexicon.json, data/lexicon.csv, data/affixes.json and data/stats.json
 * from the files in .cache/ (see `npm run fetch`).
 *
 * Every lemma that is in either 15,000-word frequency list becomes a record. The
 * record carries its rank in each list, a level graded by the less frequent of the
 * two ranks, and, where Wiktionary has an entry, its parts of speech, glosses and
 * explicit affix breakdown. Nothing is guessed: a lemma without an entry keeps its
 * ranks and an empty `senses`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildAffixes } from './lib/buildAffixes.mjs';
import { buildRecord } from './lib/buildRecord.mjs';
import { CACHE_DIR, DATA_DIR } from './lib/paths.mjs';
import { parseFrequencyList } from './lib/parseFrequencyList.mjs';
import { readBands } from './lib/readBands.mjs';
import { readEntries } from './lib/readEntries.mjs';
import { toCsv } from './lib/toCsv.mjs';

const read = (name) => readFileSync(join(CACHE_DIR, name), 'utf-8');
const lists = {};
for (const [id, file] of [['wikipedia', 'freq-wikipedia-2023.txt'], ['tekstaro', 'freq-tekstaro-2023.txt']]) {
  const text = read(file);
  const lemmas = parseFrequencyList(text);
  const bands = readBands(text);
  const expected = bands.reduce((total, band) => total + (band.to - band.from + 1), 0);
  if (lemmas.length !== expected) throw new Error(`${id}: parsed ${lemmas.length} lemmas but the headings promise ${expected}`);
  if (new Set(lemmas).size !== lemmas.length) throw new Error(`${id}: a lemma is listed twice`);
  lists[id] = new Map(lemmas.map((lemma, index) => [lemma, index + 1]));
}

const allLemmas = new Set([...lists.wikipedia.keys(), ...lists.tekstaro.keys()]);
const { entries, lines } = await readEntries(join(CACHE_DIR, 'kaikki-eo.jsonl'), allLemmas);

const records = [...allLemmas]
  .map((lemma) => buildRecord(lemma, lists.wikipedia.get(lemma) ?? null, lists.tekstaro.get(lemma) ?? null, entries.get(lemma) ?? []))
  .sort((a, b) => a.level - b.level || Math.max(a.wikipediaRank ?? 99999, a.tekstaroRank ?? 99999) - Math.max(b.wikipediaRank ?? 99999, b.tekstaroRank ?? 99999) || a.lemma.localeCompare(b.lemma, 'eo'));

const byLevel = {};
for (const record of records) byLevel[record.level] = (byLevel[record.level] ?? 0) + 1;
const withGlossByLevel = {};
for (const record of records) if (record.senses.length > 0) withGlossByLevel[record.level] = (withGlossByLevel[record.level] ?? 0) + 1;
const withSenses = records.filter((record) => record.senses.length > 0).length;
const withParts = records.filter((record) => record.parts !== null).length;
const stats = {
  lemmas: records.length,
  inBothLists: records.filter((record) => record.wikipediaRank !== null && record.tekstaroRank !== null).length,
  wikipediaOnly: records.filter((record) => record.tekstaroRank === null).length,
  tekstaroOnly: records.filter((record) => record.wikipediaRank === null).length,
  withGloss: withSenses,
  withoutGloss: records.length - withSenses,
  withPosFromWiktionary: records.filter((record) => record.posSource === 'wiktionary').length,
  withPosGuessedFromEnding: records.filter((record) => record.posSource === 'ending').length,
  withoutPos: records.filter((record) => record.pos === null).length,
  formsOfAnotherLemma: records.filter((record) => record.formOf !== null).length,
  withAffixBreakdown: withParts,
  byLevel,
  withGlossByLevel,
  wiktionaryLinesRead: lines,
};

writeFileSync(join(DATA_DIR, 'lexicon.json'), `${JSON.stringify(records)}\n`);
writeFileSync(join(DATA_DIR, 'lexicon.csv'), toCsv(records));
writeFileSync(join(DATA_DIR, 'affixes.json'), `${JSON.stringify(buildAffixes(records, entries), null, 1)}\n`);
writeFileSync(join(DATA_DIR, 'stats.json'), `${JSON.stringify(stats, null, 2)}\n`);
console.log(JSON.stringify(stats, null, 2));
