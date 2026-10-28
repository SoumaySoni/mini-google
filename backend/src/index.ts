import express, { Request, Response } from "express";
import { fetchWebpage, crawl } from "./crawler";

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

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "Connected",
    message: "Backend is running",
  });
});

/**
 * Crawler Endpoint
 * Accepts a URL and optional maxPages/limit to orchestrate multi-page or single-page crawls.
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
    res.json({
      success: true,
      type: "single_fetch",
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
    res.json({
      success: true,
      type: "single_fetch",
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
