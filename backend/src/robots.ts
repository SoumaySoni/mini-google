/**
 * Robots.txt Checker Module for Mini Google
 *
 * Responsibilities:
 * 1. Find website origin and locate /robots.txt.
 * 2. Fetch and cache robots.txt per origin (gracefully handling missing/404 files).
 * 3. Parse user-agent directives (User-agent: MiniGoogleBot or fallback to User-agent: *).
 * 4. Check whether a given URL is allowed (handling Allow, Disallow, prefix paths).
 */

export interface RobotsRuleGroup {
  userAgent: string;
  allow: string[];
  disallow: string[];
}

export interface ParsedRobotsRules {
  groups: RobotsRuleGroup[];
}

// In-memory cache of parsed rules per origin (e.g. "https://example.com" -> ParsedRobotsRules)
const robotsCache = new Map<string, ParsedRobotsRules>();

/**
 * Extracts the origin from a URL (e.g. "https://example.com:8080/path" -> "https://example.com:8080").
 */
export function getOrigin(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    throw new Error(`Invalid URL provided to robots checker: ${url}`);
  }
}

/**
 * Constructs the canonical /robots.txt URL for a given target webpage URL.
 */
export function getRobotsTxtUrl(url: string): string {
  const origin = getOrigin(url);
  return `${origin}/robots.txt`;
}

/**
 * Parses raw robots.txt content into structured rule groups.
 */
export function parseRobotsTxt(content: string): ParsedRobotsRules {
  const lines = content.split(/\r?\n/);
  const groups: RobotsRuleGroup[] = [];

  let currentUserAgents: string[] = [];
  let currentAllows: string[] = [];
  let currentDisallows: string[] = [];

  const flushGroup = () => {
    if (currentUserAgents.length > 0) {
      for (const ua of currentUserAgents) {
        groups.push({
          userAgent: ua.toLowerCase(),
          allow: [...currentAllows],
          disallow: [...currentDisallows],
        });
      }
    }
    currentUserAgents = [];
    currentAllows = [];
    currentDisallows = [];
  };

  for (const rawLine of lines) {
    // Strip comments and extra whitespace
    const commentIndex = rawLine.indexOf("#");
    const line = (commentIndex !== -1 ? rawLine.slice(0, commentIndex) : rawLine).trim();

    if (!line) {
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) {
      continue;
    }

    const directive = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    if (directive === "user-agent") {
      // If we encounter a new user-agent after seeing allow/disallow, flush the previous group
      if (currentAllows.length > 0 || currentDisallows.length > 0) {
        flushGroup();
      }
      currentUserAgents.push(value);
    } else if (directive === "disallow") {
      if (value) {
        currentDisallows.push(value);
      } else {
        // An empty 'Disallow:' cancels all previous disallows (means allow all)
        currentDisallows = [];
      }
    } else if (directive === "allow") {
      if (value) {
        currentAllows.push(value);
      }
    }
  }

  flushGroup();

  return { groups };
}

/**
 * Evaluates whether a relative path is allowed according to the parsed rules.
 * Prefers rules explicitly targeting userAgent; falls back to '*'.
 */
export function isPathAllowed(
  pathname: string,
  rules: ParsedRobotsRules,
  userAgent: string = "MiniGoogleBot"
): boolean {
  const targetUa = userAgent.toLowerCase();

  // 1. Look for groups specifically matching userAgent (e.g. "minigooglebot")
  let matchingGroups = rules.groups.filter((g) =>
    g.userAgent === targetUa || (g.userAgent !== "*" && targetUa.includes(g.userAgent))
  );

  // 2. Fall back to wildcard group "*" if no specific group matched
  if (matchingGroups.length === 0) {
    matchingGroups = rules.groups.filter((g) => g.userAgent === "*");
  }

  // If no matching group found at all, everything is allowed by default
  if (matchingGroups.length === 0) {
    return true;
  }

  // Combine rules from matching groups
  const allows: string[] = [];
  const disallows: string[] = [];
  for (const g of matchingGroups) {
    allows.push(...g.allow);
    disallows.push(...g.disallow);
  }

  // Normalize path (ensure leading slash)
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  // Find longest matching allow pattern
  let maxAllowLen = -1;
  for (const pattern of allows) {
    if (path.startsWith(pattern) && pattern.length > maxAllowLen) {
      maxAllowLen = pattern.length;
    }
  }

  // Find longest matching disallow pattern
  let maxDisallowLen = -1;
  for (const pattern of disallows) {
    if (path.startsWith(pattern) && pattern.length > maxDisallowLen) {
      maxDisallowLen = pattern.length;
    }
  }

  // Standard robots.txt precedence:
  // If a disallow matches and either no allow matches or disallow is strictly longer, disallow.
  // When allow and disallow have equal length, allow takes precedence.
  if (maxDisallowLen > -1 && maxDisallowLen > maxAllowLen) {
    return false;
  }

  return true;
}

/**
 * Fetches and parses robots.txt for a given origin with caching.
 * If the request fails (e.g. 404, network error), returns empty rules (everything allowed).
 */
export async function getRobotsRulesForOrigin(
  origin: string,
  timeoutMs: number = 5000
): Promise<ParsedRobotsRules> {
  const cached = robotsCache.get(origin);
  if (cached) {
    return cached;
  }

  const robotsUrl = `${origin}/robots.txt`;

  try {
    const res = await fetch(robotsUrl, {
      method: "GET",
      headers: {
        "User-Agent": "MiniGoogleBot/1.0 (+http://localhost:3000/bot)",
        Accept: "text/plain",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      // 404 or any other non-200 means no robots.txt restrictions
      const emptyRules: ParsedRobotsRules = { groups: [] };
      robotsCache.set(origin, emptyRules);
      return emptyRules;
    }

    const text = await res.text();
    const parsed = parseRobotsTxt(text);
    robotsCache.set(origin, parsed);
    return parsed;
  } catch {
    // If fetching fails or times out, default to allowing crawling
    const fallbackRules: ParsedRobotsRules = { groups: [] };
    robotsCache.set(origin, fallbackRules);
    return fallbackRules;
  }
}

/**
 * Primary API: Determines if a given target URL is allowed to be crawled by MiniGoogleBot.
 *
 * @param url - The full URL to check (e.g. "https://example.com/private/page").
 * @param userAgent - The crawler's user-agent name (defaults to "MiniGoogleBot").
 * @param timeoutMs - Timeout for fetching /robots.txt in milliseconds.
 * @returns Promise<boolean> - true if crawling is allowed, false if disallowed.
 */
export async function isUrlAllowed(
  url: string,
  userAgent: string = "MiniGoogleBot",
  timeoutMs: number = 5000
): Promise<boolean> {
  try {
    const parsedUrl = new URL(url);
    const origin = parsedUrl.origin;
    const pathname = parsedUrl.pathname + parsedUrl.search;

    const rules = await getRobotsRulesForOrigin(origin, timeoutMs);
    return isPathAllowed(pathname, rules, userAgent);
  } catch {
    // If URL is unparseable, return false
    return false;
  }
}

/**
 * Clears the robots.txt cache (useful for testing or cache resets).
 */
export function clearRobotsCache(): void {
  robotsCache.clear();
}

