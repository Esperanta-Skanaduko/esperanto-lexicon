import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

/**
 * Streams a kaikki JSON Lines file and groups the entries of the wanted lemmas by
 * their spelling. Lines are parsed one at a time, so the 170 MB file never has to
 * fit in memory.
 *
 * @param filePath - Path of the `.jsonl` file.
 * @param wanted - Set of lemma spellings to keep.
 * @returns Map of lemma to its entries, and the number of lines read.
 */
export const readEntries = async (filePath, wanted) => {
  const entries = new Map();
  let lines = 0;
  for await (const line of createInterface({ input: createReadStream(filePath, 'utf-8'), crlfDelay: Infinity })) {
    if (line === '') continue;
    lines += 1;
    const entry = JSON.parse(line);
    if (!wanted.has(entry.word)) continue;
    const list = entries.get(entry.word) ?? [];
    list.push(entry);
    entries.set(entry.word, list);
  }
  return { entries, lines };
};
