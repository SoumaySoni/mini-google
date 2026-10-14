"use client";

import React, { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const searchBarActive = isFocused || isHovered;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality will be implemented in the next step
  };

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
      className="flex flex-col min-h-screen bg-white text-[#202124] select-none"
    >
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

          {/* Google Apps 9-dot launcher icon */}
          <button
            type="button"
            aria-label="Google apps"
            title="Google apps"
            className="p-2 rounded-full hover:bg-[#f1f3f4] transition-colors cursor-pointer text-[#5f6368] hover:text-[#202124] flex items-center justify-center border-0 bg-transparent"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
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
          <div
            className="flex items-center text-6xl sm:text-7xl md:text-[88px] font-medium select-none"
            style={{
              fontFamily: '"Product Sans", "Google Sans", -apple-system, sans-serif',
              letterSpacing: "-2px",
            }}
          >
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
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              border: searchBarActive
                ? "1px solid transparent"
                : "1px solid #dfe1e5",
              boxShadow: searchBarActive
                ? "0 1px 6px rgba(32, 33, 36, 0.28)"
                : "none",
              borderRadius: "24px",
              height: "46px",
              backgroundColor: "#ffffff",
              transition: "all 0.2s ease-in-out",
            }}
            className="flex items-center px-4 w-full"
          >
            {/* Magnifying Glass Search Icon */}
            <div className="text-[#9aa0a6] mr-3 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Search Input Field */}
            <input
              type="text"
              id="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Google Voice Search Mic Icon */}
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors ml-1 cursor-pointer border-0 bg-transparent shrink-0"
              title="Search by voice"
              aria-label="Search by voice"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                />
                <path
                  fill="#34A853"
                  d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                />
                <path
                  fill="#EA4335"
                  d="M7.05 16.87l-1.41-1.41C4.6 14.42 4 12.8 4 11h2c0 1.3.43 2.5 1.15 3.47l-.1.4z"
                />
                <path
                  fill="#FBBC05"
                  d="M12 16c-1.38 0-2.63-.56-3.54-1.46l-1.41 1.41A6.97 6.97 0 0 0 12 18c1.93 0 3.68-.78 4.95-2.05l-1.41-1.41C14.63 15.44 13.38 16 12 16z"
                />
              </svg>
            </button>

            {/* Google Lens / Camera Icon */}
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors ml-1 cursor-pointer border-0 bg-transparent shrink-0"
              title="Search by image"
              aria-label="Search by image"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
                />
                <path
                  fill="#EA4335"
                  d="M19.5 6.5h-2.58l-1.46-1.59A2 2 0 0 0 13.98 4.25h-3.96a2 2 0 0 0-1.48.66L7.08 6.5H4.5A2.5 2.5 0 0 0 2 9v9a2.5 2.5 0 0 0 2.5 2.5h15a2.5 2.5 0 0 0 2.5-2.5V9a2.5 2.5 0 0 0-2.5-2.5zm-7.5 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm6-8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
                />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-3 mt-7">
            <button
              type="submit"
              id="search-button"
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #f8f9fa",
                borderRadius: "4px",
                color: "#3c4043",
                fontSize: "14px",
                height: "36px",
                padding: "0 16px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#dadce0";
                e.currentTarget.style.color = "#202124";
                e.currentTarget.style.boxShadow = "0 1px 1px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#f8f9fa";
                e.currentTarget.style.color = "#3c4043";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Google Search
            </button>
            <button
              type="button"
              id="lucky-button"
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #f8f9fa",
                borderRadius: "4px",
                color: "#3c4043",
                fontSize: "14px",
                height: "36px",
                padding: "0 16px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#dadce0";
                e.currentTarget.style.color = "#202124";
                e.currentTarget.style.boxShadow = "0 1px 1px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.borderColor = "#f8f9fa";
                e.currentTarget.style.color = "#3c4043";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              I&apos;m Feeling Lucky
            </button>
          </div>

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
      <footer
        style={{
          backgroundColor: "#f2f2f2",
          color: "#70757a",
          fontSize: "14px",
        }}
        className="mt-auto shrink-0"
      >
        <div
          style={{
            borderBottom: "1px solid #dadce0",
            padding: "14px 32px 14px 56px",
            fontSize: "15px",
            color: "#70757a",
          }}
        >
          India
        </div>
        <div
          style={{
            padding: "12px 32px 14px 56px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px 24px",
          }}
        >
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
