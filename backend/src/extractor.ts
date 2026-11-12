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

/**
 * Extracts visible, clean page text from an HTML string using Cheerio.
 *
 * Pipeline:
 * 1. HTML -> Cheerio loads the DOM
 * 2. Remove irrelevant content (<script>, <style>, <noscript>)
 * 3. Separate block elements to preserve paragraph structure
 * 4. Extract visible textual content
 * 5. Normalize whitespace (collapse multiple spaces, trim, strip blank lines)
 *
 * @param html - Raw HTML markup
 * @returns Cleaned visible textual content
 */
export function extractText(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  const $ = cheerio.load(html);

  // 1. Remove non-visible and irrelevant tags
  $("script, style, noscript").remove();

  // 2. Separate block elements so adjacent elements don't smash together
  $("br").replaceWith("\n");
  $("h1, h2, h3, h4, h5, h6, p, div, li, article, section, header, footer, blockquote, pre, tr")
    .before("\n")
    .after("\n");

  // 3. Extract text from body (or document root if body tag is missing)
  const rawText = $("body").length > 0 ? $("body").text() : $.text();

  // 4. Normalize excessive whitespace
  return rawText
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n\n");
}

export { normalizeUrl, normalizeUrls };