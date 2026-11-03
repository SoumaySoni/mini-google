/**
 * PostgreSQL Database Module for Storing Crawled Pages
 *
 * Responsibilities:
 * 1. Initialize the PostgreSQL connection (supports external PostgreSQL via DATABASE_URL or persistent embedded PostgreSQL via PGlite).
 * 2. Manage the `pages` table schema with essential fields:
 *    - url (TEXT UNIQUE NOT NULL)
 *    - title (TEXT)
 *    - html (TEXT NOT NULL)
 *    - status (INTEGER NOT NULL)
 *    - content_type (TEXT)
 *    - crawled_at (TIMESTAMP WITH TIME ZONE)
 * 3. Provide transactional CRUD functions (savePage, getPageByUrl, getPages, getPageCount).
 */

import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { Pool, QueryResult } from "pg";
import { PGlite } from "@electric-sql/pglite";

// Load environment variables from .env if present
dotenv.config();

export interface StoredPageInput {
  url: string;
  title: string | null;
  html: string;
  status: number;
  contentType: string | null;
  crawledAt?: Date | string;
}

export interface StoredPageRecord {
  id: number;
  url: string;
  title: string | null;
  status: number;
  content_type: string | null;
  crawled_at: string | Date;
  html?: string;
  byte_length?: number;
}

// Database client abstraction supporting both pg.Pool and PGlite
interface DatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount?: number | null }>;
  close?(): Promise<void>;
  type: "external" | "embedded";
}

let dbClient: DatabaseClient | null = null;
let isInitializing: Promise<DatabaseClient> | null = null;

/**
 * Initializes and returns the active PostgreSQL client.
 * Connects to process.env.DATABASE_URL if available; otherwise initializes persistent PGlite in backend/data/postgres.
 */
export async function getDb(): Promise<DatabaseClient> {
  if (dbClient) {
    return dbClient;
  }

  if (isInitializing) {
    return isInitializing;
  }

  isInitializing = (async () => {
    const databaseUrl = process.env.DATABASE_URL?.trim();

    if (databaseUrl) {
      console.log(`🔌 Connecting to external PostgreSQL at ${databaseUrl.replace(/:[^:@]+@/, ":****@")}...`);
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
      });

      // Verify connection
      const testResult = await pool.query("SELECT version();");
      console.log(`✅ Connected to external PostgreSQL: ${testResult.rows[0].version.split(",")[0]}`);

      dbClient = {
        query: async <T = any>(sql: string, params?: any[]) => {
          const res = await pool.query(sql, params);
          return { rows: res.rows as T[], rowCount: res.rowCount };
        },
        close: async () => {
          await pool.end();
        },
        type: "external",
      };
    } else {
      const dataDir = path.resolve(__dirname, "../data/postgres");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      console.log(`📦 Using persistent embedded PostgreSQL (PGlite) at: ${dataDir}`);
      const pglite = new PGlite(dataDir);
      await pglite.waitReady;

      console.log(`✅ Embedded PostgreSQL engine initialized successfully!`);

      dbClient = {
        query: async <T = any>(sql: string, params?: any[]) => {
          const res = await pglite.query<T>(sql, params);
          return { rows: res.rows, rowCount: res.rows.length };
        },
        close: async () => {
          await pglite.close();
        },
        type: "embedded",
      };
    }

    return dbClient;
  })();

  const client = await isInitializing;
  isInitializing = null;
  return client;
}

/**
 * Creates the `pages` table and supporting indexes if they do not exist.
 */
export async function initDb(): Promise<void> {
  const db = await getDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id SERIAL PRIMARY KEY,
      url TEXT UNIQUE NOT NULL,
      title TEXT,
      html TEXT NOT NULL,
      status INTEGER NOT NULL,
      content_type TEXT,
      crawled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`CREATE INDEX IF NOT EXISTS idx_pages_url ON pages(url);`);
  await db.query(`CREATE INDEX IF NOT EXISTS idx_pages_crawled_at ON pages(crawled_at DESC);`);

  // Sync sequence to avoid collision if data was modified
  try {
    await db.query(`SELECT setval(pg_get_serial_sequence('pages', 'id'), COALESCE((SELECT MAX(id) FROM pages), 1), (SELECT COUNT(*) > 0 FROM pages));`);
  } catch {}

  console.log(`📑 PostgreSQL schema verified: 'pages' table ready.`);
}

