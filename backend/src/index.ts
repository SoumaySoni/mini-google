import express, { Request, Response } from "express";
import { fetchWebpage } from "./crawler";

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
 * Basic Crawler Endpoint
 * Accepts a URL via query param or JSON body, fetches the webpage HTML, and returns the result.
 */
app.post("/api/crawl", async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing or invalid 'url' in request body" });
    return;
  }

  try {
    const result = await fetchWebpage(url);
    res.json({
      success: true,
      url: result.url,
      status: result.status,
      contentType: result.contentType,
      byteLength: result.byteLength,
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

  try {
    const result = await fetchWebpage(url);
    res.json({
      success: true,
      url: result.url,
      status: result.status,
      contentType: result.contentType,
      byteLength: result.byteLength,
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
