/**
 * Highlight Replay — "What I learned"
 *
 * Shows all highlights from the current book as a swipeable card carousel.
 * Triggered from the book completion screen OR via keyboard shortcut R.
 * Cards are color-coded, swipeable on mobile, keyboard navigable.
 *
 * Supports: Hebrew (RTL), English, Spanish
 */

type LangKey = 'he' | 'en' | 'es';

function getLang(): LangKey {
  return (new URLSearchParams(window.location.search).get('lang')
    || localStorage.getItem('yuval_language')
    || 'en') as LangKey;
}

// ── i18n ─────────────────────────────────────────────────────────────────────

const i18n: Record<LangKey, {
  title: string;
  subtitle: (n: number) => string;
  empty: string;
  close: string;
  prev: string;
  next: string;
  chapterLabel: string;
  colorLabels: Record<string, string>;
  dir: 'rtl' | 'ltr';
}> = {
  he: {
    title: '🔁 מה למדתי',
    subtitle: (n) => `${n} הדגשות שמורות`,
    empty: 'עדיין אין הדגשות לספר זה. סמן טקסט בזמן קריאה.',
    close: 'סגור',
    prev: '←',
    next: '→',
    chapterLabel: 'פרק',
    colorLabels: { yellow: 'תובנה', blue: 'שאלה', green: 'פעולה', pink: 'ציטוט' },
    dir: 'rtl',
  },
  es: {
    title: '🔁 Lo que aprendí',
    subtitle: (n) => `${n} resaltados guardados`,
    empty: 'Aún no hay resaltados. Selecciona texto mientras lees.',
    close: 'Cerrar',
    prev: '←',
    next: '→',
    chapterLabel: 'Capítulo',
    colorLabels: { yellow: 'Insight', blue: 'Pregunta', green: 'Acción', pink: 'Cita' },
    dir: 'ltr',
  },
  en: {
    title: '🔁 What I Learned',
    subtitle: (n) => `${n} saved highlights`,
    empty: 'No highlights yet. Select text while reading.',
    close: 'Close',
    prev: '←',
    next: '→',
    chapterLabel: 'Chapter',
    colorLabels: { yellow: 'Insight', blue: 'Question', green: 'Action', pink: 'Quote' },
    dir: 'ltr',
  },
};

function tr() { return i18n[getLang()] ?? i18n.en; }

// ── Data ──────────────────────────────────────────────────────────────────────

interface HighlightEntry {
  id: string;
  text: string;
  color: string;
  note?: string;
  timestamp: number;
  chapter: string;
}

function loadAllHighlights(book: string): HighlightEntry[] {
  const results: HighlightEntry[] = [];
  const prefix = `yuval_hl_${book}_ch`;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(prefix)) continue;

    const chapter = key.replace(prefix, '').replace(/_[a-z]{2}$/, ''); // strip lang suffix
    try {
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.forEach((hl: HighlightEntry) => {
        results.push({ ...hl, chapter });
      });
    } catch { /* skip */ }
  }

  // Deduplicate by id, sort by chapter then timestamp
  const seen = new Set<string>();
  return results
    .filter(h => { if (seen.has(h.id)) return false; seen.add(h.id); return true; })
    .sort((a, b) => a.chapter.localeCompare(b.chapter) || a.timestamp - b.timestamp);
}

function getCurrentBook(): string {
  return document.getElementById('chapter-container')?.dataset.book || '';
}

// ── Colors ────────────────────────────────────────────────────────────────────

const CARD_BG: Record<string, string> = {
  yellow: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
  blue:   'linear-gradient(135deg, #eff6ff, #dbeafe)',
  green:  'linear-gradient(135deg, #f0fdf4, #dcfce7)',
  pink:   'linear-gradient(135deg, #fdf2f8, #fce7f3)',
};
const CARD_BG_DARK: Record<string, string> = {
  yellow: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.06))',
  blue:   'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.06))',
  green:  'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))',
  pink:   'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(236,72,153,0.06))',
};
const CARD_BORDER: Record<string, string> = {
  yellow: '#fde68a', blue: '#bfdbfe', green: '#bbf7d0', pink: '#fbcfe8',
};
const CARD_ACCENT: Record<string, string> = {
  yellow: '#d97706', blue: '#2563eb', green: '#16a34a', pink: '#db2777',
};
const EMOJI: Record<string, string> = {
  yellow: '💡', blue: '❓', green: '✅', pink: '💬',
};

