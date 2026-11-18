/**
 * Standalone Test Script for Robots.txt Checker
 * Run with: npx tsx src/test-robots.ts
 */

import {
  parseRobotsTxt,
  isPathAllowed,
  isUrlAllowed,
  clearRobotsCache,
} from "./robots";

async function runTests() {
  console.log("==================================================");
  console.log("🤖 Running Robots Checker Unit & Real-World Tests");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  // --- Test 1: Standard User-agent: * with Disallow ---
  const robots1 = `
    User-agent: *
    Disallow: /private/
    Disallow: /admin
  `;
  const parsed1 = parseRobotsTxt(robots1);

  assert(
    "Disallows /private/page when Disallow: /private/ is present",
    isPathAllowed("/private/page", parsed1, "MiniGoogleBot") === false
  );

  assert(
    "Allows /public/page when not in disallow list",
    isPathAllowed("/public/page", parsed1, "MiniGoogleBot") === true
  );

  assert(
    "Disallows /admin and subpaths when Disallow: /admin is present",
    isPathAllowed("/admin/settings", parsed1, "MiniGoogleBot") === false
  );

  // --- Test 2: Allow directive overriding Disallow ---
  const robots2 = `
    User-agent: *
    Disallow: /docs/
    Allow: /docs/public/
  `;
  const parsed2 = parseRobotsTxt(robots2);

  assert(
    "Disallows /docs/secret under Disallow: /docs/",
    isPathAllowed("/docs/secret", parsed2, "MiniGoogleBot") === false
  );

  assert(
    "Allows /docs/public/guide because of more specific Allow rule",
    isPathAllowed("/docs/public/guide", parsed2, "MiniGoogleBot") === true
  );

  // --- Test 3: Specific User-agent rules take precedence over * ---
  const robots3 = `
    User-agent: *
    Disallow: /

    User-agent: MiniGoogleBot
    Allow: /search
    Disallow: /secret
  `;
  const parsed3 = parseRobotsTxt(robots3);

  assert(
    "MiniGoogleBot is allowed /search via specific user-agent group",
    isPathAllowed("/search", parsed3, "MiniGoogleBot") === true
  );

  assert(
    "MiniGoogleBot is disallowed /secret via specific user-agent group",
    isPathAllowed("/secret", parsed3, "MiniGoogleBot") === false
  );

  assert(
    "Other bots are disallowed everything by wildcard rule",
    isPathAllowed("/search", parsed3, "OtherBot") === false
  );

  // --- Test 4: Empty Disallow allows everything ---
  const robots4 = `
    User-agent: *
    Disallow:
  `;
  const parsed4 = parseRobotsTxt(robots4);

  assert(
    "Empty Disallow: allows everything",
    isPathAllowed("/any/path", parsed4, "MiniGoogleBot") === true
  );

  // --- Test 5: Live tests against real websites ---
  console.log("\n🌐 Running live tests against real websites...");
  clearRobotsCache();

  try {
    // 5a: quotes.toscrape.com (404 - robots.txt does not exist -> allowed by default)
    console.log("  Testing website without robots.txt (quotes.toscrape.com)...");
    const quotesAuthorAllowed = await isUrlAllowed("https://quotes.toscrape.com/author/Albert-Einstein");
    console.log(`  -> https://quotes.toscrape.com/author/Albert-Einstein allowed: ${quotesAuthorAllowed}`);
    assert("Site without robots.txt allows crawling", quotesAuthorAllowed === true);

    // 5b: github.com (200 - real robots.txt with Disallow: /account-login)
    console.log("\n  Testing website with real robots.txt (github.com)...");
    const githubLoginAllowed = await isUrlAllowed("https://github.com/account-login");
    const githubPublicAllowed = await isUrlAllowed("https://github.com/facebook");
    console.log(`  -> https://github.com/account-login allowed: ${githubLoginAllowed}`);
    console.log(`  -> https://github.com/facebook allowed: ${githubPublicAllowed}`);

    assert("github.com /account-login is disallowed", githubLoginAllowed === false);
    assert("github.com /facebook is allowed", githubPublicAllowed === true);
  } catch (err: any) {
    console.warn(`  Live test notice: ${err.message}`);
  }

  console.log("\n==================================================");
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exitCode = 1;
});
