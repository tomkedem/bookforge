/**
 * Sidebar collapse — chromatic-shift toggle. Drives any number of
 * independent sidebars (right-side chapter list, left-side activity
 * rail) through a single shared rAF loop / event listener.
 *
 * Each instance toggles its own body class (e.g. `sidebar-collapsed`,
 * `left-sidebar-collapsed`) in response to clicks on elements
 * carrying its toggle attribute. While mid-transition it drives an
 * SVG <feColorMatrix> via rAF so the sidebar drains color → grayscale
 * (or back) over 500ms cubic-out, in lock-step with CSS transitions
 * on opacity, transform, and the reading-article margin.
 *
 * The filter is only attached during the animation window (via a
 * transient *-animating class) — outside it, the sidebar renders
 * without any filter cost. State persists in localStorage per-instance.
 */

const DURATION_MS = 500;

// Identity matrix (full color, no shift).
const IDENT: ReadonlyArray<number> = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

// Luminance grayscale. Standard ITU-R BT.709 coefficients on each
// of the R, G, B output channels — every channel becomes the same
// luma value, killing color while preserving brightness.
const GRAY: ReadonlyArray<number> = [
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
];

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface CollapseConfig {
  /** localStorage key for collapsed-state persistence. */
  storageKey: string;
  /** id of the <feColorMatrix> element to drive. */
  matrixId: string;
  /** body class applied while collapsed. */
  collapsedClass: string;
  /** body class applied during the 500ms animation window. */
  animatingClass: string;
  /** attribute that marks toggle buttons (no value = toggle, "collapse"/"expand" = explicit). */
  toggleAttr: string;
}

interface CollapseInstance {
  setCollapsed(collapsed: boolean, animated?: boolean): void;
  isCollapsed(): boolean;
}

function createCollapse(cfg: CollapseConfig): CollapseInstance {
  let raf: number | null = null;

  function setMatrix(t: number): void {
    // t: 0 = full color, 1 = full grayscale.
    const el = document.getElementById(cfg.matrixId);
    if (!el) return;
    const out = new Array(20);
    for (let i = 0; i < 20; i++) {
      out[i] = IDENT[i] + (GRAY[i] - IDENT[i]) * t;
    }
    el.setAttribute('values', out.join(' '));
  }

  function animateMatrix(from: number, to: number, onDone?: () => void): void {
    if (raf !== null) cancelAnimationFrame(raf);
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min(1, (now - start) / DURATION_MS);
      const eased = easeOutCubic(p);
      setMatrix(from + (to - from) * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
        onDone?.();
      }
    }
    raf = requestAnimationFrame(tick);
  }

  function syncAria(collapsed: boolean): void {
    document.querySelectorAll(`[${cfg.toggleAttr}]`).forEach((btn) => {
      btn.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  function isCollapsed(): boolean {
    return document.body.classList.contains(cfg.collapsedClass);
  }

  function setCollapsed(collapsed: boolean, animated: boolean = true): void {
    const body = document.body;
    syncAria(collapsed);

    try {
      localStorage.setItem(cfg.storageKey, collapsed ? '1' : '0');
    } catch (_) {
      /* storage may be unavailable in private mode — non-fatal */
    }

    if (!animated) {
      body.classList.toggle(cfg.collapsedClass, collapsed);
      setMatrix(collapsed ? 1 : 0);
      return;
    }

    // Mark animating so CSS can opt-in the SVG filter cost only here.
    body.classList.add(cfg.animatingClass);
    body.classList.toggle(cfg.collapsedClass, collapsed);
    animateMatrix(
      collapsed ? 0 : 1,
      collapsed ? 1 : 0,
      () => body.classList.remove(cfg.animatingClass),
    );
  }

  function onClick(e: Event): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const btn = target.closest<HTMLElement>(`[${cfg.toggleAttr}]`);
    if (!btn) return;
    e.preventDefault();
    const action = btn.getAttribute(cfg.toggleAttr);
    if (action === 'collapse') setCollapsed(true, true);
    else if (action === 'expand') setCollapsed(false, true);
    else setCollapsed(!isCollapsed(), true);
  }

  function bootstrap(): void {
    let saved = false;
    try {
      saved = localStorage.getItem(cfg.storageKey) === '1';
    } catch (_) {
      /* non-fatal */
    }
    if (saved) setCollapsed(true, false);
    else syncAria(false);

    document.addEventListener('click', onClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }

  return { setCollapsed, isCollapsed };
}

// ─── Right-side unified sidebar (chapter list / TOC) ──────────────
export const rightSidebar = createCollapse({
  storageKey: 'yuval-sidebar-collapsed',
  matrixId: 'sidebar-chromatic-matrix',
  collapsedClass: 'sidebar-collapsed',
  animatingClass: 'sidebar-animating',
  toggleAttr: 'data-sidebar-toggle',
});

// ─── Left-side activity rail (reading tools) ──────────────────────
export const leftSidebar = createCollapse({
  storageKey: 'yuval-left-sidebar-collapsed',
  matrixId: 'left-sidebar-chromatic-matrix',
  collapsedClass: 'left-sidebar-collapsed',
  animatingClass: 'left-sidebar-animating',
  toggleAttr: 'data-left-sidebar-toggle',
});
