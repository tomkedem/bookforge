/**
 * Active-section tracking for the section list.
 *
 * IntersectionObserver watches the live h2/h3 elements of the active
 * chapter. As the reader scrolls, we recompute which heading is
 * "active" (closest to the top of the viewport, with a buffer zone)
 * and highlight the matching outline entry.
 *
 * State is module-level mutable on purpose: there's only ever one
 * sidebar instance, scroll-spy is a singleton concept, and exposing
 * setters everywhere would just add ceremony.
 */

import { getBookSlug, getCurrentChapterId } from './sidebar-helpers';
import { getReadSections, setReadSections } from './sidebar-storage';

let outlineSpyObserver: IntersectionObserver | null = null;
let outlineHeadingOrder: HTMLElement[] = [];
const outlineHeadingMap = new Map<string, HTMLElement>();
const outlineVisibleIds = new Set<string>();
let activeOutlineId: string | null = null;

/** Sections the reader has scrolled past in the current chapter.
 *  Once a heading has been the active outline item, every prior
 *  heading gets recorded here. The set is hydrated from localStorage
 *  on each chapter switch (see setupOutlineScrollSpy) so reopening a
 *  chapter immediately re-decorates already-read sections — and
 *  every new addition is persisted (see persistReadSections).
 *  Drives the .section-completed CSS class for "already read" rows. */
const sectionsRead = new Set<string>();

/** Write the current sectionsRead set to localStorage under the
 *  active book + chapter. Called whenever a new heading id joins the
 *  set. Best-effort — quota/private-mode failures are swallowed. */
function persistReadSections(): void {
  const book = getBookSlug();
  const chapterId = getCurrentChapterId();
  if (!book || chapterId == null) return;
  setReadSections(book, chapterId, sectionsRead);
}

/** Apply `.section-completed` to every outline `<li>` that matches the
 *  given heading id, both desktop and mobile. Idempotent — re-adding
 *  a class that's already present is a no-op. */
function markSectionRead(headingId: string): void {
  document.querySelectorAll(
    `.usb-sections li[data-heading-id="${headingId}"], #mobile-chapter-outline li[data-heading-id="${headingId}"]`,
  ).forEach(li => li.classList.add('section-completed'));
}

/** Strip every `.section-completed` mark from both desktop + mobile
 *  outlines. Called when the chapter (and therefore the section list)
 *  changes so completion marks don't bleed across chapters. */
function resetReadSections(): void {
  sectionsRead.clear();
  document.querySelectorAll(
    '.usb-sections li.section-completed, #mobile-chapter-outline li.section-completed',
  ).forEach(li => li.classList.remove('section-completed'));
}

/** External-facing reset for callers like the chapter reset button —
 *  clears in-memory state + DOM marks immediately. Storage is wiped
 *  separately by unmarkChapterComplete in sidebar-storage. The caller
 *  is expected to verify this is indeed the active chapter being
 *  reset; resetting marks for a non-active chapter would be a no-op
 *  in DOM but would still incorrectly clear our in-memory cache. */
export function clearActiveSectionMarks(): void {
  resetReadSections();
}

/** Register an outline `<li>` for a heading id so scroll-spy knows
 *  which row to highlight. Render code calls this once per section. */
export function registerOutlineEntry(headingId: string, li: HTMLElement): void {
  outlineHeadingMap.set(headingId, li);
}

/** Drop all heading registrations. Called before re-rendering an
 *  outline so stale entries don't survive. Also wipes the read-section
 *  marks since they're keyed by heading id of the previous chapter. */
export function clearOutlineRegistry(): void {
  outlineHeadingMap.clear();
  resetReadSections();
}

/**
 * Highlight the given heading id as active in the outline. If the
 * sidebar is internally scrollable and the active row is offscreen,
 * scrolls the sidebar (not the page) to bring the row into view.
 */
