import type { Language, LanguageContext, LanguageName } from '../types/index';

export const LANGUAGES = {
  HE: 'he' as const,
  EN: 'en' as const,
} as const;

export const DEFAULT_LANGUAGE: Language = LANGUAGES.EN;
const LANG_STORAGE_KEY = 'yuval_language';
const LANG_COOKIE_NAME = 'yuval-lang';

/**
 * Get language context with direction and alignment
 * Used throughout the app for RTL/LTR handling
 */
export const getLanguageContext = (lang: Language): LanguageContext => {
  return {
    current: lang,
    direction: lang === LANGUAGES.HE ? 'rtl' : 'ltr',
    textAlign: lang === LANGUAGES.HE ? 'right' : 'left',
    label: lang === LANGUAGES.HE ? 'Hebrew' : 'English',
  };
};

/**
 * Get the opposite language (HE <-> EN)
 */
export const getOppositeLanguage = (lang: Language): Language => {
  return lang === LANGUAGES.HE ? LANGUAGES.EN : LANGUAGES.HE;
};

/**
 * Get human-readable language label
 */
export const getLanguageLabel = (lang: Language): LanguageName => {
  return lang === LANGUAGES.HE ? 'Hebrew' : 'English';
};

/**
 * Validate that a value is a valid Language type
 */
export const isValidLanguage = (lang: unknown): lang is Language => {
  return lang === LANGUAGES.HE || lang === LANGUAGES.EN;
};

/**
 * Generate storage key for language preference
 * Centralized to prevent duplication
 */
export const getStorageKey = (key: string): string => {
  return `yuval_${key}`;
};

/**
 * Get language from multiple sources: URL param, localStorage, cookie, default
 * Single source of truth for language detection
 */
export const getLanguageFromStorage = (): Language => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  // Priority 1: URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang && isValidLanguage(urlLang)) {
    return urlLang as Language;
  }

  // Priority 2: localStorage
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && isValidLanguage(stored)) {
    return stored as Language;
  }

  // Priority 3: cookie (for server-side support)
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
  document.documentElement.dir = lang === LANGUAGES.HE ? 'rtl' : 'ltr';
};

/**
 * Apply language to page by toggling data-he/data-en attributes
 * Centralized content switching logic
 */
export const applyLanguageToPage = (lang: Language): void => {
  const heElements = document.querySelectorAll('[data-he]');
  const enElements = document.querySelectorAll('[data-en]');

  if (lang === LANGUAGES.HE) {
    heElements.forEach(el => {
      el.classList.remove('hidden');
      el.classList.add('visible');
    });
    enElements.forEach(el => {
      el.classList.add('hidden');
      el.classList.remove('visible');
    });
  } else {
    enElements.forEach(el => {
      el.classList.remove('hidden');
      el.classList.add('visible');
    });
    heElements.forEach(el => {
      el.classList.add('hidden');
      el.classList.remove('visible');
    });
  }

  // Update document
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
