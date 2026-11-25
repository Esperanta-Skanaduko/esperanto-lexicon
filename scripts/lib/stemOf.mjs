const ENDINGS = { noun: 'o', name: 'o', adj: 'a', adv: 'e', verb: 'i' };

/**
 * Removes the grammatical ending of a lemma to give its stem, so that `domo`,
 * `doma`, `dome` and `domi`-type words can be grouped. Only the ending that the
 * part of speech requires is removed, so `la`, `kaj` or `mi` keep their form.
 *
 * @param lemma - A lemma such as `lernejo`.
 * @param pos - Wiktionary part of speech: `noun`, `adj`, `adv`, `verb`, `name`, ...
 * @returns The stem (`lernej`), or the lemma itself when it has no such ending.
 */
export const stemOf = (lemma, pos) => {
  const ending = ENDINGS[pos];
  if (ending === undefined || lemma.length <= 2 || !lemma.toLowerCase().endsWith(ending)) return lemma.toLowerCase();
  return lemma.slice(0, -1).toLowerCase();
};
