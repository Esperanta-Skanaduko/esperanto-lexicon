#!/usr/bin/env node
/**
 * Downloads the three source files into .cache/ and records where and when they
 * were fetched, with a SHA-256, in data/sources.json. Run before `npm run build`.
 * Use --force to download again; otherwise files already present are kept.
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CACHE_DIR, DATA_DIR } from './lib/paths.mjs';
import { sha256File } from './lib/sha256File.mjs';
import { SOURCES } from './lib/sources.mjs';

mkdirSync(CACHE_DIR, { recursive: true });
mkdirSync(DATA_DIR, { recursive: true });
const force = process.argv.includes('--force');
const recorded = [];

for (const source of SOURCES) {
  const target = join(CACHE_DIR, source.file);
  if (force || !existsSync(target)) {
    console.log(`downloading ${source.url}`);
    const response = await fetch(source.url, { headers: { 'user-agent': 'esperanto-lexicon (github.com/Esperanta-Skanaduko)' } });
    if (!response.ok) throw new Error(`${source.url} answered ${response.status}`);
    writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  }
  recorded.push({
    id: source.id,
    description: source.description,
    page: source.page,
    url: source.url,
    license: source.license,
    bytes: statSync(target).size,
    sha256: await sha256File(target),
    fetchedAt: new Date(statSync(target).mtimeMs).toISOString().slice(0, 10),
  });
}
writeFileSync(join(DATA_DIR, 'sources.json'), `${JSON.stringify(recorded, null, 2)}\n`);
console.log('data/sources.json written');
