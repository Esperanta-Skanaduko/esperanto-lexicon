import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { combineRanks } from '../scripts/lib/combineRanks.mjs';
import { DATA_DIR } from '../scripts/lib/paths.mjs';
import { levelFromRank } from '../scripts/lib/levelFromRank.mjs';

const records = JSON.parse(readFileSync(join(DATA_DIR, 'lexicon.json'), 'utf-8'));
const stats = JSON.parse(readFileSync(join(DATA_DIR, 'stats.json'), 'utf-8'));
const byLemma = new Map(records.map((record) => [record.lemma, record]));

test('every lemma appears once and has a rank in at least one list, within 1..15000', () => {
  assert.equal(byLemma.size, records.length);
  for (const record of records) {
    assert.ok(record.wikipediaRank !== null || record.tekstaroRank !== null, record.lemma);
    for (const rank of [record.wikipediaRank, record.tekstaroRank]) {
      if (rank !== null) assert.ok(Number.isInteger(rank) && rank >= 1 && rank <= 15000, `${record.lemma} ${rank}`);
    }
  }
});

test('each list has exactly 15,000 distinct ranks, so nothing was lost in parsing', () => {
  const wikipedia = records.filter((record) => record.wikipediaRank !== null).map((record) => record.wikipediaRank);
  const tekstaro = records.filter((record) => record.tekstaroRank !== null).map((record) => record.tekstaroRank);
  assert.equal(new Set(wikipedia).size, 15000);
  assert.equal(new Set(tekstaro).size, 15000);
});

test('every level equals the level computed from the ranks (the grading rule is applied everywhere)', () => {
  for (const record of records) {
    assert.equal(record.level, levelFromRank(combineRanks(record.wikipediaRank, record.tekstaroRank)), record.lemma);
  }
});

test('known words have the expected shape', () => {
  assert.equal(byLemma.get('la').level, 1);
  assert.equal(byLemma.get('la').wikipediaRank, 1);
  assert.deepEqual(byLemma.get('malbona').parts, ['mal-', 'bona']);
  assert.deepEqual(byLemma.get('lernejo').parts, ['lerni', '-ejo']);
  assert.deepEqual(byLemma.get('ĉiam').parts, ['ĉi-', '-am']);
  assert.equal(byLemma.get('esti').senses[0].glosses[0], 'to be');
  assert.deepEqual(byLemma.get('konata').formOf, ['koni']);
  assert.equal(byLemma.get('Aŭstrio').pos, 'name');
});

test('parts are well-formed and a guessed part of speech is always labelled', () => {
  for (const record of records) {
    if (record.parts !== null) {
      assert.ok(record.parts.length >= 2 && record.parts.every((part) => part.length > 0), record.lemma);
      assert.ok(['affix', 'prefix', 'suffix', 'confix', 'compound'].includes(record.partsType), record.lemma);
    }
    assert.equal(record.pos === null, record.posSource === null, record.lemma);
  }
});

test('stats.json matches the data', () => {
  assert.equal(stats.lemmas, records.length);
  assert.equal(stats.withGloss, records.filter((record) => record.senses.length > 0).length);
  assert.equal(stats.withAffixBreakdown, records.filter((record) => record.parts !== null).length);
  assert.equal(Object.values(stats.byLevel).reduce((total, count) => total + count, 0), records.length);
});

test('the CSV has one row per lemma', () => {
  const csv = readFileSync(join(DATA_DIR, 'lexicon.csv'), 'utf-8');
  // A quoted field may hold a line break, so count rows by parsing quotes.
  let rows = 0;
  let inQuotes = false;
  for (const character of csv) {
    if (character === '"') inQuotes = !inQuotes;
    else if (character === '\n' && !inQuotes) rows += 1;
  }
  assert.equal(rows, records.length + 1);
});
