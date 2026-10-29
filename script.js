const creators = Array.isArray(window.konnektCreators) ? window.konnektCreators : [];

// Projects live inside each creator in data.js. This creates one flat list for project pages.
const projects = creators.flatMap((creator) => {
    return (creator.featuredProjects || []).map((project) => {
        return {
            ...project,
            creatorName: creator.name,
            creatorRole: creator.role,
            creatorLocation: creator.location
        };
    });
});

const savedStorageKey = "konnektSavedItems";

const getSavedItems = () => {
    const fallback = {
        creators: [],
        projects: []
    };

    try {
        const savedItems = JSON.parse(localStorage.getItem(savedStorageKey));

        return {
            creators: Array.isArray(savedItems?.creators) ? savedItems.creators : [],
            projects: Array.isArray(savedItems?.projects) ? savedItems.projects : []
        };
    } catch (error) {
        return fallback;
    }
};

const setSavedItems = (savedItems) => {
    try {
        localStorage.setItem(savedStorageKey, JSON.stringify(savedItems));
    } catch (error) {
        console.warn("Saved items could not be stored in this browser.");
    }
};

const getSavedListName = (saveType) => {
    return saveType === "project" ? "projects" : "creators";
};

const isItemSaved = (saveType, saveId) => {
    const savedItems = getSavedItems();
    const savedList = savedItems[getSavedListName(saveType)];

    return savedList.includes(saveId);
};

const getSaveButtonText = (saveType, isSaved) => {
    const saveLabel = saveType === "project" ? "Project" : "Creator";

    return isSaved ? `${saveLabel} Saved` : `Save ${saveLabel}`;
};

const getSavedButtonClass = (saveType, saveId) => {
    return isItemSaved(saveType, saveId) ? " is-saved" : "";
};

// Mobile navigation menu.
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");

        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target.tagName === "A") {
            navLinks.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open menu");
        }
    });
}

const getCreatorSearchText = (creator) => {
    return [
        creator.name,
        creator.role,
        creator.category,
        ...(creator.categories || []),
        ...(creator.specialties || []),
        creator.location,
        creator.shortDescription,
        (creator.tags || []).join(" ")
    ].join(" ").toLowerCase();
};

const getRecentActivityScore = (recentActivity) => {
    if (!recentActivity) {
        return 0;
    }

    const activityTime = new Date(recentActivity).getTime();

    if (Number.isNaN(activityTime)) {
        return 0;
    }

    const activityTimes = creators
        .map((creator) => new Date(creator.discovery?.recentActivity || 0).getTime())
        .filter((time) => !Number.isNaN(time));
    const newestActivityTime = Math.max(...activityTimes);

    if (!Number.isFinite(newestActivityTime) || newestActivityTime === 0) {
        return 0;
    }

    const daysBehindNewest = (newestActivityTime - activityTime) / (1000 * 60 * 60 * 24);

    return Math.max(0, 10 - daysBehindNewest);
};

// Explore ordering is data-driven. Future creators can move up by changing discovery fields in data.js.
const getExploreScore = (creator) => {
    const discovery = creator.discovery || {};
    let score = 0;

    if (discovery.featured) {
        score += 100;
    }

    if (discovery.konnektSelects) {
        score += 20;
    }

    score += discovery.rolePriority || 0;
    score += discovery.categoryPriority || 0;
    score += discovery.locationPriority || 0;
    score += getRecentActivityScore(discovery.recentActivity);

    return score;
};

const getOrderedExploreCreators = () => {
    return creators
        .map((creator, index) => ({ creator, index }))
        .sort((first, second) => {
            if (!!first.creator.isDemo !== !!second.creator.isDemo) return first.creator.isDemo ? 1 : -1;
            const scoreDifference = getExploreScore(second.creator) - getExploreScore(first.creator);

            if (scoreDifference !== 0) {
                return scoreDifference;
            }

            return first.index - second.index;
        })
        .map((item) => item.creator);
};

// Homepage featured creators are generated from the first three creator objects in data.js.
const matchesHomepageDiscipline = (creator, discipline) => {
    if (discipline === "all") return true;
    const specialties = (creator.specialties || []).map((item) => item.toLowerCase());
    const categories = typeof window.getCreatorCategories === "function"
        ? window.getCreatorCategories(creator)
        : (creator.categories || []);
    const searchable = [creator.role, creator.category, ...(creator.tags || [])]
        .filter(Boolean).join(" ").toLowerCase();
    if (["painting", "printmaking", "drawing"].includes(discipline)) {
        return specialties.some((item) => item.includes(discipline)) || searchable.includes(discipline);
    }
    if (discipline === "photography") return categories.includes("photography") || specialties.includes("photography") || creator.category === "photographer" || searchable.includes("photograph");
    if (discipline === "filmmaking") return categories.includes("film-video") || creator.category === "filmmaker" || searchable.includes("film") || searchable.includes("cinematograph");
    if (discipline === "design") return categories.includes("design") || specialties.some((item) => item.includes("design")) || searchable.includes("design");
    return false;
};

