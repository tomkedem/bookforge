/**
 * Ambient Book Color
 *
 * Applies a very subtle tinted glow to the reading background,
 * derived from the book's dominantColor.
 * Only in dark mode, very low opacity - creates a "mood" without distraction.
 * Inspired by Spotify's album ambient glow.
 */

function getDominantColor(): string | null {
  return document.getElementById('chapter-container')?.dataset.dominantColor || null;
}

function isDark(): boolean {
  return document.documentElement.classList.contains('dark');
}

// Parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

// Desaturate and darken a color for ambient use
function toAmbient(hex: string): string | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  // Increase saturation slightly, keep brightness low
  // Mix with a neutral dark to avoid overpowering
  const factor = 0.7; // how much the book color bleeds in
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `${r}, ${g}, ${b}`;
}

let styleEl: HTMLStyleElement | null = null;

function applyAmbient(): void {
  const color = getDominantColor();
  const dark = isDark();

  if (!color || color === '#1a1a1a' || !dark) {
    removeAmbient();
    return;
  }

  const rgb = toAmbient(color);
  if (!rgb) return;

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'ambient-color-style';
    document.head.appendChild(styleEl);
  }

  // Radial gradient from top, very subtle
  styleEl.textContent = `
    body.dark .reading-article,
    :is(.dark) .reading-article {
      background: radial-gradient(
        ellipse 120% 40% at 50% -5%,
        rgba(${rgb}, 0.12) 0%,
        transparent 70%
      ) !important;
      transition: background 1.2s ease;
    }

    /* Subtle left sidebar tint */
    :is(.dark) #toc-sidebar {
      background: linear-gradient(
        180deg,
        rgba(${rgb}, 0.06) 0%,
        transparent 40%
      );
    }
  `;
}

function removeAmbient(): void {
  if (styleEl) {
    styleEl.textContent = '';
  }
}

// Watch dark mode class changes
function watchTheme(): void {
  new MutationObserver(() => {
    applyAmbient();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

export function initAmbientColor(): void {
  applyAmbient();
  watchTheme();

  // Re-apply on chapter swap (new chapter may have different book... same book, same color)
  window.addEventListener('chapter-content-swapped', () => {
    setTimeout(applyAmbient, 100);
  });
}
