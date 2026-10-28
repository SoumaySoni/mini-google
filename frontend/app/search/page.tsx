"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Mic,
  Camera,
  X,
  Grid3x3,
  Settings,
  MoreVertical,
  SlidersHorizontal,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
} from "lucide-react";

interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  status?: number;
  byteLength?: number;
  linksCount?: number;
  isLiveCrawl?: boolean;
  sitelinks?: { title: string; href: string }[];
}

interface CrawlReport {
  startUrl: string;
  domain: string;
  maxPages: number;
  totalPagesCrawled: number;
  pages: {
    url: string;
    title: string;
    snippet: string;
    status: number;
    byteLength: number;
    discoveredLinksCount: number;
    sameDomainLinksCount: number;
    newLinksQueued: number;
    links: string[];
    error?: string;
  }[];
  queueRemaining: string[];
  frontierStats: {
    queued: number;
    processed: number;
    totalSeen: number;
    isEmpty: boolean;
  };
  durationMs: number;
}

function isUrlQuery(q: string): boolean {
  const trimmed = q.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return true;
  }
  // Check if looks like a domain name
  return /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/.*)?$/.test(trimmed);
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") || "";

  const [inputVal, setInputVal] = useState(rawQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlReport, setCrawlReport] = useState<CrawlReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync input value whenever the URL query parameter changes
  useEffect(() => {
    setInputVal(rawQuery);
  }, [rawQuery]);

  // Generate dynamic mock results based on the search query
  const getMockResults = (q: string): SearchResultItem[] => {
    const lower = q.toLowerCase();

    if (lower.includes("react")) {
      return [
        {
          id: "react-dev",
          title: "React – A JavaScript library for building user interfaces",
          url: "https://react.dev",
          displayUrl: "https://react.dev",
          snippet:
            "React lets you build user interfaces out of individual pieces called components. Create your own React components like Thumbnail, LikeButton, and Video.",
          sitelinks: [
            { title: "Documentation", href: "https://react.dev/learn" },
            { title: "Getting Started", href: "https://react.dev/learn/installation" },
            { title: "Hooks Reference", href: "https://react.dev/reference/react" },
            { title: "Community & Ecosystem", href: "https://react.dev/community" },
          ],
        },
        {
          id: "nextjs-org",
          title: "Next.js by Vercel - The React Framework for the Web",
          url: "https://nextjs.org",
          displayUrl: "https://nextjs.org",
          snippet:
            "Used by some of the world's largest companies, Next.js enables you to create full-stack Web applications by extending the latest React features and integrating powerful Rust-based tooling.",
          sitelinks: [
            { title: "Docs", href: "https://nextjs.org/docs" },
            { title: "App Router Guide", href: "https://nextjs.org/docs/app" },
            { title: "Learn Next.js", href: "https://nextjs.org/learn" },
            { title: "Templates", href: "https://vercel.com/templates" },
          ],
        },
      ];
    }

    // Default mock results for generic non-URL queries
    return [
      {
        id: "result-1",
        title: `${q} - Official Website & Documentation`,
        url: `https://www.example.com/${encodeURIComponent(q)}`,
        displayUrl: `https://www.example.com > ${q}`,
        snippet: `Explore all resources, tutorials, guides, and documentation related to ${q}. Learn core concepts, explore practical examples, and stay up to date.`,
        sitelinks: [
          { title: "Getting Started", href: "#" },
          { title: "Documentation", href: "#" },
          { title: "Tutorials & Guides", href: "#" },
          { title: "Community Forum", href: "#" },
        ],
      },
      {
        id: "result-2",
        title: `What is ${q}? Everything you need to know in 2026`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(q)}`,
        displayUrl: `https://en.wikipedia.org > wiki > ${q}`,
        snippet: `Comprehensive overview of ${q}. Learn about its origins, architecture, key features, real-world applications, and why it is widely used today.`,
      },
    ];
  };

  // Connect to the real backend crawler when the query is a URL
  useEffect(() => {
    if (!rawQuery.trim()) {
      setResults([]);
      setCrawlReport(null);
      setError(null);
      return;
    }

    if (isUrlQuery(rawQuery)) {
      const targetUrl =
        rawQuery.startsWith("http://") || rawQuery.startsWith("https://")
          ? rawQuery.trim()
          : `https://${rawQuery.trim()}`;

      setIsCrawling(true);
      setError(null);
      setCrawlReport(null);

      fetch("http://localhost:5000/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, maxPages: 5 }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.success && data.pages) {
            setCrawlReport(data);

            const mapped: SearchResultItem[] = data.pages.map((p: any, idx: number) => {
              let displayUrl = p.url;
              try {
                const u = new URL(p.url);
                const pathParts = u.pathname.split("/").filter(Boolean);
                displayUrl = `${u.origin}${pathParts.length ? ` > ${pathParts.join(" > ")}` : ""}`;
              } catch {}

              const sitelinks = p.links
                ?.filter((l: string) => l !== p.url)
                ?.slice(0, 4)
                ?.map((l: string) => {
                  let linkText = l;
                  try {
                    const parsedL = new URL(l);
                    const pathSegments = parsedL.pathname.split("/").filter(Boolean);
                    linkText =
                      pathSegments.length > 0
                        ? pathSegments.slice(-2).join(" / ")
                        : "Home";
                  } catch {}
                  return { title: linkText, href: l };
                });

              return {
                id: `crawl-${idx}-${p.url}`,
                title: p.title || p.url,
                url: p.url,
                displayUrl,
                snippet:
                  p.snippet ||
                  `Live crawled page on ${data.domain} • ${p.byteLength} bytes • Status ${p.status}`,
                status: p.status,
                byteLength: p.byteLength,
                linksCount: p.discoveredLinksCount,
                isLiveCrawl: true,
                sitelinks: sitelinks && sitelinks.length > 0 ? sitelinks : undefined,
              };
            });

            setResults(mapped);
          } else {
            setResults(getMockResults(rawQuery));
          }
        })
        .catch((err) => {
          console.error("Live crawl error:", err);
          setError(`Crawler Notice: ${err.message}. Showing fallback results.`);
          setResults(getMockResults(rawQuery));
        })
        .finally(() => {
          setIsCrawling(false);
        });
    } else {
      setCrawlReport(null);
      setError(null);
      setIsCrawling(false);
      setResults(getMockResults(rawQuery));
    }
  }, [rawQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#202124] font-sans select-none">
      {/* Top Search Results Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-[#dadce0] px-4 md:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Search Bar Group */}
          <div className="flex items-center flex-1 max-w-[850px] gap-6 md:gap-8">
            {/* Clickable Mini Google Logo */}
            <Link
              href="/"
              className="text-2xl sm:text-[28px] font-medium tracking-tight select-none shrink-0"
              style={{
                fontFamily: '"Product Sans", "Google Sans", -apple-system, sans-serif',
              }}
              title="Mini Google Home"
            >
              <span className="text-[#4285F4]">M</span>
              <span className="text-[#EA4335]">i</span>
              <span className="text-[#FBBC05]">n</span>
              <span className="text-[#34A853]">i</span>
              <span className="w-1.5 inline-block" />
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </Link>

            {/* Persistent Results Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 flex items-center h-11 px-4 rounded-full border border-transparent shadow-[0_2px_5px_1px_rgba(64,60,67,0.16)] hover:shadow-[0_2px_8px_1px_rgba(64,60,67,0.24)] focus-within:shadow-[0_2px_8px_1px_rgba(64,60,67,0.24)] transition-all bg-white"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search or enter URL (e.g. https://quotes.toscrape.com)"
                autoComplete="off"
                className="flex-1 h-full bg-transparent outline-none text-[#202124] text-[15px]"
              />

              {inputVal && (
                <button
                  type="button"
                  onClick={() => setInputVal("")}
                  className="p-1 mr-1 text-[#70757a] hover:text-[#202124] cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="h-5 w-[1px] bg-[#dadce0] mx-2 hidden sm:block" />

              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-[#f1f3f4] text-[#4285F4] transition-colors cursor-pointer"
                title="Search by voice"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="p-1.5 rounded-full hover:bg-[#f1f3f4] text-[#4285F4] transition-colors cursor-pointer mr-1"
                title="Search by image"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                type="submit"
                className="p-1.5 rounded-full hover:bg-[#f1f3f4] text-[#4285F4] transition-colors cursor-pointer"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center space-x-3 text-[#5f6368]">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-[#f1f3f4] transition-colors cursor-pointer hidden sm:flex items-center justify-center"
              title="Quick settings"
            >
              <Settings className="w-5 h-5 text-[#5f6368]" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-[#f1f3f4] transition-colors cursor-pointer flex items-center justify-center"
              title="Google apps"
            >
              <Grid3x3 className="w-5 h-5 text-[#5f6368]" />
            </button>
            <button
              type="button"
              className="bg-[#1a73e8] hover:bg-[#1b66ca] text-white text-[13px] font-medium px-5 py-1.5 rounded-md transition-shadow cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center space-x-6 text-[13px] text-[#5f6368] mt-3 sm:ml-[160px] md:ml-[184px]">
          <span className="flex items-center pb-2.5 text-[#1a73e8] font-medium border-b-2 border-[#1a73e8] cursor-pointer">
            <Search className="w-3.5 h-3.5 mr-1.5" />
            All
          </span>
          <span className="flex items-center pb-2.5 hover:text-[#202124] cursor-pointer transition-colors">
            Images
          </span>
          <span className="flex items-center pb-2.5 hover:text-[#202124] cursor-pointer transition-colors">
            Videos
          </span>
          <span className="flex items-center pb-2.5 hover:text-[#202124] cursor-pointer transition-colors">
            News
          </span>
          <span className="flex items-center pb-2.5 hover:text-[#202124] cursor-pointer transition-colors">
            Maps
          </span>
          <span className="flex items-center pb-2.5 hover:text-[#202124] cursor-pointer transition-colors">
            More
          </span>
          <span className="flex items-center pb-2.5 hover:text-[#202124] cursor-pointer transition-colors ml-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            Tools
          </span>
        </div>
      </header>

      {/* Main Results Content Area */}
      <main className="flex-1 px-4 sm:px-6 md:pl-[184px] md:pr-8 py-4 max-w-[1200px]">
        {/* Results Metadata */}
        <div className="text-[14px] text-[#70757a] mb-4">
          {rawQuery ? (
            <span>
              {crawlReport
                ? `Crawled ${crawlReport.totalPagesCrawled} pages in ${(crawlReport.durationMs / 1000).toFixed(2)} seconds for `
                : "About 2,840,000,000 results (0.34 seconds) for "}
              <strong className="text-[#202124] font-medium">&ldquo;{rawQuery}&rdquo;</strong>
            </span>
          ) : (
            <span>Please enter a query or website URL in the search box above.</span>
          )}
        </div>

        {/* Live Crawl Progress Indicator */}
        {isCrawling && (
          <div className="mb-6 p-4 rounded-xl border border-[#d2e3fc] bg-[#f8fafd] max-w-[652px] animate-pulse">
            <div className="flex items-center gap-3 text-[#1967d2]">
              <Loader2 className="w-5 h-5 animate-spin shrink-0 text-[#1a73e8]" />
              <div className="flex-1">
                <div className="font-medium text-[15px]">
                  🕷️ Real Crawler in Progress...
                </div>
                <div className="text-[13px] text-[#5f6368] mt-0.5">
                  Fetching pages, extracting links, and filtering same-domain URLs on{" "}
                  <code className="text-[#1a73e8] font-mono text-xs">{rawQuery}</code>
                </div>
              </div>
            </div>
            <div className="w-full bg-[#e8f0fe] h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-[#1a73e8] h-full w-2/3 animate-[pulse_1s_infinite]" />
            </div>
          </div>
        )}

        {/* Live Crawl Summary Badge */}
        {crawlReport && !isCrawling && (
          <div className="mb-6 p-4 rounded-xl border border-[#ceead6] bg-[#f6fbf7] text-[#137333] max-w-[652px] shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#188038] shrink-0" />
                <span className="font-semibold text-[15px] text-[#188038]">
                  Live Crawler Orchestrator Completed
                </span>
              </div>
              <span className="text-xs bg-[#e6f4ea] text-[#137333] font-medium px-2.5 py-1 rounded-full border border-[#ceead6]">
                Same-Domain Only
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#ceead6]/60 text-xs">
              <div>
                <span className="text-[#5f6368] block">Domain</span>
                <span className="font-medium text-[#202124] truncate block">
                  {crawlReport.domain}
                </span>
              </div>
              <div>
                <span className="text-[#5f6368] block">Pages Crawled</span>
                <span className="font-semibold text-[#188038]">
                  {crawlReport.totalPagesCrawled} / {crawlReport.maxPages}
                </span>
              </div>
              <div>
                <span className="text-[#5f6368] block">Total Links Seen</span>
                <span className="font-medium text-[#202124]">
                  {crawlReport.frontierStats.totalSeen}
                </span>
              </div>
              <div>
                <span className="text-[#5f6368] block">Queue Left</span>
                <span className="font-medium text-[#202124]">
                  {crawlReport.frontierStats.queued}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-3 rounded-lg border border-[#fce8e6] bg-[#fdf2f2] text-[#c5221f] text-sm flex items-center gap-2 max-w-[652px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-7 max-w-[652px]">
          {results.map((result) => (
            <div key={result.id} className="group">
              {/* Domain & URL preview */}
              <div className="flex items-center space-x-2 text-[12px] text-[#202124] mb-1">
                <div className="w-5 h-5 rounded-full bg-[#f1f3f4] flex items-center justify-center text-[11px] text-[#5f6368] font-bold">
                  {result.isLiveCrawl ? (
                    <Globe className="w-3 h-3 text-[#1a73e8]" />
                  ) : (
                    result.title.charAt(0)
                  )}
                </div>
                <div className="flex flex-col leading-tight overflow-hidden">
                  <span className="text-[14px] text-[#202124] truncate">
                    {result.displayUrl.split(" ")[0]}
                  </span>
                  <span className="text-[12px] text-[#4d5156] truncate">
                    {result.displayUrl}
                  </span>
                </div>

                {result.isLiveCrawl && result.status ? (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#e6f4ea] text-[#137333] shrink-0">
                    HTTP {result.status}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#5f6368] hover:text-[#202124] transition-opacity ml-auto"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Title */}
              <h2 className="text-[20px] leading-snug font-normal text-[#1a0dab] group-hover:underline cursor-pointer">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  <span>{result.title}</span>
                  {result.isLiveCrawl && (
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 inline" />
                  )}
                </a>
              </h2>

              {/* Snippet */}
              <p className="text-[14px] text-[#4d5156] leading-relaxed mt-1">
                {result.snippet}
              </p>

              {/* Crawl Metadata Tags */}
              {result.isLiveCrawl && (
                <div className="flex items-center gap-3 mt-2 text-[12px] text-[#5f6368]">
                  {result.byteLength ? (
                    <span>📦 {(result.byteLength / 1024).toFixed(1)} KB</span>
                  ) : null}
                  {result.linksCount ? (
                    <span>🔗 {result.linksCount} links extracted</span>
                  ) : null}
                  <span className="text-[#188038] font-medium">✓ Same Domain</span>
                </div>
              )}

              {/* Sitelinks (if present) */}
              {result.sitelinks && result.sitelinks.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3 pt-2 pl-3 border-l-2 border-[#dadce0]">
                  {result.sitelinks.map((sitelink, idx) => (
                    <div key={idx}>
                      <a
                        href={sitelink.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] text-[#1a0dab] hover:underline flex items-center gap-1"
                      >
                        <span className="truncate">{sitelink.title}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Related Searches Section */}
        {rawQuery && (
          <div className="mt-12 pt-6 border-t border-[#dadce0] max-w-[652px]">
            <h3 className="text-[18px] text-[#202124] font-normal mb-4">
              Related searches
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px]">
              {[
                `${rawQuery} tutorial`,
                `${rawQuery} documentation`,
                `${rawQuery} github`,
                `${rawQuery} examples 2026`,
                `best practices for ${rawQuery}`,
                `${rawQuery} vs alternatives`,
              ].map((related, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(related)}`)}
                  className="flex items-center px-4 py-2.5 rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] transition-colors text-left cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#70757a] mr-3 shrink-0" />
                  <span className="truncate">{related}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Results Footer */}
      <footer className="mt-auto bg-[#f2f2f2] text-[#70757a] text-[13px] border-t border-[#dadce0]">
        <div className="px-4 md:px-8 py-3 border-b border-[#dadce0] flex items-center space-x-4">
          <span className="font-medium text-[#3c4043]">Mini Google Crawler</span>
          <span className="w-1 h-1 rounded-full bg-[#70757a]" />
          <span>Backend: http://localhost:5000</span>
          <span className="w-1 h-1 rounded-full bg-[#70757a]" />
          <a href="#crawler" className="text-[#1a0dab] hover:underline">
            Crawler Status
          </a>
        </div>
        <div className="px-4 md:px-8 py-3 flex flex-wrap gap-x-6 gap-y-2">
          <a href="#help" className="hover:underline">
            Help
          </a>
          <a href="#feedback" className="hover:underline">
            Send feedback
          </a>
          <a href="#privacy" className="hover:underline">
            Privacy
          </a>
          <a href="#terms" className="hover:underline">
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white text-[#5f6368] text-sm">
          Loading results...
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