const renderHomepageCreators = (discipline = "all") => {
    const featuredGrid = document.querySelector("[data-featured-creators]");

    if (!featuredGrid || creators.length === 0) {
        return;
    }

    const matches = creators.filter((creator) => matchesHomepageDiscipline(creator, discipline));
    const status = document.querySelector("[data-home-filter-status]");
    if (status) status.textContent = discipline === "all"
        ? "Discover creators across different disciplines."
        : matches.length ? `Showing ${matches.length} creator${matches.length === 1 ? "" : "s"} in ${discipline}.`
            : `No ${discipline} creators featured yet. Explore all creators or check back soon.`;
    featuredGrid.innerHTML = matches.length ? matches.map((creator) => `
        <article class="creator-card">
            <img src="${creator.bannerImage}" alt="${creator.bannerAlt}">
            <div class="creator-info">
                <p class="creator-role">${creator.role}</p>
                <h3>${creator.name}</h3>
                <p class="creator-location">${creator.location}</p>
                <p>${creator.shortDescription}</p>
                <div class="card-actions">
                    <a class="profile-link" href="creator-profile.html?id=${creator.id}">View Profile</a>
                    <button class="profile-link save-button${getSavedButtonClass("creator", creator.id)}" type="button" data-save-type="creator" data-save-id="${creator.id}">${getSaveButtonText("creator", isItemSaved("creator", creator.id))}</button>
                </div>
            </div>
        </article>
    `).join("") : `<div class="home-empty-state"><p>No creators in this category yet.</p><a class="button secondary-button" href="explore.html">Explore all creators</a></div>`;
};

