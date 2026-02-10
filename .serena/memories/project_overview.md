# hongsoohyuk - Project Overview

## Purpose
Personal portfolio website (hongsoohyuk.com) showcasing projects, Instagram feed, and guestbook.

## Tech Stack
- Framework: Next.js 16.1 (App Router + Turbopack)
- UI: React 19 + Tailwind CSS v4 + Radix UI + shadcn/ui
- Data: TanStack React Query v5, Supabase (guestbook), Notion API (projects)
- i18n: next-intl v4 (ko/en)
- Form: React Hook Form + Zod v4
- Animation: Motion v12
- Testing: Jest v30 + Playwright
- Package Manager: pnpm

## Architecture: Bulletproof React
src/features/ (project, guestbook, instagram, home, resume)
src/components/ (ui/, layout/, notion/)
src/hooks/, src/lib/, src/config/, src/types/, src/utils/

Dependency: shared -> features -> app (unidirectional, ESLint enforced)
