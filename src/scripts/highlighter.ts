/**
 * Highlight system for Yuval reading platform.
 *
 * Features:
 *  - Select text → floating toolbar with 4 color categories
 *  - Highlights saved to localStorage per book/chapter/language
 *  - Auto-restored on page load and chapter navigation
 *  - Click existing highlight → remove it
 */

// ── Types ────────────────────────────────────────────────────────────────────

const COLORS = {
  yellow: { label: 'Insight',  emoji: '💡' },
  blue:   { label: 'Question', emoji: '❓' },
  green:  { label: 'Action',   emoji: '✅' },
  pink:   { label: 'Quote',    emoji: '💬' },
} as const;

type ColorKey = keyof typeof COLORS;

interface HighlightData {
  id: string;
  text: string;
  color: ColorKey;
  timestamp: number;
}

// ── Storage ──────────────────────────────────────────────────────────────────

function storageKey(book: string, chapter: string, lang: string): string {
  return `yuval_hl_${book}_ch${chapter}_${lang}`;
}

function loadHighlights(book: string, chapter: string, lang: string): HighlightData[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(book, chapter, lang)) || '[]');
  } catch {
    return [];
  }
}

function saveHighlights(book: string, chapter: string, lang: string, list: HighlightData[]): void {
  localStorage.setItem(storageKey(book, chapter, lang), JSON.stringify(list));
}

// ── Context helpers ───────────────────────────────────────────────────────────

function getPageContext(): { book: string; chapter: string; lang: string } | null {
  const container = document.getElementById('chapter-container');
  if (!container) return null;
  const book = container.dataset.book || '';
  const chapter = container.dataset.chapterId || '';
  const lang = new URLSearchParams(window.location.search).get('lang')
    || localStorage.getItem('yuval_language') || 'en';
  return { book, chapter, lang };
}

function getContentEl(): Element | null {
  const ctx = getPageContext();
  if (!ctx) return null;
  const container = document.getElementById('chapter-container');
  return container?.querySelector(`[data-lang="${ctx.lang}"]`) ?? container;
}

// ── DOM: apply a single highlight ─────────────────────────────────────────────

function applyHighlight(hl: HighlightData, contentEl: Element): boolean {
  if (!hl.text.trim()) return false;

  const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Skip already-highlighted nodes and code blocks
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('.yuval-hl, pre, code')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent || '';
    const idx = text.indexOf(hl.text);
    if (idx === -1) continue;

    const mark = document.createElement('mark');
    mark.className = `yuval-hl yuval-hl-${hl.color}`;
    mark.dataset.hlId = hl.id;
    mark.dataset.hlColor = hl.color;
    mark.title = COLORS[hl.color].label;
    mark.textContent = hl.text;

    const parent = node.parentNode!;
    if (idx > 0) parent.insertBefore(document.createTextNode(text.slice(0, idx)), node);
    parent.insertBefore(mark, node);
    if (idx + hl.text.length < text.length) {
      parent.insertBefore(document.createTextNode(text.slice(idx + hl.text.length)), node);
    }
    parent.removeChild(node);
    return true;
  }
  return false;
}

// ── DOM: restore all highlights ───────────────────────────────────────────────

