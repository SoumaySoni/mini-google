import { getDb, initDb, getPages, getPageCount } from "./db";

async function main() {
  console.log("🔍 Checking PostgreSQL connection and stored pages...\n");

  try {
    const db = await getDb();
    console.log(`🔌 Database Mode: ${db.type === "external" ? "External PostgreSQL" : "Persistent Embedded PostgreSQL (PGlite)"}`);

    await initDb();
    const count = await getPageCount();
    console.log(`📊 Total Stored Pages: ${count}\n`);

    if (count > 0) {
      const { pages } = await getPages(10, 0, false);
      console.log("Latest indexed pages:");
      pages.forEach((p, idx) => {
        console.log(`  ${idx + 1}. [${p.status}] ${p.title || "No Title"} - ${p.url}`);
      });
      if (count > 10) {
        console.log(`  ... and ${count - 10} more.`);
      }
    } else {
      console.log("No pages crawled yet. Run 'npm run crawl' or start crawling from the web interface!");
    }

    if (db.close) {
      await db.close();
    }
  } catch (error: any) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
}

main();
