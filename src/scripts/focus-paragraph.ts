/**
 * Focus Paragraph Mode
 *
 * The paragraph the reader is currently viewing → full opacity.
 * Everything else → dimmed to 35%.
 * Tracks scroll in real-time with IntersectionObserver.
 *
 * Activated via: body.focus-mode (toggled by ReadingControls FAB)
 * Works with: <p>, <h2>, <h3>, <h4>, <li>, <blockquote> inside .chapter-content
 */

const FOCUSED_OPACITY   = '1';
const DIMMED_OPACITY    = '0.3';
const TRANSITION        = 'opacity 0.25s ease';
const SELECTOR          = '.chapter-content p, .chapter-content h2, .chapter-content h3, .chapter-content h4, .chapter-content li, .chapter-content blockquote';

let currentFocused: Element | null = null;
let observer: IntersectionObserver | null = null;
let active = false;

// ── Apply / remove dimming ────────────────────────────────────────────────────

function applyDim(focused: Element | null): void {
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach(el => {
    el.style.transition = TRANSITION;
    el.style.opacity = el === focused ? FOCUSED_OPACITY : DIMMED_OPACITY;
  });
  currentFocused = focused;
}

function removeDim(): void {
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach(el => {
    el.style.transition = TRANSITION;
    el.style.opacity = FOCUSED_OPACITY;
  });
  currentFocused = null;
}

// ── IntersectionObserver — pick the topmost visible paragraph ─────────────────

function buildObserver(): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      if (!active) return;

      // Collect all currently intersecting elements
      const visible: { el: Element; top: number }[] = [];
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach(el => {
        const rect = el.getBoundingClientRect();
        // Is it in the "reading zone" — top third of viewport
        if (rect.top >= 0 && rect.top < window.innerHeight * 0.55) {
          visible.push({ el, top: rect.top });
        }
      });

      if (visible.length === 0) return;
      // Pick the one closest to top of viewport (what the reader is at)
      visible.sort((a, b) => a.top - b.top);
      const best = visible[0].el;
      if (best !== currentFocused) applyDim(best);
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] }
  );
}

function observeAll(): void {
  observer?.disconnect();
  observer = buildObserver();
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach(el => {
    observer!.observe(el);
  });
}

// ── Scroll fallback (throttled) ───────────────────────────────────────────────

let ticking = false;

function onScroll(): void {
  if (!active || ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    if (!elements.length) return;

    const viewMid = window.innerHeight * 0.4;
    let best: HTMLElement | null = null;
    let bestDist = Infinity;

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top - viewMid);
      if (dist < bestDist) { bestDist = dist; best = el; }
    });

    if (best && best !== currentFocused) applyDim(best);
  });
}

// ── Public toggle ─────────────────────────────────────────────────────────────

function enable(): void {
  active = true;
  observeAll();
  window.addEventListener('scroll', onScroll, { passive: true });
  // Trigger immediately
  onScroll();
}

function disable(): void {
  active = false;
  observer?.disconnect();
  window.removeEventListener('scroll', onScroll);
  removeDim();
}

// ── MutationObserver — re-observe on chapter swap ────────────────────────────

function watchFocusClass(): void {
  // Watch body class for focus-mode toggle
  new MutationObserver(() => {
    const nowActive = document.body.classList.contains('focus-mode');
    if (nowActive && !active) enable();
    else if (!nowActive && active) disable();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initFocusParagraph(): void {
  watchFocusClass();

  // If already in focus mode on init
  if (document.body.classList.contains('focus-mode')) enable();

  // Re-init on chapter swap
  window.addEventListener('chapter-content-swapped', () => {
    if (active) {
      disable();
      setTimeout(enable, 150);
    }
  });
}
