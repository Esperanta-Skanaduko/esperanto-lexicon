const MAX_GLOSSES = 3;
const MAX_LENGTH = 140;

/**
 * Collects short English glosses from the sense list of a Wiktionary entry, and
 * the base lemmas of inflected forms. A word such as `konata` is only described
 * there as "past passive participle of koni", so those glosses are kept (after
 * the ordinary ones) and the base word is returned in `formOf`.
 *
 * @param senses - The `senses` array of a kaikki entry.
 * @returns Up to three distinct glosses, and the lemmas the entry is a form of.
 */
export const extractSenses = (senses) => {
  const ordinary = [];
  const forms = [];
  const formOf = [];
  for (const sense of senses ?? []) {
    const target = sense.form_of || sense.alt_of ? forms : ordinary;
    for (const base of sense.form_of ?? []) if (base.word && !formOf.includes(base.word)) formOf.push(base.word);
    for (const gloss of sense.glosses ?? []) {
      const text = String(gloss).trim();
      const short = text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH - 1).trimEnd()}…` : text;
      if (short !== '' && !target.includes(short)) target.push(short);
    }
  }
  return { glosses: [...ordinary, ...forms].slice(0, MAX_GLOSSES), formOf };
};
