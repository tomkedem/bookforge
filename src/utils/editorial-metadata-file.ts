/**
 * SSR-only file-based editorial metadata reader.
 *
 * Reads `output/_editorial.json` at build / dev-server time so server-
 * rendered code paths can surface editorial overrides (series links,
 * display titles, visibility) WITHOUT depending on a browser
 * `localStorage`. The browser still owns the canonical write path
 * (`setMetadata` / `setSeriesMetadata` in `content-metadata.ts`); this
 * module is read-only and silent when the file is missing or invalid.
 *
 * Why this is a SEPARATE file from `content-metadata.ts`:
 *   `content-metadata.ts` is imported by browser code (admin.astro and
 *   the orbit hydrator). Importing `node:fs` from a browser-loaded
 *   module would break Vite's client bundle. Keeping the fs reader
 *   here, and importing it only from SSR-side modules
 *   (`library-adapter.ts`), preserves both bundles.
 *
 * File shape (intentional subset — fields are Partial per record so the
 * JSON can be hand-edited without listing every key):
 *   {
 *     "version": 1,
 *     "items":  { "<slug>": { ...Partial<ContentMetadata> } },
 *     "series": { "<name>": { ...Partial<SeriesMetadata>  } }
 *   }
 *
 * Missing file, missing keys, malformed JSON — all resolve to the same
 * empty store. SSR never throws because of editorial state.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { PATHS } from '../config';
import type {
  ContentMetadata,
  SeriesMetadata,
} from '../types/content-metadata';

interface EditorialStore {
  version: number;
  items: Record<string, Partial<ContentMetadata>>;
  series: Record<string, Partial<SeriesMetadata>>;
}

const EMPTY_STORE: EditorialStore = { version: 1, items: {}, series: {} };

let cached: EditorialStore | null = null;

/**
 * Load `output/_editorial.json` once per process. Mirrors the cache
 * pattern in `loadCatalog()` (book-discovery.ts) — fine for production
 * builds; in dev the file is rarely edited from disk because the canon-
 * ical writer is still localStorage in /admin.
 */
function loadEditorial(): EditorialStore {
  if (cached) return cached;

  const filePath = join(PATHS.OUTPUT_DIR, '_editorial.json');
  if (!existsSync(filePath)) {
    cached = EMPTY_STORE;
    return EMPTY_STORE;
  }

  try {
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<EditorialStore> | null;
    cached = {
      version: typeof parsed?.version === 'number' ? parsed.version : 1,
      items:
        parsed?.items && typeof parsed.items === 'object'
          ? (parsed.items as Record<string, Partial<ContentMetadata>>)
          : {},
      series:
        parsed?.series && typeof parsed.series === 'object'
          ? (parsed.series as Record<string, Partial<SeriesMetadata>>)
          : {},
    };
    return cached;
  } catch {
    cached = EMPTY_STORE;
    return EMPTY_STORE;
  }
}

/**
 * Raw items map. Records may be partial — a hand-authored entry can
 * declare only `seriesName` and omit everything else.
 */
export function getAllMetadataFromFile(): Record<string, Partial<ContentMetadata>> {
  return loadEditorial().items;
}

export function getAllSeriesMetadataFromFile(): Record<string, Partial<SeriesMetadata>> {
  return loadEditorial().series;
}

/**
 * Returns the editorial record for `slug`, or `undefined` if no entry
 * exists. Callers should treat `undefined` as "no overrides", not as an
 * error: an empty file is the default state.
 */
export function getMetadataFromFile(slug: string): Partial<ContentMetadata> | undefined {
  return loadEditorial().items[slug];
}

export function getSeriesMetadataFromFile(name: string): Partial<SeriesMetadata> | undefined {
  return loadEditorial().series[name];
}
