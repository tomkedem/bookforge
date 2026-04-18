import { t, isRtlLang } from '../i18n';

function getLang(): string {
  return new URLSearchParams(window.location.search).get('lang')
    || localStorage.getItem('yuval_language')
    || 'he'; // source language
}

function tr(key: string) {
  return t(key, getLang());
}

// ── State ─────────────────────────────────────────────────────────────────────

let playing = false;
let paused = false;
let currentParagraphIdx = 0;
let paragraphs: HTMLElement[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;
let selectedVoice: SpeechSynthesisVoice | null = null;
let playbackRate = 1;

const HIGHLIGHT_CLASS = 'tts-reading-highlight';
const VOICE_STORAGE_KEY = 'yuval_tts_voice';
const SPEED_STORAGE_KEY = 'yuval_tts_speed';

// ── Storage ───────────────────────────────────────────────────────────────────

function getSavedVoiceName(): string | null {
  return localStorage.getItem(`${VOICE_STORAGE_KEY}_${getLang()}`);
}

function saveVoiceName(voice: SpeechSynthesisVoice): void {
  localStorage.setItem(`${VOICE_STORAGE_KEY}_${getLang()}`, voice.name);
}

function getSavedSpeed(): number {
  return parseFloat(localStorage.getItem(SPEED_STORAGE_KEY) || '1');
}

function saveSpeed(rate: number): void {
  localStorage.setItem(SPEED_STORAGE_KEY, String(rate));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// 🔥 אין hardcode לשפות
function getLangCode(): string {
  const lang = getLang();

  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()));

  return match?.lang || lang;
}

function getVoicesForLang(): SpeechSynthesisVoice[] {
  const lang = getLang().toLowerCase();
  const voices = window.speechSynthesis.getVoices();

  return voices.filter(v => v.lang.toLowerCase().startsWith(lang));
}

// 🔥 בלי fallback ל-en
function getParagraphs(): HTMLElement[] {
  const container = document.querySelector<HTMLElement>(
    '.chapter-content.visible'
  ) || document.querySelector<HTMLElement>('.chapter-content');

  if (!container) return [];

  return Array.from(container.querySelectorAll<HTMLElement>('p, h2, h3, li'))
    .filter(el => el.textContent?.trim().length);
}

// ── Highlight ─────────────────────────────────────────────────────────────────

function clearHighlight(): void {
  document.querySelectorAll<HTMLElement>(`.${HIGHLIGHT_CLASS}`).forEach(el => {
    el.classList.remove(HIGHLIGHT_CLASS);
    el.style.removeProperty('background');
    el.style.removeProperty('border-radius');
  });
}

function highlightParagraph(el: HTMLElement): void {
  clearHighlight();
  el.classList.add(HIGHLIGHT_CLASS);
  el.style.background = 'rgba(71,85,105,0.12)';
  el.style.borderRadius = '6px';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── Playback ──────────────────────────────────────────────────────────────────

function speakParagraph(idx: number): void {
  if (idx >= paragraphs.length) {
    stopAll();
    return;
  }

  const el = paragraphs[idx];
  const text = el.textContent?.trim() || '';

  if (!text) {
    speakParagraph(idx + 1);
    return;
  }

  highlightParagraph(el);

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = getLangCode();
  utt.rate = playbackRate;

  const voices = getVoicesForLang();

  if (selectedVoice) {
    utt.voice = selectedVoice;
  } else {
    selectedVoice = voices.find(v => v.localService) || voices[0] || null;
    utt.voice = selectedVoice;
  }

  utt.onend = () => {
    if (!playing) return;
    currentParagraphIdx = idx + 1;
    speakParagraph(currentParagraphIdx);
  };

  utt.onerror = () => {
    currentParagraphIdx = idx + 1;
    speakParagraph(currentParagraphIdx);
  };

  currentUtterance = utt;
  window.speechSynthesis.speak(utt);
}

function play(): void {
  if (paused) {
    window.speechSynthesis.resume();
    paused = false;
    playing = true;
    return;
  }

  paragraphs = getParagraphs();
  if (!paragraphs.length) return;

  window.speechSynthesis.cancel();

  playing = true;
  paused = false;

  speakParagraph(currentParagraphIdx);
}

function pause(): void {
  window.speechSynthesis.pause();
  paused = true;
  playing = false;
}

function stopAll(): void {
  window.speechSynthesis.cancel();
  playing = false;
  paused = false;
  currentParagraphIdx = 0;
  currentUtterance = null;
  clearHighlight();
  notifyState();
}

function notifyState(): void {
  document.dispatchEvent(new CustomEvent('tts:state', {
    detail: { playing, paused },
  }));
}

export function toggleTextToSpeech(): void {
  if (!('speechSynthesis' in window)) return;
  if (playing) {
    pause();
  } else {
    play();
  }
  notifyState();
}

export function getTextToSpeechState(): { playing: boolean; paused: boolean } {
  return { playing, paused };
}

// ── UI ────────────────────────────────────────────────────────────────────────

const PLAY_ICON = '🔊';
const PAUSE_ICON = '⏸';

function buildWidget(): HTMLButtonElement | null {
  const existing = document.getElementById('tts-fab') as HTMLButtonElement | null;
  if (existing) return existing;

  const btn = document.createElement('button');
  btn.id = 'tts-fab';
  btn.type = 'button';
  btn.setAttribute('aria-label', tr('fab.readAloud') || 'Read aloud');
  btn.setAttribute('aria-pressed', 'false');
  btn.title = tr('fab.readAloud') || 'Read aloud';
  btn.textContent = PLAY_ICON;
  document.body.appendChild(btn);
  return btn;
}

function syncWidgetState(btn: HTMLButtonElement): void {
  const active = playing;
  btn.textContent = active ? PAUSE_ICON : PLAY_ICON;
  btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  const labelKey = active ? 'fab.readAloudPause' : 'fab.readAloud';
  const label = tr(labelKey) || (active ? 'Pause reading' : 'Read aloud');
  btn.setAttribute('aria-label', label);
  btn.title = label;
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initTextToSpeech(signal: AbortSignal): void {
  if (!('speechSynthesis' in window)) return;

  playbackRate = getSavedSpeed() || 1;

  const loadVoices = () => {
    const voices = getVoicesForLang();
    const savedName = getSavedVoiceName();
    const saved = savedName ? voices.find(v => v.name === savedName) : null;
    if (saved) {
      selectedVoice = saved;
    } else if (voices.length) {
      selectedVoice = voices.find(v => v.localService) || voices[0];
    }
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
  } else {
    loadVoices();
  }

  (window as unknown as { __ttsToggle?: () => void }).__ttsToggle = toggleTextToSpeech;
  (window as unknown as { __ttsState?: () => { playing: boolean; paused: boolean } }).__ttsState = getTextToSpeechState;

  const btn = buildWidget();
  if (btn) {
    syncWidgetState(btn);
    btn.addEventListener('click', () => {
      toggleTextToSpeech();
    }, { signal });
    const onStateChange = () => syncWidgetState(btn);
    document.addEventListener('tts:state', onStateChange, { signal });
  }

  signal.addEventListener('abort', () => {
    stopAll();
    delete (window as unknown as { __ttsToggle?: () => void }).__ttsToggle;
    delete (window as unknown as { __ttsState?: () => unknown }).__ttsState;
    document.getElementById('tts-fab')?.remove();
  });
}