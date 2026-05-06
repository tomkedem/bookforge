/**
 * Editorial metadata layer for Yuval content items.
 *
 * This is intentionally separate from:
 *  - reader progress data (yuval_bookmarks_*, yuval_reading_progress_*, …)
 *  - global reader preferences (yuval_language, yuval-theme, …)
 *  - source-of-truth book data emitted by the BookForge pipeline
 *    (book-manifest.json, _catalog.json) and surfaced via
 *    `DiscoveredBook` in src/utils/book-discovery.ts
 *
 * Source-of-truth data describes what the file system contains.
 * Editorial metadata describes how Tomer wants an item presented in
 * Yuval — title overrides, grouping, visibility — and is therefore
 * stored client-side and edited from the Knowledge Control Center.
 *
 * The existing `ContentType` exported from book-discovery.ts is a
 * structural classification ('book' | 'course_lesson'). The editorial
 * type below is a presentation classification and is named
 * `ContentItemType` to avoid the collision.
 */

export type ContentItemType = 'book' | 'course' | 'article';

export type VisualMode = 'card' | 'hidden';

export interface ContentMetadata {
  slug: string;
  displayTitle: string;
  contentType: ContentItemType;
  category: string;
  seriesName: string;
  isVisibleInUniverse: boolean;
  visualMode: VisualMode;
}

export interface ContentMetadataStore {
  version: number;
  items: Record<string, ContentMetadata>;
}

export const CONTENT_METADATA_VERSION = 1;
