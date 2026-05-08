/**
 * Knowledge Cards — three-face artifact assets for orbit cards.
 *
 * DISCOVERY MODEL — fully automatic, zero hardcoded slugs
 *
 *   Drop a folder under `src/assets/knowledge-cards/<slug>/` containing:
 *     front.png
 *     left.png
 *     right.png
 *
 *   …and on the next build / dev-server reload the matching library
 *   item will appear in artifact mode. Vite's `import.meta.glob` walks
 *   the tree at build time, so adding / removing a folder Just Works
 *   without touching code, configs, or any registry.
 *
 *   - All three faces present → returned as a complete asset bundle.
 *   - Any face missing → undefined → orbit keeps the medallion fallback.
 *   - Slug matching is case-insensitive (Windows-friendly): an item with
 *     slug `AI-Developer-Fitness` matches a folder named
 *     `ai-developer-fitness` and vice versa.
 *
 *   Why `src/assets/` and not `public/`?
 *     `src/assets/` flows through Vite's pipeline, so the URLs are
 *     content-hashed (cache-busting on rebuild) and the discovery is
 *     glob-based (no hand-rolled `fs.readdirSync`).
 *
 *   Build-time visibility: every SSR pass logs a discovery report
 *   listing each detected folder, what faces it has, and whether it
 *   counts as complete. Look for lines starting with
 *   `[knowledge-cards]` in the dev-server console / build output.
 */

// ── Vite glob discovery ────────────────────────────────────────────────
// Three globs — one per face. `eager: true` gives us the URLs synchronously
// at module-load time; `import: 'default'` + `query: '?url'` resolves each
// PNG to its bundled URL (a hashed `/src/assets/.../front.<hash>.png` path
// in production, or the original path in dev). The triple-glob shape
// (instead of one wildcarded glob) lets us require all three faces by name
// without parsing filenames at runtime.
const FRONT_GLOBS = import.meta.glob<string>(
  '/src/assets/knowledge-cards/*/front.png',
  { eager: true, query: '?url', import: 'default' },
);
const LEFT_GLOBS = import.meta.glob<string>(
  '/src/assets/knowledge-cards/*/left.png',
  { eager: true, query: '?url', import: 'default' },
);
const RIGHT_GLOBS = import.meta.glob<string>(
  '/src/assets/knowledge-cards/*/right.png',
  { eager: true, query: '?url', import: 'default' },
);

// ── Public API ─────────────────────────────────────────────────────────
export interface KnowledgeCardAssets {
  front: string;
  left: string;
  right: string;
}

/**
 * Returns the three-face asset URLs for a slug, or `undefined` when
 * the slug has no complete set of assets. Matches case-insensitively.
 */
export function getKnowledgeCardAssets(slug: string): KnowledgeCardAssets | undefined {
  if (assetsCache === null) assetsCache = buildCache();
  return assetsCache.get(normalizeSlug(slug));
}

// ── Internals ──────────────────────────────────────────────────────────
let assetsCache: Map<string, KnowledgeCardAssets> | null = null;

function normalizeSlug(slug: string): string {
  // Lower-case so catalog slugs (mixed case, e.g. `AI-Developer-Fitness`)
  // match folder names (typically lower-case kebab) without the user
  // having to keep them perfectly aligned.
  return slug.toLowerCase();
}

function slugFromGlobPath(path: string): string | null {
  // Path shape: `/src/assets/knowledge-cards/<slug>/front.png`
  const m = path.match(
    /\/knowledge-cards\/([^/]+)\/(?:front|left|right)\.png$/,
  );
  return m ? m[1] : null;
}

function buildCache(): Map<string, KnowledgeCardAssets> {
  // Pass 1: gather every face we found, keyed on the lower-cased slug.
  // The original on-disk slug is preserved alongside so the discovery
  // report can show authors what they actually named the folder.
  type PartialFaces = {
    onDiskSlug: string;
    faces: Partial<KnowledgeCardAssets>;
  };
  const partial = new Map<string, PartialFaces>();

  function collect(
    globs: Record<string, string>,
    face: keyof KnowledgeCardAssets,
  ): void {
    for (const [filePath, url] of Object.entries(globs)) {
      const slug = slugFromGlobPath(filePath);
      if (!slug) continue;
      const key = normalizeSlug(slug);
      const entry = partial.get(key) ?? { onDiskSlug: slug, faces: {} };
      entry.faces[face] = url;
      partial.set(key, entry);
    }
  }

  collect(FRONT_GLOBS, 'front');
  collect(LEFT_GLOBS, 'left');
  collect(RIGHT_GLOBS, 'right');

  // Pass 2: keep only slugs whose folder has all three faces.
  const cache = new Map<string, KnowledgeCardAssets>();
  for (const [key, { faces }] of partial) {
    if (faces.front && faces.left && faces.right) {
      cache.set(key, faces as KnowledgeCardAssets);
    }
  }

  reportDiscovery(partial, cache);
  return cache;
}

/**
 * Build-time discovery report — printed to the dev-server / build
 * console. Helps diagnose silent slug / case mismatches.
 */
function reportDiscovery(
  partial: Map<string, { onDiskSlug: string; faces: Partial<KnowledgeCardAssets> }>,
  complete: Map<string, KnowledgeCardAssets>,
): void {
  // Single, scoped log line so the report is easy to grep.
  // eslint-disable-next-line no-console
  console.log(
    `[knowledge-cards] discovered ${partial.size} folder(s); `
    + `${complete.size} complete (have all of front/left/right).`,
  );
  for (const [key, { onDiskSlug, faces }] of partial) {
    const present: string[] = [];
    if (faces.front) present.push('front');
    if (faces.left) present.push('left');
    if (faces.right) present.push('right');
    const missing = ['front', 'left', 'right'].filter((f) => !present.includes(f));
    const status = complete.has(key) ? 'COMPLETE' : 'INCOMPLETE';
    const detail = missing.length === 0
      ? 'all faces present'
      : `missing: ${missing.join(', ')}`;
    // eslint-disable-next-line no-console
    console.log(
      `[knowledge-cards]   [${status}] ${onDiskSlug}`
      + ` (lookup key: ${key}) — ${detail}`,
    );
  }
}
