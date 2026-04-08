import type { Language } from '../types/index';
import { LANGUAGES } from './language';

export interface ChapterContent {
  id: number;
  title: string;
  content: string;
  html: string;
  language: Language;
  wordCount: number;
  readingTimeMinutes: number;
}

/**
 * Load chapter content from markdown files
 * Supports both Hebrew and English versions
 */
export async function loadChapterContent(
  bookSlug: string,
  chapterId: number,
  language: Language
): Promise<ChapterContent | null> {
  try {
    const langCode = language === LANGUAGES.HE ? 'he' : 'en';
    const filename = `chapter-${String(chapterId).padStart(2, '0')}.${langCode}.md`;

    // In a real app, this would fetch from your content API or file system
    // For now, we load from the public/content directory
    const response = await fetch(`/content/${bookSlug}/${filename}`);

    if (!response.ok) {
      console.warn(`Chapter ${chapterId} not found for language ${language}`);
      return null;
    }

    const markdownContent = await response.text();

    // Parse markdown to get title (first H1) and extract content
    const lines = markdownContent.split('\n');
    const titleMatch = lines.find(line => line.startsWith('# '));
    const title = titleMatch ? titleMatch.replace(/^#\s+/, '').trim() : `Chapter ${chapterId}`;

    // Calculate reading time (average 200 words per minute)
    const wordCount = markdownContent.split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // For now, return raw markdown wrapped in HTML
    // In production, this would use a markdown-to-HTML converter like marked or remark
    const html = `<div class="prose prose-${language === LANGUAGES.HE ? 'rtl' : 'ltr'}">${escapeHtml(markdownContent)}</div>`;

    return {
      id: chapterId,
      title,
      content: markdownContent,
      html,
      language,
      wordCount,
      readingTimeMinutes,
    };
  } catch (error) {
    console.error(`Error loading chapter ${chapterId}:`, error);
    return null;
  }
}

/**
 * Load all chapters for a book
 */
export async function loadAllChapters(
  bookSlug: string,
  language: Language
): Promise<ChapterContent[]> {
  const chapters: ChapterContent[] = [];

  // Try loading up to 20 chapters (0-19)
  for (let i = 0; i < 20; i++) {
    const content = await loadChapterContent(bookSlug, i, language);
    if (content) {
      chapters.push(content);
    }
  }

  return chapters;
}

/**
 * Simple HTML escape utility
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Parse markdown content to HTML (simple version)
 * For production, use a library like marked or remark
 */
export function markdownToHtml(markdown: string, language: Language): string {
  let html = markdown;

  // Convert headings
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Convert bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Convert lists
  html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Convert paragraphs
  const paragraphs = html.split('\n\n');
  html = paragraphs
    .map(p => p.trim())
    .filter(p => p && !p.startsWith('<'))
    .map(p => `<p>${p}</p>`)
    .join('\n');

  // Add RTL/LTR wrapper
  const dir = language === LANGUAGES.HE ? 'rtl' : 'ltr';
  const align = language === LANGUAGES.HE ? 'right' : 'left';

  return `<div class="chapter-content" dir="${dir}" style="text-align: ${align}">${html}</div>`;
}
