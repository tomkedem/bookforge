/**
 * Library Display - Pure presentation helpers
 * ────────────────────────────────────────────────────────────────────────────
 * Small, pure functions used by /library components to build localized
 * strings, format values, and decide safe display behaviors.
 *
 * Hard rules:
 *  - No DOM access. No Astro globals. No I/O.
 *  - Inputs are LibraryItem / LibraryStats / Language.
 *  - Outputs are strings, numbers, booleans, or TranslationKey.
 *  - Safe to import from .ts, .astro, and unit tests.
 */

import type { Language } from '../types/index';
import type {
  LibraryItem,
  LibraryItemStatus,
  LibraryItemType,
  LibrarySourceKind,
  LibraryLanguageMap,
  LibraryLanguageListMap,
} from '../types/library';
import type { TranslationKey } from '../i18n';

// ── Localized text fallback ─────────────────────────────────────────────────

/**
 * Resolve a localized string with the standard fallback chain:
 * requested lang → en → he → caller-supplied default.
 */
export function getLocalizedLibraryText(
  field: LibraryLanguageMap | undefined,
  lang: Language,
  fallback = '',
): string {
  if (!field) return fallback;
  return field[lang] ?? field.en ?? field.he ?? fallback;
}

/**
 * Same fallback chain for list-typed localized fields (e.g. topics).
 * Returns [] when nothing is available.
 */
export function getLocalizedLibraryList(
  field: LibraryLanguageListMap | undefined,
  lang: Language,
): string[] {
  if (!field) return [];
  return field[lang] ?? field.en ?? field.he ?? [];
}

/** Item-aware shortcut: title with slug fallback so a card never goes blank. */
export function getItemTitle(item: LibraryItem, lang: Language): string {
  return getLocalizedLibraryText(item.titles, lang) || item.slug;
}

/** Item-aware shortcut: summary, returns '' when missing in all languages. */
export function getItemSummary(item: LibraryItem, lang: Language): string {
  return getLocalizedLibraryText(item.summaries, lang);
}

/** Item-aware shortcut: topics list (already an array, never undefined). */
export function getItemTopics(item: LibraryItem, lang: Language): string[] {
  return getLocalizedLibraryList(item.topics, lang);
}

// ── Translation-key construction (Liskov: same pattern for every value) ────

export function getItemTypeLabelKey(type: LibraryItemType): TranslationKey {
  return `library.itemType.${type}` as TranslationKey;
}

export function getItemStatusLabelKey(status: LibraryItemStatus): TranslationKey {
  return `library.status.${status}` as TranslationKey;
}

export function getItemSourceKindLabelKey(kind: LibrarySourceKind): TranslationKey {
  return `library.sourceKind.${kind}` as TranslationKey;
}

// ── CSS variable name helpers (token-pattern, no hex anywhere) ─────────────

export function getTypeAccentVar(type: LibraryItemType): string {
  return `var(--yuval-galaxy-type-${type})`;
}

export function getStatusAccentVar(status: LibraryItemStatus): string {
  return `var(--yuval-galaxy-status-${status})`;
}

// ── Type → glyph family mapping ────────────────────────────────────────────

/**
 * A small abstract glyph family for each LibraryItemType. Components can
 * use this id to pick a generic decorative icon — drives presentation by
 * type alone, never by item title or slug.
 *
 * The list is intentionally short: there are far fewer glyph families than
 * underlying types so the visual language stays calm. `course_lesson` rolls
 * up under 'course', `lesson_summary` under 'document', etc.
 */
export type LibraryItemGlyph =
  | 'book'
  | 'course'
  | 'article'
  | 'series'
  | 'document'
  | 'slides'
  | 'lab'
  | 'transcript';

export function getItemGlyph(type: LibraryItemType): LibraryItemGlyph {
  switch (type) {
    case 'book':           return 'book';
    case 'course':         return 'course';
    case 'course_lesson':  return 'course';
    case 'article':        return 'article';
    case 'series':         return 'series';
    case 'lesson_summary': return 'document';
    case 'slides':         return 'slides';
    case 'lab':            return 'lab';
    case 'transcript':     return 'transcript';
    case 'document':       return 'document';
  }
}

// ── Formatting ─────────────────────────────────────────────────────────────

/**
 * Format an ISO date as a localized short date.
 * Returns '' for missing/invalid input — never throws, never returns "Invalid Date".
 */
export function formatLibraryDate(iso: string | undefined, lang: Language): string {
  if (!iso) return '';
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '';
  const locale =
    lang === 'he' ? 'he-IL' :
    lang === 'es' ? 'es-ES' :
    'en-US';
  try {
    return new Date(ts).toLocaleDateString(locale, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Normalise reading-minutes for display: round, clamp at 1.
 * Returns undefined when input is not a finite number — caller decides
 * whether to render a meta line at all.
 */
export function formatReadingMinutes(minutes: number | undefined): number | undefined {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes)) return undefined;
  return Math.max(1, Math.round(minutes));
}

// ── Safe link policy ───────────────────────────────────────────────────────

/**
 * Whether a LibraryItem.href points to a route we know exists in this
 * project. Today: only `/read/...` (chapter pages) and `/books/...`
 * (book overview pages) are real. Mock data also references `/articles/`,
 * `/courses/`, `/slides/`, `/labs/`, `/transcripts/`, `/docs/` — those
 * routes are not built yet, so cards pointing there must render as
 * non-clickable to avoid silent 404s.
 *
 * Extend this list as new real routes ship.
 */
export function isSafeLibraryHref(href: string | undefined | null): boolean {
  if (!href) return false;
  return href.startsWith('/read/') || href.startsWith('/books/');
}

/**
 * Whether an item is a "readable" piece of content the user can actually
 * open right now. The synthetic course item (organizing entity, no
 * /courses/{slug} route yet) is NOT readable. Books and course lessons
 * with /books/{slug} hrefs are readable.
 *
 * Used to:
 *   - keep synthetic items out of orbit cards (no broken-looking tiles)
 *   - filter recommendations to readable content only
 *   - count "available content items" honestly in the stats panel
 */
export function isReadableLibraryItem(item: LibraryItem): boolean {
  return isSafeLibraryHref(item.href);
}
