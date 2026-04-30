/**
 * Reading Goals - daily reading target with streak tracking.
 * Shows a small goal indicator that fills as you read.
 * Stored in localStorage per book.
 */

import { t, type TranslationKey, getI18nDirection, resolveLanguage } from '../i18n';

function getLang(): string {
  return resolveLanguage(
    new URLSearchParams(window.location.search).get('lang')
      || localStorage.getItem('yuval_language')
      || 'en'
  );
}

function tr(key: TranslationKey, params?: Record<string, string | number>): string {
  return t(key, getLang(), params);
}

function getDir(): 'rtl' | 'ltr' {
  return getI18nDirection(getLang());
}

function getCurrentBook(): string {
  return document.getElementById('chapter-container')?.dataset.book || '';
}

function getGoalOptions(lang: string): { label: string; minutes: number }[] {
  const byLang: Record<string, { label: string; minutes: number }[]> = {
    he: [
      { label: '10 דקות', minutes: 10 },
      { label: '20 דקות', minutes: 20 },
      { label: '30 דקות', minutes: 30 },
      { label: 'שעה', minutes: 60 },
    ],
    es: [
      { label: '10 min', minutes: 10 },
      { label: '20 min', minutes: 20 },
      { label: '30 min', minutes: 30 },
      { label: '1 hora', minutes: 60 },
    ],
    en: [
      { label: '10 min', minutes: 10 },
      { label: '20 min', minutes: 20 },
      { label: '30 min', minutes: 30 },
      { label: '1 hour', minutes: 60 },
    ],
  };

  return byLang[lang] ?? byLang.en;
}

// ── Storage ───────────────────────────────────────────────────────────────────

interface GoalData {
  goalMinutes: number;
  todayMinutes: number;
  todayDate: string;
  streak: number;
  lastStreakDate: string;
}

const GOAL_KEY = 'yuval_reading_goal';
const DEFAULT_GOAL = 20;

function loadGoal(): GoalData {
  try {
    return JSON.parse(localStorage.getItem(GOAL_KEY) || 'null') || {
      goalMinutes: DEFAULT_GOAL,
      todayMinutes: 0,
      todayDate: today(),
      streak: 0,
      lastStreakDate: '',
    };
  } catch {
    return {
      goalMinutes: DEFAULT_GOAL,
      todayMinutes: 0,
      todayDate: today(),
      streak: 0,
      lastStreakDate: '',
    };
  }
}

function saveGoal(data: GoalData): void {
  localStorage.setItem(GOAL_KEY, JSON.stringify(data));
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Session timer ─────────────────────────────────────────────────────────────

let sessionStart = Date.now();
let accumulatedMs = 0;
let hidden = false;

function getReadMinutes(): number {
  const elapsed = hidden ? accumulatedMs : accumulatedMs + (Date.now() - sessionStart);
  return elapsed / 60000;
}

function onVisibilityChange() {
  if (document.hidden) {
    accumulatedMs += Date.now() - sessionStart;
    hidden = true;
  } else {
    sessionStart = Date.now();
    hidden = false;
  }
}

// ── Goal check & streak ───────────────────────────────────────────────────────

function tickGoal(): void {
  const data = loadGoal();
  const tdy = today();

  if (data.todayDate !== tdy) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    if (data.todayDate === yStr && data.todayMinutes >= data.goalMinutes) {
      data.streak += 1;
    } else if (data.todayDate !== yStr) {
      data.streak = 0;
    }

    data.todayMinutes = 0;
    data.todayDate = tdy;
  }

  data.todayMinutes = Math.min(data.goalMinutes * 2, getReadMinutes());
  saveGoal(data);
  updateIndicator(data);
}