const setupHomepageFilters = () => {
    document.querySelectorAll("[data-home-filter]").forEach((button) => {
        button.addEventListener("click", () => {
            const discipline = button.dataset.homeFilter;
            document.querySelectorAll("[data-home-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
            const gallery = document.querySelector("[data-featured-creators]");
            gallery?.classList.remove("home-gallery-swap");
            renderHomepageCreators(discipline);
            requestAnimationFrame(() => gallery?.classList.add("home-gallery-swap"));
        });
    });
};

// Konnekt Selects are fake recognition picks pulled from creator/project data.
const renderKonnektSelects = () => {
    const selectsGrid = document.querySelector("[data-konnekt-selects]");
    if (!selectsGrid) return;
    // Only verified real creators are eligible for this editorial spotlight.
    const creator = creators.find((item) => item.id === "jaelyn-ramos" && !item.isDemo);
    if (!creator) {
        selectsGrid.innerHTML = '<p class="home-empty-state">Our next creator spotlight is coming soon.</p>';
        return;
    }
    const artwork = (creator.featuredProjects || []).find((project) => project.id === "the-dancers")
        || (creator.featuredProjects || [])[0];
    selectsGrid.innerHTML = `
        <article class="watch-feature">
            <a class="watch-image" href="gallery.html">
                <img src="${artwork?.thumbnail || creator.bannerImage}" alt="${artwork?.alt || creator.bannerAlt}">
            </a>
            <div class="watch-copy">
                <span class="watch-kicker">KONNEKT WATCH · OCTOBER 2026</span>
                <h3>${creator.name}</h3>
                <p class="watch-role">${creator.role} · ${creator.location}</p>
                <p class="watch-specialties">${(creator.specialties || []).join(" · ")}</p>
                <p>Discover the artwork and creative perspective of this month's featured artist.</p>
                <a class="button primary-button" href="gallery.html">Explore ${creator.name}'s Work →</a>
            </div>
        </article>`;
};

// Explore cards are generated from data.js instead of repeated hardcoded HTML.
const renderExploreCards = () => {
    const exploreGrid = document.querySelector("[data-explore-grid]");
    const emptyState = document.querySelector("[data-empty-state]");

    if (!exploreGrid) {
        return;
    }

    if (creators.length === 0) {
        exploreGrid.innerHTML = "";

        if (emptyState) {
            emptyState.innerHTML = `
                <p class="eyebrow">Data unavailable</p>
                <h2>Creator data could not load.</h2>
                <p>Check that data.js is uploaded beside explore.html and is loaded before script.js.</p>
            `;
            emptyState.classList.add("is-visible");
        }

        return;
    }

    if (emptyState) {
        emptyState.classList.remove("is-visible");
    }

    exploreGrid.innerHTML = getOrderedExploreCreators().map((creator) => `
        <article class="explore-card" data-creator-id="${creator.id}" data-category="${(window.getCreatorCategories?.(creator) || [creator.category]).join(" ")}" data-search="${getCreatorSearchText(creator)}">
            <img src="${creator.profileImage}" alt="${creator.profileAlt}">
            <div class="explore-card-body">
                <p class="creator-role">${creator.role}${creator.isDemo ? " · Demo Profile" : ""}</p>
                <h2>${creator.name}</h2>
                <p class="creator-location">${creator.location}</p>
                <p>${creator.shortDescription}</p>
                <div class="card-actions">
                    <a class="profile-link" href="creator-profile.html?id=${creator.id}">View Profile</a>
                    <button class="profile-link save-button${getSavedButtonClass("creator", creator.id)}" type="button" data-save-type="creator" data-save-id="${creator.id}">${getSaveButtonText("creator", isItemSaved("creator", creator.id))}</button>
                </div>
            </div>
        </article>
    `).join("");
};

const renderCreatorPreviewCards = (creatorList) => {
    return creatorList.map((creator) => `
        <article class="explore-card" data-creator-id="${creator.id}" data-category="${(window.getCreatorCategories?.(creator) || [creator.category]).join(" ")}" data-search="${getCreatorSearchText(creator)}">
            <img src="${creator.profileImage}" alt="${creator.profileAlt}">
            <div class="explore-card-body">
                <p class="creator-role">${creator.role}</p>
                <h2>${creator.name}</h2>
                <p class="creator-location">${creator.location}</p>
                <p>${creator.shortDescription}</p>
                <div class="card-actions">
                    <a class="profile-link" href="creator-profile.html?id=${creator.id}">View Profile</a>
                    <button class="profile-link save-button is-saved" type="button" data-save-type="creator" data-save-id="${creator.id}">Creator Saved</button>
                </div>
            </div>
        </article>
    `).join("");
};

const renderSavedItems = () => {
    const savedCreatorsGrid = document.querySelector("[data-saved-creators]");
    const savedProjectsGrid = document.querySelector("[data-saved-projects]");

    const savedItems = getSavedItems();
    const savedCreatorItems = creators.filter((creator) => savedItems.creators.includes(creator.id));
    const savedProjectItems = projects.filter((project) => savedItems.projects.includes(project.id));
    const savedCreatorsEmpty = document.querySelector("[data-saved-creators-empty]");
    const savedProjectsEmpty = document.querySelector("[data-saved-projects-empty]");

    if (savedCreatorsGrid) {
        savedCreatorsGrid.innerHTML = renderCreatorPreviewCards(savedCreatorItems);
    }

    if (savedProjectsGrid) {
        savedProjectsGrid.innerHTML = renderProjects(savedProjectItems);
    }

    if (savedCreatorsEmpty) {
        savedCreatorsEmpty.classList.toggle("is-visible", savedCreatorItems.length === 0);
    }

    if (savedProjectsEmpty) {
        savedProjectsEmpty.classList.toggle("is-visible", savedProjectItems.length === 0);
    }
};

// Search and role filters work on the generated Explore cards.
const setupExploreFilters = () => {
    const buttons = [...document.querySelectorAll(".filter-button")];
    const cards = [...document.querySelectorAll("[data-explore-grid] .explore-card")];
    const search = document.querySelector(".creator-search");
    const specialty = document.querySelector("#specialty-filter");
    const location = document.querySelector("#location-filter");
    const availability = document.querySelector("#availability-filter");
    const clear = document.querySelector("#clear-discovery");
    const empty = document.querySelector("[data-empty-state]");
    const count = document.querySelector("[data-result-count]");
    if (!cards.length) return;
    let category = "all";
    const getCategories = creator => window.getCreatorCategories?.(creator) || [creator.category];
    const updateSpecialties = () => {
        if (!specialty) return;
        const previous = specialty.value;
        const relevant = creators.filter(creator => category === "all" || getCategories(creator).includes(category));
        const options = [...new Set(relevant.flatMap(creator => creator.specialties || []))].sort();
        specialty.replaceChildren(new Option("All specialties", ""), ...options.map(item => new Option(item, item)));
        specialty.value = options.includes(previous) ? previous : "";
    };
    const update = () => {
        const query = (search?.value || "").trim().toLowerCase();
        const place = (location?.value || "").trim().toLowerCase();
        const niche = specialty?.value || "";
        const status = availability?.value || "";
        let visible = 0;
        cards.forEach(card => {
            const creator = creators.find(item => item.id === card.dataset.creatorId);
            if (!creator) return;
            const categories = getCategories(creator);
            const specialties = creator.specialties || [];
            const availableFor = creator.availableFor || [];
            const match = (category === "all" || categories.includes(category))
                && (!query || getCreatorSearchText(creator).includes(query))
                && (!place || (creator.location || "").toLowerCase().includes(place))
                && (!niche || specialties.includes(niche))
                && (!status || availableFor.includes(status));
            card.classList.toggle("is-hidden", !match);
            if (match) visible++;
        });
        if (empty) empty.classList.toggle("is-visible", visible === 0);
        if (count) count.textContent = `${visible} creator${visible === 1 ? "" : "s"} showing`;
    };
    buttons.forEach(button => button.addEventListener("click", () => {
        category = button.dataset.filter;
        buttons.forEach(item => item.classList.toggle("is-active", item === button));
        updateSpecialties();
        update();
    }));
    [search, specialty, location, availability].forEach(element => element?.addEventListener("input", update));
    clear?.addEventListener("click", () => {
        category = "all";
        buttons.forEach(item => item.classList.toggle("is-active", item.dataset.filter === "all"));
        if (search) search.value = "";
        if (location) location.value = "";
        if (availability) availability.value = "";
        updateSpecialties();
        update();
    });
    updateSpecialties();
    update();
};

const getCreatorFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const creatorId = params.get("id") || creators[0]?.id;

    return creators.find((creator) => creator.id === creatorId);
};

const getProjectFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id") || projects[0]?.id;

    return projects.find((project) => project.id === projectId);
};

const getCreatorById = (creatorId) => {
    return creators.find((creator) => creator.id === creatorId);
};

const renderStats = (creator) => {
    return `
        <div>
            <strong>${creator.stats.projects}</strong>
            <span>Projects</span>
        </div>
        <div>
            <strong>${creator.stats.views}</strong>
            <span>Monthly views</span>
        </div>
        <div>
            <strong>${creator.stats.badges}</strong>
            <span>Selects badges</span>
        </div>
    `;
};

const renderBadges = (badges) => {
    return badges.map((badge) => `<span>${badge}</span>`).join("");
};

const renderSocialLinks = (links) => {
    return links.map((link) => `
        <a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>
    `).join("");
};

const renderProjects = (projects) => {
    return projects.map((project) => `
        <article class="project-card">
            <a href="project.html?id=${project.id}" aria-label="View ${project.title} project">
                <img src="${project.thumbnail || project.image}" alt="${project.alt}">
            </a>
            <div>
                <p class="creator-role">${project.category || project.type}</p>
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="card-actions">
                    <a class="profile-link" href="project.html?id=${project.id}">View Project</a>
                    <button class="profile-link save-button${getSavedButtonClass("project", project.id)}" type="button" data-save-type="project" data-save-id="${project.id}">${getSaveButtonText("project", isItemSaved("project", project.id))}</button>
                </div>
            </div>
        </article>
    `).join("");
};

const renderGallery = (gallery) => {
    return gallery.map((item, index) => `
        <img class="lightbox-image ${index === 0 ? "gallery-feature" : ""}" src="${item.src}" alt="${item.alt}">
    `).join("");
};

const renderVideos = (videos) => {
    return videos.map((video) => `
        <article class="video-card">
            <div class="video-frame">
                <img src="${video.image}" alt="${video.alt}">
                <span>Play</span>
            </div>
            <div>
                <p class="creator-role">${video.type}</p>
                <h3>${video.title}</h3>
                <p>${video.description}</p>
            </div>
        </article>
    `).join("");
};

const renderDetailItems = (items) => {
    return items.map((item) => `<span>${item}</span>`).join("");
};

const renderProjectMedia = (media) => {
    return media.map((item, index) => `
        <img class="lightbox-image ${index === 0 ? "gallery-feature" : ""}" src="${item.src}" alt="${item.alt}">
    `).join("");
};

