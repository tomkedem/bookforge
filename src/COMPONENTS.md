# Yuval Platform - Astro Components Documentation

## Overview

This document describes all Astro components and pages for the Yuval digital reading platform. The platform supports Hebrew (RTL) and English (LTR) with mobile-first responsive design.

## Components

### LanguageToggle.astro

A bilingual language switch component for Hebrew/English selection with localStorage persistence.

Props:
- currentLanguage?: Language - Current language ('he' or 'en')
- class?: string - Additional CSS classes

Features:
- Toggle between Hebrew and English
- Persists preference to localStorage
- Dispatches custom event on language change
- Full keyboard accessibility
- RTL/LTR aware styling

### BookCard.astro

Displays a book with cover image, title, description, and call-to-action button.

Props:
- slug: string - Book URL slug
- title: string - Book title
- description: string - Short description
- coverImage: string - Image URL
- dominantColor?: string - Overlay color on hover
- language?: Language - Current language
- class?: string - Additional CSS classes

Features:
- Dominant color overlay on hover
- Responsive image handling
- Accessible focus states
- Smooth transitions

### ReadingProgress.astro

A sticky progress bar showing reading progress in current chapter.

Props:
- scrollPercentage?: number - Progress percentage (0-100)
- language?: Language - Current language
- class?: string - Additional CSS classes

Features:
- Automatic scroll tracking
- Accessible ARIA labels
- Smooth progress animation

### ChapterNavigation.astro

Navigation between chapters with previous/next buttons and chapter info.

### Header.astro

Sticky header with logo and language toggle.

## Layouts

### BaseLayout.astro

Root layout for all pages with header, progress bar, and meta tags.

### ReadingLayout.astro

Specialized layout for chapter reading with optimized typography.

## Pages

### index.astro (/)

Homepage displaying all available books in a grid layout.

### books/[slug].astro (/books/:slug)

Book detail page showing description, metadata, and chapter list.

### read/[book]/[chapter].astro (/read/:book/:chapter)

Reading page for individual chapters with full typography and navigation.

## Utilities

### language.ts

Language management utilities for RTL/LTR switching and localStorage persistence.

### reading-progress.ts

Reading progress tracking and scroll position restoration.

### data-loader.ts

Data loading utilities for books and chapters from various sources.

## Design System Integration

All components use Tailwind CSS with custom colors:

Color Classes:
- text-yuval-text - Primary text (#1a1a1a)
- text-yuval-text-secondary - Secondary text (#4a4a4a)
- text-yuval-text-tertiary - Tertiary text (#888888)
- bg-yuval-bg - Primary background (#ffffff)
- bg-yuval-bg-secondary - Secondary background (#fafaf8)
- border-yuval-border - Primary border (#f0ede8)

Font Classes:
- font-heading - Frank Ruhl Libre (headings)
- font-body - Heebo (body text)
- font-code - JetBrains Mono (code)

## Mobile-First Design

All components use mobile-first CSS:
1. Base styles for mobile
2. sm: for tablets (640px+)
3. lg: for desktop (1024px+)

## Language Support

RTL/LTR Handling:
- Hebrew content uses dir="rtl" and text-right
- English content uses dir="ltr" and text-left
- Flex directions reverse for RTL
- Arrow icons flip direction

## Accessibility

All components follow WCAG AA guidelines:
- Proper semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