function restoreHighlights(): void {
  const ctx = getPageContext();
  if (!ctx) return;
  const contentEl = getContentEl();
  if (!contentEl) return;

  // Clear existing mark elements first (avoid duplication on re-init)
  contentEl.querySelectorAll('.yuval-hl').forEach(el => {
    const parent = el.parentNode!;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  });

  const highlights = loadHighlights(ctx.book, ctx.chapter, ctx.lang);
  highlights.forEach(hl => applyHighlight(hl, contentEl));
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

let toolbar: HTMLElement | null = null;

function createToolbar(): HTMLElement {
  const el = document.createElement('div');
  el.id = 'hl-toolbar';
  el.setAttribute('role', 'toolbar');
  el.setAttribute('aria-label', 'Highlight options');
  el.innerHTML = `
    <span class="hl-toolbar-label">Highlight</span>
    <div class="hl-colors">
      ${(Object.entries(COLORS) as [ColorKey, typeof COLORS[ColorKey]][]).map(([color, meta]) => `
        <button class="hl-dot hl-dot-${color}" data-color="${color}" title="${meta.label}" type="button" aria-label="${meta.label}">
          <span class="hl-dot-ring"></span>
        </button>
      `).join('')}
    </div>
  `;
  document.body.appendChild(el);
  return el;
}

function getToolbar(): HTMLElement {
  if (!toolbar || !document.body.contains(toolbar)) {
    toolbar = createToolbar();
  }
  return toolbar;
}

function showToolbar(rect: DOMRect): void {
  const tb = getToolbar();
  tb.classList.add('visible');

  // Position above selection, centered
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const tbWidth = 200; // approx, toolbar uses max-content
  const top = rect.top + scrollY - 48;
  const left = rect.left + scrollX + rect.width / 2 - tbWidth / 2;

  tb.style.top = `${Math.max(scrollY + 8, top)}px`;
  tb.style.left = `${Math.max(8, left)}px`;
}

function hideToolbar(): void {
  toolbar?.classList.remove('visible');
}

// ── Remove tooltip (shown on highlight click) ─────────────────────────────────

let removeTooltip: HTMLElement | null = null;

function showRemoveTooltip(markEl: HTMLElement): void {
  if (!removeTooltip) {
    removeTooltip = document.createElement('div');
    removeTooltip.id = 'hl-remove-tooltip';
    removeTooltip.innerHTML = `<button type="button" id="hl-remove-btn">✕ Remove</button>`;
    document.body.appendChild(removeTooltip);
  }

  const rect = markEl.getBoundingClientRect();
  removeTooltip.style.top = `${rect.top + window.scrollY - 40}px`;
  removeTooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
  removeTooltip.classList.add('visible');

  const btn = removeTooltip.querySelector<HTMLButtonElement>('#hl-remove-btn')!;
  btn.onclick = () => {
    const hlId = markEl.dataset.hlId;
    if (!hlId) return;
    removeHighlight(hlId);
    removeTooltip?.classList.remove('visible');
  };
}

function hideRemoveTooltip(): void {
  removeTooltip?.classList.remove('visible');
}

function removeHighlight(hlId: string): void {
  const ctx = getPageContext();
  if (!ctx) return;

  // Remove from DOM
  const mark = document.querySelector<HTMLElement>(`[data-hl-id="${hlId}"]`);
  if (mark) {
    const parent = mark.parentNode!;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  }

  // Remove from storage
  const list = loadHighlights(ctx.book, ctx.chapter, ctx.lang);
  saveHighlights(ctx.book, ctx.chapter, ctx.lang, list.filter(h => h.id !== hlId));
}

// ── CSS injection ─────────────────────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('hl-styles')) return;
  const style = document.createElement('style');
  style.id = 'hl-styles';
  style.textContent = `
    /* ── Highlight marks ── */
    .yuval-hl {
      border-radius: 3px;
      padding: 1px 0;
      cursor: pointer;
      transition: filter 0.15s;
      text-decoration: none;
    }
    .yuval-hl:hover { filter: brightness(0.92); }

    .yuval-hl-yellow { background: #fef08a; color: #713f12; }
    .yuval-hl-blue   { background: #bfdbfe; color: #1e3a8a; }
    .yuval-hl-green  { background: #bbf7d0; color: #14532d; }
    .yuval-hl-pink   { background: #fecdd3; color: #881337; }

    :is(.dark) .yuval-hl-yellow { background: #854d0e55; color: #fef08a; }
    :is(.dark) .yuval-hl-blue   { background: #1e40af55; color: #bfdbfe; }
    :is(.dark) .yuval-hl-green  { background: #14532d55; color: #bbf7d0; }
    :is(.dark) .yuval-hl-pink   { background: #9f123955; color: #fecdd3; }

    /* ── Floating toolbar ── */
    #hl-toolbar {
      position: absolute;
      z-index: 9998;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: var(--yuval-surface, #fff);
      border: 1px solid var(--yuval-border, #e5e7eb);
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08);
      opacity: 0;
      pointer-events: none;
      transform: translateY(4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      white-space: nowrap;
    }
    #hl-toolbar.visible {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .hl-toolbar-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--yuval-text-muted, #9ca3af);
      padding-right: 4px;
      border-right: 1px solid var(--yuval-border, #e5e7eb);
    }

    .hl-colors {
      display: flex;
      gap: 4px;
    }

    .hl-dot {
      position: relative;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
    }
    .hl-dot:hover { transform: scale(1.2); }
    .hl-dot:active { transform: scale(0.9); }

    .hl-dot-yellow { background: #fef08a; }
    .hl-dot-blue   { background: #bfdbfe; }
    .hl-dot-green  { background: #bbf7d0; }
    .hl-dot-pink   { background: #fecdd3; }

    .hl-dot-ring {
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      border: 2px solid transparent;
      transition: border-color 0.15s;
    }
    .hl-dot:hover .hl-dot-ring { border-color: currentColor; opacity: 0.4; }

    /* ── Remove tooltip ── */
    #hl-remove-tooltip {
      position: absolute;
      z-index: 9999;
      transform: translateX(-50%);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s;
    }
    #hl-remove-tooltip.visible {
      opacity: 1;
      pointer-events: auto;
    }
    #hl-remove-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 12px;
      background: #ef4444;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(239,68,68,0.35);
      transition: background 0.15s;
      white-space: nowrap;
    }
    #hl-remove-btn:hover { background: #dc2626; }
  `;
  document.head.appendChild(style);
}

