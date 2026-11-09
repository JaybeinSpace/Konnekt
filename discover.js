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
    const preview = previewConfig(post);
    return (preview
      ? `<button type="button" class="discover-preview-trigger" data-preview-video="${escape(post.id)}" aria-label="Play 30-second preview of ${escape(post.title)}">▶ Preview 30s</button>`
      : "") + `<a href="${projectUrl}">View project ↗</a>` +
      (creatorUrl ? `<a href="${creatorUrl}">Meet the creator ↗</a>`
        : post.videoUrl ? `<a href="watch-project.html?id=${encodeURIComponent(post.id)}">Watch film ↗</a>` : "");
  };
  // Preview segments reference only the original YouTube player, never media files.
  // A future backend can store the approved start/duration on the project record.
  const previewConfig = post => {
    if (post.previewEnabled === false) return null;
    let id = typeof post.youtubeId === "string" && /^[A-Za-z0-9_-]{11}$/.test(post.youtubeId)
      ? post.youtubeId : null;
    if (!id && typeof post.videoUrl === "string") {
      try {
        const url = new URL(post.videoUrl);
        const host = url.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
        if (host === "youtu.be") id = url.pathname.split("/")[1];
        else if (host === "youtube.com" || host === "youtube-nocookie.com") {
          const parts = url.pathname.split("/").filter(Boolean);
          id = url.pathname === "/watch" ? url.searchParams.get("v")
            : ["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : null;
        }
      } catch { return null; }
    }
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    const start = Number.isInteger(post.previewStartSeconds) &&
      post.previewStartSeconds >= 0 ? post.previewStartSeconds : 0;
    const duration = Number.isInteger(post.previewDurationSeconds) &&
      post.previewDurationSeconds > 0 && post.previewDurationSeconds <= 30
        ? post.previewDurationSeconds : 30;
    return { id, start, end: start + duration };
  };


  // One muted, inline 30-second preview can run while a film card is in view.
  // It starts only on the first substantial appearance during this visit.
  // We remove the iframe when scrolling away rather than playing offscreen.
  const autoPlayed = new Set();
  let autoObserver = null;
  let activeAutoArticle = null;
  let autoStopTimer = null;
  const allowAutoPreview = () => !(
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    navigator.connection?.saveData
  );
  const stopAutoPreview = () => {
    if (autoStopTimer !== null) {
      window.clearTimeout(autoStopTimer);
      autoStopTimer = null;
    }
    if (!activeAutoArticle) return;
    activeAutoArticle.querySelector(".discover-auto-preview-player")?.remove();
    activeAutoArticle.classList.remove("is-auto-previewing");
    activeAutoArticle = null;
  };
  const sizeAutoPreview = () => {
    if (!activeAutoArticle) return;
    const media = activeAutoArticle.querySelector(".discover-post-media");
    const frame = media?.querySelector(".discover-auto-preview-player");
    if (!frame) return;
    // Fill tall feed cards like a cinematic cover, cropping the video's sides.
    const rect = media.getBoundingClientRect();
    const width = Math.ceil(Math.max(rect.width, rect.height * 16 / 9));
    frame.style.width = width + "px";
    frame.style.height = Math.ceil(width * 9 / 16) + "px";
  };
  const startAutoPreview = article => {
    if (view !== "feed" || document.hidden || !allowAutoPreview() ||
        previewDialog?.open || activeAutoArticle) return;
    const post = posts.find(item => item.id === article.dataset.postId);
    const config = post && previewConfig(post);
    if (!config || autoPlayed.has(post.id)) return;
    const media = article.querySelector(".discover-post-media");
    if (!media) return;
    const frame = document.createElement("iframe");
    frame.className = "discover-auto-preview-player";
    frame.title = "Muted 30-second preview of " + post.title;
    frame.loading = "eager";
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    frame.allow = "autoplay; encrypted-media; picture-in-picture";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.src = "https://www.youtube-nocookie.com/embed/" + config.id +
      "?start=" + config.start + "&end=" + config.end +
      "&autoplay=1&mute=1&playsinline=1&controls=0&fs=0";
    media.append(frame);
    activeAutoArticle = article;
    autoPlayed.add(post.id);
    article.classList.add("is-auto-previewing");
    sizeAutoPreview();
    // The YouTube end parameter limits content to 30 seconds; this also
    // clears the embed at the end to avoid showing unrelated recommendations.
    autoStopTimer = window.setTimeout(stopAutoPreview, 33000);
  };
  const observeAutoPreviews = () => {
    autoObserver?.disconnect();
    autoObserver = null;
    if (view !== "feed" || !("IntersectionObserver" in window) || !allowAutoPreview()) return;
    autoObserver = new IntersectionObserver(entries => {
      if (document.hidden || previewDialog?.open) return;
      if (activeAutoArticle && entries.some(entry =>
          entry.target === activeAutoArticle && entry.intersectionRatio < 0.45)) {
        stopAutoPreview();
      }
      if (activeAutoArticle) return;
      const first = entries
        .filter(entry => entry.isIntersecting && entry.intersectionRatio >= 0.6 &&
          !autoPlayed.has(entry.target.dataset.postId))
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (first) startAutoPreview(first.target);
    }, { threshold: [0, 0.45, 0.6, 0.85] });
    feed.querySelectorAll(".discover-post").forEach(article => {
      const post = posts.find(item => item.id === article.dataset.postId);
      if (post && previewConfig(post)) autoObserver.observe(article);
    });
  };
  window.addEventListener("resize", sizeAutoPreview);
  window.addEventListener("pagehide", stopAutoPreview);
  const previewDialog = document.querySelector("[data-discover-preview]");
  const previewPlayer = previewDialog?.querySelector("[data-preview-player]");
  let previewTrigger = null;
  const stopPreview = () => {
    if (!previewDialog) return;
    if (previewDialog.open) previewDialog.close();
    previewPlayer?.replaceChildren(); // Unloads YouTube iframe: audio/video stop.
    if (previewTrigger?.isConnected) previewTrigger.focus();
    previewTrigger = null;
  };
  const openPreview = (post, trigger) => {
    const config = previewConfig(post);
    if (!previewDialog || !previewPlayer || !config) return;
    stopAutoPreview();
    stopPreview();
    previewTrigger = trigger;
    previewDialog.querySelector("[data-preview-title]").textContent = post.title + " · 30-second preview";
    previewDialog.querySelector("[data-preview-full]").href =
      "https://www.youtube.com/watch?v=" + encodeURIComponent(config.id);
    previewDialog.querySelector("[data-preview-project]").href = artworkLink(post);
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + config.id +
      "?start=" + config.start + "&end=" + config.end +
      "&autoplay=1&playsinline=1&controls=1";
    iframe.title = "30-second YouTube preview of " + post.title;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    previewPlayer.replaceChildren(iframe);
    previewDialog.showModal();
    previewDialog.querySelector("[data-preview-close]").focus();
  };
  previewDialog?.querySelector("[data-preview-close]")?.addEventListener("click", stopPreview);
  previewDialog?.addEventListener("close", () => {
    previewPlayer?.replaceChildren();
    if (previewTrigger?.isConnected) previewTrigger.focus();
    previewTrigger = null;
  });
  previewDialog?.addEventListener("click", event => {
    if (event.target === previewDialog) stopPreview();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoPreview();
      stopPreview();
    }
  });
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
    autoObserver?.disconnect();
    stopAutoPreview();
    stopPreview();
    const filtered = posts.filter(post => filter === "all" || (filter === "motion" ? isMotion(post) : !isMotion(post)));
    feed.innerHTML = filtered.map(post => {
      const active = liked.includes(post.id);
      const saved = readSaved().projects.includes(post.id);
      const category = isMotion(post) ? "FILM & MOTION" : "ART & PHOTOGRAPHY";
      const label = isDemo(post) ? "DEMO · " + category : category;
      return `<article class="discover-post" data-post-id="${escape(post.id)}" data-demo="${isDemo(post)}">
        <div class="discover-post-media"><img loading="lazy" src="${escape(post.image || post.thumbnail)}" alt="${escape(post.alt || post.title)}"><span class="discover-auto-preview-label" aria-hidden="true">▶ MUTED · 30 SEC PREVIEW</span></div>
        <div class="discover-post-top"><span class="discover-type">${label}</span><span class="discover-type">KONNEKT DISCOVER</span></div>
        <div class="discover-post-bottom"><p class="discover-artist">${escape(byline(post))}</p><h2>${escape(post.title)}</h2><p class="discover-post-description">${escape(post.description || "")}</p>
        <div class="discover-links">${discoveryLinks(post)}</div></div>
        <div class="discover-actions"><button class="discover-like" type="button" data-like-id="${escape(post.id)}" aria-label="${active ? "Unlike" : "Like"} ${escape(post.title)}" aria-pressed="${active}"><span class="heart" aria-hidden="true">${active ? "♥" : "♡"}</span><small>${active ? "Liked" : "Like"}</small></button><button class="discover-save" type="button" data-save-project="${escape(post.id)}" aria-pressed="${saved}" aria-label="${saved ? "Unsave" : "Save"} ${escape(post.title)}"><span aria-hidden="true">${saved ? "▣" : "▢"}</span><small>${saved ? "Saved" : "Save"}</small></button><button class="discover-share" type="button" data-share-project="${escape(post.id)}" aria-label="Share ${escape(post.title)}"><span aria-hidden="true">↗</span><small>Share</small></button></div></article>`;
    }).join("");
    document.querySelector("[data-discover-empty]").hidden = filtered.length > 0;
    observeAutoPreviews();
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
  feed.addEventListener("click", event => {
    const button = event.target.closest("[data-preview-video]");
    if (!button) return;
    const post = posts.find(item => item.id === button.dataset.previewVideo);
    if (post) openPreview(post, button);
  });
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