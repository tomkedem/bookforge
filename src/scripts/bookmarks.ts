/**
 * Bookmarks — dynamic i18n version
 */

import { t, getI18nDirection, resolveLanguage } from '../i18n';

// ── Language ────────────────────────────────────────────────────────────────

function getLang(): string {
  return resolveLanguage(
    new URLSearchParams(window.location.search).get('lang')
      || localStorage.getItem('yuval_language')
      || 'en'
  );
}

function tr(key: string, params?: Record<string, string | number>): string {
  return t(key, getLang(), params);
}

function getDir(): 'rtl' | 'ltr' {
  return getI18nDirection(getLang());
}

// ── Context ─────────────────────────────────────────────────────────────────

function getCurrentBook(): string {
  return document.getElementById('chapter-container')?.dataset.book || '';
}

function getCurrentChapter(): number {
  return parseInt(
    document.getElementById('chapter-container')?.dataset.chapterId || '0', 10
  );
}

// ── Types ───────────────────────────────────────────────────────────────────

interface Bookmark {
  id: string;
  chapterId: number;
  text: string;
  scrollY: number;
  timestamp: number;
}

// ── Storage ─────────────────────────────────────────────────────────────────

function storageKey(book: string): string {
  return `yuval_bookmarks_${book}`;
}

function loadBookmarks(book: string): Bookmark[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(book)) || '[]');
  } catch {
    return [];
  }
}

function saveBookmarks(book: string, list: Bookmark[]): void {
  localStorage.setItem(storageKey(book), JSON.stringify(list));
}

// ── Core logic ──────────────────────────────────────────────────────────────

function addBookmark(el: Element): void {
  const book = getCurrentBook();
  const chapterId = getCurrentChapter();
  const text = (el.textContent || '').trim().slice(0, 100);
  if (!text) return;

  const list = loadBookmarks(book);

  if (list.some(b => b.chapterId === chapterId && b.text === text)) {
    removeBookmarkByText(text, chapterId);
    return;
  }

  const bm: Bookmark = {
    id: `bm_${Date.now()}`,
    chapterId,
    text,
    scrollY: window.scrollY,
    timestamp: Date.now(),
  };

  list.push(bm);
  saveBookmarks(book, list);

  showToast(tr('bookmarks.saved'));
  updateBadge();
}

function removeBookmarkByText(text: string, chapterId: number): void {
  const book = getCurrentBook();
  const list = loadBookmarks(book).filter(
    b => !(b.chapterId === chapterId && b.text === text)
  );
  saveBookmarks(book, list);
  updateBadge();
}

function removeBookmark(id: string): void {
  const book = getCurrentBook();
  const list = loadBookmarks(book).filter(b => b.id !== id);
  saveBookmarks(book, list);
  updateBadge();
}

// ── Toast ───────────────────────────────────────────────────────────────────

function showToast(msg: string): void {
  const tEl = document.createElement('div');
  tEl.className = 'bm-toast';
  tEl.textContent = msg;
  document.body.appendChild(tEl);

  requestAnimationFrame(() => tEl.classList.add('visible'));

  setTimeout(() => {
    tEl.classList.remove('visible');
    setTimeout(() => tEl.remove(), 300);
  }, 1800);
}

// ── Badge ───────────────────────────────────────────────────────────────────

function updateBadge(): void {
  const badge = document.getElementById('bm-fab-badge');
  if (!badge) return;

  const total = loadBookmarks(getCurrentBook()).length;
  badge.textContent = String(total);
  badge.style.display = total > 0 ? '' : 'none';
}

// ── Panel ───────────────────────────────────────────────────────────────────

function openPanel(): void {
  renderPanel();
  document.getElementById('bm-overlay')?.classList.add('open');
  document.getElementById('bm-panel')?.classList.add('open');
}

function closePanel(): void {
  document.getElementById('bm-overlay')?.classList.remove('open');
  document.getElementById('bm-panel')?.classList.remove('open');
}

function renderPanel(): void {
  const panel = document.getElementById('bm-panel');
  if (!panel) return;

  const book = getCurrentBook();
  const bookmarks = loadBookmarks(book);

  panel.setAttribute('dir', getDir());

  panel.innerHTML = `
    <div id="bm-panel-header">
      <span>🔖 ${tr('bookmarks.title')}</span>
      <button id="bm-close">✕</button>
    </div>
    <div id="bm-body"></div>
  `;

  document.getElementById('bm-close')?.addEventListener('click', closePanel);

  const body = document.getElementById('bm-body')!;

  if (!bookmarks.length) {
    body.innerHTML = `
      <div class="bm-empty">
        <div>${tr('bookmarks.empty')}</div>
        <div>${tr('bookmarks.emptyHint')}</div>
      </div>
    `;
    return;
  }

  bookmarks.forEach(bm => {
    const item = document.createElement('div');
    item.className = 'bm-item';

    item.innerHTML = `
      <div>${bm.text}</div>
      <div>${tr('bookmarks.chapter', { n: bm.chapterId })}</div>
    `;

    item.onclick = () => {
      window.scrollTo({ top: bm.scrollY, behavior: 'smooth' });
      closePanel();
    };

    body.appendChild(item);
  });
}

// ── Init ────────────────────────────────────────────────────────────────────

export function initBookmarks(signal: AbortSignal): void {
  const fab = document.createElement('button');
  fab.id = 'bm-fab-btn';
  fab.textContent = '🔖';
  document.body.appendChild(fab);

  const overlay = document.createElement('div');
  overlay.id = 'bm-overlay';
  document.body.appendChild(overlay);

  const panel = document.createElement('div');
  panel.id = 'bm-panel';
  document.body.appendChild(panel);

  fab.addEventListener('click', openPanel);
  overlay.addEventListener('click', closePanel);

  document.addEventListener('contextmenu', (e) => {
    const target = (e.target as HTMLElement).closest('#chapter-container p');
    if (!target) return;
    e.preventDefault();
    addBookmark(target);
  }, { signal });

  updateBadge();
}