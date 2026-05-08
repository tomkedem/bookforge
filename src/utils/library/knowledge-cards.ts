/**
 * Knowledge Cards — four-face artifact assets for orbit cards.
 *
 * DISCOVERY MODEL — fully automatic, zero hardcoded slugs
 *
 *   Drop a folder under `src/assets/knowledge-cards/<slug>/` containing:
 *     front.png      — straight, non-selected positions on the orbit
 *     left.png       — left arc of the orbit
 *     right.png      — right arc of the orbit
 *     selected.png   — click-focused / center / promoted state
 *
 *   …and on the next build / dev-server reload the matching library
 *   item will appear in artifact mode. Vite's `import.meta.glob` walks
 *   the tree at build time, so adding / removing a folder Just Works
 *   without touching code, configs, or any registry.
 *
 *   - All four faces present → returned as a complete asset bundle.
 *   - Any face missing → undefined → orbit keeps the medallion fallback
 *     (the item is excluded from the orbit by the page-level filter).
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
 *   listing each detected folder, which faces are present, and whether
 *   the bundle is complete. Look for lines starting with
 *   `[knowledge-cards]` in the dev-server console / build output.
 */

// ── Vite glob discovery ────────────────────────────────────────────────
// One glob per face. `eager: true` returns URLs synchronously at module
// load; `import: 'default'` + `query: '?url'` resolves each PNG to its
// bundled URL. The four-glob shape (instead of one wildcard) lets us
// require each named face without parsing filenames at runtime.
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
const SELECTED_GLOBS = import.meta.glob<string>(
  '/src/assets/knowledge-cards/*/selected.png',
  { eager: true, query: '?url', import: 'default' },
);

// ── Public API ─────────────────────────────────────────────────────────
export interface KnowledgeCardAssets {
  front: string;
  left: string;
  right: string;
  /**
   * Shown only on the click-focused / promoted-to-center card. Authored
   * intentionally taller than `front.png` (~50 % more vertical) so the
   * focused presentation stands clearly apart from the orbit-station
   * artwork. Layout adapts: when this face is active, the artifact
   * container's aspect-ratio relaxes so the image renders at its
   * natural proportions without clipping.
   */
  selected: string;
}

/** Names of every face the discovery code expects. Single source of truth. */
const FACE_KEYS = ['front', 'left', 'right', 'selected'] as const;
type FaceKey = (typeof FACE_KEYS)[number];

/**
 * Returns the four-face asset URLs for a slug, or `undefined` when
 * the slug has no complete set of assets. Matches case-insensitively.
 *
 * Behavior contract:
 *   - All four PNGs present → `{ front, left, right, selected }`.
 *   - Any face missing → `undefined`. The page-level filter then drops
 *     the item from the orbit and the existing medallion fallback
 *     remains in place for non-orbit views (e.g. mobile carousel).
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
  // Path shape: `/src/assets/knowledge-cards/<slug>/<face>.png`
  const m = path.match(
    /\/knowledge-cards\/([^/]+)\/(?:front|left|right|selected)\.png$/,
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
    face: FaceKey,
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
  collect(SELECTED_GLOBS, 'selected');

  // Pass 2: keep only slugs whose folder has every required face.
  const cache = new Map<string, KnowledgeCardAssets>();
  for (const [key, { faces }] of partial) {
    if (FACE_KEYS.every((f) => faces[f])) {
      cache.set(key, faces as KnowledgeCardAssets);
    }
  }

  reportDiscovery(partial, cache);
  return cache;
}

/**
 * Build-time discovery report — printed to the dev-server / build
 * console. Helps diagnose silent slug / case mismatches and missing
 * faces.
 */
function reportDiscovery(
  partial: Map<string, { onDiskSlug: string; faces: Partial<KnowledgeCardAssets> }>,
  complete: Map<string, KnowledgeCardAssets>,
): void {
  // Single, scoped headline so the report is easy to grep.
  // eslint-disable-next-line no-console
  console.log(
    `[knowledge-cards] discovered ${partial.size} folder(s); `
    + `${complete.size} complete (have all of `
    + `${FACE_KEYS.join('/')}).`,
  );
  for (const [key, { onDiskSlug, faces }] of partial) {
    const present = FACE_KEYS.filter((f) => faces[f]);
    const missing = FACE_KEYS.filter((f) => !faces[f]);
    const status = complete.has(key) ? 'COMPLETE' : 'INCOMPLETE';
    const detail = missing.length === 0
      ? 'all faces present'
      : `missing: ${missing.join(', ')}`;
    // eslint-disable-next-line no-console
    console.log(
      `[knowledge-cards]   [${status}] ${onDiskSlug}`
      + ` (lookup key: ${key}) — `
      + `present: ${present.join(', ') || '(none)'}; ${detail}`,
    );
  }
}
