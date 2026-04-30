import { t, type TranslationKey, getI18nDirection } from '../i18n';
import {
  getLang,
  getCurrentBook,
  getCurrentChapter,
  getContentRoot,
  resolveChapterTitleByTitles,
  waitForContentReady,
  parseChapterKey,
  type ChapterKey,
} from './reading-location';

// ── Language ────────────────────────────────────────────────────────────────

function tr(key: TranslationKey, params?: Record<string, string | number>): string {
  return t(key, getLang(), params);
}

function getDir(): 'rtl' | 'ltr' {
  return getI18nDirection(getLang());
}

// ── Highlight types ─────────────────────────────────────────────────────────

type HighlightColor = 'yellow' | 'blue' | 'green' | 'pink';

function isHighlightColor(v: string): v is HighlightColor {
  return v === 'yellow' || v === 'blue' || v === 'green' || v === 'pink';
}

// ── Types ───────────────────────────────────────────────────────────────────

interface HighlightData {
  id: string;
  text: string;
  color: string;
  timestamp: number;
  note?: string;
  anchor?: string;
  sectionHeading?: string;
}

interface ChapterHighlights {
  chapterId: ChapterKey;
  highlights: HighlightData[];
}

const PENDING_HL_KEY = 'yuval_pending_highlight';

declare global {
  interface Window {
    yuvalLoadChapter?: (url: string) => Promise<void> | void;
  }
}

// ── Colors ──────────────────────────────────────────────────────────────────

/* Inline SVG icons (line-art, stroke-currentColor) replace the legacy
   emoji set. Each is sized 16×16 with a 24×24 viewBox so the strokes
   render at ~1.33 px optical weight — refined enough for the small
   panel scale, bold enough not to dissolve.
   - yellow  → lightbulb (insight)
   - blue    → help circle (question)
   - green   → check (verified)
   - pink    → quote (commentary) */
const COLOR_SVG: Record<HighlightColor, string> = {
  yellow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  blue:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
  green:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  pink:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,
};

/* Glass-tint backgrounds: each highlight card is a soft diagonal
   gradient of its category hue rather than a flat colour wash.
   Top-left of the card holds the most saturated tint; it fades to
   near-transparent at bottom-right, which lets the panel surface
   show through and creates a "light catches the corner" feel.
   Lower max-opacity than the legacy flat fills so the gold rim
   we added in CSS becomes the dominant visual cue, not the colour
   wash. */
const COLOR_BG: Record<HighlightColor, string> = {
  yellow: 'linear-gradient(135deg, rgba(234,179,8,0.18) 0%, rgba(234,179,8,0.05) 100%)',
  blue:   'linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.04) 100%)',
  green:  'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.05) 100%)',
  pink:   'linear-gradient(135deg, rgba(236,72,153,0.16) 0%, rgba(236,72,153,0.04) 100%)',
};

const COLOR_DARK_BG: Record<HighlightColor, string> = {
  yellow: 'linear-gradient(135deg, rgba(234,179,8,0.14) 0%, rgba(234,179,8,0.03) 100%)',
  blue:   'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.03) 100%)',
  green:  'linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0.03) 100%)',
  pink:   'linear-gradient(135deg, rgba(236,72,153,0.14) 0%, rgba(236,72,153,0.03) 100%)',
};

const COLOR_TEXT: Record<HighlightColor, string> = {
  yellow: '#713f12',
  blue: '#1e3a8a',
  green: '#14532d',
  pink: '#831843',
};

const COLOR_DARK_TEXT: Record<HighlightColor, string> = {
  yellow: '#fde68a',
  blue: '#93c5fd',
  green: '#86efac',
  pink: '#f9a8d4',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showHlToast(msg: string): void {
  const el = document.createElement('div');
  el.className = 'bm-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 300);
  }, 1800);
}

function countHighlights(): number {
  return getAllHighlights().reduce((sum, c) => sum + c.highlights.length, 0);
}

function updateBadge(): void {
  const badge = document.getElementById('highlights-fab-badge');
  if (!badge) return;
  const total = countHighlights();
  badge.textContent = String(total);
  badge.style.display = total > 0 ? '' : 'none';
}