// ── Main init ─────────────────────────────────────────────────────────────────

export function initHighlighter(signal: AbortSignal): void {
  injectStyles();
  restoreHighlights();

  // Re-restore when chapter content is swapped via fetch
  window.addEventListener('chapter-content-swapped', restoreHighlights, { signal });

  // ── Selection handler: show toolbar ──
  document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      hideToolbar();
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 2) { hideToolbar(); return; }

    // Only trigger inside the reading content
    const contentEl = getContentEl();
    if (!contentEl) return;
    const range = selection.getRangeAt(0);
    if (!contentEl.contains(range.commonAncestorContainer)) {
      hideToolbar();
      return;
    }

    // Don't highlight inside code blocks
    if (range.commonAncestorContainer.parentElement?.closest('pre, code')) {
      hideToolbar();
      return;
    }

    const rect = range.getBoundingClientRect();
    showToolbar(rect);
  }, { signal });

  // ── Toolbar color click: save & apply highlight ──
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.hl-dot[data-color]');
    if (!btn) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (!text) return;

    const ctx = getPageContext();
    if (!ctx) return;

    const color = btn.dataset.color as ColorKey;
    const hl: HighlightData = {
      id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text,
      color,
      timestamp: Date.now(),
    };

    const contentEl = getContentEl();
    if (!contentEl) return;

    selection.removeAllRanges();
    hideToolbar();

    const applied = applyHighlight(hl, contentEl);
    if (applied) {
      const list = loadHighlights(ctx.book, ctx.chapter, ctx.lang);
      list.push(hl);
      saveHighlights(ctx.book, ctx.chapter, ctx.lang, list);
    }
  }, { signal });

  // ── Click existing highlight: show remove option ──
  document.addEventListener('click', (e) => {
    const mark = (e.target as HTMLElement).closest<HTMLElement>('.yuval-hl');
    if (mark) {
      e.stopPropagation();
      showRemoveTooltip(mark);
      return;
    }

    // Click outside — hide remove tooltip and toolbar
    if (!(e.target as HTMLElement).closest('#hl-remove-tooltip, #hl-toolbar')) {
      hideRemoveTooltip();
      if (!(e.target as HTMLElement).closest('.hl-dot')) {
        hideToolbar();
      }
    }
  }, { signal });

  // ── Hide toolbar on scroll ──
  window.addEventListener('scroll', hideToolbar, { signal, passive: true });
}
