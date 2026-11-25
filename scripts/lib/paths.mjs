import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Absolute path of the repository root. */
export const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Folder for downloaded source files. Ignored by git; recreate it with `npm run fetch`. */
export const CACHE_DIR = join(ROOT_DIR, '.cache');

/** Folder for the published dataset files. */
export const DATA_DIR = join(ROOT_DIR, 'data');
