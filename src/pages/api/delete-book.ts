/**
 * API endpoint to delete a book and all its files from the filesystem.
 * POST /api/delete-book
 * Body: { slug: string }
 *
 * Deletes:
 * - output/<slug>/ (all chapter files in all languages)
 * - public/<slug>/assets/ (images)
 * - public/covers/<slug>.png (cover image)
 *
 * Preserves (never touched by this endpoint):
 * - src/assets/knowledge-cards/<slug>/
 *   knowledge-cards is an ASSET LIBRARY, not a book source of truth.
 *   The orbit/carousel artwork is expensive to recreate, and the book
 *   may be regenerated later from the original Word file via the
 *   pipeline. Leaving the folder under its original slug means that
 *   when the book is re-discovered (via `output/<slug>/`), the existing
 *   artwork is picked up automatically — no manual restore step, no
 *   re-upload.
 *
 *   Orphan assets are safe: library discovery (book-discovery.ts) only
 *   surfaces a slug if `output/<slug>/` exists AND contains chapters,
 *   so a knowledge-cards folder without matching output never becomes
 *   a "ghost" station in the universe.
 */

import type { APIRoute } from 'astro';
import { existsSync, rmSync, readdirSync, rmdirSync } from 'fs';
import { resolve } from 'path';

export const prerender = false;

const REPO_ROOT = resolve(process.cwd());

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const slug = body.slug;

    // Validate slug
    if (!slug || typeof slug !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Security: prevent path traversal
    if (slug.includes('/') || slug.includes('\\') || slug.startsWith('.')) {
      return new Response(JSON.stringify({ error: 'Invalid slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const deleted: string[] = [];
    // Kept in the response for backward-compatibility with any caller
    // that still reads the field. The new policy is "knowledge-cards is
    // never touched on delete", so this list is always empty — see the
    // preservation block below for the rationale.
    const archived: string[] = [];
    const missing: string[] = [];
    const preserved: string[] = [];

    // 1. Delete output/<slug>/
    const bookDir = resolve(REPO_ROOT, 'output', slug);
    if (existsSync(bookDir)) {
      rmSync(bookDir, { recursive: true, force: true });
      deleted.push(`output/${slug}/`);
    } else {
      missing.push(`output/${slug}/`);
    }

    // 2. Delete public/<slug>/assets/
    const assetsDir = resolve(REPO_ROOT, 'public', slug, 'assets');
    if (existsSync(assetsDir)) {
      rmSync(assetsDir, { recursive: true, force: true });
      deleted.push(`public/${slug}/assets/`);
      
      // Remove empty parent dir
      const parentDir = resolve(REPO_ROOT, 'public', slug);
      if (existsSync(parentDir)) {
        const contents = readdirSync(parentDir);
        if (contents.length === 0) {
          rmdirSync(parentDir);
          deleted.push(`public/${slug}/`);
        }
      }
    } else {
      missing.push(`public/${slug}/assets/`);
    }

    // 3. Delete public/covers/<slug>.png
    const coverPng = resolve(REPO_ROOT, 'public', 'covers', `${slug}.png`);
    if (existsSync(coverPng)) {
      rmSync(coverPng);
      deleted.push(`public/covers/${slug}.png`);
    } else {
      missing.push(`public/covers/${slug}.png`);
    }

    // 4. Delete public/covers/<slug>.jpg (fallback)
    const coverJpg = resolve(REPO_ROOT, 'public', 'covers', `${slug}.jpg`);
    if (existsSync(coverJpg)) {
      rmSync(coverJpg);
      deleted.push(`public/covers/${slug}.jpg`);
    }

    // 5. PRESERVE the knowledge-card artwork — never delete, never rename.
    //    knowledge-cards is treated as a reusable asset library, not as a
    //    book source of truth. Two reasons:
    //      (a) Re-import safety: when the book is regenerated later from
    //          the original Word/source file via the pipeline, the same
    //          slug will appear under output/<slug>/ again. Leaving the
    //          artwork untouched here means the next discovery pass picks
    //          it up automatically — no manual restore, no broken cards.
    //      (b) Orphan safety: book-discovery.ts (see discoverBook) only
    //          surfaces slugs that have a real output/<slug>/ folder with
    //          chapters. A knowledge-cards folder without matching output
    //          cannot produce a LibraryItem and therefore cannot render a
    //          ghost station in the universe, so leaving the assets in
    //          place is harmless.
    //    This block intentionally performs no filesystem operation on the
    //    knowledge-cards folder. It records the preservation in the
    //    response so the caller can show the user what was kept.
    const knowledgeCardsDir = resolve(
      REPO_ROOT, 'src', 'assets', 'knowledge-cards', slug,
    );
    if (existsSync(knowledgeCardsDir)) {
      preserved.push(`src/assets/knowledge-cards/${slug}/`);
    }

    if (deleted.length === 0 && archived.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: `No files found for book "${slug}"`,
        missing,
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      deleted,
      archived,
      preserved,
      missing,
      message: `Book "${slug}" deleted successfully`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Delete book error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
