/**
 * Basic Web Crawler Fetcher Module
 * Purpose: Takes a single URL, issues an HTTP request, retrieves the webpage HTML, and extracts discovered links.
 */

import { extractLinks, normalizeUrl, normalizeUrls } from "./extractor";

export interface CrawlResult {
  url: string;
  status: number;
  contentType: string | null;
  html: string;
  byteLength: number;
  links: string[];
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
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });

  const contentType = response.headers.get("content-type");
  const html = await response.text();
  const finalUrl = response.url || targetUrl;
  const links = extractLinks(html, finalUrl);

  return {
    url: finalUrl,
    status: response.status,
    contentType,
    html,
    byteLength: Buffer.byteLength(html, "utf8"),
    links,
  };
}

export { extractLinks, normalizeUrl, normalizeUrls };
