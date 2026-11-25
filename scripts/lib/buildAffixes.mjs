import { extractParts } from './extractParts.mjs';

const GRAMMATICAL_ENDINGS = new Set(['-o', '-a', '-e', '-i', '-u', '-j', '-n']);

/**
 * Counts how many lemmas use each prefix, suffix and infix, using the breakdowns
 * that Wiktionary gives for the Wiktionary entries behind the dataset. The gloss of
 * an affix is the one most often written next to it, because the same affix is
 * glossed differently in different words (`-o` is "action, result" in `vivo` but a
 * correlative suffix in `tio`). Grammatical endings are marked so they can be skipped.
 *
 * @param records - The dataset records.
 * @param entries - Map of lemma to its Wiktionary entries.
 * @returns Affixes sorted by number of lemmas, most used first.
 */
export const buildAffixes = (records, entries) => {
  const table = new Map();
  for (const record of records) {
    for (const entry of entries.get(record.lemma) ?? []) {
      const breakdown = extractParts(entry.etymology_templates);
      if (breakdown === null) continue;
      for (const part of breakdown.parts) {
        const starts = part.form.startsWith('-');
        const ends = part.form.endsWith('-');
        if (!starts && !ends) continue;
        const row = table.get(part.form) ?? {
          affix: part.form,
          kind: starts && ends ? 'infix' : starts ? 'suffix' : 'prefix',
          grammaticalEnding: GRAMMATICAL_ENDINGS.has(part.form),
          glosses: new Map(),
          lemmas: new Set(),
        };
        if (part.gloss) row.glosses.set(part.gloss, (row.glosses.get(part.gloss) ?? 0) + 1);
        row.lemmas.add(record.lemma);
        table.set(part.form, row);
      }
      break;
    }
  }
  return [...table.values()]
    .map(({ glosses, lemmas, ...row }) => ({
      ...row,
      gloss: [...glosses.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null,
      lemmaCount: lemmas.size,
      examples: [...lemmas].slice(0, 5),
    }))
    .sort((a, b) => b.lemmaCount - a.lemmaCount || a.affix.localeCompare(b.affix));
};
