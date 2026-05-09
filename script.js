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
            const scoreDifference = getExploreScore(second.creator) - getExploreScore(first.creator);

            if (scoreDifference !== 0) {
                return scoreDifference;
            }

            return first.index - second.index;
        })
        .map((item) => item.creator);
};

// Homepage featured creators are generated from the first three creator objects in data.js.
const renderHomepageCreators = () => {
    const featuredGrid = document.querySelector("[data-featured-creators]");

    if (!featuredGrid || creators.length === 0) {
        return;
    }

    featuredGrid.innerHTML = creators.slice(0, 3).map((creator) => `
        <article class="creator-card">
            <img src="${creator.bannerImage}" alt="${creator.bannerAlt}">
            <div class="creator-info">
                <p class="creator-role">${creator.role}</p>
                <h3>${creator.name}</h3>
                <p class="creator-location">${creator.location}</p>
                <p>${creator.shortDescription}</p>
                <div class="card-actions">
                    <a class="profile-link" href="creator-profile.html?id=${creator.id}">View Profile</a>
                    <button class="profile-link save-button" type="button" data-save-type="creator">Save Creator</button>
                </div>
            </div>
        </article>
    `).join("");
};

// Konnekt Selects are fake recognition picks pulled from creator/project data.
const renderKonnektSelects = () => {
    const selectsGrid = document.querySelector("[data-konnekt-selects]");
    const featuredCreator = creators.find((creator) => creator.badges.includes("Featured This Month")) || creators[0];
    const topFilmPick = projects.find((project) => project.id === "after-hours") || projects[0];
    const photoSpotlight = projects.find((project) => project.id === "new-faces") || projects[1];

    if (!selectsGrid || !featuredCreator || !topFilmPick || !photoSpotlight) {
        return;
    }

    const selectItems = [
        {
            rank: "01",
            label: "Featured This Month",
            title: featuredCreator.name,
            description: `${featuredCreator.role} from ${featuredCreator.location}, selected for a standout visual identity.`,
            image: featuredCreator.bannerImage,
            href: `creator-profile.html?id=${featuredCreator.id}`,
            linkText: "View Profile",
            large: true
        },
        {
            rank: "02",
            label: "Top Film Picks",
            title: topFilmPick.title,
            description: topFilmPick.description,
            image: topFilmPick.thumbnail,
            href: `project.html?id=${topFilmPick.id}`,
            linkText: "View Project",
            large: false
        },
        {
            rank: "03",
            label: "Weekly Photo Spotlight",
            title: photoSpotlight.title,
            description: photoSpotlight.description,
            image: photoSpotlight.thumbnail,
            href: `project.html?id=${photoSpotlight.id}`,
            linkText: "View Project",
            large: false
        }
    ];

    selectsGrid.innerHTML = selectItems.map((item) => `
        <article class="select-card ${item.large ? "select-card-large" : ""}" style="--select-bg: url('${item.image}')">
            <span class="select-rank">${item.rank}</span>
            <p class="creator-role">${item.label}</p>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <a class="profile-link" href="${item.href}">${item.linkText}</a>
        </article>
    `).join("");
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
        <article class="explore-card" data-category="${creator.category}" data-search="${getCreatorSearchText(creator)}">
            <img src="${creator.profileImage}" alt="${creator.profileAlt}">
            <div class="explore-card-body">
                <p class="creator-role">${creator.role}</p>
                <h2>${creator.name}</h2>
                <p class="creator-location">${creator.location}</p>
                <p>${creator.shortDescription}</p>
                <div class="card-actions">
                    <a class="profile-link" href="creator-profile.html?id=${creator.id}">View Profile</a>
                    <button class="profile-link save-button" type="button" data-save-type="creator">Save Creator</button>
                </div>
            </div>
        </article>
    `).join("");
};

const renderCreatorPreviewCards = (creatorList) => {
    return creatorList.map((creator) => `
        <article class="explore-card" data-category="${creator.category}" data-search="${getCreatorSearchText(creator)}">
            <img src="${creator.profileImage}" alt="${creator.profileAlt}">
            <div class="explore-card-body">
                <p class="creator-role">${creator.role}</p>
                <h2>${creator.name}</h2>
                <p class="creator-location">${creator.location}</p>
                <p>${creator.shortDescription}</p>
                <div class="card-actions">
                    <a class="profile-link" href="creator-profile.html?id=${creator.id}">View Profile</a>
                    <button class="profile-link save-button is-saved" type="button" data-save-type="creator">Creator Saved</button>
                </div>
            </div>
        </article>
    `).join("");
};

const renderSavedItems = () => {
    const savedCreatorsGrid = document.querySelector("[data-saved-creators]");
    const savedProjectsGrid = document.querySelector("[data-saved-projects]");

    // Example saved items only. Real saved lists need accounts or storage later.
    if (savedCreatorsGrid) {
        savedCreatorsGrid.innerHTML = renderCreatorPreviewCards(creators.slice(0, 2));
    }

    if (savedProjectsGrid) {
        savedProjectsGrid.innerHTML = renderProjects(projects.slice(0, 2));
    }
};

// Search and role filters work on the generated Explore cards.
const setupExploreFilters = () => {
    const filterButtons = document.querySelectorAll(".filter-button");
    const creatorCards = document.querySelectorAll("[data-explore-grid] .explore-card");
    const creatorSearch = document.querySelector(".creator-search");
    const emptyState = document.querySelector("[data-empty-state]");
    let activeFilter = "all";

    if (filterButtons.length === 0 || creatorCards.length === 0) {
        return;
    }

    const updateCreatorCards = () => {
        const searchText = creatorSearch ? creatorSearch.value.toLowerCase().trim() : "";
        let visibleCards = 0;

        creatorCards.forEach((card) => {
            const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
            const matchesSearch = card.dataset.search.includes(searchText);
            const shouldShow = matchesFilter && matchesSearch;

            card.classList.toggle("is-hidden", !shouldShow);

            if (shouldShow) {
                visibleCards += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visibleCards === 0);
        }
    };

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter;

            filterButtons.forEach((filterButton) => {
                filterButton.classList.remove("is-active");
            });

            button.classList.add("is-active");
            updateCreatorCards();
        });
    });

    if (creatorSearch) {
        creatorSearch.addEventListener("input", updateCreatorCards);
    }

    updateCreatorCards();
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
                    <button class="profile-link save-button" type="button" data-save-type="project">Save Project</button>
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

    document.querySelector("[data-profile-banner]").src = creator.bannerImage;
    document.querySelector("[data-profile-banner]").alt = creator.bannerAlt;
    document.querySelector("[data-profile-avatar]").src = creator.profileImage;
    document.querySelector("[data-profile-avatar]").alt = creator.profileAlt;
    document.querySelector("[data-profile-name]").textContent = creator.name;
    document.querySelector("[data-profile-meta]").textContent = `${creator.role} | ${creator.location}`;
    document.querySelector("[data-profile-bio]").textContent = creator.bio;
    document.querySelector("[data-profile-stats]").innerHTML = renderStats(creator);
    document.querySelector("[data-profile-badges]").innerHTML = renderBadges(creator.badges);
    document.querySelector("[data-profile-socials]").innerHTML = renderSocialLinks(creator.socialLinks);
    document.querySelector("[data-profile-projects]").innerHTML = renderProjects(creator.featuredProjects);
    document.querySelector("[data-profile-gallery]").innerHTML = renderGallery(creator.gallery);
    document.querySelector("[data-profile-videos]").innerHTML = renderVideos(creator.videos);
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
    document.querySelector("[data-project-credits]").innerHTML = renderDetailItems(project.credits);
    document.querySelector("[data-project-tools]").innerHTML = renderDetailItems(project.tools);
    document.querySelector("[data-project-media]").innerHTML = renderProjectMedia(project.media);

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
                message.textContent = "Frontend preview only. No data was sent or saved.";
            }
        });
    });
};

const setupSaveButtons = () => {
    const saveButtons = document.querySelectorAll(".save-button");

    // This is only a UI mockup. Nothing is saved to a backend or browser storage.
    saveButtons.forEach((button) => {
        button.setAttribute("aria-pressed", button.classList.contains("is-saved"));

        button.addEventListener("click", () => {
            const isSaved = button.classList.toggle("is-saved");
            const saveType = button.dataset.saveType === "project" ? "Project" : "Creator";

            button.textContent = isSaved ? `${saveType} Saved` : `Save ${saveType}`;
            button.setAttribute("aria-pressed", isSaved);
        });
    });
};

renderHomepageCreators();
renderKonnektSelects();
renderExploreCards();
renderSavedItems();
setupExploreFilters();
renderCreatorProfile();
renderProjectDetail();
setupLightbox();
setupFrontendForms();
setupSaveButtons();
