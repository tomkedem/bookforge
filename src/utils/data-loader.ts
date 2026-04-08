import type { Book, Chapter } from '../types/index';

/**
 * DataLoader - Utility for loading book and chapter data
 * In production, this would fetch from an API or database
 */

export class DataLoader {
  /**
   * Load all books
   * @returns Promise<Book[]>
   */
  static async loadBooks(): Promise<
    Array<{
      slug: string;
      title_he: string;
      title_en: string;
      description_he: string;
      description_en: string;
      coverImage: string;
      dominantColor: string;
    }>
  > {
    // In a real app, fetch from API
    return [
      {
        slug: 'bookforge',
        title_he: 'BookForge: בניית מערכות סוכנים עם Claude Code',
        title_en: 'BookForge: Building Agent Systems with Claude Code',
        description_he:
          'ספר מעשי על בניית מערכות סוכנים משוכללות באמצעות Claude Code',
        description_en:
          'A practical guide to building sophisticated agent systems with Claude Code',
        coverImage: '/covers/bookforge.jpg',
        dominantColor: '#1a1a1a',
      },
    ];
  }

  /**
   * Load book by slug
   */
  static async loadBook(
    slug: string
  ): Promise<
    | {
        slug: string;
        title_he: string;
        title_en: string;
        description_he: string;
        description_en: string;
        coverImage: string;
        dominantColor: string;
        chapters: Chapter[];
      }
    | null
  > {
    const books = await this.loadBooks();
    const book = books.find((b) => b.slug === slug);

    if (!book) return null;

    return {
      ...book,
      chapters: await this.loadChapters(slug),
    };
  }

  /**
   * Load chapters for a book
   */
  static async loadChapters(bookSlug: string): Promise<Chapter[]> {
    // Mock data - in real app, load from markdown files or API
    if (bookSlug === 'bookforge') {
      return [
        {
          id: 0,
          title_he: 'פרק הכנה: פרויקט ההדגמה והסביבה',
          title_en: 'Prep Chapter: The Demo Project and Environment',
          sections: 6,
          has_images: true,
          word_count: 1100,
          topics: [
            'BookForge Overview',
            'Yuval Platform',
            'Agent System Architecture',
          ],
        },
        {
          id: 1,
          title_he: 'פרק 1: שינוי מודל המנטלי',
          title_en: 'Chapter 1: Changing the Mental Model',
          sections: 4,
          has_images: false,
          word_count: 1050,
          topics: ['Helper vs Agent System', 'Comparative Scenarios'],
        },
        {
          id: 2,
          title_he: 'פרק 2: CLAUDE.md כארכיטקטורה',
          title_en: 'Chapter 2: CLAUDE.md as Architecture',
          sections: 5,
          has_images: false,
          word_count: 1200,
          topics: ['CLAUDE.md as Constitution', 'Local Configuration'],
        },
        {
          id: 3,
          title_he: 'פרק 3: Subagents, חלוקת עבודה נכונה',
          title_en: 'Chapter 3: Subagents, Proper Work Division',
          sections: 6,
          has_images: true,
          word_count: 3600,
          topics: ['Single Agent Limitations', 'Subagent Architecture'],
        },
      ];
    }

    return [];
  }

  /**
   * Load chapter content
   */
  static async loadChapterContent(
    bookSlug: string,
    chapterId: number,
    language: 'he' | 'en'
  ): Promise<string> {
    // In real app, fetch markdown and parse it
    const lang = language === 'he' ? 'he' : 'en';
    const fileName = `chapter-${String(chapterId).padStart(2, '0')}.${lang}.md`;

    try {
      // This would fetch from your content source
      const response = await fetch(`/content/${bookSlug}/${fileName}`);
      if (!response.ok) throw new Error('Not found');
      return await response.text();
    } catch {
      return `# Chapter ${chapterId}\n\nContent not found.`;
    }
  }

  /**
   * Get all available languages
   */
  static getAvailableLanguages(): Array<{ code: 'he' | 'en'; label: string }> {
    return [
      { code: 'he', label: 'Hebrew' },
      { code: 'en', label: 'English' },
    ];
  }
}
