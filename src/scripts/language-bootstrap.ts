/**
 * Language bootstrap.
 *
 * Reads the persisted language from storage on first paint and on every
 * Astro view transition, and listens for `language-changed` events
 * dispatched by the LanguageSelector to apply the new language across
 * the document (lang attr, dir attr, in-page translations).
 *
 * Lives as a stand-alone script so Astro's bundler resolves the
 * ../utils/language import correctly. When the same logic was inlined
 * inside a `<script type="module">` block in BaseLayout.astro, some
 * builds emitted the raw TS source into the page — including the ES
 * module import, which the browser then failed to resolve.
 */

import {
  getLanguageFromStorage,
  isValidLanguage,
  applyLanguageToPage,
  getLanguageDirection,
} from '../utils/language';

function applyStoredLanguage(): void {
  const storedLang = getLanguageFromStorage();
  if (isValidLanguage(storedLang)) {
    document.documentElement.lang = storedLang;
    document.documentElement.dir = getLanguageDirection(storedLang);
    applyLanguageToPage(storedLang);
  }
}

applyStoredLanguage();
document.addEventListener('astro:after-swap', applyStoredLanguage);

window.addEventListener('language-changed', (e: Event) => {
  const customEvent = e as CustomEvent<{ language?: string }>;
  const lang = customEvent.detail?.language;
  if (!lang) return;

  document.documentElement.lang = lang;
  document.documentElement.dir = getLanguageDirection(lang);
  applyLanguageToPage(lang);
});
