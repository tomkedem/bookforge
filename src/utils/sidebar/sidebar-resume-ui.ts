/**
 * Resume-banner + per-section progress-bar DOM.
 *
 * Banner: a small "welcome back" card placed above the chapter list
 * in the sidebar. Auto-dismisses on first interaction (X click,
 * sidebar click, or scroll past a threshold). Once dismissed in a
 * session, never re-appears for that book until session ends.
 *
 * Section progress bar: a 2 px bar inside whichever .usb-sections
 * <li> is currently active, reflecting the reader's progress through
 * that single section. Driven by the scroll listener.
 *
 * No build-time markup — both elements are created dynamically here
 * to match the rest of the sidebar runtime (everything dynamic
 * lives in TS, never in .astro).
 */

import { t } from '../../i18n';
import { getCurrentLang } from './sidebar-helpers';
import { formatTimeAgo } from './sidebar-time-ago';
import type { LastPosition } from './sidebar-resume';

const SESSION_DISMISS_KEY_PREFIX = 'yuval.banner.dismissed.';
const DISMISS_SCROLL_THRESHOLD_PX = 100;
const FADE_DURATION_MS = 300;
const SECTION_TITLE_MAX = 30;

/** True when the user already dismissed the banner this session. */
export function isBannerDismissedThisSession(bookId: string): boolean {
  if (!bookId) return false;
  try {
    return (
      sessionStorage.getItem(SESSION_DISMISS_KEY_PREFIX + bookId) === '1'
    );
  } catch {
    return false;
  }
}

function markBannerDismissed(bookId: string): void {
  if (!bookId) return;
  try {
    sessionStorage.setItem(SESSION_DISMISS_KEY_PREFIX + bookId, '1');
  } catch {
    /* Silent fail. */
  }
}

function positionLabelKey(scrollPercent: number): string {
  if (scrollPercent < 0.25) return 'resume.position.start';
  if (scrollPercent > 0.75) return 'resume.position.end';
  return 'resume.position.middle';
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

/** Defensive: section heading may have been renamed/removed since
 *  the save. Returns '' if not findable so the banner can fall back
 *  to the no-section copy. */
function findSectionTitle(headingId: string): string {
  if (!headingId) return '';
  try {
    const el = document.getElementById(headingId);
    return (el?.textContent || '').trim();
  } catch {
    return '';
  }
}

/**
 * Build and insert the welcome-back banner above the chapter list.
 * No-op if a banner already exists, the slot is missing, or the
 * banner has been dismissed in this session.
 */
export function showWelcomeBackBanner(
  bookId: string,
  last: LastPosition,
  elapsedMs: number,
  options: { initialScrollY: number },
): void {
  if (isBannerDismissedThisSession(bookId)) return;
  const slot = document.getElementById('usb-resume-banner-slot');
  if (!slot) return;
  if (slot.querySelector('.usb-resume-banner')) return;

  const lang = getCurrentLang();
  const sectionTitleRaw = findSectionTitle(last.sectionSlug);
  const sectionTitle = sectionTitleRaw
    ? truncate(sectionTitleRaw, SECTION_TITLE_MAX)
    : '';
  const timeAgo = formatTimeAgo(elapsedMs, lang);
  const positionLabel = t(positionLabelKey(last.scrollPercent), lang);

  const bodyText = sectionTitle
    ? t('resume.bannerBody', lang, {
        timeAgo,
        section: sectionTitle,
        position: positionLabel,
      })
    : t('resume.bannerBodyNoSection', lang, {
        timeAgo,
        position: positionLabel,
      });

  const banner = document.createElement('div');
  banner.className = 'usb-resume-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');

  banner.innerHTML = `
    <button type="button" class="usb-resume-banner-close" aria-label="${t(
      'resume.dismiss',
      lang,
    )}">
      <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true">
        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="usb-resume-banner-title">
      <span class="usb-resume-banner-emoji" aria-hidden="true">👋</span>
      <span class="usb-resume-banner-title-text"></span>
    </div>
    <div class="usb-resume-banner-body"></div>
  `;
  banner.querySelector('.usb-resume-banner-title-text')!.textContent = t(
    'resume.welcomeBack',
    lang,
  );
  banner.querySelector('.usb-resume-banner-body')!.textContent = bodyText;

  slot.appendChild(banner);
  wireDismissTriggers(bookId, banner, options.initialScrollY);
}

/** Fade the banner out and remove it. Idempotent. */
export function dismissBanner(bookId: string): void {
  const slot = document.getElementById('usb-resume-banner-slot');
  const banner = slot?.querySelector<HTMLElement>('.usb-resume-banner');
  if (!banner) return;
  if (banner.dataset.dismissing === 'true') return;
  banner.dataset.dismissing = 'true';
  banner.classList.add('usb-resume-banner-dismissing');
  markBannerDismissed(bookId);
  window.setTimeout(() => banner.remove(), FADE_DURATION_MS);
}

/**
 * Wire all three dismissal triggers. The scroll listener compares
 * against `initialScrollY` (the position where the auto-scroll
 * landed) so the banner survives the auto-scroll itself but
 * disappears the moment the reader scrolls beyond a threshold.
 */
function wireDismissTriggers(
  bookId: string,
  banner: HTMLElement,
  initialScrollY: number,
): void {
  const close = banner.querySelector<HTMLElement>(
    '.usb-resume-banner-close',
  );
  close?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissBanner(bookId);
  });

  const sidebar = document.getElementById('unified-sidebar');
  const onSidebarClick = (e: Event) => {
    /* Clicks on the banner itself shouldn't dismiss it — only the
       X does. Lets the user select the section text without losing
       the banner. */
    if ((e.target as HTMLElement)?.closest('.usb-resume-banner')) return;
    dismissBanner(bookId);
    sidebar?.removeEventListener('click', onSidebarClick);
  };
  sidebar?.addEventListener('click', onSidebarClick);

  const onScroll = () => {
    if (
      Math.abs(window.scrollY - initialScrollY) >
      DISMISS_SCROLL_THRESHOLD_PX
    ) {
      dismissBanner(bookId);
      window.removeEventListener('scroll', onScroll);
      sidebar?.removeEventListener('click', onSidebarClick);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Remove the resume banner immediately, without fade and without
 * marking it dismissed for the session. Used by chapter-swap so a
 * stale banner from the previous page doesn't linger in the
 * persisted sidebar. Distinct from dismissBanner — the user didn't
 * actually dismiss; the page just changed under them.
 */
export function clearResumeBanner(): void {
  const slot = document.getElementById('usb-resume-banner-slot');
  if (!slot) return;
  slot.innerHTML = '';
}
