/**
 * Page Repository
 *
 * Data-access module for the `pages` table.
 * Uses the Prisma db client to persist crawled pages.
 *
 * Responsibility:
 *   Take a CrawlResult produced by fetchWebpage() and upsert it
 *   into the `pages` table via Prisma.
 *
 * Field mapping:
 *   CrawlResult.url         → pages.url
 *   CrawlResult.title       → pages.title  (extracted from <title> by Cheerio in fetchWebpage)
 *   CrawlResult.html        → pages.html
 *   CrawlResult.pageText    → pages.page_text (cleaned searchable visible text)
 *   CrawlResult.status      → pages.status
 *   CrawlResult.contentType → pages.content_type (via Prisma field alias)
 */

import { db } from './prisma/db';
import type { CrawlResult } from './crawler';

export interface SavedPage {
  id: number;
  url: string;
  title: string | null;
  pageText: string | null;
  status: number;
  contentType: string | null;
  crawledAt: Date;
}

/**
 * Upserts a crawled page into the `pages` table.
 *
 * If the URL already exists, the existing row is updated with the
 * latest crawl data (title, html, pageText, status, contentType, crawledAt).
 * Title and clean visible pageText are extracted using Cheerio inside fetchWebpage().
 *
 * @param result - The CrawlResult produced by fetchWebpage().
 * @returns The upserted row (id, url, title, pageText, status, contentType, crawledAt).
 */
export async function saveCrawledPage(result: CrawlResult): Promise<SavedPage> {
  const now = new Date();

  const row = await db.orm.public.Page.upsert({
    create: {
      url: result.url,
      html: result.html,
      pageText: result.pageText ?? null,
      status: result.status,
      contentType: result.contentType ?? null,
      title: result.title ?? null,
      crawledAt: now,
    },
    update: {
      html: result.html,
      pageText: result.pageText ?? null,
      status: result.status,
      contentType: result.contentType ?? null,
      title: result.title ?? null,
      crawledAt: now,
    },
    conflictOn: { url: result.url },
  });

  return {
    id: row.id,
    url: row.url,
    title: row.title,
    pageText: row.pageText,
    status: row.status,
    contentType: row.contentType,
    crawledAt: row.crawledAt,
  };
}
