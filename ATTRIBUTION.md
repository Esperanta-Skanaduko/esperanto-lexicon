# Attribution

This dataset is built from the work of many Wiktionary editors and from open tools. Please keep this credit with any copy or adaptation.

## Data

- **Wiktionary contributors.** Entries, glosses, parts of speech and etymology breakdowns come from [en.wiktionary.org](https://en.wiktionary.org/), text available under CC BY-SA 4.0 (and GFDL). Contributors are listed in each entry's page history.
- **Frequency lists.** [Wiktionary: Frequency lists/Esperanto/Wikipedia 2023](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Esperanto/Wikipedia_2023) (based on the Esperanto Wikipedia dump of 2023-03-01) and [Wiktionary: Frequency lists/Esperanto/Tekstaro 2023](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Esperanto/Tekstaro_2023) (based on the Tekstaro de Esperanto dump of 2023-03-15), by the Wiktionary contributors to those pages, CC BY-SA 4.0.
- **Machine-readable Wiktionary.** The entries were read from the [kaikki.org](https://kaikki.org/dictionary/Esperanto/index.html) extraction made with [wiktextract](https://github.com/tatuylonen/wiktextract). Please cite:
  Tatu Ylonen, *Wiktextract: Wiktionary as Machine-Readable Structured Data*, Proceedings of the 13th Conference on Language Resources and Evaluation (LREC), pp. 1317-1325, Marseille, 20-25 June 2022.

## Changes made

The lists were merged, graded into levels, and joined with entries; glosses were shortened to at most 140 characters; some fields were derived (`stem`, `level`, and `pos` where marked `posSource: "ending"`). See the README for the rules.
