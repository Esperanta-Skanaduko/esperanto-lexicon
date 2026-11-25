/**
 * Cleans one part of a Wiktionary affix template: removes inline markers such as
 * `<t:place>` and a language prefix such as `eo:`, and keeps the gloss if there
 * was one.
 *
 * @param raw - A template argument such as `-ejo<t:place>`.
 * @returns The form (`-ejo`) and its gloss (`place`, or null).
 */
export const cleanPart = (raw) => {
  const gloss = /<t:([^>]*)>/.exec(raw)?.[1] ?? null;
  const form = raw.replace(/<[^>]*>/g, '').replace(/^[a-z-]{2,7}:/, '').trim();
  return { form, gloss };
};
