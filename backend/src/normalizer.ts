/**
 * URL Normalization Module
 *
 * Responsibilities:
 * 1. Convert relative URLs into absolute URLs using a base URL.
 * 2. Keep only HTTP and HTTPS protocols.
 * 3. Remove URL fragments/hashes (e.g., #pricing, #section-1).
 * 4. Handle malformed/invalid URLs safely without throwing exceptions.
 * 5. Remove duplicates across discovered links.
 */

/**
 * Normalizes a single raw href attribute into a clean absolute URL.
 *
 * @param rawHref - The href string extracted from an HTML <a> element.
 * @param baseUrl - The base URL of the current webpage (e.g., "https://example.com/blog/post-1").
 * @returns A clean absolute URL string, or null if the URL is invalid or unsupported.
 */
export function normalizeUrl(rawHref: string | null | undefined, baseUrl: string): string | null {
  if (!rawHref || typeof rawHref !== "string") {
    return null;
  }

  const trimmed = rawHref.trim();
  if (!trimmed) {
    return null;
  }

  // Reject non-navigational pseudo-protocols early
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("data:") ||
    lower.startsWith("sms:")
  ) {
    return null;
  }

  try {
    // 1. Resolve relative URLs into absolute URLs against baseUrl
    const parsed = new URL(trimmed, baseUrl);

    // 2. Keep only http:// and https:// protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    // 3. Remove URL fragments (e.g. #pricing, #heading-2)
    parsed.hash = "";

    // 4. Return clean absolute URL
    return parsed.toString();
  } catch {
    // Safely ignore malformed or unparseable URLs
    return null;
  }
}

/**
 * Normalizes an array of raw href strings and removes obvious duplicates.
 *
 * @param rawHrefs - An array of raw href strings extracted from HTML.
 * @param baseUrl - The base URL of the current webpage.
 * @returns An array of unique, clean absolute URLs.
 */
export function normalizeUrls(rawHrefs: (string | null | undefined)[], baseUrl: string): string[] {
  if (!Array.isArray(rawHrefs) || !baseUrl) {
    return [];
  }

  const uniqueUrls = new Set<string>();

  for (const rawHref of rawHrefs) {
    const cleanUrl = normalizeUrl(rawHref, baseUrl);
    if (cleanUrl) {
      uniqueUrls.add(cleanUrl);
    }
  }

  return Array.from(uniqueUrls);
}
