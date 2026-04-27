/**
 * Humanize an elapsed-time duration for the resume banner.
 *
 * Hebrew has dual forms (שעתיים / יומיים / שבועיים) that English
 * and Spanish lack. For n=2 we use a dedicated "*Dual" key; for
 * n≥3 we use a pluralized {{n}} key. English/Spanish translations
 * of the dual key mirror the plural form so the lookup logic stays
 * uniform across languages.
 *
 * Buckets match the spec:
 *   < 5 min      → timeAgo.justNow
 *   5–59 min     → timeAgo.minutes  (n)
 *   1 hour       → timeAgo.hour
 *   2 hours      → timeAgo.hoursDual
 *   3–23 hours   → timeAgo.hours    (n)
 *   1 day        → timeAgo.yesterday
 *   2 days       → timeAgo.daysDual
 *   3–6 days     → timeAgo.days     (n)
 *   7–13 days    → timeAgo.week
 *   14 days      → timeAgo.weeksDual
 *   15–29 days   → timeAgo.weeks    (n)
 *   ≥ 30 days    → timeAgo.moreThanMonth
 */

import { t } from '../../i18n';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;

export function formatTimeAgo(elapsedMs: number, lang: string): string {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return t('timeAgo.justNow', lang);
  }

  if (elapsedMs < 5 * MIN) {
    return t('timeAgo.justNow', lang);
  }
  if (elapsedMs < HOUR) {
    const n = Math.floor(elapsedMs / MIN);
    return t('timeAgo.minutes', lang, { n });
  }
  if (elapsedMs < DAY) {
    const n = Math.floor(elapsedMs / HOUR);
    if (n <= 1) return t('timeAgo.hour', lang);
    if (n === 2) return t('timeAgo.hoursDual', lang);
    return t('timeAgo.hours', lang, { n });
  }
  if (elapsedMs < 2 * DAY) {
    return t('timeAgo.yesterday', lang);
  }
  if (elapsedMs < WEEK) {
    const n = Math.floor(elapsedMs / DAY);
    if (n === 2) return t('timeAgo.daysDual', lang);
    return t('timeAgo.days', lang, { n });
  }
  if (elapsedMs < 2 * WEEK) {
    return t('timeAgo.week', lang);
  }
  if (elapsedMs < MONTH) {
    const n = Math.floor(elapsedMs / WEEK);
    if (n === 2) return t('timeAgo.weeksDual', lang);
    return t('timeAgo.weeks', lang, { n });
  }
  return t('timeAgo.moreThanMonth', lang);
}
