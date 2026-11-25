/**
 * Reads the block headings of a Wiktionary frequency page ("First hundred by
 * frequency", "Frequency rank of 501-1000") and returns how many words each block
 * should hold, in page order. Used to check that parsing lost or gained nothing.
 *
 * @param wikitext - The raw wikitext of a frequency page.
 * @returns For each block, its first and last rank.
 */
export const readBands = (wikitext) => {
  const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
  const bands = [];
  for (const line of wikitext.split('\n')) {
    const hundred = /^===(First|Second|Third|Fourth|Fifth) hundred/.exec(line);
    if (hundred) {
      const index = ordinals.indexOf(hundred[1]);
      bands.push({ from: index * 100 + 1, to: index * 100 + 100 });
      continue;
    }
    const range = /^===Frequency rank of (\d+)[–-](\d+)===/.exec(line);
    if (range) bands.push({ from: Number(range[1]), to: Number(range[2]) });
  }
  return bands;
};
