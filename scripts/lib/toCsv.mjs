/**
 * Writes the dataset as CSV (RFC 4180: fields containing commas, quotes or line
 * breaks are quoted, quotes are doubled). One row per lemma with its first gloss.
 *
 * @param records - The dataset records.
 * @returns CSV text with a header row and a final newline.
 */
export const toCsv = (records) => {
  const quote = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = ['lemma', 'pos', 'pos_source', 'stem', 'level', 'wikipedia_rank', 'tekstaro_rank', 'gloss', 'form_of', 'parts'];
  const rows = records.map((record) =>
    [
      record.lemma,
      record.pos,
      record.posSource,
      record.stem,
      record.level,
      record.wikipediaRank,
      record.tekstaroRank,
      record.senses[0]?.glosses[0] ?? '',
      record.formOf ? record.formOf.join(' ') : '',
      record.parts ? record.parts.join(' + ') : '',
    ]
      .map(quote)
      .join(','),
  );
  return `${[header.join(','), ...rows].join('\n')}\n`;
};
