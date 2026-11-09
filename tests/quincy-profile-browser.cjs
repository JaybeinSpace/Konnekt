/* Browser regression test of Quincy's unapproved profile at actual mobile
 * and desktop viewport sizes. Requires playwright-core in the CI test job.
 * This test never authenticates or checks Instagram account ownership.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

function findChrome() {
    const paths = [process.env.CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
    return paths.find(p => fs.existsSync(p));
}

async function main() {
    const executablePath = findChrome();
    assert.ok(executablePath, "Chrome or Chromium must be installed in test environment");
    const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
    try {
        const file = "file://" + path.join(__dirname, "..", "creator-profile.html") +
            "?id=quincy-baker&draftPreview=1";
        for (const [width, height] of [[390, 844], [1440, 900]]) {
            const mobile = width <= 430;
            const context = await browser.newContext({
                viewport: { width, height }, deviceScaleFactor: mobile ? 2 : 1,
                isMobile: mobile, hasTouch: mobile
            });
            try {
                const page = await context.newPage();
                await page.goto(file, { waitUntil: "load" });

                const link = page.locator('[data-profile-socials] a[href="https://www.instagram.com/takenwithqair/"]');
                assert.equal(await link.count(), 1, "Instagram must be shown exactly once");
                assert.equal((await link.textContent()).trim(), "Instagram · @takenwithqair");
                assert.equal(await link.getAttribute("target"), "_blank");
                assert.equal(await link.isVisible(), true, "Instagram link must be visible");
                await link.scrollIntoViewIfNeeded();
                const bounds = await link.boundingBox();
                assert.ok(bounds && bounds.width >= 44 && bounds.height >= 30,
                    "Instagram link must be a usable touch/click target");

                const state = await page.evaluate(() => {
                    const link = document.querySelector('[data-profile-socials] a[href="https://www.instagram.com/takenwithqair/"]');
                    const rect = link.getBoundingClientRect();
                    return {
                        width: window.innerWidth,
                        left: rect.left,
                        right: rect.right,
                        draft: !!document.querySelector(".profile-page.is-draft-preview"),
                        pending: !!document.querySelector(".profile-social-verification-note")?.textContent.includes("awaiting confirmation"),
                        featured: !!document.querySelector("[data-featured-in-projects]")?.textContent.includes("The Devil in My House") &&
                            !!document.querySelector("[data-featured-in-projects]")?.textContent.includes("Director of Photography"),
                        emptyWork: !!document.querySelector("[data-profile-projects]")?.textContent.includes("No independently presented Work"),
                        contactHidden: document.querySelector("[data-konnekt-open]")?.hidden === true
                    };
                });
                assert.equal(state.width, width, "Browser must use exact CSS viewport width");
                assert.ok(state.left >= -1 && state.right <= width + 1,
                    "Instagram link must fit within viewport; " + JSON.stringify(state));
                for (const key of ["draft", "pending", "featured", "emptyWork", "contactHidden"]) {
                    assert.equal(state[key], true, key + " must remain true at " + width + "px");
                }
                // Exercise a real pointer click; intercept navigation before it
                // leaves the local draft to avoid claiming Instagram was contacted.
                await page.evaluate(() => {
                    window.__quincyClickedHref = null;
                    document.addEventListener("click", event => {
                        const anchor = event.target.closest("[data-profile-socials] a");
                        if (anchor) {
                            window.__quincyClickedHref = anchor.href;
                            event.preventDefault();
                        }
                    }, { capture: true, once: true });
                });
                await link.click();
                assert.equal(await page.evaluate(() => window.__quincyClickedHref),
                    "https://www.instagram.com/takenwithqair/");
                console.log("PASS " + width + "px: link visible, fits screen, opens correct URL; draft, pending notice, Featured In preserved");
            } finally {
                await context.close();
            }
        }
    } finally {
        await browser.close();
    }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
