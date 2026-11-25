/** Upper rank limits of levels 1 to 6. A word beyond the last limit is level 7. */
export const LEVEL_LIMITS = [500, 1000, 2000, 5000, 10000, 15000];

/**
 * Turns a frequency rank into a learning level from 1 (most common) to 7.
 *
 * @param rank - Frequency rank, where 1 is the most frequent word.
 * @returns 1 for ranks up to 500, then 2 (up to 1,000), 3 (2,000), 4 (5,000), 5 (10,000), 6 (15,000), and 7 beyond.
 */
export const levelFromRank = (rank) => {
  const index = LEVEL_LIMITS.findIndex((limit) => rank <= limit);
  return index === -1 ? LEVEL_LIMITS.length + 1 : index + 1;
};
