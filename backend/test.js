// Automated test suite for URL Shortener
import { encodeBase62, decodeBase62, generateRandomCode } from "./src/utils/base62.js";
import { isValidUrl, normalizeUrl, isValidAlias } from "./src/utils/urlValidator.js";
import { urlService } from "./src/services/url.service.js";
import { urlRepository } from "./src/storage/url.repository.js";
import { app } from "./src/server.js";

async function runTests() {
  console.log("🧪 Running URL Shortener unit & integration test suite...\n");

  // 1. Base62 Encoding & Decoding
  console.log("--- 1. Base62 Tests ---");
  const testNum = 1001;
  const encoded = encodeBase62(testNum);
  const decoded = decodeBase62(encoded);
  if (decoded !== testNum) throw new Error("Base62 roundtrip failed");
  if (encodeBase62(0) !== "0") throw new Error("Base62 zero handling failed");
  const randomCode = generateRandomCode(7);
  if (randomCode.length !== 7) throw new Error("Random code generation failed");
  console.log("✅ Base62 tests passed!");

  // 2. URL Validation & Normalization
  console.log("\n--- 2. URL Validator Tests ---");
  if (!isValidUrl("https://antigravity.google.com/docs")) throw new Error("Valid URL marked invalid");
  if (!isValidUrl("http://localhost:5000/test")) throw new Error("Localhost URL marked invalid");
  if (isValidUrl("javascript:alert(1)")) throw new Error("Dangerous protocol allowed");
  if (isValidUrl("not-a-valid-url")) throw new Error("Malformed URL allowed");

  const normalized1 = normalizeUrl("https://example.com/");
  const normalized2 = normalizeUrl("https://example.com");
  if (normalized1 !== normalized2) throw new Error("Trailing slash normalization failed");

  if (!isValidAlias("custom-link_1").valid) throw new Error("Valid custom alias rejected");
  if (isValidAlias("api").valid) throw new Error("Reserved alias 'api' was accepted");
  console.log("✅ URL Validator tests passed!");

  // 3. Service & Repository Tests
  console.log("\n--- 3. URL Service & Repository Tests ---");
  urlRepository.clear();

  const item1 = urlService.shortenUrl({ originalUrl: "https://github.com/google" });
  if (!item1.shortCode) throw new Error("URL shortening failed");

  const item2 = urlService.shortenUrl({ originalUrl: "https://github.com/google/" });
  if (item2.shortCode !== item1.shortCode) throw new Error("Idempotency check failed");

  const customItem = urlService.shortenUrl({ originalUrl: "https://news.ycombinator.com", customAlias: "hacker-news" });
  if (customItem.shortCode !== "hacker-news") throw new Error("Custom alias creation failed");

  const resolved = urlService.resolveUrl(item1.shortCode, { userAgent: "Node-Test-Agent", referrer: "https://twitter.com" });
  if (resolved !== "https://github.com/google") throw new Error("URL resolution failed");

  const stats = urlService.getAnalytics(item1.shortCode);
  if (stats.clicks !== 1 || stats.recentClicks.length !== 1) throw new Error("Analytics tracking failed");

  const allUrls = urlService.getAllUrls();
  if (allUrls.length !== 2) throw new Error("List all URLs count mismatch");

  const deleted = urlService.deleteUrl("hacker-news");
  if (!deleted || urlService.getAllUrls().length !== 1) throw new Error("URL deletion failed");
  console.log("✅ URL Service & Repository tests passed!");

  // 4. HTTP API Integration Tests (In-Process Server)
  console.log("\n--- 4. HTTP API Integration Tests ---");
  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // GET /health
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    if (healthRes.status !== 200 || healthData.status !== "ok") throw new Error("GET /health failed");

    // POST /api/shorten
    const testUrl = "https://developer.mozilla.org/en-US/docs/Web/JavaScript";
    const shortenRes = await fetch(`${baseUrl}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: testUrl })
    });
    const shortenData = await shortenRes.json();
    if (shortenRes.status !== 201 || !shortenData.success) throw new Error("POST /api/shorten failed");
    const testCode = shortenData.data.shortCode;

    // POST /api/shorten with custom alias
    const aliasRes = await fetch(`${baseUrl}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://wikipedia.org", customAlias: "wiki-test" })
    });
    const aliasData = await aliasRes.json();
    if (aliasRes.status !== 201 || aliasData.data.shortCode !== "wiki-test") throw new Error("Custom alias API failed");

    // GET /api/urls
    const listRes = await fetch(`${baseUrl}/api/urls`);
    const listData = await listRes.json();
    if (listRes.status !== 200 || !Array.isArray(listData.data)) throw new Error("GET /api/urls failed");

    // GET /:shortCode (Redirection & Tracking)
    const redirRes = await fetch(`${baseUrl}/${testCode}`, {
      redirect: "manual",
      headers: { "User-Agent": "Test-Browser", "Referer": "https://google.com" }
    });
    if (redirRes.status !== 302 || redirRes.headers.get("location") !== testUrl) {
      throw new Error("HTTP 302 redirection failed");
    }

    // GET /api/analytics/:shortCode
    const analyticsRes = await fetch(`${baseUrl}/api/analytics/${testCode}`);
    const analyticsData = await analyticsRes.json();
    if (analyticsData.data.clicks < 1) throw new Error("Click count increment via HTTP failed");

    // DELETE /api/urls/:shortCode
    const delRes = await fetch(`${baseUrl}/api/urls/wiki-test`, { method: "DELETE" });
    const delData = await delRes.json();
    if (delRes.status !== 200 || !delData.success) throw new Error("DELETE /api/urls failed");

    console.log("✅ All HTTP API endpoints verified successfully!");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY (100%)!\n");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
