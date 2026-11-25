import { LEVEL_LIMITS } from './levelFromRank.mjs';

/**
 * Combines a word's rank in the two corpora into one rank for grading. A word has
 * to be reasonably common in BOTH to count as common: the less frequent of the two
 * ranks is used, and a word missing from a list counts as ranked just past its end.
 * Wikipedia alone over-rates place names and dates, and Tekstaro alone over-rates
 * older literary words; requiring both keeps everyday words together.
 *
 * @param wikipediaRank - Rank in the Wikipedia list, or null when absent.
 * @param tekstaroRank - Rank in the Tekstaro list, or null when absent.
 * @returns The rank to grade by.
 */
export const combineRanks = (wikipediaRank, tekstaroRank) => {
  const missing = LEVEL_LIMITS[LEVEL_LIMITS.length - 1] + 1;
  return Math.max(wikipediaRank ?? missing, tekstaroRank ?? missing);
};