// ── CSS ───────────────────────────────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('reading-goals-styles')) return;
  const s = document.createElement('style');
  s.id = 'reading-goals-styles';
  s.textContent = `
    #goal-indicator {
      position: fixed;
      bottom: 15.9rem;
      inset-inline-end: 1rem;
      z-index: 9980;
      width: 2.5rem; height: 2.5rem;
      border-radius: 50%;
      background: var(--yuval-surface, #fff);
      border: 1px solid var(--yuval-border, #e5e7eb);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #goal-indicator:hover {
      transform: scale(1.08);
      box-shadow: 0 4px 16px rgba(0,0,0,0.14);
    }
    :is(.dark) #goal-indicator { background: #2a2a2a; border-color: rgba(255,255,255,0.1); }
    @media (max-width: 1023px) {
      #goal-indicator { display: none !important; }
    }
    /* On desktop the LeftSidebar's daily-goal button replaces this
       legacy FAB. The DOM stays in place so left-sidebar.ts can still
       delegate clicks to it (#goal-indicator?.click()), but it's
       visually hidden. */
    @media (min-width: 1024px) {
      #goal-indicator { display: none !important; }
    }

    #goal-ring { position: absolute; inset: 0; }
    #goal-ring-track { fill: none; stroke: var(--yuval-border, #e5e7eb); stroke-width: 3; }
    #goal-ring-fill {
      fill: none; stroke: #22c55e; stroke-width: 3;
      stroke-linecap: round;
      stroke-dasharray: 120;
      stroke-dashoffset: 120;
      transform: rotate(-90deg);
      transform-origin: center;
      transition: stroke-dashoffset 1s ease;
    }
    #goal-ring-fill.done { stroke: #16a34a; }
    #goal-emoji { font-size: 18px; position: relative; z-index: 1; }

    /* ── Goal modal — Yuval premium charcoal+gold language ─────────
       Drops the old green-accented Bootstrap-y look in favour of the
       same warm-charcoal surface + gold-accent vocabulary used by
       the LeftSidebar dock, the bookmark dialog, and the active
       chapter card. Light mode uses a parchment-cream variant of
       the same shapes. */

    #goal-modal-overlay {
      position: fixed; inset: 0; z-index: 10001;
      background: rgba(2, 6, 18, 0.55);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      animation: goal-fade-in 200ms ease-out;
    }

    @keyframes goal-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes goal-pop-in {
      from { opacity: 0; transform: translateY(6px) scale(0.985); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Default = LIGHT — warm cream parchment. Dark overrides below. */
    #goal-modal {
      --gm-bg-from: rgba(252, 250, 246, 0.94);
      --gm-bg-to:   rgba(245, 242, 235, 0.96);
      --gm-border:  var(--yuval-border, rgba(201, 169, 110, 0.30));
      --gm-shadow:
        0 18px 40px -16px rgba(60, 50, 30, 0.22),
        inset 0 0 0 1px rgba(255, 255, 255, 0.55),
        inset 0 1px 0 rgba(255, 255, 255, 0.85);
      --gm-title:        #2c2c34;
      --gm-text:         rgba(60, 50, 70, 0.82);
      --gm-text-muted:   rgba(60, 50, 70, 0.60);
      --gm-divider:      rgba(60, 50, 30, 0.10);
      --gm-inner-bg:     rgba(255, 248, 232, 0.55);
      --gm-inner-border: rgba(184, 146, 63, 0.22);
      --gm-track:        rgba(60, 50, 30, 0.12);
      --gm-secondary-bg:        rgba(60, 50, 30, 0.04);
      --gm-secondary-bg-hover:  rgba(201, 169, 110, 0.10);
      --gm-secondary-border:    rgba(60, 50, 30, 0.14);
      --gm-secondary-text:      rgba(60, 50, 70, 0.85);

      background: linear-gradient(180deg, var(--gm-bg-from) 0%, var(--gm-bg-to) 100%);
      border: 1px solid var(--gm-border);
      border-radius: 18px;
      box-shadow: var(--gm-shadow);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      padding: 22px 22px 20px;
      width: min(360px, calc(100vw - 32px));
      animation: goal-pop-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    :is(.dark) #goal-modal {
      --gm-bg-from: rgba(28, 28, 34, 0.92);
      --gm-bg-to:   rgba(20, 20, 26, 0.96);
      --gm-border:  var(--yuval-border, rgba(127, 127, 127, 0.18));
      --gm-shadow:
        0 24px 60px -18px rgba(0, 0, 0, 0.65),
        inset 0 0 0 1px rgba(255, 255, 255, 0.035),
        inset 0 1px 0 rgba(212, 196, 168, 0.06);
      --gm-title:        rgba(240, 235, 225, 0.96);
      --gm-text:         rgba(212, 196, 168, 0.82);
      --gm-text-muted:   rgba(212, 196, 168, 0.55);
      --gm-divider:      rgba(255, 255, 255, 0.07);
      --gm-inner-bg:     rgba(255, 255, 255, 0.025);
      --gm-inner-border: rgba(184, 146, 63, 0.22);
      --gm-track:        rgba(255, 255, 255, 0.08);
      --gm-secondary-bg:        rgba(255, 255, 255, 0.035);
      --gm-secondary-bg-hover:  rgba(255, 255, 255, 0.07);
      --gm-secondary-border:    rgba(255, 255, 255, 0.10);
      --gm-secondary-text:      rgba(230, 225, 215, 0.85);
    }

    #goal-modal h2 {
      font-size: 17px; font-weight: 600;
      letter-spacing: -0.005em;
      color: var(--gm-title);
      margin: 0 0 6px;
      display: flex; align-items: center; gap: 8px;
    }

    /* Streak — warm amber instead of safety-orange. The flame emoji
       carries the heat semantics; the colour just supports it. */
    .goal-streak-row {
      font-size: 13px; font-weight: 500;
      color: #d49b4a;
      margin: 0 0 18px;
      letter-spacing: 0.01em;
    }
    :is(.dark) .goal-streak-row { color: #e6b56a; }

    /* Progress card — warm-cream inset (light) / charcoal-glass (dark)
       with a thin gold border. */
    .goal-progress-row {
      background: var(--gm-inner-bg);
      border: 1px solid var(--gm-inner-border);
      border-radius: 14px;
      padding: 14px 16px;
      margin: 0 0 18px;
    }

    .goal-progress-label {
      font-size: 12px; font-weight: 500;
      color: var(--gm-text-muted);
      letter-spacing: 0.01em;
      margin: 0 0 8px;
      font-variant-numeric: tabular-nums;
    }

    /* Track + fill — gold gradient instead of bright green; matches
       the dock's golden-target tile so progress reads as "the brand". */
    .goal-progress-bar {
      height: 6px; border-radius: 99px;
      background: var(--gm-track); overflow: hidden;
    }
    .goal-progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(
        90deg,
        rgba(212, 175, 55, 0.85) 0%,
        rgba(184, 146, 63, 0.95) 100%
      );
      box-shadow: 0 0 8px rgba(212, 175, 55, 0.35);
      transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .goal-progress-text {
      font-size: 13px; font-weight: 600;
      color: var(--gm-title);
      margin-top: 8px;
      font-variant-numeric: tabular-nums;
    }

    /* Preset options — 2×2 grid. Inactive: glass. Active: gold gradient
       like the dock's golden-target. */
    .goal-options {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 8px; margin: 0 0 18px;
    }
    .goal-option {
      padding: 11px 10px;
      border-radius: 12px;
      border: 1px solid var(--gm-secondary-border);
      background: var(--gm-secondary-bg);
      font-size: 13px; font-weight: 500;
      color: var(--gm-secondary-text);
      cursor: pointer; text-align: center;
      letter-spacing: 0.005em;
      transition:
        background-color 160ms ease,
        border-color 160ms ease,
        color 160ms ease,
        box-shadow 160ms ease,
        transform 160ms ease;
    }
    .goal-option:hover {
      background: var(--gm-secondary-bg-hover);
      border-color: rgba(184, 146, 63, 0.45);
    }
    .goal-option.active {
      background: linear-gradient(
        135deg,
        rgba(212, 175, 55, 0.32) 0%,
        rgba(184, 146, 63, 0.16) 100%
      );
      border-color: rgba(212, 175, 55, 0.65);
      color: #4a3a14;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.40),
        0 4px 14px -4px rgba(212, 175, 55, 0.30);
    }
    :is(.dark) .goal-option.active {
      background: linear-gradient(
        135deg,
        rgba(212, 175, 55, 0.22) 0%,
        rgba(184, 146, 63, 0.10) 100%
      );
      color: #f0e3c2;
      box-shadow:
        inset 0 1px 0 rgba(255, 235, 180, 0.10),
        inset 0 -1px 0 rgba(0, 0, 0, 0.30),
        0 6px 16px -6px rgba(212, 175, 55, 0.25);
    }

    /* Divider above the action row to lift the buttons off the grid. */
    .goal-modal-actions {
      display: flex; gap: 10px; justify-content: flex-end;
      padding-top: 14px;
      border-top: 1px solid var(--gm-divider);
    }

    .goal-btn {
      flex: 1 1 auto;
      min-height: 38px;
      padding: 0 16px;
      border-radius: 12px;
      font-family: inherit;
      font-size: 13px; font-weight: 600;
      letter-spacing: 0.01em;
      cursor: pointer;
      border: 1px solid var(--gm-secondary-border);
      background: var(--gm-secondary-bg);
      color: var(--gm-secondary-text);
      transition:
        background-color 160ms ease,
        border-color 160ms ease,
        color 160ms ease,
        box-shadow 200ms ease,
        transform 160ms ease;
    }
    .goal-btn:hover { background: var(--gm-secondary-bg-hover); }
    .goal-btn:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 2px var(--gm-bg-from),
        0 0 0 4px rgba(212, 175, 55, 0.55);
    }

    /* Primary "save" — gold gradient in the warm Yuval brand language. */
    .goal-btn.primary {
      background: linear-gradient(
        180deg,
        rgba(230, 201, 138, 0.32) 0%,
        rgba(184, 146, 63, 0.18) 100%
      );
      border: 1px solid rgba(184, 146, 63, 0.55);
      color: #4a3a14;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.55) inset,
        0 -1px 0 rgba(60, 50, 30, 0.06) inset,
        0 4px 14px -4px rgba(184, 146, 63, 0.30);
    }
    :is(.dark) .goal-btn.primary {
      background: linear-gradient(
        180deg,
        rgba(212, 175, 55, 0.22) 0%,
        rgba(184, 146, 63, 0.10) 100%
      );
      border-color: rgba(184, 146, 63, 0.45);
      color: #f0e3c2;
      box-shadow:
        0 1px 0 rgba(255, 235, 180, 0.10) inset,
        0 -1px 0 rgba(0, 0, 0, 0.35) inset,
        0 6px 16px -6px rgba(212, 175, 55, 0.22);
    }
    .goal-btn.primary:hover {
      transform: translateY(-1px);
      background: linear-gradient(
        180deg,
        rgba(230, 201, 138, 0.46) 0%,
        rgba(184, 146, 63, 0.28) 100%
      );
      border-color: rgba(212, 175, 55, 0.70);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.70) inset,
        0 -1px 0 rgba(60, 50, 30, 0.08) inset,
        0 6px 18px -4px rgba(212, 175, 55, 0.45);
    }
    :is(.dark) .goal-btn.primary:hover {
      background: linear-gradient(
        180deg,
        rgba(212, 175, 55, 0.34) 0%,
        rgba(184, 146, 63, 0.18) 100%
      );
      border-color: rgba(212, 175, 55, 0.70);
      color: #fbeec6;
      box-shadow:
        0 1px 0 rgba(255, 235, 180, 0.16) inset,
        0 -1px 0 rgba(0, 0, 0, 0.40) inset,
        0 8px 22px -8px rgba(212, 175, 55, 0.45);
    }
    .goal-btn.primary:active { transform: translateY(0); filter: brightness(0.97); }

    @media (prefers-reduced-motion: reduce) {
      #goal-modal-overlay,
      #goal-modal { animation: none; }
      .goal-progress-fill { transition: none; }
      .goal-btn,
      .goal-option { transition: none; }
    }
  `;
  document.head.appendChild(s);
}