// The profile page reads ?id=creator-id and fills the template from data.js.
// Credits remain attached to their original project; no duplicate project records.
const normalizeCredits = (project) => (project.credits || []).map((credit) => {
    if (typeof credit === "string") {
        const separator = credit.indexOf(":");
        const role = separator >= 0 ? credit.slice(0, separator).trim() : "";
        const name = separator >= 0 ? credit.slice(separator + 1).trim() : credit.trim();
        return { name, role };
    }
    return credit && typeof credit === "object" ? credit : null;
}).filter(credit => credit?.name && credit?.role);
const creditUrl = (credit, project) => {
    if (!credit.creatorId && project?.creatorId && credit.name.toLowerCase() === (getCreatorById(project.creatorId)?.name || "").toLowerCase()) return "creator-profile.html?id=" + encodeURIComponent(project.creatorId);
    if (credit.creatorId && creators.some(creator => creator.id === credit.creatorId)) {
        return "creator-profile.html?id=" + encodeURIComponent(credit.creatorId);
    }
    if (credit.url) {
        try {
            const parsed = new URL(credit.url);
            if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.href;
        } catch (error) { /* invalid external credit URL */ }
    }
    return "";
};
const renderCreditList = (project, expanded = false) => {
    const all = normalizeCredits(project);
    const list = expanded ? all : all.slice(0, 5);
    const container = document.querySelector("[data-project-credits]");
    if (!container) return;
    container.replaceChildren();
    if (!all.length) {
        const empty = document.createElement("p");
        empty.textContent = "Credits have not been added for this project.";
        container.append(empty);
        return;
    }
    list.forEach(credit => {
        const row = document.createElement("div");
        row.className = "credit-entry";
        const role = document.createElement("span");
        role.className = "credit-role";
        role.textContent = credit.role;
        const url = creditUrl(credit, project);
        const name = document.createElement(url ? "a" : "span");
        name.textContent = credit.name;
        if (url) {
            name.href = url;
            if (/^https?:/.test(url)) { name.target = "_blank"; name.rel = "noopener noreferrer"; }
        }
        row.append(role, name);
        container.append(row);
    });
};
const renderFeaturedIn = (creator) => {
    const section = document.querySelector("[data-featured-in-section]");
    const grid = document.querySelector("[data-featured-in-projects]");
    if (!section || !grid) return;
    const matches = projects.filter(project => project.creatorId !== creator.id &&
        normalizeCredits(project).some(credit => credit.creatorId === creator.id && credit.approved === true));
    section.hidden = matches.length === 0;
    grid.replaceChildren();
    matches.forEach(project => {
        const roles = normalizeCredits(project).filter(credit => credit.creatorId === creator.id && credit.approved === true).map(credit => credit.role).join(" · ");
        const card = document.createElement("article");
        card.className = "project-card";
        const link = document.createElement("a");
        link.href = "project.html?id=" + encodeURIComponent(project.id);
        const image = document.createElement("img");
        image.src = project.thumbnail || project.image || "";
        image.alt = project.alt || project.title;
        const title = document.createElement("h3");
        title.textContent = project.title;
        const role = document.createElement("p");
        role.textContent = roles;
        link.append(image, title);
        card.append(link, role);
        grid.append(card);
    });
};
const setupProjectDiscovery = () => {
    const grid = document.querySelector("[data-discovery-projects]");
    const creatorGrid = document.querySelector("[data-explore-grid]");
    if (!grid || !creatorGrid) return;
    const search = document.querySelector(".creator-search");
    const location = document.querySelector("#location-filter");
    const specialty = document.querySelector("#specialty-filter");
    const availability = document.querySelector("#availability-filter");
    const categoryButtons = [...document.querySelectorAll(".filter-button[data-filter]")];
    const buttons = [...document.querySelectorAll("[data-discovery-view]")];
    const empty = document.querySelector("[data-empty-state]");
    const count = document.querySelector("[data-result-count]");
    const realProjects = projects.filter(project => !getCreatorById(project.creatorId)?.isDemo);
    const demoProjects = projects.filter(project => getCreatorById(project.creatorId)?.isDemo);
    const sorted = [...realProjects, ...demoProjects];
    const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
    let view = "creators";
    const update = () => {
        const isProjects = view === "projects";
        creatorGrid.hidden = isProjects;
        grid.hidden = !isProjects;
        buttons.forEach(button => {
            const active = button.dataset.discoveryView === view;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        if (!isProjects) {
            const visible = creatorGrid.querySelectorAll(".explore-card:not(.is-hidden)").length;
            if (count) count.textContent = visible + " creator" + (visible === 1 ? "" : "s") + " showing";
            if (empty) empty.classList.toggle("is-visible", visible === 0);
            return;
        }
        const q = (search?.value || "").trim().toLowerCase();
        const place = (location?.value || "").trim().toLowerCase();
        const niche = (specialty?.value || "").toLowerCase();
        const status = availability?.value || "";
        const category = categoryButtons.find(button => button.classList.contains("is-active"))?.dataset.filter || "all";
        const matches = sorted.filter(project => {
            const creator = getCreatorById(project.creatorId);
            const text = [project.title,project.category,project.type,project.description,project.tags?.join(" "),project.credits?.map(credit => typeof credit === "string" ? credit : [credit.name,credit.role].join(" ")).join(" "),creator?.name,creator?.role,creator?.location,creator?.specialties?.join(" ")].join(" ").toLowerCase();
            const categories = window.getCreatorCategories?.(creator) || [creator?.category];
            return (!q || text.includes(q)) && (!place || (creator?.location || "").toLowerCase().includes(place)) &&
                (!niche || text.includes(niche)) && (!status || (creator?.availableFor || []).includes(status)) &&
                (category === "all" || categories.includes(category));
        });
        grid.innerHTML = matches.map(project => `<article class="explore-card discovery-work-card"><a href="project.html?id=${encodeURIComponent(project.id)}"><img loading="lazy" src="${escape(project.thumbnail || project.image || "")}" alt="${escape(project.alt || project.title)}"></a><div class="explore-card-body"><p class="creator-role">${escape(project.type || project.category)}${getCreatorById(project.creatorId)?.isDemo ? " · Demo" : ""}</p><h2>${escape(project.title)}</h2><p>${escape(project.creatorName)}</p><a class="profile-link" href="project.html?id=${encodeURIComponent(project.id)}">Explore Work →</a></div></article>`).join("");
        if (count) count.textContent = matches.length + " project" + (matches.length === 1 ? "" : "s") + " showing";
        if (empty) empty.classList.toggle("is-visible", matches.length === 0);
    };
    buttons.forEach(button => button.addEventListener("click", () => { view = button.dataset.discoveryView; update(); }));
    [search, location, specialty, availability].forEach(input => input?.addEventListener("input", () => setTimeout(update, 0)));
    categoryButtons.forEach(button => button.addEventListener("click", () => setTimeout(update, 0)));
    document.querySelector("#clear-discovery")?.addEventListener("click", () => setTimeout(update, 0));
    update();
};
const renderCreatorProfile = () => {
    const profilePage = document.querySelector(".profile-page");

    if (!profilePage) {
        return;
    }

    const creator = getCreatorFromUrl();
    const notFound = document.querySelector("[data-profile-not-found]");

    if (!creator) {
        profilePage.classList.add("profile-missing");
        notFound?.classList.add("is-visible");
        return;
    }

    document.title = `${creator.name} | Konnekt Creator Profile`;
    const shareProfileButton = document.querySelector("[data-share-creator]");
    const shareProfileStatus = document.querySelector("[data-profile-share-status]");
    shareProfileButton?.addEventListener("click", async () => {
        const url = new URL("creator-profile.html?id=" + encodeURIComponent(creator.id), location.href).href;
        if (navigator.share) {
            try {
                await navigator.share({ title: creator.name + " | Konnekt", url });
                if (shareProfileStatus) shareProfileStatus.textContent = "Share options opened.";
                return;
            } catch (error) {
                if (error.name === "AbortError") return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            if (shareProfileStatus) shareProfileStatus.textContent = "Profile link copied.";
        } catch {
            window.prompt("Copy profile link", url);
            if (shareProfileStatus) shareProfileStatus.textContent = "Copy the profile link to share it.";
        }
    });


    document.querySelector("[data-profile-banner]").src = creator.bannerImage;
    document.querySelector("[data-profile-banner]").alt = creator.bannerAlt;
    document.querySelector("[data-profile-avatar]").src = creator.profileImage;
    document.querySelector("[data-profile-avatar]").alt = creator.profileAlt;
    document.querySelector("[data-profile-name]").textContent = creator.name;
    document.querySelector("[data-profile-meta]").textContent = [creator.role,creator.location].filter(Boolean).join(" | ");
    document.querySelector("[data-profile-bio]").textContent = creator.bio || "";
    document.querySelector("[data-profile-tagline]").textContent = creator.tagline || creator.shortDescription || "";
    document.querySelector("[data-profile-availability]").textContent = creator.availability || "";
    const details = document.querySelector("[data-profile-details]");
    [["Specialties",creator.specialties],["Looking for",creator.lookingFor],["Other roles",creator.additionalRoles],["Skills",creator.skills],["Styles",creator.styles],["Equipment",creator.equipment],["Software",creator.software]].forEach(([label,values]) => {
        if (!Array.isArray(values) || !values.length) return;
        const section = document.createElement("section");
        const title = document.createElement("h3");
        title.textContent = label;
        const description = document.createElement("p");
        description.textContent = values.join(" · ");
        section.append(title,description);
        details.append(section);
    });
    const featuredNav = document.querySelector("[data-profile-featured-nav]");
    const hasFeaturedCredits = (window.konnektCreators || []).some(other =>
        other.id !== creator.id && (other.featuredProjects || []).some(project =>
            (project.credits || []).some(credit => typeof credit === "object" && credit &&
                (credit.creatorId === creator.id || credit.name === creator.name))
        )
    );
    if (featuredNav) featuredNav.hidden = !hasFeaturedCredits;
    const panel = document.querySelector("[data-konnekt-panel]");
    const options = document.querySelector("[data-konnekt-options]");
    const feedback = document.querySelector("[data-konnekt-feedback]");
    const openKonnekt = document.querySelector("[data-konnekt-open]");
    const closeKonnekt = document.querySelector("[data-konnekt-close]");
    const formContainer = document.querySelector("[data-konnekt-form]");
    const approved = creator.contactOptions || {};
    const email = typeof creator.contactEmail === "string" && creator.contactEmail.includes("@") && !/\s/.test(creator.contactEmail) ? creator.contactEmail : "";
    const socials = (creator.socialLinks || []).filter(link => {
        try { return ["https:", "http:"].includes(new URL(link.url).protocol); } catch { return false; }
    });
    const close = () => {
        panel.hidden = true;
        openKonnekt.setAttribute("aria-expanded", "false");
        formContainer.replaceChildren();
        openKonnekt.focus();
    };
    const setContactAction = (action) => {
        formContainer.replaceChildren();
        feedback.textContent = "";
        if (action === "Socials") {
            socials.forEach(link => {
                const a = document.createElement("a");
                a.className = "button secondary-button";
                a.href = link.url;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.textContent = "Open " + link.label + " ↗";
                formContainer.append(a);
            });
            return;
        }
        const fields = action === "Hire / Commission" ? ["Project type", "Budget range", "Timeline", "Project description", "Your contact information"] :
            action === "Collaborate" ? ["Your creative role", "Project idea", "Location / remote", "Paid / unpaid / undecided", "Your contact information"] :
            ["Your introduction", "Your contact information"];
        const form = document.createElement("form");
        form.className = "konnekt-inquiry-form";
        fields.forEach(label => {
            const wrapper = document.createElement("label");
            wrapper.textContent = label;
            const input = label === "Project description" || label === "Project idea" || label === "Your introduction" ? document.createElement("textarea") : document.createElement("input");
            input.name = label;
            input.required = true;
            wrapper.append(input);
            form.append(wrapper);
        });
        const send = document.createElement("button");
        send.type = "submit";
        send.className = "button primary-button";
        send.textContent = "Open email draft ↗";
        form.append(send);
        form.addEventListener("submit", event => {
            event.preventDefault();
            if (!email) return;
            const body = fields.map(label => label + ": " + (new FormData(form).get(label) || "")).join(String.fromCharCode(10, 10));
            window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(action + " inquiry via Konnekt") + "&body=" + encodeURIComponent(body);
            feedback.textContent = "Your email app will open with a draft. Konnekt has not sent anything.";
        });
        formContainer.append(form);
    };
    const actions = [
        ["Hire / Commission", approved.hire === true && !!email],
        ["Collaborate", approved.collaborate === true && !!email],
        ["Network", approved.network === true && !!email],
        ["General Inquiry", approved.general === true && !!email],
        ["Socials", socials.length > 0]
    ];
    actions.filter(([,enabled]) => enabled).forEach(([action]) => {
        const button = document.createElement("button");
        button.className = "button secondary-button";
        button.type = "button";
        button.textContent = action;
        button.addEventListener("click", () => setContactAction(action));
        options.append(button);
    });
    if (!options.children.length) feedback.textContent = "This creator has not added a public contact method yet.";
    document.querySelector("[data-konnekt-title]").textContent = "Konnekt with " + creator.name;
    openKonnekt.addEventListener("click", () => {
        panel.hidden = !panel.hidden;
        openKonnekt.setAttribute("aria-expanded", String(!panel.hidden));
        if (!panel.hidden) closeKonnekt.focus();
    });
    closeKonnekt?.addEventListener("click", close);
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !panel.hidden) close();
    });
    const visitSource = new URLSearchParams(window.location.search).get("source");
    if (["nfc","qr","share","discovery"].includes(visitSource)) document.documentElement.dataset.profileSource = visitSource;

    document.querySelector("[data-profile-stats]").innerHTML = renderStats(creator);
    document.querySelector("[data-profile-badges]").innerHTML = renderBadges(creator.badges || []);
    document.querySelector("[data-profile-socials]").innerHTML = renderSocialLinks(creator.socialLinks || []);
    document.querySelector("[data-profile-projects]").innerHTML = renderProjects(creator.featuredProjects || []);
    document.querySelector("[data-profile-gallery]").innerHTML = renderGallery(creator.gallery || []);
    document.querySelector("[data-profile-videos]").innerHTML = renderVideos(creator.videos || []);
    renderFeaturedIn(creator);

    const profileSaveButton = document.querySelector(".profile-actions .save-button");

    if (profileSaveButton) {
        const isSaved = isItemSaved("creator", creator.id);

        profileSaveButton.dataset.saveId = creator.id;
        profileSaveButton.textContent = getSaveButtonText("creator", isSaved);
        profileSaveButton.classList.toggle("is-saved", isSaved);
    }
};

