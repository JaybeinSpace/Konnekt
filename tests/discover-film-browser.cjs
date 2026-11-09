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
        // Avoid live YouTube requests: test the requested official embed URL.
        await context.route("https://www.youtube-nocookie.com/**", route =>
          route.fulfill({ status: 200, contentType: "text/html",
            body: "<!doctype html><title>Preview player test stub</title>" }));
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
        // First substantial on-screen appearance should trigger ONE muted,
        // inline 30-second preview without a tap or modal.
        const autoplay = film.locator(".discover-auto-preview-player");
        await autoplay.waitFor({ state: "attached", timeout: 8000 });
        assert.equal(await page.locator(".discover-auto-preview-player").count(), 1);
        const autoSrc = new URL(await autoplay.getAttribute("src"));
        assert.equal(autoSrc.origin, "https://www.youtube-nocookie.com");
        assert.equal(autoSrc.pathname, "/embed/SJnMvchdG_E");
        assert.equal(autoSrc.searchParams.get("start"), "0");
        assert.equal(autoSrc.searchParams.get("end"), "30");
        assert.equal(autoSrc.searchParams.get("autoplay"), "1");
        assert.equal(autoSrc.searchParams.get("mute"), "1");
        assert.equal(autoSrc.searchParams.get("playsinline"), "1");
        assert.equal(await page.locator('[data-discover-preview] iframe').count(), 0,
          "Autoplay should be inline, not a popup");
        assert.equal(await film.locator(".discover-auto-preview-label").isVisible(), true);
        // Scrolling away must remove the player, not leave audio/video behind.
        await page.locator(".discover-post").last().scrollIntoViewIfNeeded();
        await autoplay.waitFor({ state: "detached", timeout: 8000 });
        await film.scrollIntoViewIfNeeded();
        assert.equal(await film.locator(".discover-auto-preview-player").count(), 0,
          "Auto-preview should play only once per visit; manual replay stays available");
        const teaser = film.locator('[data-preview-video="the-devil-in-my-house"]');
        assert.equal(await teaser.count(), 1, "Preview action should be available on the film");
        const teaserBounds = await teaser.boundingBox();
        assert.ok(teaserBounds && teaserBounds.height >= 40,
          "Preview button must be usable on a touch screen");
        await teaser.click();
        const modal = page.locator("[data-discover-preview]");
        assert.equal(await modal.evaluate(dialog => dialog.open), true, "Preview opens a native modal");
        assert.equal(await page.evaluate(() => document.activeElement.hasAttribute("data-preview-close")), true,
          "Close button receives keyboard focus");
        const videoFrame = modal.locator("iframe");
        assert.equal(await videoFrame.count(), 1, "Only one video player may load");
        const source = new URL(await videoFrame.getAttribute("src"));
        assert.equal(source.origin, "https://www.youtube-nocookie.com");
        assert.equal(source.pathname, "/embed/SJnMvchdG_E");
        assert.equal(source.searchParams.get("start"), "0");
        assert.equal(source.searchParams.get("end"), "30");
        assert.equal(source.searchParams.get("playsinline"), "1");
        assert.equal(await modal.locator("[data-preview-full]").getAttribute("href"),
          "https://www.youtube.com/watch?v=SJnMvchdG_E");
        const dialogBounds = await modal.boundingBox();
        assert.ok(dialogBounds && dialogBounds.width <= width + 1,
          "Preview dialog must fit the viewport");
        const frameBounds = await videoFrame.boundingBox();
        assert.ok(frameBounds && frameBounds.width >= 200 && frameBounds.height >= 200,
          "Embedded YouTube player must fit minimum player dimensions");
        await page.keyboard.press("Escape");
        assert.equal(await modal.evaluate(dialog => dialog.open), false,
          "Escape dismisses the preview");
        assert.equal(await modal.locator("iframe").count(), 0,
          "Closing the preview unloads the video and stops playback");
        const bounds = await film.boundingBox();
        assert.ok(bounds && bounds.width <= width + 1, "Discover card should fit the screen");
        await page.locator('[data-feed-filter="motion"]').click();
        assert.equal(await film.count(), 1, "Film must appear in Film & Motion");
        await page.locator('[data-feed-filter="art"]').click();
        assert.equal(await film.count(), 0, "Film must not appear in Art & Photography");
        await page.locator('[data-feed-filter="all"]').click();
        await page.locator('[data-discover-view="grid"]').click();
        assert.equal(await film.count(), 1, "Film must appear once in Discover Grid");
        assert.equal(await film.locator(".discover-auto-preview-player").count(), 0,
          "Grid should not autoplay videos");
        await film.locator('[data-preview-video="the-devil-in-my-house"]').click();
        assert.equal(await page.locator("[data-discover-preview]").evaluate(dialog => dialog.open), true,
          "Preview also works in grid layout");
        await page.locator("[data-preview-close]").click();
        assert.equal(await page.locator("[data-discover-preview] iframe").count(), 0);
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
        console.log("PASS " + width + "px: 30s YouTube preview in Feed/Grid; Escape/Close unloads player; attribution, Saved and Collections preserved");
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
