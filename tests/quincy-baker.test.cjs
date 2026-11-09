/* Run with: node --test tests/quincy-baker.test.cjs */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { findMatch, youtubeId } = require("../credit-match-core.js");

const root = path.join(__dirname, "..");
const load = () => {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, "data.js"), "utf8"), { window });
  return window;
};
const filmId = "the-devil-in-my-house";
const videoUrl = "https://www.youtube.com/watch?v=SJnMvchdG_E";
const expectedCredits = [
  ["Imane Lawrence-Brooks", "Cast — Maia"],
  ["Jassiah McAnuff", "Cast — Marshall"],
  ["Alayna Williams", "Director"],
  ["Quincy Baker", "Director of Photography"],
  ["Kayla Cain", "First Assistant Camera"],
  ["Chelsea Chilewa", "Sound"],
  ["Alyssa Nichols", "Sound"],
  ["Beverly Roberts", "Production Assistant"],
  ["Shanaiah Elam-Moore", "Production Assistant"],
  ["Milly Pineda-Rivera", "Script Supervisor"],
  ["Alayna Williams", "Editor"]
];

test("exactly one canonical film record with specified YouTube video", () => {
  const data = load();
  const all = [...data.konnektCreators.flatMap(c => c.featuredProjects || []), ...data.konnektStandaloneProjects];
  const records = all.filter(p => youtubeId(p.videoUrl || p.youtubeUrl) === "SJnMvchdG_E");
  assert.equal(records.length, 1);
  assert.equal(records[0].id, filmId);
  assert.equal(records[0].videoUrl, videoUrl);
  assert.equal(records[0].watchListed, true);
  assert.equal(records[0].type, "Short Film");
  assert.equal(records[0].copyrightOwner, null);
  assert.equal(records[0].creatorId, null);
});

test("cast and crew credits retain exact supplied names and roles", () => {
  const { konnektStandaloneProjects } = load();
  const film = konnektStandaloneProjects.find(p => p.id === filmId);
  assert.equal(film.credits.map(c => c.name + "|" + c.role).join("\n"),
    expectedCredits.map(([name, role]) => name + "|" + role).join("\n"));
});

test("Quincy is not a public creator or owner; draft Work stays empty", () => {
  const data = load();
  assert.equal(data.konnektCreators.some(c => c.id === "quincy-baker"), false);
  const draft = data.konnektCreatorDrafts.find(c => c.id === "quincy-baker");
  assert.equal(draft.status, "draft");
  assert.equal(draft.creatorManaged, false);
  assert.equal(draft.approved, false);
  assert.equal(draft.featuredProjects.length, 0);
  assert.equal(draft.contactEmail, "");
  assert.equal(draft.socialLinks.length, 0);
  assert.equal(draft.location, "");
  assert.equal(draft.profileImage, "");
});

test("draft Featured In links by pending credit only, never by approved account", () => {
  const data = load();
  const film = data.konnektStandaloneProjects[0];
  const credit = film.credits.find(c => c.name === "Quincy Baker");
  assert.equal(credit.pendingCreatorId, "quincy-baker");
  assert.notEqual(credit.approved, true);
  assert.equal(credit.creatorId, undefined);
  assert.equal(findMatch(videoUrl, "Quincy Baker", data.konnektStandaloneProjects).kind, "credit-match");
});

test("Konnekt Watch lists the film and builds official video embed without rehosting", () => {
  const data = load();
  const cards = { innerHTML: "" };
  const hero = { style: { setProperty() {} }, querySelector() { return null; } };
  const elements = {
    "[data-watch-hero]": hero, "[data-watch-rows]": cards,
    "[data-watch-detail]": null
  };
  const document = { querySelector: selector => elements[selector] || null };
  vm.runInNewContext(fs.readFileSync(path.join(root, "watch.js"), "utf8"),
    { window: data, document, location: { search: "" }, URL, URLSearchParams });
  assert.match(cards.innerHTML, /The Devil in My House/);
  assert.match(cards.innerHTML, /Director of Photography/);
  assert.equal((cards.innerHTML.match(/watch-project.html\?id=the-devil-in-my-house/g) || []).length, 1);

  const detail = {};
  const viewer = { replaceChildren(element) { this.element = element; } };
  const info = { innerHTML: "" }, credits = { innerHTML: "" }, more = { innerHTML: "" };
  const detailNodes = {
    "[data-watch-hero]": null, "[data-watch-detail]": detail,
    "[data-watch-viewer]": viewer, "[data-watch-info]": info,
    "[data-watch-credits]": credits, "[data-watch-more]": more
  };
  const detailDocument = {
    title: "",
    querySelector: selector => detailNodes[selector] || null,
    createElement: name => ({ tagName: name })
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, "watch.js"), "utf8"),
    { window: data, document: detailDocument, location: { search: "?id=" + filmId }, URL, URLSearchParams });
  assert.equal(viewer.element.src, "https://www.youtube-nocookie.com/embed/SJnMvchdG_E");
  assert.match(info.innerHTML, /Watch on YouTube/);
  assert.doesNotMatch(info.innerHTML, /Meet the artist/);
  for (const [name] of expectedCredits) assert.ok(credits.innerHTML.includes(name));
  assert.match(credits.innerHTML, /<h2>Cast<\/h2>/);
  assert.match(credits.innerHTML, /<h2>Crew<\/h2>/);
});
