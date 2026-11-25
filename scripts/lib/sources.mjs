/**
 * Every upstream file the dataset is built from. The two frequency lists are
 * Wiktionary pages (CC BY-SA 4.0) that list 15,000 lemmas in frequency order for
 * two corpora; the entries come from the kaikki.org extraction of Wiktionary.
 */
export const SOURCES = [
  {
    id: 'wikipedia',
    file: 'freq-wikipedia-2023.txt',
    url: 'https://en.wiktionary.org/w/index.php?title=Wiktionary:Frequency_lists/Esperanto/Wikipedia_2023&action=raw',
    page: 'https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Esperanto/Wikipedia_2023',
    description: 'Top 15,000 lemmas of the Esperanto Wikipedia dump of 2023-03-01 (more than 43 million words)',
    license: 'CC BY-SA 4.0',
  },
  {
    id: 'tekstaro',
    file: 'freq-tekstaro-2023.txt',
    url: 'https://en.wiktionary.org/w/index.php?title=Wiktionary:Frequency_lists/Esperanto/Tekstaro_2023&action=raw',
    page: 'https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Esperanto/Tekstaro_2023',
    description: 'Top 15,000 lemmas of the Tekstaro de Esperanto dump of 2023-03-15 (more than 10 million words)',
    license: 'CC BY-SA 4.0',
  },
  {
    id: 'wiktionary',
    file: 'kaikki-eo.jsonl',
    url: 'https://kaikki.org/dictionary/Esperanto/kaikki.org-dictionary-Esperanto.jsonl',
    page: 'https://kaikki.org/dictionary/Esperanto/index.html',
    description: 'Wiktionary Esperanto entries, extracted to JSON Lines by wiktextract',
    license: 'CC BY-SA 4.0 and GFDL (Wiktionary text)',
  },
];
