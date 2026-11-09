(() => {
    "use strict";

    // Existing featured artist curation remains independent from film submissions.
    const FEATURED_CREATOR_IDS = ["jaelyn-ramos"];
    const creators = Array.isArray(window.konnektCreators) ? window.konnektCreators : [];
    const featured = creators.filter(c => FEATURED_CREATOR_IDS.includes(c.id) && !c.isDemo);
    const artwork = featured.flatMap(creator =>
        (creator.featuredProjects || []).map(p => ({ ...p, creatorName: creator.name }))
    );
    const films = (window.konnektStandaloneProjects || []).filter(p =>
        p.watchListed === true && p.type === "Short Film"
    );
    // One canonical project ID; contributor portfolios reference the record, not copies.
    const allProjects = [...artwork, ...films].filter((p, index, list) =>
        list.findIndex(other => other.id === p.id) === index
    );

    const escape = value => String(value ?? "").replace(/[&<>"']/g,
        character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
    const mediaId = url => {
        try {
            const parsed = new URL(url);
            const host = parsed.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
            let id = null;
            if (host === "youtu.be") id = parsed.pathname.split("/")[1];
            if (host === "youtube.com" || host === "youtube-nocookie.com") {
                const parts = parsed.pathname.split("/").filter(Boolean);
                id = parsed.pathname === "/watch" ? parsed.searchParams.get("v") :
                    ["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : null;
            }
            return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
        } catch { return null; }
    };
    const videoEmbed = url => {
        const id = mediaId(url);
        if (id) return "https://www.youtube-nocookie.com/embed/" + id;
        try {
            const parsed = new URL(url);
            if (parsed.hostname === "vimeo.com" && /^\/\d+$/.test(parsed.pathname))
                return "https://player.vimeo.com/video" + parsed.pathname;
        } catch {}
        return null;
    };
    const card = project => {
        const label = project.type === "Short Film" ? "SHORT FILM" : "ARTWORK";
        const credit = project.submittedBy
            ? project.submittedByRole + " · " + project.submittedBy
            : (project.creatorName || "") + " · " + (project.type || project.category || "Project");
        return `<a class="watch-card" href="watch-project.html?id=${encodeURIComponent(project.id)}">
            <div class="watch-card-image">
                <img loading="lazy" src="${escape(project.thumbnail || project.image || "")}" alt="${escape(project.alt || project.title)}">
                <span class="watch-card-badge">${label}</span>
            </div>
            <div class="watch-card-info"><strong>${escape(project.title)}</strong><span>${escape(credit)}</span></div>
        </a>`;
    };
    const rail = (heading, items) => items.length ? `
        <section class="watch-row">
            <div class="watch-row-title"><h2>${escape(heading)}</h2>
            <span>${items.length} ${items.length === 1 ? "project" : "projects"}</span></div>
            <div class="watch-rail">${items.map(card).join("")}</div>
        </section>` : "";

    const hero = document.querySelector("[data-watch-hero]");
    if (hero) {
        const creator = featured[0];
        if (creator) {
            hero.style.setProperty("--watch-feature-image", 'url("assets/jaelyn-ramos/05-the-dancers.jpg")');
            const link = document.querySelector("[data-watch-feature-link]");
            if (link) { link.href = "#browse"; link.textContent = "Explore her work →"; }
            const note = document.querySelector("[data-watch-feature-note]");
            if (note) note.textContent = "FEATURED CREATOR · " + creator.name + " · " + creator.location;
            const meet = hero.querySelector(".watch-hero-actions a:nth-child(2)");
            if (meet) meet.href = "creator-profile.html?id=" + encodeURIComponent(creator.id);
            const creatorLink = document.querySelector(".watch-discovery-heading > a");
            if (creatorLink) creatorLink.href = "creator-profile.html?id=" + encodeURIComponent(creator.id);
        }
        const rows = document.querySelector("[data-watch-rows]");
        if (rows) rows.innerHTML = rail("Short Films", films) + rail("Selected Works", artwork) ||
            '<div class="watch-empty">More work is coming soon.</div>';
        const note = document.querySelector("[data-watch-filter-note]");
        if (note) note.textContent = "Selected short films and artwork, with credits for the people behind the work.";
    }

    const detail = document.querySelector("[data-watch-detail]");
    if (!detail) return;
    const id = new URLSearchParams(location.search).get("id");
    const project = allProjects.find(item => item.id === id);
    const viewer = document.querySelector("[data-watch-viewer]");
    if (!project) {
        viewer.innerHTML = '<div class="watch-empty"><h1>Project not found.</h1><a href="watch.html">Back to Watch →</a></div>';
        return;
    }
    document.title = project.title + " | Konnekt Watch";
    const creator = featured.find(c => c.id === project.creatorId);
    const embed = videoEmbed(project.videoUrl || project.watchUrl || project.embedUrl || "");
    if (embed) {
        const iframe = document.createElement("iframe");
        iframe.className = "watch-player";
        iframe.src = embed;
        iframe.title = "Watch " + project.title + " on YouTube";
        iframe.loading = "lazy";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
        viewer.replaceChildren(iframe);
    } else {
        const container = document.createElement("div");
        container.className = "watch-art-viewer";
        const image = document.createElement("img");
        image.src = project.image || project.thumbnail || "";
        image.alt = project.alt || project.title;
        container.append(image);
        viewer.replaceChildren(container);
    }

    const info = document.querySelector("[data-watch-info]");
    info.innerHTML = `
        <p class="watch-eyebrow">${escape(project.type || project.category)} · KONNEKT WATCH</p>
        <h1>${escape(project.title)}</h1>
        <p>${escape(project.description || "")}</p>
        ${project.submittedBy ? `<p class="watch-submission-credit">Submitted by ${escape(project.submittedBy)} · ${escape(project.submittedByRole || "Contributor")}. Copyright owner not confirmed.</p>` : ""}
        <div class="watch-links">
            <a class="watch-pill watch-pill-primary" href="project.html?id=${encodeURIComponent(project.id)}">View full project →</a>
            ${creator ? `<a class="watch-pill" href="creator-profile.html?id=${encodeURIComponent(creator.id)}">Meet the artist →</a>` : ""}
            ${project.videoUrl && mediaId(project.videoUrl) ? `<a class="watch-pill" href="${escape(project.videoUrl)}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>` : ""}
        </div>`;

    const credits = document.querySelector("[data-watch-credits]");
    const normalized = (project.credits || []).map(credit => {
        if (typeof credit === "string") return { display: credit, role: "", name: "" };
        return { display: (credit.name || "") + " — " + (credit.role || ""),
            role: credit.role || "", name: credit.name || "" };
    });
    if (project.submittedBy) {
        const cast = normalized.filter(credit => credit.role.startsWith("Cast — "));
        const crew = normalized.filter(credit => !credit.role.startsWith("Cast — "));
        const list = entries => `<ul>${entries.map(c => `<li>${escape(c.display)}</li>`).join("")}</ul>`;
        credits.innerHTML = "<h2>Cast</h2>" + list(cast) + "<h2>Crew</h2>" + list(crew) +
            '<p class="watch-credits-note">Credits supplied with submission; not independently verified.</p>';
    } else {
        credits.innerHTML = `<h2>Artist</h2>
            <a href="creator-profile.html?id=${encodeURIComponent(project.creatorId)}">${escape(creator?.name || project.creatorName)}</a>
            <h2>Credits</h2><ul>${normalized.map(c => `<li>${escape(c.display)}</li>`).join("") || "<li>Credits pending</li>"}</ul>`;
    }
    const related = allProjects.filter(item => item.creatorId && item.creatorId === project.creatorId && item.id !== project.id);
    const more = document.querySelector("[data-watch-more]");
    if (more) more.innerHTML = project.creatorId ? rail("More from " + (project.creatorName || creator?.name || "this artist"), related) : "";
})();
