/* Browser regression test for Quincy's unpublished profile.
 * Uses Chrome/Chromium from the CI runner; no dependency in production.
 * Tests rendering and link target, not account ownership or external Instagram uptime.
 * Run: node tests/quincy-profile-browser.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

function browserExecutable() {
    const candidates = [
        process.env.CHROME_BIN,
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser"
    ].filter(Boolean);
    for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
    const located = spawnSync("sh", ["-c", "command -v google-chrome || command -v chromium || command -v chromium-browser"], { encoding: "utf8" });
    return located.status === 0 ? located.stdout.trim().split("\n")[0] : null;
}

const chrome = browserExecutable();
assert.ok(chrome, "Chrome/Chromium is required for browser layout tests");
const root = path.join(__dirname, "..");
const original = fs.readFileSync(path.join(root, "creator-profile.html"), "utf8");
const marker = `<script>
(function () {
    const link = [...document.querySelectorAll("[data-profile-socials] a")]
        .find(anchor => anchor.getAttribute("href") === "https://www.instagram.com/takenwithqair/");
    const bounds = link ? link.getBoundingClientRect() : null;
    const featured = document.querySelector("[data-featured-in-projects]");
    const work = document.querySelector("[data-profile-projects]");
    const note = document.querySelector(".profile-social-verification-note");
    const computed = link ? getComputedStyle(link) : null;
    const output = document.createElement("output");
    output.id = "quincy-browser-result";
    output.textContent = JSON.stringify({
        viewportWidth: window.innerWidth,
        link: link?.getAttribute("href") || null,
        label: link?.textContent.trim() || null,
        target: link?.target || null,
        visible: !!bounds && bounds.width > 0 && bounds.height >= 30 &&
            bounds.left >= -1 && bounds.right <= window.innerWidth + 1 &&
            computed.display !== "none" && computed.visibility !== "hidden",
        pendingNotice: !!note && note.textContent.includes("awaiting confirmation"),
        draft: !!document.querySelector(".profile-page.is-draft-preview"),
        featuredFilm: !!featured && featured.textContent.includes("The Devil in My House") &&
            featured.textContent.includes("Director of Photography"),
        emptyWork: !!work && work.textContent.includes("No independently presented Work"),
        contactHidden: document.querySelector("[data-konnekt-open]")?.hidden === true
    });
    document.body.append(output);
})();
</script>`;
assert.ok(original.includes("</body>"), "Profile HTML must have closing body tag");
const temp = path.join(root, ".quincy-browser-regression-" + process.pid + ".html");
try {
    fs.writeFileSync(temp, original.replace("</body>", marker + "</body>"));
    for (const [width, height] of [[390, 844], [1440, 900]]) {
        const uri = "file://" + temp + "?id=quincy-baker&draftPreview=1";
        const run = spawnSync(chrome, [
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--no-first-run",
            "--disable-background-networking",
            "--virtual-time-budget=3000",
            "--window-size=" + width + "," + height,
            "--dump-dom",
            uri
        ], { encoding: "utf8", timeout: 45000, maxBuffer: 10 * 1024 * 1024 });
        assert.equal(run.status, 0, "Chrome exited with error at " + width + "px: " + (run.stderr || "").slice(-1200));
        const match = run.stdout.match(/<output id="quincy-browser-result">([^<]+)<\/output>/);
        assert.ok(match, "Browser did not render test output at " + width + "px");
        const json = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        const result = JSON.parse(json);
        assert.equal(result.link, "https://www.instagram.com/takenwithqair/");
        assert.equal(result.label, "Instagram · @takenwithqair");
        assert.equal(result.target, "_blank");
        for (const name of ["visible", "pendingNotice", "draft", "featuredFilm", "emptyWork", "contactHidden"]) {
            assert.equal(result[name], true, name + " failed at " + width + "px: " + JSON.stringify(result));
        }
        console.log("PASS " + width + "px browser: social link visible and correctly targeted; draft and Featured In retained; viewport " + result.viewportWidth + "px");
    }
} finally {
    try { fs.unlinkSync(temp); } catch {}
}
