import { combineRanks } from './combineRanks.mjs';
import { extractParts } from './extractParts.mjs';
import { extractSenses } from './extractSenses.mjs';
import { guessPos } from './guessPos.mjs';
import { levelFromRank } from './levelFromRank.mjs';
import { stemOf } from './stemOf.mjs';

const MAX_POS = 3;

/**
 * Builds one dataset record: a lemma with its ranks, level, senses and breakdown.
 *
 * @param lemma - The lemma as written in the frequency lists.
 * @param wikipediaRank - Rank in the Wikipedia list, or null.
 * @param tekstaroRank - Rank in the Tekstaro list, or null.
 * @param entries - The Wiktionary entries for this spelling (possibly empty).
 * @returns The record. `senses` is empty when Wiktionary has no entry for the spelling.
 */
export const buildRecord = (lemma, wikipediaRank, tekstaroRank, entries) => {
  const byPos = new Map();
  const formOf = [];
  let breakdown = null;
  let inUniversalaVortaro = false;
  for (const entry of entries) {
    const { glosses, formOf: bases } = extractSenses(entry.senses);
    for (const base of bases) if (!formOf.includes(base)) formOf.push(base);
    if (glosses.length > 0) {
      const merged = byPos.get(entry.pos) ?? [];
      for (const gloss of glosses) if (!merged.includes(gloss) && merged.length < 4) merged.push(gloss);
      byPos.set(entry.pos, merged);
    }
    breakdown ??= extractParts(entry.etymology_templates);
    inUniversalaVortaro ||= (entry.senses ?? []).some((sense) =>
      (sense.categories ?? []).some((category) => category.name === 'Esperanto 1894 Universala Vortaro'),
    );
  }
  const senses = [...byPos.entries()].slice(0, MAX_POS).map(([pos, glosses]) => ({ pos, glosses }));
  const wiktionaryPos = senses[0]?.pos ?? entries[0]?.pos ?? null;
  const primaryPos = wiktionaryPos ?? guessPos(lemma);
  const rank = combineRanks(wikipediaRank, tekstaroRank);
  return {
    lemma,
    pos: primaryPos,
    posSource: wiktionaryPos !== null ? 'wiktionary' : primaryPos !== null ? 'ending' : null,
    stem: stemOf(lemma, primaryPos),
    level: levelFromRank(rank),
    wikipediaRank,
    tekstaroRank,
    senses,
    formOf: formOf.length > 0 ? formOf : null,
    parts: breakdown ? breakdown.parts.map((part) => part.form) : null,
    partsType: breakdown ? breakdown.type : null,
    inUniversalaVortaro1894: inUniversalaVortaro,
  };
};
