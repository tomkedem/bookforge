/**
 * Knowledge Cards — three-face artifact assets for orbit cards.
 *
 * SLUG CONTRACT (binding):
 *   The folder name under `public/assets/knowledge-cards/` MUST equal
 *   the item's `LibraryItem.slug` exactly — same casing, same dashes,
 *   no abbreviation. The item slug is derived directly from the
 *   directory name in `output/` (see `book-discovery.ts`), so the
 *   asset folder must mirror that name. Examples:
 *     output/practical-python-for-ai-engineering/
 *     → public/assets/knowledge-cards/practical-python-for-ai-engineering/
 *   A shorter or stylised folder name (e.g. `python-ai-engineering`)
 *   silently misses the lookup and the orbit excludes the item.
 *
 * Each slug under `public/assets/knowledge-cards/<slug>/` may carry three
 * pre-rendered images:
 *
 *   front.png  — visible when the card is at or near the orbit's center
 *                (top / bottom of the orbit, or click-focused)
 *   left.png   — visible while the card is on the visual-left arc
 *   right.png  — visible while the card is on the visual-right arc
 *
 * Discovery is filesystem-driven so the catalog is trivial to extend:
 * drop a folder containing all three PNGs and the slug becomes
 * artifact-eligible. A folder missing any of the three faces is skipped
 * — partial artifacts never reach the UI, so the orbit always falls
 * back to its default medallion+glyph for that slug instead of
 * rendering broken images.
 *
 * Only the assets are exposed: text (title, type, count, progress) is
 * already rendered by `LibraryCard` from the `LibraryItem` data, and
 * must NOT be baked into the image.
 */

import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';

const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');
const ASSETS_SUBPATH = 'assets/knowledge-cards';
const FACE_FILES = {
  front: 'front.png',
  left:  'left.png',
  right: 'right.png',
} as const;

export interface KnowledgeCardAssets {
  front: string;
  left: string;
  right: string;
}

// Cached map of slug → assets. Computed once on first lookup and
// served from memory for every subsequent card on the same SSR pass.
let assetsCache: Map<string, KnowledgeCardAssets> | null = null;

/**
 * Returns the three-face asset URLs for a slug, or `undefined` when
 * the slug has no complete set of assets on disk. A partial folder
 * (e.g. only `front.png`) returns `undefined` so the orbit keeps
 * showing its default medallion fallback rather than rendering a
 * broken image.
 */
export function getKnowledgeCardAssets(slug: string): KnowledgeCardAssets | undefined {
  if (assetsCache === null) assetsCache = buildCache();
  return assetsCache.get(slug);
}

function buildCache(): Map<string, KnowledgeCardAssets> {
  const cache = new Map<string, KnowledgeCardAssets>();
  const root = path.resolve(PUBLIC_ROOT, ASSETS_SUBPATH);
  if (!existsSync(root)) return cache;

  for (const entry of readdirSync(root)) {
    const dir = path.join(root, entry);
    if (!statSync(dir).isDirectory()) continue;
    const allPresent = (Object.values(FACE_FILES) as string[])
      .every((file) => existsSync(path.join(dir, file)));
    if (!allPresent) continue;
    const baseUrl = `/${ASSETS_SUBPATH}/${entry}`;
    cache.set(entry, {
      front: `${baseUrl}/${FACE_FILES.front}`,
      left:  `${baseUrl}/${FACE_FILES.left}`,
      right: `${baseUrl}/${FACE_FILES.right}`,
    });
  }
  return cache;
}
