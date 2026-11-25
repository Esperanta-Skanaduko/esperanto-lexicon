/**
 * Guesses the part of speech of a lemma that Wiktionary has no entry for, from its
 * spelling alone. The result is a guess and the dataset marks it as one
 * (`posSource: "ending"`): a capital letter means a name, and `-o -a -e -i` mean
 * noun, adjective, adverb and verb. Short words and everything else stay unknown.
 *
 * @param lemma - A lemma such as `lernanto`.
 * @returns `name`, `noun`, `adj`, `adv`, `verb`, or null.
 */
export const guessPos = (lemma) => {
  if (/^\p{Lu}/u.test(lemma)) return 'name';
  if (lemma.length <= 3 || /[^\p{L}]/u.test(lemma)) return null;
  const last = lemma[lemma.length - 1];
  return { o: 'noun', a: 'adj', e: 'adv', i: 'verb' }[last] ?? null;
};
