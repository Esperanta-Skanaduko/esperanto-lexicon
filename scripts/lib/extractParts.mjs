import { cleanPart } from './cleanPart.mjs';

const TYPES = new Map([
  ['af', 'affix'], ['affix', 'affix'], ['suf', 'suffix'], ['suffix', 'suffix'], ['pre', 'prefix'], ['prefix', 'prefix'],
  ['confix', 'confix'], ['com', 'compound'], ['compound', 'compound'],
]);

/**
 * Reads the morphological breakdown of a word from the etymology templates of its
 * Wiktionary entry, for example `lernejo` = `lerni` + `-ejo`, or `ĉiam` = `ĉi-` + `-am`.
 * Only explicit breakdowns are used; nothing is guessed. Templates are either
 * `{{af|eo|...}}`-style, or the generic `{{ety|eo|:af|...}}` form.
 *
 * @param templates - The `etymology_templates` array of a kaikki entry.
 * @returns The first breakdown found, or null. `parts` keep hyphens that mark affixes.
 */
export const extractParts = (templates) => {
  for (const template of templates ?? []) {
    const args = template.args ?? {};
    let type = TYPES.get(template.name);
    let first = 2;
    if (type === undefined && template.name === 'ety' && typeof args['2'] === 'string') {
      type = TYPES.get(args['2'].replace(/^:/, '').split('<')[0]);
      first = 3;
    }
    if (type === undefined) continue;

    const parts = [];
    for (let position = first; args[String(position)] !== undefined; position += 1) {
      const raw = String(args[String(position)]);
      if (raw.startsWith(':')) continue;
      const { form, gloss } = cleanPart(raw);
      if (form !== '') parts.push({ form, gloss: gloss ?? args[`t${position - first + 1}`] ?? null });
    }
    if (parts.length < 2) continue;

    if (type === 'suffix') parts[parts.length - 1].form = `-${parts[parts.length - 1].form.replace(/^-/, '')}`;
    if (type === 'prefix') parts[0].form = `${parts[0].form.replace(/-$/, '')}-`;
    if (type === 'confix') {
      parts[0].form = `${parts[0].form.replace(/-$/, '')}-`;
      parts[parts.length - 1].form = `-${parts[parts.length - 1].form.replace(/^-/, '')}`;
    }
    return { type, parts };
  }
  return null;
};
