"use client";

import React, { useState } from "react";
import { Search, Mic, Camera, X, Grid3x3 } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [capturedQuery, setCapturedQuery] = useState<string | null>(null);

  const handleSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setCapturedQuery(trimmed);
    console.log("Captured search query:", trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#202124] select-none font-sans">
      {/* Top Header Navigation */}
      <header className="flex items-center justify-between px-6 py-4 text-sm text-[#3c4043] shrink-0">
        <div className="flex items-center space-x-4 text-[13px] md:text-sm">
          <a
            href="#about"
            className="hover:underline text-[#5f6368] hover:text-[#202124] transition-colors"
          >
            About
          </a>
          <a
            href="#store"
            className="hover:underline text-[#5f6368] hover:text-[#202124] transition-colors"
          >
            Store
          </a>
        </div>

        <div className="flex items-center space-x-4 md:space-x-5 text-[13px] md:text-sm">
          <a
            href="#gmail"
            className="hover:underline text-[#5f6368] hover:text-[#202124] transition-colors"
          >
            Gmail
          </a>
          <a
            href="#images"
            className="hover:underline text-[#5f6368] hover:text-[#202124] transition-colors"
          >
            Images
          </a>

          {/* Google Apps launcher icon */}
          <button
            type="button"
            aria-label="Google apps"
            title="Google apps"
            className="p-2 rounded-full hover:bg-[#f1f3f4] transition-colors cursor-pointer text-[#5f6368] hover:text-[#202124] flex items-center justify-center border-0 bg-transparent"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>

          {/* Sign in button */}
          <button
            type="button"
            className="bg-[#1a73e8] hover:bg-[#1b66ca] text-white text-[14px] font-medium px-6 py-2 rounded-md transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.2)] cursor-pointer border-0"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Main Center Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-10 sm:-mt-14">
        {/* Mini Google Logo */}
        <div className="flex flex-col items-center mb-7 sm:mb-8">
          <div className="flex items-center text-6xl sm:text-7xl md:text-[88px] font-medium select-none tracking-[-2px]">
            {/* "Mini" */}
            <span className="text-[#4285F4] hover:scale-105 transition-transform duration-150 inline-block">M</span>
            <span className="text-[#EA4335] hover:scale-105 transition-transform duration-150 inline-block">i</span>
            <span className="text-[#FBBC05] hover:scale-105 transition-transform duration-150 inline-block">n</span>
            <span className="text-[#34A853] hover:scale-105 transition-transform duration-150 inline-block">i</span>

            <span className="w-3 sm:w-5 md:w-6 inline-block" />

            {/* "Google" */}
            <span className="text-[#4285F4] hover:scale-105 transition-transform duration-150 inline-block">G</span>
            <span className="text-[#EA4335] hover:scale-105 transition-transform duration-150 inline-block">o</span>
            <span className="text-[#FBBC05] hover:scale-105 transition-transform duration-150 inline-block">o</span>
            <span className="text-[#4285F4] hover:scale-105 transition-transform duration-150 inline-block">g</span>
            <span className="text-[#34A853] hover:scale-105 transition-transform duration-150 inline-block">l</span>
            <span className="text-[#EA4335] hover:scale-105 transition-transform duration-150 inline-block">e</span>
          </div>
        </div>

        {/* Large Search Input & Buttons Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[584px] flex flex-col items-center">
          {/* Large Search Bar */}
          <div className="flex items-center w-full h-[46px] px-4 rounded-full border border-[#dfe1e5] bg-white hover:border-transparent hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus-within:border-transparent focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] transition-all duration-200">
            {/* Magnifying Glass Search Icon */}
            <div className="text-[#9aa0a6] mr-3 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>

            {/* Search Input Field */}
            <input
              type="text"
              id="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder=""
              autoComplete="off"
              className="flex-1 h-full bg-transparent outline-none text-[#202124] text-[16px] leading-normal"
            />

            {/* Clear Button if query is present */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[#70757a] hover:text-[#202124] p-1 mr-1 cursor-pointer bg-transparent border-0 flex items-center"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Voice Search Mic Icon */}
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-[#f1f3f4] transition-colors ml-1 cursor-pointer border-0 bg-transparent shrink-0 text-[#4285F4]"
              title="Search by voice"
              aria-label="Search by voice"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Google Lens / Camera Icon */}
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-[#f1f3f4] transition-colors ml-1 cursor-pointer border-0 bg-transparent shrink-0 text-[#4285F4]"
              title="Search by image"
              aria-label="Search by image"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-3 mt-7">
            <button
              type="submit"
              id="search-button"
              className="h-9 px-4 text-sm text-[#3c4043] bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:text-[#202124] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] active:border-[#4285f4] rounded cursor-pointer transition-all duration-150"
            >
              Google Search
            </button>
            <button
              type="button"
              id="lucky-button"
              onClick={() => handleSearch(query)}
              className="h-9 px-4 text-sm text-[#3c4043] bg-[#f8f9fa] border border-[#f8f9fa] hover:border-[#dadce0] hover:text-[#202124] hover:shadow-[0_1px_1px_rgba(0,0,0,0.1)] active:border-[#4285f4] rounded cursor-pointer transition-all duration-150"
            >
              I&apos;m Feeling Lucky
            </button>
          </div>

          {/* Captured Query Verification Badge */}
          {capturedQuery && (
            <div
              id="captured-query-badge"
              className="mt-6 px-4 py-2 rounded-full bg-[#f1f3f4] text-[#202124] text-sm flex items-center gap-2 border border-[#dadce0] shadow-xs transition-all animate-fadeIn"
            >
              <Search className="w-4 h-4 text-[#4285F4] shrink-0" />
              <span>
                Captured query:{" "}
                <span className="font-semibold text-[#1a73e8]">
                  &ldquo;{capturedQuery}&rdquo;
                </span>
              </span>
            </div>
          )}

          {/* Google Offered In Languages */}
          <div className="text-center mt-7 text-[13px] text-[#4d5156]">
            <span>Google offered in: </span>
            <span className="space-x-2 text-[#1a0dab]">
              <a href="#lang-hi" className="hover:underline">हिन्दी</a>
              <a href="#lang-bn" className="hover:underline">বাংলা</a>
              <a href="#lang-te" className="hover:underline">తెలుగు</a>
              <a href="#lang-mr" className="hover:underline">मराठी</a>
              <a href="#lang-ta" className="hover:underline">தமிழ்</a>
              <a href="#lang-gu" className="hover:underline">ગુજરાતી</a>
              <a href="#lang-kn" className="hover:underline">ಕನ್ನಡ</a>
              <a href="#lang-ml" className="hover:underline">മലയാളം</a>
              <a href="#lang-pa" className="hover:underline">ਪੰਜਾਬੀ</a>
            </span>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="mt-auto shrink-0 bg-[#f2f2f2] text-[#70757a] text-sm">
        <div className="px-14 py-3.5 border-b border-[#dadce0] text-[15px]">
          India
        </div>
        <div className="px-14 py-3 flex flex-wrap justify-between items-center gap-y-3">
          <div className="flex flex-wrap items-center space-x-6">
            <a href="#about" className="hover:underline text-[#70757a] hover:text-[#3c4043]">
              About
            </a>
            <a href="#advertising" className="hover:underline text-[#70757a] hover:text-[#3c4043]">
              Advertising
            </a>
            <a href="#business" className="hover:underline text-[#70757a] hover:text-[#3c4043]">
              Business
            </a>
            <a href="#howsearchworks" className="hover:underline text-[#70757a] hover:text-[#3c4043]">
              How Search works
            </a>
          </div>
          <div className="flex flex-wrap items-center space-x-6">
            <a href="#privacy" className="hover:underline text-[#70757a] hover:text-[#3c4043]">
              Privacy
            </a>
            <a href="#terms" className="hover:underline text-[#70757a] hover:text-[#3c4043]">
              Terms
            </a>
            <a href="#settings" className="hover:underline text-[#70757a] hover:text-[#3c4043]">
              Settings
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
