# esperanto-lexicon

An open Esperanto lexicon for people who build things for learners: **20,507 lemmas**, each with its rank in two corpora, a learning level from 1 to 7, English glosses, part of speech, and (for 4,364 of them) an explicit breakdown into root and affixes such as `lernejo` = `lerni` + `-ejo`.

**Search it:** https://esperantaskanaduko.com/open-source/esperanto-lexicon/

It is built, not hand-written, from three open sources, and every step is reproducible (`npm run fetch && npm run build`). Nothing is guessed except one field, and that field says so.

## What is in `data/`

| File | What it is |
| --- | --- |
| `lexicon.json` | One record per lemma (below). |
| `lexicon.csv` | The same, flat: `lemma, pos, pos_source, stem, level, wikipedia_rank, tekstaro_rank, gloss, form_of, parts`. **Spreadsheet-safe:** a cell that starts with `=`, `+`, `-`, `@`, a tab or a line break gets a leading apostrophe so a spreadsheet cannot run it as a formula (9 cells today, all affixes such as `'-ebla + -i`). Use the JSON for exact values. |
| `affixes.json` | 123 prefixes, suffixes and infixes with the number of lemmas using each and their usual gloss. |
| `stats.json` | Counts and coverage of this build. |
| `sources.json` | Where each input came from, when, and its SHA-256. |

```js
import lexicon from 'esperanto-lexicon/lexicon.json' with { type: 'json' };
lexicon.filter((word) => word.level <= 2 && word.pos === 'noun').map((word) => word.lemma);
```

### A record

```json
{
  "lemma": "lernejo", "pos": "noun", "posSource": "wiktionary", "stem": "lernej",
  "level": 1, "wikipediaRank": 224, "tekstaroRank": 388,
  "senses": [{ "pos": "noun", "glosses": ["school (institution dedicated to teaching and learning)"] }],
  "formOf": null, "parts": ["lerni", "-ejo"], "partsType": "affix",
  "inUniversalaVortaro1894": true
}
```

| Field | Meaning |
| --- | --- |
| `lemma` | The base form as the frequency lists write it (names keep their capital). |
| `pos`, `posSource` | Part of speech. `wiktionary` means Wiktionary gives it. **`ending` means it is a guess from the spelling** (`-o` noun, `-a` adjective, `-e` adverb, `-i` verb, capital letter name); it is used for 8,970 lemmas with no Wiktionary entry. `null` for 169 short or odd words. |
| `stem` | The lemma without its grammatical ending (`lernej`), for grouping a word family. |
| `wikipediaRank`, `tekstaroRank` | Position in the Wiktionary list for that corpus, 1 = most frequent, or `null` if the lemma is not in that corpus's top 15,000. |
| `level` | See below. |
| `senses` | Up to three parts of speech, each with up to four short English glosses. Empty when Wiktionary has no entry. |
| `formOf` | For participles and other inflected forms Wiktionary lists on their own (`konata`), the lemma they come from (`koni`). |
| `parts`, `partsType` | The breakdown Wiktionary states, with hyphens marking affixes. `null` when it states none. Types: `affix`, `prefix`, `suffix`, `confix`, `compound`. |
| `inUniversalaVortaro1894` | The word is tagged as in Zamenhof's 1894 *Universala Vortaro*. |

## How the level is decided

Each corpus list is a ranking of its 15,000 most frequent lemmas. A word's **level is set by the less frequent of its two ranks**, and a word that is in only one list counts as ranked past the end:

| Level | Rank (in both lists) | Lemmas | With a gloss |
| ---: | --- | ---: | ---: |
| 1 | up to 500 | 290 | 99.7% |
| 2 | up to 1,000 | 340 | 99.1% |
| 3 | up to 2,000 | 674 | 98.5% |
| 4 | up to 5,000 | 2,019 | 89.5% |
| 5 | up to 10,000 | 3,083 | 72.1% |
| 6 | up to 15,000 | 3,087 | 59.2% |
| 7 | in only one of the two lists | 11,014 | 38.3% |

The two corpora complement each other: Wikipedia over-represents places, dates and science, and the Tekstaro (literature, periodicals, translations) over-represents older literary words. Requiring a word to be common in both keeps everyday words together. If you want a different rule, the raw ranks are in every record.

**This is a frequency grading, not CEFR.** Frequency is a good guide for what to learn first, but it does not know that `kvazaŭ` is harder than `kaj`. Treat levels as a sorted shopping list.

## Where the data comes from

| Input | What it gives | License |
| --- | --- | --- |
| [Wiktionary: Frequency lists/Esperanto/Wikipedia 2023](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Esperanto/Wikipedia_2023) | The 15,000 most frequent lemmas of the Esperanto Wikipedia (dump of 2023-03-01, over 43 million words), already reduced to base form | CC BY-SA 4.0 |
| [Wiktionary: Frequency lists/Esperanto/Tekstaro 2023](https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/Esperanto/Tekstaro_2023) | The same for the Tekstaro de Esperanto (dump of 2023-03-15, over 10 million words) | CC BY-SA 4.0 |
| [kaikki.org Esperanto dictionary](https://kaikki.org/dictionary/Esperanto/index.html) | Wiktionary's Esperanto entries as JSON, by [wiktextract](https://github.com/tatuylonen/wiktextract) | CC BY-SA 4.0 / GFDL |

The frequency lists already existed and are already lemmatized. What this repository adds is the join: two corpora combined into one level, matched to Wiktionary's glosses, parts of speech and stated affix breakdowns, plus the family stems and the affix inventory, in one clean, tested dataset.

## Limits you should know

- **Half the lemmas have no gloss** (9,141 of 20,507), mostly rarer words and proper names. Wiktionary has no entry for many regular derivations such as `reprezentanto`. `senses` is then empty; no gloss is invented.
- **`parts` exists only where Wiktionary states a breakdown** (4,364 lemmas). A missing `parts` means "not stated", not "has no affixes". Grammatical endings are not split off; use `stem`.
- **Glosses are English, short and written by Wiktionary editors.** For participles they can read "singular present passive participle of koni" first; see `formOf`.
- **Two 2023 corpora have their own bias** (encyclopaedic text, and mostly literary text). Neither is spoken or conversational Esperanto.
- **Ranks are the position on the Wiktionary list**, which is in frequency order; ties are broken by the list's author. There are no raw counts.
- **The kaikki download is marked deprecated by its maintainer.** `data/sources.json` records the SHA-256 of the file used, so a rebuild from a newer dump shows exactly what changed.

## Rebuild

```bash
npm run fetch    # downloads the three inputs into .cache/ (about 175 MB) and writes data/sources.json
npm run build    # writes data/ and site/lexicon-lite.json
npm test         # unit tests plus invariants on the shipped data
```

Node 20 or newer, no dependencies. The build refuses to run if a frequency page parses to a different number of lemmas than its headings promise.

## License

The **code** is [MIT](LICENSE). The **data** in `data/` is derived from Wiktionary and is licensed **[CC BY-SA 4.0](LICENSE-DATA.md)**: you may use and share it, including commercially, if you credit the sources in [ATTRIBUTION.md](ATTRIBUTION.md) and share adaptations under the same license.

Part of [Esperanta Skanaduko](https://esperantaskanaduko.com).
