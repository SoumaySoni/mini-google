import * as cheerio from "cheerio";

/**
 * Extracts and normalizes URLs from all <a href="..."> elements within an HTML string.
 *
 * @param html - The raw HTML string to parse.
 * @param baseUrl - Optional base URL (e.g., "https://example.com") used to resolve relative URLs.
 * @returns Array of unique, valid URLs extracted from <a> tags.
 */
export function extractLinks(html: string, baseUrl?: string): string[] {
  if (!html || typeof html !== "string") {
    return [];
  }

  const $ = cheerio.load(html);
  const discoveredUrls = new Set<string>();

  $("a[href]").each((_, element) => {
    const rawHref = $(element).attr("href");
    if (!rawHref) return;

    const trimmedHref = rawHref.trim();
    if (!trimmedHref) return;

    // Filter out non-navigational links
    if (
      trimmedHref.startsWith("#") ||
      trimmedHref.toLowerCase().startsWith("javascript:") ||
      trimmedHref.toLowerCase().startsWith("mailto:") ||
      trimmedHref.toLowerCase().startsWith("tel:") ||
      trimmedHref.toLowerCase().startsWith("data:")
    ) {
      return;
    }

    try {
      const resolved = baseUrl ? new URL(trimmedHref, baseUrl) : new URL(trimmedHref);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") {
        resolved.hash = ""; // Remove fragment identifier
        discoveredUrls.add(resolved.toString());
      }
    } catch {
      // If no baseUrl was provided and it's a relative URL, retain it as a relative link
      if (!baseUrl && !trimmedHref.includes("://") && !trimmedHref.startsWith("//")) {
        discoveredUrls.add(trimmedHref);
      }
    }
  });

  return Array.from(discoveredUrls);
}