// The project page reads ?id=project-id and fills the template from data.js.
const renderProjectDetail = () => {
    const projectPage = document.querySelector(".project-page");

    if (!projectPage) {
        return;
    }

    const project = getProjectFromUrl();
    const notFound = document.querySelector("[data-project-not-found]");

    if (!project) {
        projectPage.classList.add("project-missing");
        notFound?.classList.add("is-visible");
        return;
    }

    const watchLink = document.querySelector("[data-watch-project-link]");
    if (watchLink) {
        const classification = [project.category, project.type, ...(project.tags || [])].join(" ").toLowerCase();
        const watchEligible = /music video|documentary|animation|experimental|short film|narrative film|cinema|film/.test(classification);
        watchLink.hidden = !watchEligible;
        if (watchEligible) watchLink.href = "watch-project.html?id=" + encodeURIComponent(project.id);
    }
    const creator = getCreatorById(project.creatorId);
    const creatorProfileUrl = `creator-profile.html?id=${project.creatorId}`;

    document.title = `${project.title} | Konnekt Project`;

    document.querySelector("[data-project-category]").textContent = project.category;
    document.querySelector("[data-project-title]").textContent = project.title;
    document.querySelector("[data-project-description]").textContent = project.description;
    document.querySelector("[data-project-creator]").textContent = creator ? `${creator.name} | ${creator.role}` : project.creatorName;
    document.querySelector("[data-project-year]").textContent = project.year;
    document.querySelector("[data-project-main-image]").src = project.thumbnail || project.image;
    document.querySelector("[data-project-main-image]").alt = project.alt;
    renderCreditList(project);
    const creditToggle = document.querySelector("[data-credits-toggle]");
    const allCredits = normalizeCredits(project);
    if (creditToggle && allCredits.length > 5) {
        creditToggle.hidden = false;
        creditToggle.addEventListener("click", () => {
            const expanded = creditToggle.getAttribute("aria-expanded") !== "true";
            creditToggle.setAttribute("aria-expanded", String(expanded));
            creditToggle.textContent = expanded ? "Show Key Credits" : "View Full Credits";
            renderCreditList(project, expanded);
        });
    }
    const creditNote = document.querySelector("[data-credits-note]");
    if (creditNote) creditNote.textContent = allCredits.length ? "Credits provided with the project; not independently verified." : "";
    document.querySelector("[data-project-tools]").innerHTML = renderDetailItems(project.tools);
    document.querySelector("[data-project-media]").innerHTML = renderProjectMedia(project.media);

    const projectSaveButton = document.querySelector(".project-hero .save-button");

    if (projectSaveButton) {
        const isSaved = isItemSaved("project", project.id);

        projectSaveButton.dataset.saveId = project.id;
        projectSaveButton.textContent = getSaveButtonText("project", isSaved);
        projectSaveButton.classList.toggle("is-saved", isSaved);
    }

    const topCreatorLink = document.querySelector("[data-project-creator-link]");
    const bottomCreatorLink = document.querySelector("[data-project-bottom-link]");

    topCreatorLink.href = creatorProfileUrl;
    topCreatorLink.textContent = creator ? `View ${creator.name}` : "View Creator";
    bottomCreatorLink.href = creatorProfileUrl;
    bottomCreatorLink.textContent = creator ? `View ${creator.name}` : "View Creator";

    const tagContainer = document.createElement("div");
    tagContainer.className = "badge-list project-tags";
    tagContainer.innerHTML = renderBadges(project.tags);
    document.querySelector(".project-hero-copy").appendChild(tagContainer);
};

