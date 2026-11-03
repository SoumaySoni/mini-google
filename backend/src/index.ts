import express, { Request, Response } from "express";
import { fetchWebpage, crawl } from "./crawler";
import { initDb, savePage, getPages, getPageByUrl, getPageCount } from "./db";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const pagesCount = await getPageCount();
    res.json({
      status: "Connected",
      message: "Backend is running",
      database: "PostgreSQL connected",
      storedPages: pagesCount,
    });
  } catch (error: any) {
    res.json({
      status: "Connected",
      message: "Backend is running",
      database: `PostgreSQL error: ${error.message}`,
    });
  }
});

/**
 * Stored Pages API: List pages from PostgreSQL
 */
app.get("/api/pages", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const includeHtml = req.query.includeHtml === "true";

    const result = await getPages(limit, offset, includeHtml);
    res.json({
      success: true,
      total: result.total,
      pages: result.pages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve stored pages",
    });
  }
});

/**
 * Stored Pages API: Retrieve single page with HTML by URL
 */
app.get("/api/pages/by-url", async (req: Request, res: Response) => {
  const url = req.query.url;
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing 'url' query parameter" });
    return;
  }

  try {
    const page = await getPageByUrl(url, true);
    if (!page) {
      res.status(404).json({ success: false, error: "Page not found in database" });
      return;
    }
    res.json({ success: true, page });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve page",
    });
  }
});

/**
 * Crawler Endpoint
 * Accepts a URL and optional maxPages/limit to orchestrate multi-page or single-page crawls.
 * Automatically saves all crawled pages into PostgreSQL.
 */
app.post("/api/crawl", async (req: Request, res: Response) => {
  const { url, maxPages, limit } = req.body;
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing or invalid 'url' in request body" });
    return;
  }

  const pageLimit = typeof maxPages === "number" ? maxPages : typeof limit === "number" ? limit : undefined;

  try {
    if (pageLimit && pageLimit > 1) {
      const report = await crawl(url, pageLimit);
      res.json({
        success: true,
        type: "crawl_batch",
        ...report,
      });
      return;
    }

    const result = await fetchWebpage(url);

    // Save single fetch to PostgreSQL
    const stored = await savePage({
      url: result.url,
      title: result.title,
      html: result.html,
      status: result.status,
      contentType: result.contentType,
      crawledAt: new Date(),
    });

    res.json({
      success: true,
      type: "single_fetch",
      dbId: stored.id,
      url: result.url,
      title: result.title,
      snippet: result.snippet,
      status: result.status,
      contentType: result.contentType,
      byteLength: result.byteLength,
      links: result.links,
      html: result.html,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch webpage",
    });
  }
});

app.get("/api/crawl", async (req: Request, res: Response) => {
  const url = req.query.url;
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing or invalid 'url' query parameter" });
    return;
  }

  const rawLimit = req.query.maxPages || req.query.limit;
  const pageLimit = rawLimit ? parseInt(rawLimit as string, 10) : undefined;

  try {
    if (pageLimit && !isNaN(pageLimit) && pageLimit > 1) {
      const report = await crawl(url, pageLimit);
      res.json({
        success: true,
        type: "crawl_batch",
        ...report,
      });
      return;
    }

    const result = await fetchWebpage(url);

    // Save single fetch to PostgreSQL
    const stored = await savePage({
      url: result.url,
      title: result.title,
      html: result.html,
      status: result.status,
      contentType: result.contentType,
      crawledAt: new Date(),
    });

    res.json({
      success: true,
      type: "single_fetch",
      dbId: stored.id,
      url: result.url,
      title: result.title,
      snippet: result.snippet,
      status: result.status,
      contentType: result.contentType,
      byteLength: result.byteLength,
      links: result.links,
      html: result.html,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch webpage",
    });
  }
});

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  try {
    await initDb();
  } catch (err) {
    console.error("Failed to initialize database on startup:", err);
  }
});