export function setActiveOutlineItem(id: string | null): void {
  if (activeOutlineId === id) return;
  activeOutlineId = id;

  document.querySelectorAll('.usb-sections li.active, #mobile-chapter-outline li.active')
    .forEach(li => li.classList.remove('active'));

  if (!id) return;

  document.querySelectorAll(
    `.usb-sections li[data-heading-id="${id}"], #mobile-chapter-outline li[data-heading-id="${id}"]`,
  ).forEach(li => li.classList.add('active'));

  /* Mark every heading BEFORE the new active one as read. We don't
     mark the current active itself — "you're reading it now" is a
     separate signal — but the moment activity moves to the next
     heading this one will be backfilled on the next call. We don't
     unmark when scrolling back up: once you've passed a section,
     you've read it for the rest of the session. */
  const activeIdx = outlineHeadingOrder.findIndex(h => h.id === id);
  if (activeIdx > 0) {
    let added = false;
    for (let i = 0; i < activeIdx; i++) {
      const headingId = outlineHeadingOrder[i].id;
      if (!sectionsRead.has(headingId)) {
        sectionsRead.add(headingId);
        markSectionRead(headingId);
        added = true;
      }
    }
    if (added) persistReadSections();
  }

  /* Auto-scroll the sidebar's own container so the active row stays
     visible during scroll-spy updates. We deliberately don't scroll
     the page — that would fight the user's actual scroll. */
  const sidebar = document.getElementById('unified-sidebar');
  const li = outlineHeadingMap.get(id);
  if (sidebar && li && sidebar.scrollHeight > sidebar.clientHeight) {
    const sRect = sidebar.getBoundingClientRect();
    const lRect = li.getBoundingClientRect();
    const margin = 60;
    if (lRect.top < sRect.top + margin) {
      sidebar.scrollTo({
        top: sidebar.scrollTop + (lRect.top - sRect.top) - margin,
        behavior: 'smooth',
      });
    } else if (lRect.bottom > sRect.bottom - margin) {
      sidebar.scrollTo({
        top: sidebar.scrollTop + (lRect.bottom - sRect.bottom) + margin,
        behavior: 'smooth',
      });
    }
  }
}

/**
 * Pick the most-active heading from current visibility info and
 * apply it. "Active zone" is the upper quarter of the viewport — a
 * heading activates as it crosses ~25% from the top, and stays
 * active until the next one arrives. If no headings are in the
 * active zone (e.g. the user is mid-section between two headings),
 * we fall back to the last one that has scrolled past the trigger.
 */
export function recomputeActiveOutline(): void {
  if (outlineHeadingOrder.length === 0) return;

  const firstVisible = outlineHeadingOrder.find(h => outlineVisibleIds.has(h.id));
  if (firstVisible) {
    setActiveOutlineItem(firstVisible.id);
    return;
  }

  const triggerY = window.innerHeight * 0.25;
  let candidate: HTMLElement | null = null;
  for (const h of outlineHeadingOrder) {
    const top = h.getBoundingClientRect().top;
    if (top <= triggerY) candidate = h;
    else break;
  }
  setActiveOutlineItem(candidate ? candidate.id : outlineHeadingOrder[0]?.id || null);
}

/**
 * (Re-)wire the IntersectionObserver to a new set of headings.
 * Disposes any previous observer first.
 *
 * The rootMargin "-15% 0px -60% 0px" defines an active band that
 * sits in the upper quarter of the viewport — once a heading scrolls
 * into that band it counts as visible. Out-of-band headings count as
 * not visible regardless of whether they're technically on screen.
 */
export function setupOutlineScrollSpy(headings: HTMLElement[]): void {
  if (outlineSpyObserver) {
    outlineSpyObserver.disconnect();
    outlineSpyObserver = null;
  }
  outlineVisibleIds.clear();
  outlineHeadingOrder = headings;
  activeOutlineId = null;
  resetReadSections();

  /* Hydrate from localStorage so previously-read sections of THIS
     chapter are marked immediately on chapter open, before the user
     scrolls anything. This is what makes clicking a chapter card
     feel "remembered" rather than starting fresh every visit. */
  const book = getBookSlug();
  const chapterId = getCurrentChapterId();
  if (book && chapterId != null) {
    const persisted = getReadSections(book, chapterId);
    persisted.forEach(headingId => {
      sectionsRead.add(headingId);
      markSectionRead(headingId);
    });
  }

  if (!('IntersectionObserver' in window) || headings.length === 0) return;

  outlineSpyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = (entry.target as HTMLElement).id;
      if (!id) return;
      if (entry.isIntersecting) outlineVisibleIds.add(id);
      else outlineVisibleIds.delete(id);
    });
    recomputeActiveOutline();
  }, {
    rootMargin: '-15% 0px -60% 0px',
    threshold: 0,
  });

  headings.forEach(h => outlineSpyObserver!.observe(h));
  recomputeActiveOutline();
}

/** Read-only access to the currently-active outline id. Used by the
 *  mobile drawer builder so it can preselect the right row. */
export function getActiveOutlineId(): string | null {
  return activeOutlineId;
}