// Full-screen media viewer for creator gallery images.
const setupLightbox = () => {
    const lightboxImages = document.querySelectorAll(".lightbox-image");
    const lightbox = document.querySelector(".lightbox");
    const lightboxDisplay = document.querySelector(".lightbox-display");
    const lightboxClose = document.querySelector(".lightbox-close");
    const lightboxPrev = document.querySelector(".lightbox-prev");
    const lightboxNext = document.querySelector(".lightbox-next");
    let currentImageIndex = 0;

    if (lightboxImages.length === 0 || !lightbox || !lightboxDisplay || !lightboxClose || !lightboxPrev || !lightboxNext) {
        return;
    }

    const showLightboxImage = (index) => {
        const image = lightboxImages[index];

        currentImageIndex = index;
        lightboxDisplay.src = image.src;
        lightboxDisplay.alt = image.alt;
    };

    const openLightbox = (index) => {
        showLightboxImage(index);
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
        lightboxClose.focus();
    };

    const closeLightbox = () => {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxDisplay.src = "";
        lightboxDisplay.alt = "";
        document.body.classList.remove("no-scroll");
    };

    const showPreviousImage = () => {
        const previousIndex = currentImageIndex === 0 ? lightboxImages.length - 1 : currentImageIndex - 1;
        showLightboxImage(previousIndex);
    };

    const showNextImage = () => {
        const nextIndex = currentImageIndex === lightboxImages.length - 1 ? 0 : currentImageIndex + 1;
        showLightboxImage(nextIndex);
    };

    lightboxImages.forEach((image, index) => {
        image.setAttribute("role", "button");
        image.setAttribute("tabindex", "0");
        image.setAttribute("aria-label", `Open image ${index + 1} in media viewer`);

        image.addEventListener("click", () => {
            openLightbox(index);
        });

        image.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(index);
            }
        });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", showPreviousImage);
    lightboxNext.addEventListener("click", showNextImage);

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!lightbox.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
        }

        if (event.key === "ArrowLeft") {
            showPreviousImage();
        }

        if (event.key === "ArrowRight") {
            showNextImage();
        }
    });
};

