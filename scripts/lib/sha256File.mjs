import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

/**
 * Computes the SHA-256 of a file by streaming it.
 *
 * @param filePath - Path of the file.
 * @returns The hash as lower-case hex.
 */
export const sha256File = (filePath) =>
  new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    createReadStream(filePath)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject);
  });
