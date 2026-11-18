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
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface SearchResultItem {
  id: number | string;
  url: string;
  title: string | null;
  snippet: string;
}

interface SearchApiResponse {
  success: boolean;
  query: string;
  total: number;
  results: SearchResultItem[];
  error?: string;
}

function formatDisplayUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const pathParts = u.pathname.split("/").filter(Boolean);
    return `${u.origin}${pathParts.length ? ` > ${pathParts.join(" > ")}` : ""}`;
  } catch {
    return rawUrl;
  }
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") || "";

  const [inputVal, setInputVal] = useState(rawQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync input value whenever the URL query parameter changes
  useEffect(() => {
    setInputVal(rawQuery);
  }, [rawQuery]);

  // Fetch real search results from the backend API
  useEffect(() => {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      setResults([]);
      setTotalResults(0);
      setSearchTime(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const startTime = performance.now();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    fetch(`${backendUrl}/api/search?q=${encodeURIComponent(trimmed)}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with HTTP ${res.status}`);
        }
        return res.json() as Promise<SearchApiResponse>;
      })
      .then((data) => {
        const duration = (performance.now() - startTime) / 1000;
        setSearchTime(duration);

        if (data.success && Array.isArray(data.results)) {
          setResults(data.results);
          setTotalResults(data.total ?? data.results.length);
        } else {
          setResults([]);
          setTotalResults(0);
        }
      })
      .catch((err) => {
        console.error("Search API error:", err);
        setError(err.message || "Failed to connect to search backend");
        setResults([]);
        setTotalResults(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
                placeholder="Search Mini Google or enter query..."
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
        {rawQuery && !isLoading && !error && (
          <div className="text-[14px] text-[#70757a] mb-5">
            About {totalResults} {totalResults === 1 ? "result" : "results"}{" "}
            {searchTime !== null && `(${searchTime.toFixed(2)} seconds)`} for{" "}
            <strong className="text-[#202124] font-medium">&ldquo;{rawQuery}&rdquo;</strong>
          </div>
        )}

        {!rawQuery && (
          <div className="text-[14px] text-[#70757a] mb-5">
            Please enter a search query in the box above.
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 py-8 text-[#1a73e8] max-w-[652px]">
            <Loader2 className="w-5 h-5 animate-spin shrink-0 text-[#1a73e8]" />
            <span className="text-[15px] font-medium text-[#202124]">
              Searching PostgreSQL index for &ldquo;{rawQuery}&rdquo;...
            </span>
          </div>
        )}

        {/* Error Notification */}
        {error && !isLoading && (
          <div className="mb-6 p-4 rounded-lg border border-[#fce8e6] bg-[#fdf2f2] text-[#c5221f] text-sm flex items-start gap-3 max-w-[652px]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#d93025]" />
            <div className="flex-1">
              <p className="font-semibold text-[14px]">Search failed</p>
              <p className="text-[13px] text-[#5f6368] mt-1">{error}</p>
              <button
                type="button"
                onClick={() => router.refresh()}
                className="mt-3 text-xs font-medium text-[#1a73e8] hover:underline cursor-pointer"
              >
                Retry search
              </button>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && !error && rawQuery && results.length === 0 && (
          <div className="py-6 max-w-[652px] text-[#202124]">
            <p className="text-[18px] mb-3">
              Your search - <strong className="font-semibold">&ldquo;{rawQuery}&rdquo;</strong> - did not match any indexed pages.
            </p>
            <p className="text-[14px] text-[#5f6368] mt-4 font-medium">Suggestions:</p>
            <ul className="list-disc pl-6 text-[14px] text-[#5f6368] space-y-1.5 mt-2">
              <li>Make sure that all words are spelled correctly.</li>
              <li>Try different or more general keywords.</li>
              <li>Try fewer keywords.</li>
              <li>Check if the website has been crawled into Mini Google yet.</li>
            </ul>
          </div>
        )}

        {/* Results List */}
        {!isLoading && !error && results.length > 0 && (
          <div className="space-y-7 max-w-[652px]">
            {results.map((result) => {
              const displayUrl = formatDisplayUrl(result.url);
              const initial = (result.title || result.url).charAt(0).toUpperCase();

              return (
                <div key={result.id} className="group">
                  {/* Domain & URL preview */}
                  <div className="flex items-center space-x-2 text-[12px] text-[#202124] mb-1">
                    <div className="w-5 h-5 rounded-full bg-[#f1f3f4] flex items-center justify-center text-[11px] text-[#5f6368] font-bold">
                      {initial || <Globe className="w-3 h-3 text-[#1a73e8]" />}
                    </div>
                    <div className="flex flex-col leading-tight overflow-hidden">
                      <span className="text-[14px] text-[#202124] truncate">
                        {displayUrl.split(" ")[0]}
                      </span>
                      <span className="text-[12px] text-[#4d5156] truncate">
                        {displayUrl}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#5f6368] hover:text-[#202124] transition-opacity ml-auto"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title */}
                  <h2 className="text-[20px] leading-snug font-normal text-[#1a0dab] group-hover:underline cursor-pointer">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5"
                    >
                      <span>{result.title || result.url}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-40 inline" />
                    </a>
                  </h2>

                  {/* Snippet */}
                  <p className="text-[14px] text-[#4d5156] leading-relaxed mt-1">
                    {result.snippet || "No text snippet available for this page."}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Related Searches Section */}
        {rawQuery && !isLoading && results.length > 0 && (
          <div className="mt-12 pt-6 border-t border-[#dadce0] max-w-[652px]">
            <h3 className="text-[18px] text-[#202124] font-normal mb-4">
              Related searches
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[14px]">
              {[
                `${rawQuery} quotes`,
                `${rawQuery} biography`,
                `${rawQuery} thinking`,
                `${rawQuery} books`,
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
          <span className="font-medium text-[#3c4043]">Mini Google Search</span>
          <span className="w-1 h-1 rounded-full bg-[#70757a]" />
          <span>Backend: http://localhost:5000</span>
          <span className="w-1 h-1 rounded-full bg-[#70757a]" />
          <span className="text-[#188038]">✓ PostgreSQL Connected</span>
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