const setupFrontendForms = () => {
    const frontendForms = document.querySelectorAll(".frontend-form");

    // Frontend-only form feedback. Nothing is submitted or saved.
    frontendForms.forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const message = form.querySelector(".form-message");

            if (message) {
                message.textContent = "Frontend-only mockup: no account, upload, or form data was sent.";
            }
        });
    });
};

const setupSaveButtons = () => {
    const saveButtons = document.querySelectorAll(".save-button");

    // Frontend-only saved state. This uses browser storage, not a backend or account.
    saveButtons.forEach((button) => {
        const saveType = button.dataset.saveType === "project" ? "project" : "creator";
        const saveId = button.dataset.saveId;

        if (saveId) {
            const saved = isItemSaved(saveType, saveId);

            button.classList.toggle("is-saved", saved);
            button.textContent = getSaveButtonText(saveType, saved);
        }

        button.setAttribute("aria-pressed", button.classList.contains("is-saved"));

        button.addEventListener("click", () => {
            if (!saveId) {
                const isSaved = button.classList.toggle("is-saved");

                button.textContent = getSaveButtonText(saveType, isSaved);
                button.setAttribute("aria-pressed", isSaved);
                return;
            }

            const savedItems = getSavedItems();
            const listName = getSavedListName(saveType);
            const savedList = savedItems[listName];
            const alreadySaved = savedList.includes(saveId);
            const nextSavedList = alreadySaved
                ? savedList.filter((itemId) => itemId !== saveId)
                : [...savedList, saveId];

            savedItems[listName] = nextSavedList;
            setSavedItems(savedItems);

            const isSaved = !alreadySaved;
            const matchingButtons = document.querySelectorAll(`[data-save-type="${saveType}"][data-save-id="${saveId}"]`);

            matchingButtons.forEach((matchingButton) => {
                matchingButton.classList.toggle("is-saved", isSaved);
                matchingButton.textContent = getSaveButtonText(saveType, isSaved);
                matchingButton.setAttribute("aria-pressed", isSaved);
            });
        });
    });
};

renderHomepageCreators();
setupHomepageFilters();
renderKonnektSelects();
renderExploreCards();
renderSavedItems();
setupExploreFilters();
setupProjectDiscovery();
renderCreatorProfile();
renderProjectDetail();
setupLightbox();
setupFrontendForms();
setupSaveButtons();
