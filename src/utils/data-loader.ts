import type { Book, Chapter } from '../types/index';
import { discoverAllBooks, discoverBook } from './book-discovery';

/**
 * DataLoader - Utility for loading book and chapter data
 * Uses book-discovery for automatic detection of all books in output/
 */

export class DataLoader {
  /**
   * Load all books - auto-discovers from output/ folder
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
    // Use book-discovery to auto-detect all books
    const discovered = discoverAllBooks();
    
    return discovered.map(book => ({
      slug: book.slug,
      title_he: book.title_he,
      title_en: book.title_en,
      description_he: book.description_he,
      description_en: book.description_en,
      coverImage: book.coverImage,
      dominantColor: book.dominantColor,
    }));
  }

  /**
   * Load book by slug - auto-discovers from output/ folder
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
    // Use book-discovery to auto-detect the book
    const discovered = discoverBook(slug);
    
    if (!discovered) return null;

    return {
      slug: discovered.slug,
      title_he: discovered.title_he,
      title_en: discovered.title_en,
      description_he: discovered.description_he,
      description_en: discovered.description_en,
      coverImage: discovered.coverImage,
      dominantColor: discovered.dominantColor,
      chapters: discovered.chapters,
    };
  }

  /**
   * Load chapters for a book - delegates to loadBook
   * @deprecated Use loadBook instead, which includes chapters
   */
  static async loadChapters(bookSlug: string): Promise<Chapter[]> {
    const book = await this.loadBook(bookSlug);
    return book?.chapters || [];
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
