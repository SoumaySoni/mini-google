import * as cheerio from "cheerio";
import { normalizeUrls, normalizeUrl } from "./normalizer";

/**
 * Extracts and normalizes URLs from all <a href="..."> elements within an HTML string.
 *
 * Pipeline:
 * 1. HTML -> Cheerio loads the DOM
 * 2. Extract hrefs -> Collect all raw href attributes from <a> tags
 * 3. Normalize URLs -> Resolve relative paths, strip fragments, validate protocols
 * 4. Clean absolute URLs -> Deduplicate and return final array of clean URLs
 *
 * @param html - The raw HTML string to parse.
 * @param baseUrl - The base URL of the webpage (e.g., "https://example.com/blog/post-1").
 * @returns Array of unique, clean absolute URLs.
 */
export function extractLinks(html: string, baseUrl?: string): string[] {
  if (!html || typeof html !== "string") {
    return [];
  }

  // 1. HTML -> Cheerio
  const $ = cheerio.load(html);

  // 2. Extract hrefs
  const rawHrefs: string[] = [];
  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (href !== undefined) {
      rawHrefs.push(href);
    }
  });

  // 3. Normalize URLs & 4. Clean absolute URLs
  if (baseUrl) {
    return normalizeUrls(rawHrefs, baseUrl);
  }

  // If no baseUrl is provided, normalize only hrefs that are already absolute URLs
  const uniqueUrls = new Set<string>();
  for (const href of rawHrefs) {
    if (!href) continue;
    try {
      const parsed = new URL(href.trim());
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        parsed.hash = "";
        uniqueUrls.add(parsed.toString());
      }
    } catch {
      // Relative URLs without a baseUrl cannot be made absolute
    }
  }

  return Array.from(uniqueUrls);
}

export { normalizeUrl, normalizeUrls };