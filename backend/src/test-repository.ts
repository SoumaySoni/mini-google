/**
 * Quick integration test: fetch https://example.com → saveCrawledPage → PostgreSQL
 * Run with: npx tsx src/test-repository.ts
 */

import { fetchWebpage } from './crawler';
import { saveCrawledPage } from './page-repository';

async function main() {
  const url = 'https://example.com';

  console.log(`\n🌐 Fetching ${url} ...`);
  const result = await fetchWebpage(url);
  console.log(`✅ Fetched — status: ${result.status}, contentType: ${result.contentType}, bytes: ${result.byteLength}`);

  console.log(`\n💾 Saving via Prisma → PostgreSQL (mini_google.pages) ...`);
  const saved = await saveCrawledPage(result);

  console.log(`\n✅ Row saved!`);
  console.log(`   id          : ${saved.id}`);
  console.log(`   url         : ${saved.url}`);
  console.log(`   title       : ${saved.title}`);
  console.log(`   pageText    : ${JSON.stringify(saved.pageText)}`);
  console.log(`   status      : ${saved.status}`);
  console.log(`   contentType : ${saved.contentType}`);
  console.log(`   crawledAt   : ${saved.crawledAt}`);
  console.log(`\n→ Open pgAdmin → mini_google → pages to verify.\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

