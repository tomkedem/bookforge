/**
 * Keyboard navigation for the reading experience.
 *
 * Shortcuts:
 *   ← / →     Previous / next chapter (respects RTL)
 *   F          Toggle immersive (focus) reading mode
 *   H          Open highlights panel
 *   S          Open reading stats
 *   B          Open bookmarks panel
 *   /          Open search
 *   Escape     Exit immersive mode / close open panels
 */

const TOAST_DURATION = 1800; // ms

let toastEl: HTMLElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function getToast(): HTMLElement {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'kbd-nav-toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  return toastEl;
}

function showToast(msg: string) {
  const el = getToast();
  el.textContent = msg;
  el.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), TOAST_DURATION);
}

function getNavUrl(dir: 'prev' | 'next'): string | null {
  const link = document.querySelector<HTMLAnchorElement>(
    `.chapter-nav-link[data-nav="${dir}"]`
  );
  return link?.href || null;
}

async function navigate(dir: 'prev' | 'next') {
  const url = getNavUrl(dir);
  if (!url) return;

  const loadFn = (window as any).yuvalLoadChapter as
    | ((url: string) => Promise<void>)
    | undefined;

  const arrow = dir === 'next' ? '→' : '←';
  const chapterNum = url.match(/\/(\d+)(?:\?|$)/)?.[1];
  showToast(`${arrow}  Chapter ${chapterNum ?? ''}`);

  if (loadFn) {
    await loadFn(url);
  } else {
    window.location.href = url;
  }
}

export function initKeyboardNav(signal: AbortSignal) {
  // Inject toast styles once
  if (!document.getElementById('kbd-nav-styles')) {
    const style = document.createElement('style');
    style.id = 'kbd-nav-styles';
    style.textContent = `
      #kbd-nav-toast {
        position: fixed;
        bottom: 88px;
        left: 50%;
        transform: translateX(-50%) translateY(8px);
        background: var(--yuval-surface, #1e1e1e);
        color: var(--yuval-text, #ededed);
        border: 1px solid var(--yuval-border, #333);
        border-radius: 8px;
        padding: 8px 18px;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.02em;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease, transform 0.2s ease;
        z-index: 9999;
        white-space: nowrap;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      }
      #kbd-nav-toast.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

  const handler = async (e: KeyboardEvent) => {
    // Skip when typing in inputs
    const target = e.target as HTMLElement;
    if (
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
      target.isContentEditable
    ) return;

    // Skip modifier combos
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const isRtl = document.documentElement.dir === 'rtl';

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        await navigate(isRtl ? 'prev' : 'next');
        break;

      case 'ArrowLeft':
        e.preventDefault();
        await navigate(isRtl ? 'next' : 'prev');
        break;

      case 'f':
      case 'F': {
        const isImmersive = document.body.classList.toggle('reading-immersive');
        showToast(isImmersive ? '⬛  Focus mode' : '⬜  Normal mode');
        break;
      }

      case 'h':
      case 'H': {
        const hlBtn = document.getElementById('hl-panel-fab-btn');
        if (hlBtn) { hlBtn.click(); showToast('💡  Highlights'); }
        break;
      }

      case 's':
      case 'S': {
        const statsBtn = document.getElementById('stats-fab-btn');
        if (statsBtn) { statsBtn.click(); showToast('📊  Stats'); }
        break;
      }

      case 'b':
      case 'B': {
        const bmBtn = document.getElementById('bm-fab-btn');
        if (bmBtn) { bmBtn.click(); showToast('🔖  Bookmarks'); }
        break;
      }

      case 'Escape':
        if (document.body.classList.contains('reading-immersive')) {
          document.body.classList.remove('reading-immersive');
          showToast('⬜  Normal mode');
        }
        break;
    }
  };

  document.addEventListener('keydown', handler, { signal });
}