/**
 * Saves or updates a crawled page in PostgreSQL.
 * If the URL already exists, it updates the record with the latest crawl information.
 *
 * @param page - The crawled page details to store.
 * @returns The saved page record with generated id and timestamps.
 */
export async function savePage(page: StoredPageInput): Promise<StoredPageRecord> {
  const db = await getDb();

  const upsertSql = `
    INSERT INTO pages (url, title, html, status, content_type, crawled_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (url) DO UPDATE SET
      title = EXCLUDED.title,
      html = EXCLUDED.html,
      status = EXCLUDED.status,
      content_type = EXCLUDED.content_type,
      crawled_at = EXCLUDED.crawled_at
    RETURNING id, url, title, status, content_type, crawled_at;
  `;

  const crawledAt = page.crawledAt ? new Date(page.crawledAt).toISOString() : new Date().toISOString();

  const result = await db.query<StoredPageRecord>(upsertSql, [
    page.url,
    page.title,
    page.html,
    page.status,
    page.contentType,
    crawledAt,
  ]);

  return result.rows[0];
}

/**
 * Retrieves a stored page by its URL, optionally including the raw HTML.
 */
export async function getPageByUrl(
  url: string,
  includeHtml: boolean = false
): Promise<StoredPageRecord | null> {
  const db = await getDb();

  const selectSql = includeHtml
    ? `SELECT id, url, title, html, status, content_type, crawled_at, LENGTH(html) as byte_length FROM pages WHERE url = $1 LIMIT 1;`
    : `SELECT id, url, title, status, content_type, crawled_at, LENGTH(html) as byte_length FROM pages WHERE url = $1 LIMIT 1;`;

  const result = await db.query<StoredPageRecord>(selectSql, [url]);
  return result.rows[0] || null;
}

/**
 * Retrieves a list of stored pages ordered by most recently crawled.
 */
export async function getPages(
  limit: number = 50,
  offset: number = 0,
  includeHtml: boolean = false
): Promise<{ total: number; pages: StoredPageRecord[] }> {
  const db = await getDb();

  const countSql = `SELECT COUNT(*)::INTEGER as count FROM pages;`;
  const countRes = await db.query<{ count: number }>(countSql);
  const total = Number(countRes.rows[0]?.count || 0);

  const selectSql = includeHtml
    ? `SELECT id, url, title, html, status, content_type, crawled_at, LENGTH(html) as byte_length FROM pages ORDER BY crawled_at DESC LIMIT $1 OFFSET $2;`
    : `SELECT id, url, title, status, content_type, crawled_at, LENGTH(html) as byte_length FROM pages ORDER BY crawled_at DESC LIMIT $1 OFFSET $2;`;

  const result = await db.query<StoredPageRecord>(selectSql, [limit, offset]);

  return {
    total,
    pages: result.rows,
  };
}

/**
 * Returns the total count of pages currently stored in PostgreSQL.
 */
export async function getPageCount(): Promise<number> {
  const db = await getDb();
  const res = await db.query<{ count: number }>(`SELECT COUNT(*)::INTEGER as count FROM pages;`);
  return Number(res.rows[0]?.count || 0);
}

/**
 * Removes all pages from the table (useful for clean test resets).
 */
export async function clearPages(): Promise<number> {
  const db = await getDb();
  const res = await db.query(`DELETE FROM pages;`);
  return res.rowCount || 0;
}

/**
 * Closes the active database connection.
 */
export async function closeDb(): Promise<void> {
  if (dbClient?.close) {
    await dbClient.close();
    dbClient = null;
  }
}
