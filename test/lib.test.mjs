import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRecord } from '../scripts/lib/buildRecord.mjs';
import { cleanPart } from '../scripts/lib/cleanPart.mjs';
import { combineRanks } from '../scripts/lib/combineRanks.mjs';
import { extractParts } from '../scripts/lib/extractParts.mjs';
import { extractSenses } from '../scripts/lib/extractSenses.mjs';
import { guessPos } from '../scripts/lib/guessPos.mjs';
import { levelFromRank } from '../scripts/lib/levelFromRank.mjs';
import { parseFrequencyList } from '../scripts/lib/parseFrequencyList.mjs';
import { readBands } from '../scripts/lib/readBands.mjs';
import { stemOf } from '../scripts/lib/stemOf.mjs';
import { toCsv } from '../scripts/lib/toCsv.mjs';

const PAGE = `intro text
===First hundred by frequency===
{{col-top|4|100 most common words}}
* [[la#Esperanto|la]]
* [[Aŭstrio#Esperanto|Aŭstrio]]
{{col-bottom}}
===Frequency rank of 501–1000===
* [[domo#Esperanto|domo]]
`;

test('parseFrequencyList keeps page order, so the position is the rank, and keeps capitals', () => {
  assert.deepEqual(parseFrequencyList(PAGE), ['la', 'Aŭstrio', 'domo']);
});

test('NEGATIVE CONTROL: parseFrequencyList refuses a bullet it cannot read', () => {
  assert.throws(() => parseFrequencyList('* [[broken'), /Unrecognised/);
});

test('readBands reads both heading styles', () => {
  assert.deepEqual(readBands(PAGE), [{ from: 1, to: 100 }, { from: 501, to: 1000 }]);
});

test('levelFromRank is exact on every boundary', () => {
  const cases = [[1, 1], [500, 1], [501, 2], [1000, 2], [1001, 3], [2000, 3], [2001, 4], [5000, 4], [5001, 5], [10000, 5], [10001, 6], [15000, 6], [15001, 7]];
  for (const [rank, level] of cases) assert.equal(levelFromRank(rank), level, `rank ${rank}`);
});

test('combineRanks grades by the less frequent corpus and treats a missing list as past the end', () => {
  assert.equal(combineRanks(100, 300), 300);
  assert.equal(combineRanks(100, null), 15001);
  assert.equal(combineRanks(null, null), 15001);
});

test('stemOf removes only the ending the part of speech requires', () => {
  assert.equal(stemOf('lernejo', 'noun'), 'lernej');
  assert.equal(stemOf('malbona', 'adj'), 'malbon');
  assert.equal(stemOf('ĉiam', 'adv'), 'ĉiam');
  assert.equal(stemOf('esti', 'verb'), 'est');
  assert.equal(stemOf('la', 'article'), 'la');
  assert.equal(stemOf('Aŭstrio', 'name'), 'aŭstri');
  assert.equal(stemOf('ĉi', 'adv'), 'ĉi');
});

test('guessPos is conservative and says nothing about short or odd words', () => {
  assert.equal(guessPos('lernanto'), 'noun');
  assert.equal(guessPos('Unesko'), 'name');
  assert.equal(guessPos('konata'), 'adj');
  assert.equal(guessPos('kadre'), 'adv');
  assert.equal(guessPos('depost'), null);
  assert.equal(guessPos('ekz'), null);
  assert.equal(guessPos('n-ro'), null);
  assert.equal(guessPos('mi'), null);
});

test('cleanPart strips markers and keeps the gloss', () => {
  assert.deepEqual(cleanPart('-ejo<t:place>'), { form: '-ejo', gloss: 'place' });
  assert.deepEqual(cleanPart('mal-<t:opposite of>'), { form: 'mal-', gloss: 'opposite of' });
  assert.deepEqual(cleanPart('fr:la'), { form: 'la', gloss: null });
});

