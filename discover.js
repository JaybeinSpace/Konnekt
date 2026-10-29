(() => {
  "use strict";
  const feed = document.querySelector("[data-discover-feed]");
  if (!feed) return;
  const creators = Array.isArray(window.konnektCreators) ? window.konnektCreators : [];
  const posts = creators.flatMap(creator => (creator.featuredProjects || []).filter(project => project && project.id && (project.image || project.thumbnail)).map(project => ({...project, creator})));
  // The real featured artist is first; fictional demonstration content is clearly labeled.
  posts.sort((a,b) => Number(!!a.creator.isDemo) - Number(!!b.creator.isDemo));
  const key = "konnekt-discover-likes-v1";
  let liked = [];
  try { const stored = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(stored)) liked = stored.filter(id => typeof id === "string"); } catch {}
  const escape = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const classification = post => [post.type,post.category,...(post.tags || [])].join(" ").toLowerCase();
  const isMotion = post => /film|video|animation|documentary|cinema|motion/.test(classification(post));
  const isDemo = post => !!post.creator.isDemo || (post.creator.badges || []).includes("Demo Profile");
  const artworkLink = post => "project.html?id=" + encodeURIComponent(post.id);
  const profileLink = post => "creator-profile.html?id=" + encodeURIComponent(post.creator.id);
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
      const category = isMotion(post) ? "FILM & MOTION" : "ART & PHOTOGRAPHY";
      const label = isDemo(post) ? "DEMO · " + category : category;
      return `<article class="discover-post" data-post-id="${escape(post.id)}" data-demo="${isDemo(post)}">
        <div class="discover-post-media"><img loading="lazy" src="${escape(post.image || post.thumbnail)}" alt="${escape(post.alt || post.title)}"></div>
        <div class="discover-post-top"><span class="discover-type">${label}</span><span class="discover-type">KONNEKT DISCOVER</span></div>
        <div class="discover-post-bottom"><p class="discover-artist">${escape(post.creator.name)} · ${escape(post.creator.location || "")}</p><h2>${escape(post.title)}</h2><p class="discover-post-description">${escape(post.description || "")}</p>
        <div class="discover-links"><a href="${artworkLink(post)}">View project ↗</a><a href="${profileLink(post)}">Meet the creator ↗</a></div></div>
        <div class="discover-actions"><button class="discover-like" type="button" data-like-id="${escape(post.id)}" aria-label="${active ? "Unlike" : "Like"} ${escape(post.title)}" aria-pressed="${active}"><span class="heart" aria-hidden="true">${active ? "♥" : "♡"}</span><small>${active ? "Liked" : "Like"}</small></button></div></article>`;
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