function getAllHighlights(): ChapterHighlights[] {
  const book = getCurrentBook();
  if (!book) return [];

  const lang = getLang();
  // Legacy keys have no _lang suffix; new keys end with _<lang>.
  const pattern = new RegExp(`^yuval_hl_${escapeRegex(book)}_ch([^_]+)(?:_(.+))?$`);
  const result: ChapterHighlights[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const m = key.match(pattern);
    if (!m) continue;

    const keyLang = m[2];
    // If key is language-scoped, show only highlights for current language.
    if (keyLang && keyLang !== lang) continue;

    const chapterId = parseChapterKey(m[1]);

    try {
      const list: HighlightData[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (list.length) result.push({ chapterId, highlights: list });
    } catch {}
  }

  return result.sort((a, b) => {
    const an = typeof a.chapterId === 'number';
    const bn = typeof b.chapterId === 'number';
    if (an && bn) return (a.chapterId as number) - (b.chapterId as number);
    if (an !== bn) return an ? 1 : -1; // non-numeric (e.g. "intro") first
    return String(a.chapterId).localeCompare(String(b.chapterId));
  });
}

// ── Chapter label ───────────────────────────────────────────────────────────

function formatHighlightChapterLabel(chapterId: ChapterKey): string {
  if (!chapterId && chapterId !== 0) return tr('bookmarks.chapterUnknown');

  const sameBook = !!getCurrentBook();
  const title = resolveChapterTitleByTitles(undefined, chapterId, sameBook);
  const numberLabel = tr('highlights.chapter', { n: chapterId });
  return title ? `${numberLabel} · ${title}` : numberLabel;
}

// ── Navigation ──────────────────────────────────────────────────────────────

function scrollToHighlightTarget(hl: HighlightData): boolean {
  const root = getContentRoot() || document;

  const byId = root.querySelector<HTMLElement>(`[data-hl-id="${CSS.escape(hl.id)}"]`);
  if (byId) {
    byId.scrollIntoView({ behavior: 'smooth', block: 'center' });
    byId.classList.add('hl-pulse');
    setTimeout(() => byId.classList.remove('hl-pulse'), 1600);
    return true;
  }

  if (hl.anchor) {
    const byAnchor = root.querySelector<HTMLElement>(`[data-bm-anchor="${CSS.escape(hl.anchor)}"]`);
    if (byAnchor) {
      byAnchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      byAnchor.classList.add('hl-pulse');
      setTimeout(() => byAnchor.classList.remove('hl-pulse'), 1600);
      showHlToast(tr('bookmarks.approximate'));
      return true;
    }
  }

  const firstHead = (root as Document | HTMLElement)
    .querySelector<HTMLElement>('#chapter-container h2, #chapter-container h3');
  if (firstHead) {
    firstHead.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showHlToast(tr('bookmarks.approximate'));
    return true;
  }

  showHlToast(tr('bookmarks.approximate'));
  return false;
}

async function navigateToHighlight(hl: HighlightData, chapterId: ChapterKey): Promise<void> {
  const book = getCurrentBook();
  if (!chapterId && chapterId !== 0) {
    showHlToast(tr('bookmarks.chapterUnknown'));
    return;
  }

  const sameChapter = chapterId === getCurrentChapter();

  if (!sameChapter) {
    const url = `/read/${book}/${chapterId}`;
    if (typeof window.yuvalLoadChapter === 'function') {
      await window.yuvalLoadChapter(url);
    } else {
      try {
        sessionStorage.setItem(PENDING_HL_KEY, JSON.stringify({ id: hl.id, anchor: hl.anchor, chapterId, book }));
      } catch {}
      window.location.href = url;
      return;
    }
  }

  await waitForContentReady();
  scrollToHighlightTarget(hl);
  closePanel();
}

function consumePendingHighlight(): void {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(PENDING_HL_KEY);
    if (raw) sessionStorage.removeItem(PENDING_HL_KEY);
  } catch {
    return;
  }
  if (!raw) return;

  let pending: { id: string; anchor?: string; chapterId: ChapterKey; book: string };
  try {
    pending = JSON.parse(raw);
  } catch {
    return;
  }
  if (!pending || pending.book !== getCurrentBook() || pending.chapterId !== getCurrentChapter()) return;

  waitForContentReady().then(() => {
    scrollToHighlightTarget({
      id: pending.id,
      text: '',
      color: 'yellow',
      timestamp: 0,
      anchor: pending.anchor,
    });
  });
}

// ── Panel ───────────────────────────────────────────────────────────────────

