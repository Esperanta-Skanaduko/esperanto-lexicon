/**
 * Writes the dataset as a spreadsheet-safe CSV (RFC 4180: fields containing commas,
 * quotes or line breaks are quoted, quotes are doubled). One row per lemma with its
 * first gloss.
 *
 * Spreadsheets run a cell as a formula when it starts with `=`, `+`, `-`, `@`, a tab
 * or a carriage return, and the glosses come from Wiktionary, which anyone can edit
 * (CSV/formula injection). Such cells get a leading apostrophe, so they stay text.
 * The JSON file keeps the exact values; use it when you need them unchanged.
 *
 * @param records - The dataset records.
 * @returns CSV text with a header row and a final newline.
 */
export const toCsv = (records) => {
  const quote = (value) => {
    const raw = value === null || value === undefined ? '' : String(value);
    const text = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
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
