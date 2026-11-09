(() => {
  "use strict";
  const feed = document.querySelector("[data-discover-feed]");
  if (!feed) return;
  const creators = Array.isArray(window.konnektCreators) ? window.konnektCreators : [];
  // Creator Work is distinct from independently submitted films. Do not copy
  // films into a contributor's portfolio or invent a project owner.
  const creatorPosts = creators.flatMap(creator =>
    (creator.featuredProjects || [])
      .filter(project => project && project.id && (project.image || project.thumbnail))
      .map(project => ({...project, creator}))
  );
  const standalonePosts = (window.konnektStandaloneProjects || [])
    .filter(project => project && project.discoverListed === true &&
      project.id && (project.image || project.thumbnail))
    .map(project => ({...project, creator: null}));
  // Put independent films first while keeping the real artists above demo cards.
  const confirmedRealCreatorIds = new Set(["jaelyn-ramos", "leticia-mendoza"]);
  const posts = [...standalonePosts, ...creatorPosts]
    .filter((project, index, list) => list.findIndex(item => item.id === project.id) === index);
  posts.sort((a, b) => {
    const rank = item => item.creator
      ? (confirmedRealCreatorIds.has(item.creator.id) ? 1 : 2) : 0;
    return rank(a) - rank(b);
  });
  const key = "konnekt-discover-likes-v1";
  let liked = [];
  try { const stored = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(stored)) liked = stored.filter(id => typeof id === "string"); } catch {}
  const savedKey = "konnektSavedItems";
  const readSaved = () => { try { const value = JSON.parse(localStorage.getItem(savedKey) || "{}"); return { creators: Array.isArray(value.creators) ? value.creators : [], projects: Array.isArray(value.projects) ? value.projects : [] }; } catch { return {creators:[],projects:[]}; } };
  const writeSaved = value => { try { localStorage.setItem(savedKey, JSON.stringify(value)); } catch {} };
  const escape = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const classification = post => [post.type,post.category,...(Array.isArray(post.tags) ? post.tags : [])].join(" ").toLowerCase();
  const isMotion = post => /film|video|animation|documentary|cinema|motion/.test(classification(post));
  const isDemo = post => post.creator
    ? !confirmedRealCreatorIds.has(post.creator.id) : post.isDemo === true;
  const artworkLink = post => "project.html?id=" + encodeURIComponent(post.id);
  const profileLink = post => post.creator?.id
    ? "creator-profile.html?id=" + encodeURIComponent(post.creator.id) : null;
  const byline = post => post.creator
    ? [post.creator.name, post.creator.location].filter(Boolean).join(" · ")
    : post.submittedBy
      ? "Submitted by " + post.submittedBy + " · " + (post.submittedByRole || "Contributor")
      : "Project credits on detail page";
  const discoveryLinks = post => {
    const creatorUrl = profileLink(post);
    const projectUrl = artworkLink(post);
    return `<a href="${projectUrl}">View project ↗</a>` +
      (creatorUrl ? `<a href="${creatorUrl}">Meet the creator ↗</a>`
        : post.videoUrl ? `<a href="watch-project.html?id=${encodeURIComponent(post.id)}">Watch film ↗</a>` : "");
  };
  const params = new URLSearchParams(location.search);
  let view = params.get("view") === "grid" ? "grid" : "feed";
  let current = ["all","art","motion"].includes(params.get("category")) ? params.get("category") : "all";
  const updateControls = () => {
    document.querySelectorAll("[data-feed-filter]").forEach(button => { const active = button.dataset.feedFilter === current; button.classList.toggle("is-active",active); button.setAttribute("aria-pressed",String(active)); });
    document.querySelectorAll("[data-discover-view]").forEach(button => { const active = button.dataset.discoverView === view; button.classList.toggle("is-active",active); button.setAttribute("aria-pressed",String(active)); });
    feed.classList.toggle("discover-grid-view",view === "grid");
    const url = new URL(location.href); url.searchParams.set("view",view); url.searchParams.set("category",current); history.replaceState(null,"",url);
  };
  const render = filter => {
    const filtered = posts.filter(post => filter === "all" || (filter === "motion" ? isMotion(post) : !isMotion(post)));
    feed.innerHTML = filtered.map(post => {
      const active = liked.includes(post.id);
      const saved = readSaved().projects.includes(post.id);
      const category = isMotion(post) ? "FILM & MOTION" : "ART & PHOTOGRAPHY";
      const label = isDemo(post) ? "DEMO · " + category : category;
      return `<article class="discover-post" data-post-id="${escape(post.id)}" data-demo="${isDemo(post)}">
        <div class="discover-post-media"><img loading="lazy" src="${escape(post.image || post.thumbnail)}" alt="${escape(post.alt || post.title)}"></div>
        <div class="discover-post-top"><span class="discover-type">${label}</span><span class="discover-type">KONNEKT DISCOVER</span></div>
        <div class="discover-post-bottom"><p class="discover-artist">${escape(byline(post))}</p><h2>${escape(post.title)}</h2><p class="discover-post-description">${escape(post.description || "")}</p>
        <div class="discover-links">${discoveryLinks(post)}</div></div>
        <div class="discover-actions"><button class="discover-like" type="button" data-like-id="${escape(post.id)}" aria-label="${active ? "Unlike" : "Like"} ${escape(post.title)}" aria-pressed="${active}"><span class="heart" aria-hidden="true">${active ? "♥" : "♡"}</span><small>${active ? "Liked" : "Like"}</small></button><button class="discover-save" type="button" data-save-project="${escape(post.id)}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${escape(post.title)}"><span aria-hidden="true">${saved ? "▣" : "▢"}</span><small>${saved ? "Saved" : "Save"}</small></button><button class="discover-share" type="button" data-share-project="${escape(post.id)}" aria-label="Share ${escape(post.title)}"><span aria-hidden="true">↗</span><small>Share</small></button></div></article>`;
    }).join("");
    document.querySelector("[data-discover-empty]").hidden = filtered.length > 0;
  };
  document.querySelectorAll("[data-feed-filter]").forEach(button => button.addEventListener("click", () => {
    current = button.dataset.feedFilter;
    updateControls();
    render(current);
  }));
  document.querySelectorAll("[data-discover-view]").forEach(button => button.addEventListener("click", () => {
    view = button.dataset.discoverView;
    updateControls();
    render(current);
  }));
  const notify = message => { const region = document.querySelector("[data-discover-status]"); if (region) region.textContent = message; };
  feed.addEventListener("click", async event => {
    const saveButton = event.target.closest("[data-save-project]");
    if (saveButton) {
      const id = saveButton.dataset.saveProject;
      const saved = readSaved();
      const next = !saved.projects.includes(id);
      saved.projects = next ? [...saved.projects,id] : saved.projects.filter(item => item !== id);
      writeSaved(saved);
      saveButton.setAttribute("aria-pressed",String(next));
      saveButton.setAttribute("aria-label",(next ? "Unsave " : "Save ") + (saveButton.closest(".discover-post")?.querySelector("h2")?.textContent || "project"));
      saveButton.querySelector("span").textContent = next ? "▣" : "▢";
      saveButton.querySelector("small").textContent = next ? "Saved" : "Save";
      notify(next ? "Project saved on this device." : "Project removed from saved items.");
      return;
    }
    const shareButton = event.target.closest("[data-share-project]");
    if (shareButton) {
      const id = shareButton.dataset.shareProject;
      const title = shareButton.closest(".discover-post")?.querySelector("h2")?.textContent || "Konnekt project";
      const url = new URL("project.html?id=" + encodeURIComponent(id), location.href).href;
      if (navigator.share) {
        try { await navigator.share({title,url}); notify("Share options opened."); return; }
        catch (error) { if (error.name === "AbortError") return; }
      }
      try { await navigator.clipboard.writeText(url); notify("Project link copied."); }
      catch { notify("Copy this link: " + url); window.prompt("Copy project link",url); }
      return;
    }
  });
  feed.addEventListener("click", event => {
    const button = event.target.closest("[data-like-id]");
    if (!button) return;
    const id = button.dataset.likeId;
    liked = liked.includes(id) ? liked.filter(item => item !== id) : [...liked, id];
    try { localStorage.setItem(key, JSON.stringify(liked)); } catch {}
    const active = liked.includes(id);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", (active ? "Unlike " : "Like ") + (button.closest(".discover-post")?.querySelector("h2")?.textContent || "project"));
    button.querySelector(".heart").textContent = active ? "♥" : "♡";
    button.querySelector("small").textContent = active ? "Liked" : "Like";
  });
  updateControls();
  render(current);
})();