// ── CSS ───────────────────────────────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('highlight-replay-styles')) return;
  const s = document.createElement('style');
  s.id = 'highlight-replay-styles';
  s.textContent = `
    @keyframes hrFadeIn  { from { opacity:0 } to { opacity:1 } }
    @keyframes hrSlideUp { from { opacity:0; transform:translateY(32px) scale(0.96) } to { opacity:1; transform:none } }
    @keyframes hrCardIn  { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:none } }
    @keyframes hrCardInR { from { opacity:0; transform:translateX(-40px) } to { opacity:1; transform:none } }

    #hr-overlay {
      position: fixed; inset: 0; z-index: 10050;
      background: rgba(0,0,0,0.72);
      backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      animation: hrFadeIn 0.3s ease;
      padding: 20px;
    }

    #hr-modal {
      width: min(480px, 100%);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: hrSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }

    /* Header */
    #hr-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--yuval-surface, #fff);
      border-radius: 20px 20px 0 0;
      border: 1px solid var(--yuval-border, #e5e7eb);
      border-bottom: none;
    }
    :is(.dark) #hr-header {
      background: #1e1e1e;
      border-color: rgba(255,255,255,0.08);
    }
    #hr-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--yuval-text, #1a1a1a);
      letter-spacing: -0.01em;
    }
    #hr-subtitle {
      font-size: 12px;
      color: var(--yuval-text-muted, #999);
      margin-top: 2px;
    }
    #hr-close {
      background: none; border: none;
      color: var(--yuval-text-tertiary, #888);
      font-size: 18px; cursor: pointer;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 8px;
      transition: background 0.15s;
    }
    #hr-close:hover { background: var(--yuval-bg-secondary, #f3f4f6); }

    /* Card area */
    #hr-card-area {
      flex: 1;
      overflow: hidden;
      border-left: 1px solid var(--yuval-border, #e5e7eb);
      border-right: 1px solid var(--yuval-border, #e5e7eb);
      position: relative;
      min-height: 260px;
      max-height: 400px;
    }
    :is(.dark) #hr-card-area {
      border-color: rgba(255,255,255,0.08);
    }

    .hr-card {
      position: absolute;
      inset: 0;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow-y: auto;
    }
    .hr-card.enter-next  { animation: hrCardIn  0.35s cubic-bezier(0.34,1.56,0.64,1); }
    .hr-card.enter-prev  { animation: hrCardInR 0.35s cubic-bezier(0.34,1.56,0.64,1); }

    .hr-card-emoji {
      font-size: 28px;
      margin-bottom: 12px;
      line-height: 1;
    }
    .hr-card-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 10px;
      opacity: 0.65;
    }
    .hr-card-text {
      font-size: 17px;
      line-height: 1.7;
      font-weight: 500;
      color: inherit;
      margin-bottom: 0;
    }
    .hr-card-note {
      font-size: 13px;
      font-style: italic;
      margin-top: 14px;
      opacity: 0.7;
      border-top: 1px solid currentColor;
      padding-top: 10px;
    }
    .hr-card-chapter {
      font-size: 11px;
      font-weight: 500;
      opacity: 0.5;
      margin-top: 16px;
    }

    /* Footer */
    #hr-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: var(--yuval-surface, #fff);
      border: 1px solid var(--yuval-border, #e5e7eb);
      border-top: none;
      border-radius: 0 0 20px 20px;
      gap: 12px;
    }
    :is(.dark) #hr-footer {
      background: #1e1e1e;
      border-color: rgba(255,255,255,0.08);
    }

    .hr-nav-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 1px solid var(--yuval-border, #e5e7eb);
      background: var(--yuval-bg-secondary, #f9f9f9);
      color: var(--yuval-text-secondary, #555);
      font-size: 18px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s, transform 0.15s;
    }
    .hr-nav-btn:hover:not(:disabled) {
      background: var(--yuval-accent, #3b82f6);
      color: #fff;
      border-color: transparent;
      transform: scale(1.05);
    }
    .hr-nav-btn:disabled { opacity: 0.3; cursor: default; }

    #hr-counter {
      font-size: 13px;
      font-weight: 700;
      color: var(--yuval-text, #1a1a1a);
      min-width: 60px;
      text-align: center;
    }

    /* Dots */
    #hr-dots {
      display: flex;
      gap: 5px;
      align-items: center;
      justify-content: center;
      flex: 1;
    }
    .hr-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--yuval-border, #e5e7eb);
      transition: background 0.2s, transform 0.2s;
      cursor: pointer;
    }
    .hr-dot.active {
      background: var(--yuval-accent, #3b82f6);
      transform: scale(1.4);
    }

    /* Empty state */
    #hr-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      background: var(--yuval-surface, #fff);
      border: 1px solid var(--yuval-border, #e5e7eb);
      border-top: none;
      border-bottom: none;
      color: var(--yuval-text-muted, #999);
      font-size: 14px;
      text-align: center;
    }
    :is(.dark) #hr-empty {
      background: #1e1e1e;
      border-color: rgba(255,255,255,0.08);
    }
    #hr-empty span { font-size: 40px; }
  `;
  document.head.appendChild(s);
}