function renderPanel(): void {
  const panel = document.getElementById('hl-panel');
  if (!panel) return;

  const isDark = document.documentElement.classList.contains('dark');
  const chapters = getAllHighlights();

  panel.setAttribute('dir', getDir());

  panel.innerHTML = `
    <div id="hl-panel-header">
      <span>${tr('highlights.title')}</span>
      <button id="hl-panel-close">✕</button>
    </div>
    <div id="hl-panel-body"></div>
  `;

  document.getElementById('hl-panel-close')?.addEventListener('click', closePanel);

  const body = document.getElementById('hl-panel-body')!;

  if (!chapters.length) {
    body.innerHTML = `
      <div class="hl-panel-empty">
        <svg class="empty-illustration" viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <linearGradient id="hl-empty-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="100%" stop-color="#fbbf24"/>
            </linearGradient>
          </defs>
          <rect x="22" y="40" width="76" height="48" rx="4" fill="url(#hl-empty-grad)" opacity="0.55"/>
          <path d="M30 52 H86 M30 62 H78 M30 72 H82" stroke="#92400e" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
          <g transform="translate(70 22) rotate(25)">
            <rect x="0" y="0" width="10" height="48" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
            <path d="M0 44 L10 44 L5 54 Z" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
            <rect x="0" y="0" width="10" height="10" fill="#fbbf24"/>
          </g>
        </svg>
        <div class="empty-title">${tr('empty.highlights.title')}</div>
        <div class="empty-body">${tr('empty.highlights.body')}</div>
        <div class="empty-cta">${tr('empty.highlights.cta')}</div>
      </div>
    `;
    return;
  }

  chapters.forEach(({ chapterId, highlights }) => {
    const group = document.createElement('div');
    const chapterLabel = formatHighlightChapterLabel(chapterId);
    group.innerHTML = `<div class="hl-chapter-label">${escapeHtml(chapterLabel)}</div>`;

    highlights.forEach(hl => {
      const color: HighlightColor = isHighlightColor(hl.color) ? hl.color : 'yellow';

      const bg = isDark ? COLOR_DARK_BG[color] : COLOR_BG[color];
      const text = isDark ? COLOR_DARK_TEXT[color] : COLOR_TEXT[color];
      const iconSvg = COLOR_SVG[color];

      const item = document.createElement('div');
      item.className = 'hl-item';
      item.style.background = bg;
      item.style.cursor = 'pointer';
      item.setAttribute('role', 'button');
      item.tabIndex = 0;

      const meta = hl.sectionHeading
        ? `${chapterLabel} › ${hl.sectionHeading}`
        : chapterLabel;

      /* Icon span inherits the highlight's text color via inline style
         so the SVG's `stroke="currentColor"` picks up the per-category
         hue (warm-amber, blue, green, magenta) automatically. */
      item.innerHTML = `
        <span class="hl-icon" style="color:${text}">${iconSvg}</span>
        <div>
          <div style="color:${text}">${escapeHtml(hl.text)}</div>
          <div class="hl-item-meta">${escapeHtml(meta)}</div>
        </div>
      `;

      const go = () => { navigateToHighlight(hl, chapterId); };
      item.addEventListener('click', go);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });

      group.appendChild(item);
    });

    body.appendChild(group);
  });
}

// ── Open / Close ────────────────────────────────────────────────────────────

function openPanel(): void {
  renderPanel();
  document.getElementById('hl-overlay')?.classList.add('open');
  document.getElementById('hl-panel')?.classList.add('open');
}

function closePanel(): void {
  document.getElementById('hl-overlay')?.classList.remove('open');
  document.getElementById('hl-panel')?.classList.remove('open');
}

// ── Init ────────────────────────────────────────────────────────────────────

function applyLabels(btn: HTMLButtonElement): void {
  btn.setAttribute('aria-label', tr('aria.highlights'));
  btn.title = tr('aria.highlights');
}

export function initHighlightsPanel(): void {
  if (document.getElementById('highlights-fab')) return;

  const btn = document.createElement('button');
  btn.id = 'highlights-fab';
  btn.type = 'button';
  btn.textContent = '💡';
  applyLabels(btn);
  btn.onclick = openPanel;

  const badge = document.createElement('span');
  badge.id = 'highlights-fab-badge';
  badge.className = 'yuval-fab-badge';
  badge.style.display = 'none';
  btn.appendChild(badge);

  document.body.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.id = 'hl-overlay';
  overlay.addEventListener('click', closePanel);
  document.body.appendChild(overlay);

  const panel = document.createElement('div');
  panel.id = 'hl-panel';
  document.body.appendChild(panel);

  updateBadge();

  const onChange = () => {
    updateBadge();
    if (panel.classList.contains('open')) renderPanel();
  };

  window.addEventListener('yuval-highlights-changed', onChange);
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('yuval_hl_')) onChange();
  });

  window.addEventListener('language-changed', () => {
    applyLabels(btn);
    updateBadge();
    if (panel.classList.contains('open')) renderPanel();
  });

  window.addEventListener('chapter-content-swapped', () => {
    updateBadge();
    consumePendingHighlight();
  });

  consumePendingHighlight();
}