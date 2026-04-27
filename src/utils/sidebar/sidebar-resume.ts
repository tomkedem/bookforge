/**
 * Resume-from-here data layer.
 *
 * Tracks the reader's last position so a return visit can offer a
 * "continue where you left off" experience. Distinct from the
 * existing reading_progress_* keys (which capture a chapter's
 * furthest scroll for sidebar progress UI) — this captures the LIVE
 * position at any moment, scoped per book, including which section
 * the reader is in and how far through that section.
 *
 * Storage key: yuval.lastread.<bookId>  →  JSON LastPosition
 *
 * Positioning policy (decision 1, locked in plan):
 *   scrollPercent is the canonical signal.
 *   scrollY is a fallback only — used when the saved sectionSlug is
 *   no longer in the DOM (e.g. section was renamed/removed) so we
 *   still land somewhere reasonable. Never use scrollY when the
 *   section element is present; typography/font-size changes shift
 *   absolute pixels and would land on a different paragraph.
 */

import { getVisibleContentDiv } from './sidebar-helpers';

export interface LastPosition {
  chapterSlug: string;
  sectionSlug: string;
  scrollPercent: number;
  scrollY: number;
  timestamp: number;
}

const KEY_PREFIX = 'yuval.lastread.';
const SAVE_THROTTLE_MS = 3000;

function storageKey(bookId: string): string {
  return `${KEY_PREFIX}${bookId}`;
}

/** Read the saved position for a book. Returns null when absent or
 *  when stored JSON is malformed / fails type checks. */
export function getLastPosition(bookId: string): LastPosition | null {
  if (!bookId) return null;
  try {
    const raw = localStorage.getItem(storageKey(bookId));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (
      typeof data?.chapterSlug !== 'string' ||
      typeof data?.sectionSlug !== 'string' ||
      typeof data?.scrollPercent !== 'number' ||
      typeof data?.scrollY !== 'number' ||
      typeof data?.timestamp !== 'number'
    ) {
      return null;
    }
    return data as LastPosition;
  } catch {
    return null;
  }
}

/** Per-book "last write at" cache — drives the 3 s throttle. Page
 *  reload resets it naturally; the beforeunload force-save makes
 *  sure the final position lands before the throttle clears. */
const lastSaveAt = new Map<string, number>();

/**
 * Persist a position. Throttled by SAVE_THROTTLE_MS unless `force`
 * is true (used by the beforeunload handler so the final position
 * always lands).
 *
 * Quota / private-mode failures are swallowed — reading must never
 * break because of storage trouble.
 */
export function savePosition(
  bookId: string,
  partial: Omit<LastPosition, 'timestamp'>,
  options: { force?: boolean } = {},
): void {
  if (!bookId) return;
  const now = Date.now();
  const last = lastSaveAt.get(bookId) ?? 0;
  if (!options.force && now - last < SAVE_THROTTLE_MS) return;

  const payload: LastPosition = { ...partial, timestamp: now };
  try {
    localStorage.setItem(storageKey(bookId), JSON.stringify(payload));
    lastSaveAt.set(bookId, now);
  } catch {
    /* Quota / private mode — silent fail. */
  }
}

/** Wipe the saved position for a book. */
export function clearPosition(bookId: string): void {
  if (!bookId) return;
  try {
    localStorage.removeItem(storageKey(bookId));
    lastSaveAt.delete(bookId);
  } catch {
    /* Silent fail. */
  }
}

/** Milliseconds since last save, or null when there is no record. */
export function getElapsedSinceLastVisit(bookId: string): number | null {
  const pos = getLastPosition(bookId);
  if (!pos) return null;
  return Date.now() - pos.timestamp;
}

/* ─────────────────────────────────────────────────────────────────
   Section-relative scroll percent.

   The "trigger line" matches scroll-spy: upper quarter of the
   viewport. Using the same reference keeps section-pct math
   consistent with which heading the user perceives as active.
   ───────────────────────────────────────────────────────────────── */

/** Heading element + section bounds, computed defensively. */
function findSectionBounds(headingId: string): {
  top: number;
  bottom: number;
} | null {
  if (!headingId) return null;
  const content = getVisibleContentDiv();
  if (!content) return null;

  let heading: HTMLElement | null = null;
  try {
    /* Prefer the heading inside the visible chapter content; fall
       back to global if the heading is outside the .visible div for
       some reason (e.g. mid-language-swap). */
    heading =
      content.querySelector<HTMLElement>(`[id="${headingId}"]`) ||
      document.getElementById(headingId);
  } catch {
    heading = null;
  }
  if (!heading) return null;

  const headings = Array.from(
    content.querySelectorAll<HTMLElement>('h2, h3'),
  );
  const idx = headings.indexOf(heading);
  const headingTop = heading.getBoundingClientRect().top + window.scrollY;

  let sectionBottom: number;
  if (idx >= 0 && idx + 1 < headings.length) {
    sectionBottom =
      headings[idx + 1].getBoundingClientRect().top + window.scrollY;
  } else {
    const container = document.getElementById('chapter-container');
    if (container) {
      sectionBottom =
        container.getBoundingClientRect().top +
        window.scrollY +
        container.offsetHeight;
    } else {
      sectionBottom = headingTop + window.innerHeight;
    }
  }
  return { top: headingTop, bottom: sectionBottom };
}

/**
 * Fraction of the section the trigger line has crossed. Returns
 * null when the section element isn't in the DOM (caller decides
 * fallback behaviour). Always in [0, 1] when non-null.
 */
export function computeSectionPercent(headingId: string): number | null {
  const bounds = findSectionBounds(headingId);
  if (!bounds) return null;
  const length = bounds.bottom - bounds.top;
  if (length <= 0) return 0;
  const triggerY = window.scrollY + window.innerHeight * 0.25;
  const into = triggerY - bounds.top;
  if (into <= 0) return 0;
  if (into >= length) return 1;
  return into / length;
}

/**
 * Translate a saved position to an absolute scroll target.
 *
 * Primary path: section-relative — find the section, scale by
 * scrollPercent, subtract the trigger offset so the heading's
 * position at scrollPercent=0 puts the heading at the same upper-
 * quarter line scroll-spy uses.
 *
 * Fallback path: absolute scrollY — used only when the section
 * element can't be found (renamed / removed since the save).
 *
 * Returns null when neither signal yields a usable target.
 */
export function computeScrollTarget(last: LastPosition): number | null {
  try {
    const bounds = findSectionBounds(last.sectionSlug);
    if (bounds) {
      const length = Math.max(0, bounds.bottom - bounds.top);
      const trigger = window.innerHeight * 0.25;
      const target = bounds.top + last.scrollPercent * length - trigger;
      return Math.max(0, Math.round(target));
    }
  } catch {
    /* Fall through to scrollY fallback. */
  }
  if (Number.isFinite(last.scrollY) && last.scrollY > 0) {
    return Math.max(0, Math.round(last.scrollY));
  }
  return null;
}