// ── Render ────────────────────────────────────────────────────────────────────

let currentIndex = 0;
let highlights: HighlightEntry[] = [];
let direction: 'next' | 'prev' = 'next';

function renderCard(idx: number): void {
  const isDark = document.documentElement.classList.contains('dark');
  const labels = tr();
  const hl = highlights[idx];
  const area = document.getElementById('hr-card-area');
  if (!area) return;

  const bg     = isDark ? (CARD_BG_DARK[hl.color] || '') : (CARD_BG[hl.color] || '');
  const border = CARD_BORDER[hl.color] || 'transparent';
  const accent = CARD_ACCENT[hl.color] || '#555';
  const emoji  = EMOJI[hl.color] || '💡';
  const colorLabel = labels.colorLabels[hl.color] || '';

  const card = document.createElement('div');
  card.className = `hr-card enter-${direction}`;
  card.style.cssText = `background: ${bg}; border-top: 3px solid ${border}; color: ${accent};`;
  card.innerHTML = `
    <div class="hr-card-emoji">${emoji}</div>
    <div class="hr-card-label">${colorLabel}</div>
    <div class="hr-card-text">${hl.text}</div>
    ${hl.note ? `<div class="hr-card-note">📝 ${hl.note}</div>` : ''}
    <div class="hr-card-chapter">${labels.chapterLabel} ${hl.chapter}</div>
  `;

  // Remove old card
  area.querySelectorAll('.hr-card').forEach(old => old.remove());
  area.appendChild(card);

  // Update counter
  const counter = document.getElementById('hr-counter');
  if (counter) counter.textContent = `${idx + 1} / ${highlights.length}`;

  // Update dots (max 10 shown)
  const dots = document.getElementById('hr-dots');
  if (dots) {
    dots.querySelectorAll('.hr-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
  }

  // Update nav buttons
  const prevBtn = document.getElementById('hr-prev') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('hr-next') as HTMLButtonElement | null;
  if (prevBtn) prevBtn.disabled = idx === 0;
  if (nextBtn) nextBtn.disabled = idx === highlights.length - 1;
}

function buildDots(): string {
  const count = Math.min(highlights.length, 12);
  return highlights.slice(0, count).map((_, i) =>
    `<div class="hr-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></div>`
  ).join('');
}

function open(): void {
  if (document.getElementById('hr-overlay')) return;

  const book = getCurrentBook();
  highlights = loadAllHighlights(book);
  currentIndex = 0;
  direction = 'next';

  const labels = tr();
  const overlay = document.createElement('div');
  overlay.id = 'hr-overlay';
  overlay.setAttribute('dir', labels.dir);

  if (highlights.length === 0) {
    overlay.innerHTML = `
      <div id="hr-modal">
        <div id="hr-header">
          <div>
            <div id="hr-title">${labels.title}</div>
          </div>
          <button id="hr-close">${labels.close}</button>
        </div>
        <div id="hr-empty">
          <span>📚</span>
          ${labels.empty}
        </div>
        <div id="hr-footer" style="justify-content:center">
          <button class="hr-nav-btn" id="hr-close-empty">${labels.close}</button>
        </div>
      </div>
    `;
  } else {
    overlay.innerHTML = `
      <div id="hr-modal">
        <div id="hr-header">
          <div>
            <div id="hr-title">${labels.title}</div>
            <div id="hr-subtitle">${labels.subtitle(highlights.length)}</div>
          </div>
          <button id="hr-close">✕</button>
        </div>
        <div id="hr-card-area"></div>
        <div id="hr-footer">
          <button class="hr-nav-btn" id="hr-prev" aria-label="Previous">${labels.dir === 'rtl' ? labels.next : labels.prev}</button>
          <div id="hr-dots">${buildDots()}</div>
          <button class="hr-nav-btn" id="hr-next" aria-label="Next">${labels.dir === 'rtl' ? labels.prev : labels.next}</button>
        </div>
      </div>
    `;
  }

  document.body.appendChild(overlay);

  if (highlights.length > 0) renderCard(0);

  const close = () => {
    overlay.style.transition = 'opacity 0.25s';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 250);
  };

  document.getElementById('hr-close')?.addEventListener('click', close);
  document.getElementById('hr-close-empty')?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.getElementById('hr-prev')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      direction = 'prev';
      currentIndex--;
      renderCard(currentIndex);
    }
  });

  document.getElementById('hr-next')?.addEventListener('click', () => {
    if (currentIndex < highlights.length - 1) {
      direction = 'next';
      currentIndex++;
      renderCard(currentIndex);
    }
  });

  // Dot navigation
  overlay.querySelectorAll<HTMLElement>('.hr-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.idx || '0', 10);
      direction = idx > currentIndex ? 'next' : 'prev';
      currentIndex = idx;
      renderCard(currentIndex);
    });
  });

  // Keyboard nav
  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (currentIndex < highlights.length - 1) {
        direction = 'next'; currentIndex++; renderCard(currentIndex);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (currentIndex > 0) {
        direction = 'prev'; currentIndex--; renderCard(currentIndex);
      }
    } else if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onKey);
    }
  }
  document.addEventListener('keydown', onKey);

  // Touch swipe
  let touchStartX = 0;
  overlay.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const isRtl = labels.dir === 'rtl';
    if (Math.abs(dx) < 50) return;
    if (dx < 0) { // swipe left = next (LTR) or prev (RTL)
      const dir = isRtl ? 'prev' : 'next';
      if (dir === 'next' && currentIndex < highlights.length - 1) {
        direction = 'next'; currentIndex++; renderCard(currentIndex);
      } else if (dir === 'prev' && currentIndex > 0) {
        direction = 'prev'; currentIndex--; renderCard(currentIndex);
      }
    } else {
      const dir = isRtl ? 'next' : 'prev';
      if (dir === 'prev' && currentIndex > 0) {
        direction = 'prev'; currentIndex--; renderCard(currentIndex);
      } else if (dir === 'next' && currentIndex < highlights.length - 1) {
        direction = 'next'; currentIndex++; renderCard(currentIndex);
      }
    }
  }, { passive: true });
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initHighlightReplay(): void {
  injectStyles();

  // Expose globally for book-completion screen to call
  (window as any).yuvalOpenHighlightReplay = open;

  // Keyboard shortcut: R
  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      open();
    }
  });
}
