const BULLET = /^\* \[\[([^\]#|]+)#Esperanto\|[^\]]*\]\]\s*$/;

/**
 * Reads a Wiktionary Esperanto frequency page (wikitext) into an ordered list of
 * lemmas. The page lists words in frequency order, so the position in the list is
 * the rank (1 is the most frequent). Each word appears once.
 *
 * @param wikitext - The raw wikitext of a `Wiktionary:Frequency lists/Esperanto/...` page.
 * @returns Lemmas in rank order, as written on the page (capital letters kept for names).
 * @throws When a bullet line does not look like `* [[word#Esperanto|word]]`.
 */
export const parseFrequencyList = (wikitext) => {
  const lemmas = [];
  for (const line of wikitext.split('\n')) {
    if (!line.startsWith('* [[')) continue;
    const match = BULLET.exec(line);
    if (match === null) throw new Error(`Unrecognised frequency list line: ${line}`);
    lemmas.push(match[1].trim());
  }
  return lemmas;
};
