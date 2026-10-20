/**
 * Basic Web Crawler Fetcher Module
 * Purpose: Takes a single URL, issues an HTTP request, and retrieves the webpage HTML.
 */

export interface CrawlResult {
  url: string;
  status: number;
  contentType: string | null;
  html: string;
  byteLength: number;
}

/**
 * Fetches a webpage given a URL and returns its HTML content and metadata.
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

  return {
    url: response.url || targetUrl, // Final URL after any redirects
    status: response.status,
    contentType,
    html,
    byteLength: Buffer.byteLength(html, "utf8"),
  };
}

// Allow direct CLI execution for quick testing: npx tsx src/crawler.ts <url>
if (require.main === module) {
  const testUrl = process.argv[2] || "https://example.com";
  console.log(`[Crawler CLI] Testing fetch for: ${testUrl}`);
  fetchWebpage(testUrl)
    .then((result) => {
      console.log(`[Crawler CLI] Success! Status: ${result.status}, Length: ${result.byteLength} bytes`);
      console.log(`[Crawler CLI] HTML preview (first 250 chars):\n${result.html.slice(0, 250)}...`);
    })
    .catch((err) => {
      console.error(`[Crawler CLI] Failed:`, err);
      process.exit(1);
    });
}
