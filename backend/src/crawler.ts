/**
 * Web Crawler Orchestrator & Fetcher Module
 *
 * Responsibilities:
 * 1. Fetch individual webpages and extract normalized links (fetchWebpage).
 * 2. Enforce domain boundary constraints (isSameDomain) to restrict crawls to the starting domain.
 * 3. Orchestrate the crawling loop using UrlFrontier (FIFO queue with seen deduplication).
 * 4. Gracefully handle errors and respect max page limits.
 */

import * as cheerio from "cheerio";
import { extractLinks, normalizeUrl, normalizeUrls } from "./extractor";
import { UrlFrontier } from "./frontier";

export interface CrawlResult {
  url: string;
  title: string;
  snippet: string;
  status: number;
  contentType: string | null;
  html: string;
  byteLength: number;
  links: string[];
}

export interface CrawledPage {
  url: string;
  title: string;
  snippet: string;
  status: number;
  contentType: string | null;
  byteLength: number;
  discoveredLinksCount: number;
  sameDomainLinksCount: number;
  newLinksQueued: number;
  links: string[];
  error?: string;
}

export interface FrontierStats {
  queued: number;
  processed: number;
  totalSeen: number;
  isEmpty: boolean;
}

export interface CrawlOptions {
  timeoutMs?: number;
  delayMs?: number;
  silent?: boolean;
  onPageCrawled?: (page: CrawledPage, stats: FrontierStats) => void;
}

export interface CrawlReport {
  startUrl: string;
  domain: string;
  maxPages: number;
  totalPagesCrawled: number;
  pages: CrawledPage[];
  queueRemaining: string[];
  frontierStats: FrontierStats;
  durationMs: number;
}

/**
 * Checks whether a candidate URL belongs to the same domain as the base domain or URL.
 *
 * Rules:
 * - Compares normalized hostnames (case-insensitive).
 * - Matches exact hostname (e.g., "example.com" === "example.com").
 * - Tolerates 'www.' prefix variation (e.g. "www.example.com" and "example.com").
 * - Filters out external domains (e.g., "google.com", "github.com", "goodreads.com").
 *
 * @param candidateUrl - The URL to inspect.
 * @param baseDomainOrUrl - The starting URL or base domain to compare against.
 */
export function isSameDomain(candidateUrl: string, baseDomainOrUrl: string): boolean {
  try {
    const candidateObj = new URL(candidateUrl);
    const baseObj = baseDomainOrUrl.includes("://")
      ? new URL(baseDomainOrUrl)
      : new URL(`https://${baseDomainOrUrl}`);

    const candidateHost = candidateObj.hostname.toLowerCase();
    const baseHost = baseObj.hostname.toLowerCase();

    // Port check for local development
    if (candidateHost === "localhost" || candidateHost === "127.0.0.1") {
      if (baseObj.port && candidateObj.port && baseObj.port !== candidateObj.port) {
        return false;
      }
    }

    if (candidateHost === baseHost) {
      return true;
    }

    // Treat 'www.example.com' and 'example.com' as the same domain
    const stripWww = (h: string) => (h.startsWith("www.") ? h.slice(4) : h);
    return stripWww(candidateHost) === stripWww(baseHost);
  } catch {
    return false;
  }
}

/**
 * Fetches a webpage given a URL and returns its HTML content, metadata, and extracted links.
 *
 * @param targetUrl - The webpage URL to fetch (http or https)
 * @param timeoutMs - Request timeout in milliseconds (default: 10000ms)
 */
