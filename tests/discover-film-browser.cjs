/* Browser regression: canonical independent short film is discoverable without
 * incorrectly assigning project ownership or publishing a draft creator profile.
 * Runs against static HTML in CI with Chromium, Playwright is test-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");
function chromeBinary() {
  return [process.env.CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean).find(fs.existsSync);
}
async function main() {
  const binary = chromeBinary();
  assert.ok(binary, "Chromium browser executable not found");
  const browser = await chromium.launch({ executablePath: binary, headless: true, args: ["--no-sandbox"] });
  try {
    const root = path.join(__dirname, "..");
    for (const [width, height] of [[390, 844], [1440, 900]]) {
      const isMobile = width <= 430;
      const context = await browser.newContext({
        viewport: { width, height }, deviceScaleFactor: isMobile ? 2 : 1,
        isMobile, hasTouch: isMobile
      });
      try {
        const page = await context.newPage();
        await page.goto("file://" + path.join(root, "discover.html"), { waitUntil: "load" });
        const film = page.locator('[data-discover-feed] [data-post-id="the-devil-in-my-house"]');
        assert.equal(await film.count(), 1, "Film must occur exactly once in Discover's For You feed");
        assert.equal(await film.getAttribute("data-demo"), "false", "Real submitted film must not be labeled a demo");
        assert.match(await film.locator(".discover-artist").innerText(),
          /Submitted by Quincy Baker · Director of Photography/);
        assert.equal(await film.locator('a[href="project.html?id=the-devil-in-my-house"]').count(), 1);
        assert.equal(await film.locator('a[href="watch-project.html?id=the-devil-in-my-house"]').count(), 1);
        assert.equal(await film.locator('a[href*="creator-profile.html"]').count(), 0,
          "Never link an unapproved creator identity from this film");
        assert.equal(await film.isVisible(), true);
        const bounds = await film.boundingBox();
        assert.ok(bounds && bounds.width <= width + 1, "Discover card should fit the screen");
        await page.locator('[data-feed-filter="motion"]').click();
        assert.equal(await film.count(), 1, "Film must appear in Film & Motion");
        await page.locator('[data-feed-filter="art"]').click();
        assert.equal(await film.count(), 0, "Film must not appear in Art & Photography");
        await page.locator('[data-feed-filter="all"]').click();
        await page.locator('[data-discover-view="grid"]').click();
        assert.equal(await film.count(), 1, "Film must appear once in Discover Grid");
        await page.locator('[data-discover-view="feed"]').click();
        assert.equal(await film.count(), 1, "Film must remain in Discover Feed");

        await film.locator('[data-save-project="the-devil-in-my-house"]').click();
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("konnektSavedItems")));
        assert.ok(saved?.projects.includes("the-devil-in-my-house"), "Film should save by canonical ID");
        await page.goto("file://" + path.join(root, "saved.html"), { waitUntil: "load" });
        assert.equal(await page.locator('[data-saved-projects] a[href="project.html?id=the-devil-in-my-house"]').count() > 0, true,
          "Saved projects must link to original canonical film");
        await page.goto("file://" + path.join(root, "collections.html"), { waitUntil: "load" });
        await page.locator("#collection-name").fill("Film reference");
        await page.locator('[data-collection-form] button[type="submit"]').click();
        assert.equal(await page.locator('.collection-picker option').filter({ hasText: "The Devil in My House" }).count(), 1,
          "A saved standalone film must be available in Collections");
        console.log("PASS " + width + "px: Discover Feed/Grid/Film & Motion; accurate attribution; Saved and Collections canonical links");
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
