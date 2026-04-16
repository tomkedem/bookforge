import { t, getI18nDirection, resolveLanguage } from '../i18n';

// ── Language ────────────────────────────────────────────────────────────────

function getLang(): string {
  return resolveLanguage(
    new URLSearchParams(window.location.search).get('lang')
      || localStorage.getItem('yuval_language')
      || document.documentElement.lang
      || 'en'
  );
}

function tr(key: string, params?: Record<string, string | number>) {
  return t(key, getLang(), params);
}

function getDir(): 'rtl' | 'ltr' {
  return getI18nDirection(getLang());
}

// ── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'yuval_onboarded_v1';

function hasOnboarded(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

function markOnboarded(): void {
  localStorage.setItem(STORAGE_KEY, 'true');
}

// ── Steps (NO i18n here) ────────────────────────────────────────────────────

interface Step {
  target: string;
  titleKey: string;
  bodyKey: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: Step[] = [
  {
    target: '#chapter-header',
    titleKey: 'onboard.welcome.title',
    bodyKey: 'onboard.welcome.body',
    position: 'bottom',
  },
  {
    target: '#toc-toggle, .toc-sidebar, #chapter-nav',
    titleKey: 'onboard.toc.title',
    bodyKey: 'onboard.toc.body',
    position: 'right',
  },
  {
    target: '#fab-toggle',
    titleKey: 'onboard.display.title',
    bodyKey: 'onboard.display.body',
    position: 'left',
  },
  {
    target: '#reading-fab, .reading-fab',
    titleKey: 'onboard.highlight.title',
    bodyKey: 'onboard.highlight.body',
    position: 'left',
  },
  {
    target: '#goal-indicator',
    titleKey: 'onboard.goal.title',
    bodyKey: 'onboard.goal.body',
    position: 'left',
  },
];

// ── Core ────────────────────────────────────────────────────────────────────

let currentStep = 0;
let overlayEl: HTMLElement | null = null;

function findTarget(step: Step): Element | null {
  for (const sel of step.target.split(', ')) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function renderStep(idx: number): void {
  if (!overlayEl) return;

  const step = STEPS[idx];
  const target = findTarget(step);
  const isLast = idx === STEPS.length - 1;

  const tooltip = overlayEl.querySelector('#ob-tooltip') as HTMLElement;

  tooltip.setAttribute('dir', getDir());

  tooltip.innerHTML = `
    <div id="ob-title">${tr(step.titleKey)}</div>
    <div id="ob-body">${tr(step.bodyKey)}</div>

    <div id="ob-actions">
      <button id="ob-skip">${tr('onboard.skip')}</button>
      <button id="ob-next">${isLast ? tr('onboard.done') : tr('onboard.next')}</button>
    </div>
  `;

  tooltip.querySelector('#ob-next')?.addEventListener('click', () => {
    isLast ? finish() : next();
  });

  tooltip.querySelector('#ob-skip')?.addEventListener('click', finish);
}

function next() {
  currentStep++;
  if (currentStep >= STEPS.length) return finish();
  renderStep(currentStep);
}

function finish() {
  markOnboarded();
  overlayEl?.remove();
  overlayEl = null;
}

// ── Init ────────────────────────────────────────────────────────────────────

function start() {
  if (hasOnboarded() || overlayEl) return;

  const overlay = document.createElement('div');
  overlay.id = 'ob-overlay';
  overlay.innerHTML = `<div id="ob-tooltip"></div>`;

  document.body.appendChild(overlay);
  overlayEl = overlay;

  renderStep(0);
}

export function initOnboardingTour() {
  setTimeout(start, 1200);
}