import type { Language, LanguageContext, LanguageMeta, LanguageName } from '../types/index';
import { t } from '../i18n';

/**
 * Master list of supported languages.
 * To add a new language: append one entry here — nothing else in the codebase needs to change.
 * The pipeline, components, and pages all derive their language support from this config.
 */
export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'he', label: 'עברית',   labelEn: 'Hebrew',  dir: 'rtl', locale: 'he-IL' },
  { code: 'en', label: 'English', labelEn: 'English', dir: 'ltr', locale: 'en-US' },
  { code: 'es', label: 'Español', labelEn: 'Spanish', dir: 'ltr', locale: 'es-ES' },
  // Add new languages here:
  // { code: 'fr', label: 'Français', labelEn: 'French',  dir: 'ltr', locale: 'fr-FR' },
  // { code: 'de', label: 'Deutsch',  labelEn: 'German',  dir: 'ltr', locale: 'de-DE' },
  // { code: 'ar', label: 'العربية',  labelEn: 'Arabic',  dir: 'rtl', locale: 'ar-SA' },
];

// Derived constants from SUPPORTED_LANGUAGES
export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(l => l.code);
export const RTL_LANGUAGES = new Set(SUPPORTED_LANGUAGES.filter(l => l.dir === 'rtl').map(l => l.code));

// Legacy LANGUAGES object for backward compatibility
export const LANGUAGES = Object.fromEntries(
  SUPPORTED_LANGUAGES.map(l => [l.code.toUpperCase(), l.code])
) as Record<string, string>;

export const DEFAULT_LANGUAGE: Language = 'en';
const LANG_STORAGE_KEY = 'yuval_language';
const LANG_COOKIE_NAME = 'yuval-lang';

const VALID_CODES = new Set<string>(SUPPORTED_LANGUAGES.map(l => l.code));

/**
 * Get the metadata object for a language code
 */
export const getLanguageMeta = (lang: Language): LanguageMeta => {
  return SUPPORTED_LANGUAGES.find(l => l.code === lang) ?? SUPPORTED_LANGUAGES[1];
};

/**
 * Get language context with direction and alignment
 */
export const getLanguageContext = (lang: Language): LanguageContext => {
  const meta = getLanguageMeta(lang);
  return {
    current: lang,
    direction: meta.dir,
    textAlign: meta.dir === 'rtl' ? 'right' : 'left',
    label: meta.labelEn,
  };
};

/**
 * Get human-readable language label
 */
export const getLanguageLabel = (lang: Language): LanguageName => {
  return getLanguageMeta(lang).labelEn;
};

/**
 * Validate that a value is a supported Language code
 */
export const isValidLanguage = (lang: unknown): lang is Language => {
  return typeof lang === 'string' && VALID_CODES.has(lang);
};

/**
 * Generate storage key for language preference
 * Centralized to prevent duplication
 */
export const getStorageKey = (key: string): string => {
  return `yuval_${key}`;
};

/**
 * Get language from localStorage ONLY (the toggle position).
 * Cookie is used as fallback for SSR and first-time visitors.
 * URL param is IGNORED to ensure toggle is the single source of truth.
 */
export const getLanguageFromStorage = (): Language => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  // Priority 1: localStorage (the toggle position)
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && isValidLanguage(stored)) {
    return stored as Language;
  }

  // Priority 2: cookie (for first-time visitors)
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === LANG_COOKIE_NAME && value && isValidLanguage(value)) {
      return value as Language;
    }
  }

  // Fallback to default
  return DEFAULT_LANGUAGE;
};

/**
 * Set language to localStorage AND update document attributes
 * Single function to handle all language updates
 */
export const setLanguageToStorage = (lang: Language): void => {
  if (typeof window === 'undefined') return;

  // Save to localStorage
  localStorage.setItem(LANG_STORAGE_KEY, lang);

  // Save to cookie (yuval-lang as specified in acceptance criteria)
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  document.cookie = `${LANG_COOKIE_NAME}=${lang}; expires=${expiryDate.toUTCString()}; path=/`;

  // Update document attributes
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
};

/**
 * Apply language to page.
 *
 * Handles two systems:
 *
 * 1. NEW — data-i18n="key"
 *    Looks up the key in the central translations registry.
 *    Works for any number of languages with no HTML changes.
 *
 * 2. LEGACY — data-he / data-en / data-es (kept for dynamic content like book/chapter titles)
 *    Falls back to data-en, then data-he for missing translations.
 *    Single-lang elements are shown/hidden.
 */
export const applyLanguageToPage = (lang: Language): void => {
  // ── 1. New i18n system ──────────────────────────────────────────────────────
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')!;
    el.textContent = t(key, lang);
  });

  // ── 2. Legacy data-{lang} system (dynamic content) ──────────────────────────
  // Generate selector dynamically from SUPPORTED_LANGUAGES
  const selector = LANGUAGE_CODES.map(code => `[data-${code}]`).join(', ');

  document.querySelectorAll(selector).forEach(el => {
    const values: Record<string, string | null> = {};
    LANGUAGE_CODES.forEach(code => {
      values[code] = el.getAttribute(`data-${code}`);
    });

    const hasMultiple = LANGUAGE_CODES.filter(code => values[code] !== null).length > 1;
    if (hasMultiple) {
      // Fallback chain: requested lang -> en -> first available
      const text = values[lang] ?? values['en'] ?? Object.values(values).find(v => v !== null) ?? null;
      if (text !== null) el.textContent = text;
    } else {
      const ownLang = LANGUAGE_CODES.find(code => values[code] !== null);
      if (ownLang) {
        (el as HTMLElement).classList.toggle('hidden', ownLang !== lang);
      }
    }
  });

  setLanguageToStorage(lang);
};

/**
 * Initialize language on page load
 * Handles all aspects of initial language setup
 */
export const initializeLanguage = (): Language => {
  const lang = getLanguageFromStorage();
  applyLanguageToPage(lang);
  return lang;
};

/**
 * Dispatch language changed event for all components to listen to
 * Standard way to notify app of language changes
 */
export const dispatchLanguageChangeEvent = (lang: Language): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('language-changed', {
        detail: { language: lang },
        bubbles: true,
      })
    );
  }
};

/**
 * Listen for language changes with automatic cleanup
 * Returns cleanup function
 */
export const onLanguageChange = (
  callback: (lang: Language) => void,
  signal?: AbortSignal
): void => {
  if (typeof window === 'undefined') return;

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ language: Language }>;
    callback(customEvent.detail.language);
  };

  window.addEventListener('language-changed', handler, { signal });
};