export async function fetchWebpage(
  targetUrl: string,
  timeoutMs: number = 10000
): Promise<CrawlResult> {
  // Validate and parse the URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error(`Unsupported protocol '${parsedUrl.protocol}'. Only http: and https: are allowed.`);
    }
  } catch (err: any) {
    throw new Error(`Invalid URL: ${err.message}`);
  }

  // Request the webpage with crawler headers and timeout
  const response = await fetch(parsedUrl.toString(), {
    method: "GET",
    headers: {
      "User-Agent": "MiniGoogleBot/1.0 (+http://localhost:3000/bot)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });

  const contentType = response.headers.get("content-type");
  const html = await response.text();
  const finalUrl = response.url || targetUrl;
  const links = extractLinks(html, finalUrl);

  const $ = cheerio.load(html);
  const rawTitle = $("title").first().text().trim();
  const heading = $("h1, h2, h3").first().text().trim();
  const title = rawTitle || heading || finalUrl;

  let snippet = $('meta[name="description"]').attr("content")?.trim() || "";
  if (!snippet) {
    $("p").each((_, el) => {
      if (snippet) return;
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text.length > 20) {
        snippet = text;
      }
    });
  }
  if (!snippet) {
    snippet = $("body").text().replace(/\s+/g, " ").trim().slice(0, 160);
  }
  if (snippet.length > 200) {
    snippet = snippet.slice(0, 197) + "...";
  }

  return {
    url: finalUrl,
    title,
    snippet,
    status: response.status,
    contentType,
    html,
    byteLength: Buffer.byteLength(html, "utf8"),
    links,
  };
}

/**
 * Main Web Crawler Orchestrator.
 *
 * Crawl Loop:
 * 1. Normalize and push start URL to the queue (UrlFrontier).
 * 2. Loop while queue is not empty and pages crawled < maxPages:
 *    a. Dequeue next URL.
 *    b. Fetch page HTML and extract links.
 *    c. Filter links to stay strictly on the same domain.
 *    d. Add new same-domain links to the queue (seen deduplication handled by UrlFrontier).
 * 3. Return crawl report with pages crawled, stats, and remaining queue.
 *
 * @param startUrl - The entry point URL to start crawling from.
 * @param maxPages - Maximum number of pages to crawl (default: 10).
 * @param options - Additional options (timeout, politeness delay, callbacks, logging).
 */
export async function crawl(
  startUrl: string,
  maxPages: number = 10,
  options: CrawlOptions = {}
): Promise<CrawlReport> {
  const startTime = Date.now();
  const limit = Math.max(1, Math.floor(maxPages));
  const log = options.silent ? () => {} : console.log;

  // Validate and normalize the start URL
  const normalizedStart = normalizeUrl(startUrl, startUrl);
  if (!normalizedStart) {
    throw new Error(`Invalid starting URL: '${startUrl}'. Must be a valid HTTP/HTTPS URL.`);
  }

  const startObj = new URL(normalizedStart);
  const targetDomain = startObj.hostname;

  log(`\n======================================================`);
  log(`🕷️  Mini Google Web Crawler`);
  log(`🎯 Starting URL : ${normalizedStart}`);
  log(`🌐 Target Domain: ${targetDomain} (Same-domain only)`);
  log(`📑 Page Limit   : ${limit}`);
  log(`======================================================\n`);

  const frontier = new UrlFrontier();
  frontier.add(normalizedStart);

  const pages: CrawledPage[] = [];
  let pagesCrawled = 0;

  while (!frontier.isEmpty() && pagesCrawled < limit) {
    const currentUrl = frontier.next();
    if (!currentUrl) {
      break;
    }

    pagesCrawled++;
    log(`[${pagesCrawled}/${limit}] 📥 Fetching: ${currentUrl}`);

    let crawledPage: CrawledPage;

    try {
      const result = await fetchWebpage(currentUrl, options.timeoutMs ?? 10000);

      // Filter extracted links for same domain only
      const sameDomainLinks: string[] = [];
      const externalLinks: string[] = [];

      for (const link of result.links) {
        if (isSameDomain(link, normalizedStart)) {
          sameDomainLinks.push(link);
        } else {
          externalLinks.push(link);
        }
      }

      // Add new same-domain links to the frontier
      let newQueuedCount = 0;
      for (const link of sameDomainLinks) {
        if (frontier.add(link)) {
          newQueuedCount++;
        }
      }

      crawledPage = {
        url: result.url,
        title: result.title,
        snippet: result.snippet,
        status: result.status,
        contentType: result.contentType,
        byteLength: result.byteLength,
        discoveredLinksCount: result.links.length,
        sameDomainLinksCount: sameDomainLinks.length,
        newLinksQueued: newQueuedCount,
        links: sameDomainLinks,
      };

      log(
        `   ↳ Status: ${result.status} | Title: "${result.title}" | Found: ${result.links.length} links ` +
          `(${sameDomainLinks.length} internal, ${externalLinks.length} external) | ` +
          `Queued: +${newQueuedCount} new | Queue size: ${frontier.size()}`
      );
    } catch (err: any) {
      crawledPage = {
        url: currentUrl,
        title: currentUrl,
        snippet: `Error encountered while fetching page: ${err.message || "Unknown error"}`,
        status: 0,
        contentType: null,
        byteLength: 0,
        discoveredLinksCount: 0,
        sameDomainLinksCount: 0,
        newLinksQueued: 0,
        links: [],
        error: err.message || "Failed to fetch webpage",
      };

      log(`   ⚠️ Error fetching ${currentUrl}: ${err.message}`);
    }

    pages.push(crawledPage);

    if (options.onPageCrawled) {
      options.onPageCrawled(crawledPage, frontier.getStats());
    }

    // Optional politeness delay between requests
    if (options.delayMs && options.delayMs > 0 && !frontier.isEmpty() && pagesCrawled < limit) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  const durationMs = Date.now() - startTime;
  const stats = frontier.getStats();

  log(`\n======================================================`);
  log(`🏁 Crawl Complete!`);
  log(`⏱️  Duration      : ${(durationMs / 1000).toFixed(2)}s`);
  log(`📄 Pages Crawled : ${pages.length}`);
  log(`🔍 Total Seen    : ${stats.totalSeen}`);
  log(`📬 Queue Left    : ${stats.queued}`);
  log(`======================================================\n`);

  return {
    startUrl: normalizedStart,
    domain: targetDomain,
    maxPages: limit,
    totalPagesCrawled: pages.length,
    pages,
    queueRemaining: frontier.getQueue(),
    frontierStats: stats,
    durationMs,
  };
}

/**
 * Object-oriented Crawler wrapper for advanced configurations.
 */
export class Crawler {
  constructor(private defaultOptions: CrawlOptions = {}) {}

  async crawl(startUrl: string, maxPages: number = 10, options?: CrawlOptions): Promise<CrawlReport> {
    return crawl(startUrl, maxPages, { ...this.defaultOptions, ...options });
  }
}

// Re-export underlying components for convenient imports
export { extractLinks, normalizeUrl, normalizeUrls };
export { UrlFrontier, UrlQueue } from "./frontier";

// CLI entry point: run directly with `npx tsx src/crawler.ts <url> <maxPages>`
if (require.main === module) {
  const targetUrl = process.argv[2] || "https://quotes.toscrape.com";
  const limit = process.argv[3] ? parseInt(process.argv[3], 10) : 5;

  crawl(targetUrl, limit).catch((err) => {
    console.error("Crawl error:", err);
    process.exit(1);
  });
}