test('extractParts reads the ety, affix, suffix, prefix and confix template shapes seen in Wiktionary', () => {
  const ety = [{ name: 'ety', args: { 1: 'eo', 2: ':af', 3: 'lerni<t:to learn>', 4: '-ejo<t:place>' } }];
  assert.deepEqual(extractParts(ety).parts.map((part) => part.form), ['lerni', '-ejo']);
  const confix = [{ name: 'confix', args: { 1: 'eo', 2: 'ĉi', 3: 'am', t1: 'universal correlative prefix', t2: 'correlative suffix of time' } }];
  assert.deepEqual(extractParts(confix).parts.map((part) => part.form), ['ĉi-', '-am']);
  assert.equal(extractParts(confix).parts[0].gloss, 'universal correlative prefix');
  const suffix = [{ name: 'suffix', args: { 1: 'eo', 2: 'lerni', 3: 'ejo' } }];
  assert.deepEqual(extractParts(suffix).parts.map((part) => part.form), ['lerni', '-ejo']);
  const prefix = [{ name: 'prefix', args: { 1: 'eo', 2: 'mal', 3: 'bona' } }];
  assert.deepEqual(extractParts(prefix).parts.map((part) => part.form), ['mal-', 'bona']);
  const compound = [{ name: 'com', args: { 1: 'eo', 2: 'sun', 3: 'flor' } }];
  assert.equal(extractParts(compound).type, 'compound');
});

test('NEGATIVE CONTROL: extractParts returns null for a borrowing, an empty list, or one part', () => {
  assert.equal(extractParts([{ name: 'bor+', args: { 1: 'eo', 2: 'fr', 3: 'est' } }]), null);
  assert.equal(extractParts([{ name: 'ety', args: { 1: 'eo', 2: ':bor', 3: 'la:ire' } }]), null);
  assert.equal(extractParts([]), null);
  assert.equal(extractParts(undefined), null);
  assert.equal(extractParts([{ name: 'af', args: { 1: 'eo', 2: 'unu' } }]), null);
});

test('extractSenses puts ordinary glosses first, keeps form-of glosses and returns the base word', () => {
  const senses = [
    { glosses: ['singular past passive participle of fermi'], form_of: [{ word: 'fermi' }] },
    { glosses: ['closed, shut'] },
  ];
  assert.deepEqual(extractSenses(senses), { glosses: ['closed, shut', 'singular past passive participle of fermi'], formOf: ['fermi'] });
  assert.deepEqual(extractSenses(undefined), { glosses: [], formOf: [] });
  assert.equal(extractSenses([{ glosses: ['x'.repeat(300)] }]).glosses[0].length, 140);
});

test('buildRecord joins ranks, level, senses and parts, and marks a guessed part of speech', () => {
  const entry = {
    pos: 'noun',
    senses: [{ glosses: ['school'], categories: [{ name: 'Esperanto 1894 Universala Vortaro' }] }],
    etymology_templates: [{ name: 'ety', args: { 1: 'eo', 2: ':af', 3: 'lerni', 4: '-ejo' } }],
  };
  const record = buildRecord('lernejo', 224, 388, [entry]);
  assert.equal(record.level, 1);
  assert.deepEqual(record.parts, ['lerni', '-ejo']);
  assert.equal(record.posSource, 'wiktionary');
  assert.equal(record.inUniversalaVortaro1894, true);
  const guessed = buildRecord('reprezentanto', 1016, 728, []);
  assert.deepEqual([guessed.pos, guessed.posSource, guessed.senses.length, guessed.level], ['noun', 'ending', 0, 3]);
});

test('toCsv quotes commas, quotes and line breaks', () => {
  const record = buildRecord('x', 1, 1, [{ pos: 'noun', senses: [{ glosses: ['a "b", c\nd'] }] }]);
  const csv = toCsv([record]);
  assert.match(csv, /"a ""b"", c\nd"/);
  assert.equal(csv.split('\n')[0], 'lemma,pos,pos_source,stem,level,wikipedia_rank,tekstaro_rank,gloss,form_of,parts');
});