// ── Indicator ─────────────────────────────────────────────────────────────────

function buildIndicator(): void {
  if (document.getElementById('goal-indicator')) return;

  const el = document.createElement('button');
  el.id = 'goal-indicator';
  el.type = 'button';
  el.setAttribute('aria-label', tr('goal.title'));
  el.title = tr('goal.title');
  el.innerHTML = `
    <svg id="goal-ring" viewBox="0 0 44 44">
      <circle id="goal-ring-track" cx="22" cy="22" r="19"/>
      <circle id="goal-ring-fill" cx="22" cy="22" r="19"/>
    </svg>
    <span id="goal-emoji">🎯</span>
  `;
  document.body.appendChild(el);
  el.addEventListener('click', openGoalModal);
}

function updateIndicator(data: GoalData): void {
  const fill = document.getElementById('goal-ring-fill');
  const emoji = document.getElementById('goal-emoji');
  const indicator = document.getElementById('goal-indicator');

  if (!fill || !emoji) return;

  if (indicator) {
    indicator.setAttribute('aria-label', tr('goal.title'));
  }

  const pct = Math.min(1, data.todayMinutes / data.goalMinutes);
  const circumference = 2 * Math.PI * 19;
  const offset = circumference * (1 - pct);

  fill.style.strokeDasharray = String(circumference);
  fill.style.strokeDashoffset = String(offset);

  if (pct >= 1) {
    fill.classList.add('done');
    emoji.textContent = '✅';
  } else if (pct > 0) {
    fill.classList.remove('done');
    emoji.textContent = '📖';
  } else {
    fill.classList.remove('done');
    emoji.textContent = '🎯';
  }
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function openGoalModal(): void {
  if (document.getElementById('goal-modal-overlay')) return;

  const lang = getLang();
  const data = loadGoal();
  let selectedMinutes = data.goalMinutes;

  const pct = Math.min(100, Math.round((data.todayMinutes / data.goalMinutes) * 100));
  const remaining = Math.max(0, Math.ceil(data.goalMinutes - data.todayMinutes));
  const progressText = pct >= 100
    ? tr('goal.reached')
    : tr('goal.minutesLeft', { n: remaining });

  const overlay = document.createElement('div');
  overlay.id = 'goal-modal-overlay';
  overlay.setAttribute('dir', getDir());

  overlay.innerHTML = `
    <div id="goal-modal">
      <h2>🎯 ${tr('goal.title')}</h2>
      <div class="goal-streak-row">${tr('goal.streak', { n: data.streak })}</div>
      <div class="goal-progress-row">
        <div class="goal-progress-label">${tr('goal.title')}: ${data.goalMinutes} min</div>
        <div class="goal-progress-bar">
          <div class="goal-progress-fill" style="width:0%" data-target="${pct}"></div>
        </div>
        <div class="goal-progress-text">${progressText}</div>
      </div>
      <div class="goal-options">
        ${getGoalOptions(lang).map(opt => `
          <button class="goal-option${opt.minutes === selectedMinutes ? ' active' : ''}"
            data-minutes="${opt.minutes}" type="button">${opt.label}</button>
        `).join('')}
      </div>
      <div class="goal-modal-actions">
        <button class="goal-btn" id="goal-cancel">${tr('goal.cancel')}</button>
        <button class="goal-btn primary" id="goal-save">${tr('goal.save')}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    const f = overlay.querySelector<HTMLElement>('.goal-progress-fill');
    if (f) f.style.width = `${pct}%`;
  });

  overlay.querySelectorAll<HTMLButtonElement>('.goal-option').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedMinutes = parseInt(btn.dataset.minutes || '20', 10);
      overlay.querySelectorAll('.goal-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const close = () => overlay.remove();

  document.getElementById('goal-cancel')?.addEventListener('click', close);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  document.getElementById('goal-save')?.addEventListener('click', () => {
    data.goalMinutes = selectedMinutes;
    saveGoal(data);
    updateIndicator(data);
    close();
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initReadingGoals(signal: AbortSignal): void {
  injectStyles();
  buildIndicator();

  document.addEventListener('visibilitychange', onVisibilityChange);

  const interval = setInterval(tickGoal, 30_000);
  setTimeout(tickGoal, 5_000);

  const onLangChange = () => {
    const indicator = document.getElementById('goal-indicator');
    if (indicator) {
      indicator.setAttribute('aria-label', tr('goal.title'));
    }
  };

  window.addEventListener('language-changed', onLangChange, { signal });

  signal.addEventListener('abort', () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  });
}