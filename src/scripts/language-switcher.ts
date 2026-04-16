import {
  SUPPORTED_LANGUAGES,
  getLanguageFromStorage,
  setLanguageToStorage,
} from '../utils/language';

import { applyLanguageToPage } from '../utils/language';
import { resolveLanguage } from '../i18n';
import type { Language } from '../types/index';

/**
 * Switch content blocks by data-lang
 */
function switchLanguage(lang: string) {
  const targets = ['chapter-container', 'chapter-header', 'chapter-meta-bar'];
  const langCodes = SUPPORTED_LANGUAGES.map(l => l.code);

  for (const id of targets) {
    const el = document.getElementById(id);
    if (!el) continue;

    for (const code of langCodes) {
      const block = el.querySelector<HTMLElement>(`[data-lang="${code}"]`);
      if (!block) continue;

      const isActive = code === lang;
      block.classList.toggle('hidden', !isActive);
      block.classList.toggle('visible', isActive);
    }
  }

  const meta = SUPPORTED_LANGUAGES.find(l => l.code === lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = meta?.dir ?? 'ltr';

  applyLanguageToPage(lang as Language);
}

/**
 * Init language system
 */
export function initLanguageSwitcher(controller: AbortController) {
  // ✅ normalize language from storage
  const raw = getLanguageFromStorage();
  const currentLanguage = resolveLanguage(raw);

  // ✅ persist normalized value
  setLanguageToStorage(currentLanguage as Language);

  // ✅ apply immediately
  switchLanguage(currentLanguage);

  window.addEventListener('language-changed', (event: Event) => {
    const rawLang = (event as CustomEvent<{ language: string }>).detail?.language;
    const lang = resolveLanguage(rawLang);

    setLanguageToStorage(lang as Language);
    switchLanguage(lang);
  }, { signal: controller.signal });
}