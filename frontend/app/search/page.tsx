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
} from "lucide-react";

interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  sitelinks?: { title: string; href: string }[];
}

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") || "";

  const [inputVal, setInputVal] = useState(rawQuery);

  // Sync input value whenever the URL query parameter changes
  useEffect(() => {
    setInputVal(rawQuery);
  }, [rawQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

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
        {
          id: "react-wiki",
          title: "React (software) - Wikipedia",
          url: "https://en.wikipedia.org/wiki/React_(software)",
          displayUrl: "https://en.wikipedia.org > wiki > React_(software)",
          snippet:
            "React (also known as React.js or ReactJS) is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta and a community.",
        },
        {
          id: "react-github",
          title: "facebook/react: The library for web and native user interfaces",
          url: "https://github.com/facebook/react",
          displayUrl: "https://github.com > facebook > react",
          snippet:
            "React is a JavaScript library for building user interfaces. Declarative: React makes it painless to create interactive UIs. Component-Based: Build encapsulated components that manage their own state.",
        },
      ];
    }

    // Default mock results for any other search query
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
      {
        id: "result-3",
        title: `GitHub - Awesome resources and projects for ${q}`,
        url: `https://github.com/topics/${encodeURIComponent(q)}`,
        displayUrl: `https://github.com > topics > ${q}`,
        snippet: `A curated list of awesome frameworks, libraries, software, and resources built around ${q}. Contribute and star top community projects.`,
      },
      {
        id: "result-4",
        title: `${q} News, Articles & Technical Insights`,
        url: `https://news.ycombinator.com`,
        displayUrl: `https://news.ycombinator.com > item?query=${encodeURIComponent(q)}`,
        snippet: `Latest discussions, industry updates, and engineering deep-dives covering ${q} and modern technology trends.`,
      },
    ];
  };

  const results = rawQuery ? getMockResults(rawQuery) : [];

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
                placeholder=""
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
      <main className="flex-1 px-4 sm:px-6 md:pl-[184px] md:pr-8 py-3 max-w-[1200px]">
        {/* Results Metadata */}
        <div className="text-[14px] text-[#70757a] mb-5">
          {rawQuery ? (
            <span>
              About 2,840,000,000 results (0.34 seconds) for{" "}
              <strong className="text-[#202124] font-medium">&ldquo;{rawQuery}&rdquo;</strong>
            </span>
          ) : (
            <span>Please enter a query in the search box above.</span>
          )}
        </div>

        {/* Results List */}
        <div className="space-y-8 max-w-[652px]">
          {results.map((result) => (
            <div key={result.id} className="group">
              {/* Domain & URL preview */}
              <div className="flex items-center space-x-2 text-[12px] text-[#202124] mb-1">
                <div className="w-4 h-4 rounded-full bg-[#f1f3f4] flex items-center justify-center text-[10px] text-[#5f6368] font-bold">
                  {result.title.charAt(0)}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[14px] text-[#202124]">{result.displayUrl.split(" ")[0]}</span>
                  <span className="text-[12px] text-[#4d5156]">{result.displayUrl}</span>
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
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  {result.title}
                </a>
              </h2>

              {/* Snippet */}
              <p className="text-[14px] text-[#4d5156] leading-relaxed mt-1">
                {result.snippet}
              </p>

              {/* Sitelinks (if present) */}
              {result.sitelinks && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3 pt-2 pl-3 border-l-2 border-[#dadce0]">
                  {result.sitelinks.map((sitelink, idx) => (
                    <div key={idx}>
                      <a
                        href={sitelink.href}
                        className="text-[14px] text-[#1a0dab] hover:underline"
                      >
                        {sitelink.title}
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

        {/* Pagination Section */}
        {rawQuery && (
          <div className="mt-12 mb-8 flex items-center justify-center max-w-[652px] space-x-3 text-sm">
            <span className="text-[#4285F4] font-semibold text-lg">M</span>
            <span className="text-[#EA4335] font-semibold text-lg">i</span>
            <span className="text-[#FBBC05] font-semibold text-lg">n</span>
            <span className="text-[#34A853] font-semibold text-lg">i</span>
            <span className="space-x-2 text-[#1a0dab]">
              <span className="px-2 py-1 font-bold text-[#202124] border-b-2 border-[#202124]">
                1
              </span>
              <span className="px-2 py-1 hover:underline cursor-pointer">2</span>
              <span className="px-2 py-1 hover:underline cursor-pointer">3</span>
              <span className="px-2 py-1 hover:underline cursor-pointer">4</span>
              <span className="px-2 py-1 hover:underline cursor-pointer">5</span>
              <span className="px-2 py-1 hover:underline cursor-pointer">Next &gt;</span>
            </span>
          </div>
        )}
      </main>

      {/* Results Footer */}
      <footer className="mt-auto bg-[#f2f2f2] text-[#70757a] text-[13px] border-t border-[#dadce0]">
        <div className="px-4 md:px-8 py-3 border-b border-[#dadce0] flex items-center space-x-4">
          <span className="font-medium text-[#3c4043]">India</span>
          <span className="w-1 h-1 rounded-full bg-[#70757a]" />
          <span>From your IP address</span>
          <span className="w-1 h-1 rounded-full bg-[#70757a]" />
          <a href="#update" className="text-[#1a0dab] hover:underline">
            Update location
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
