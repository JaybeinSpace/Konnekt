# Konnekt Code Walkthrough

Konnekt is a frontend-only discovery and portfolio platform for emerging filmmakers and photographers.

Frontend-only means the site runs in the browser with HTML, CSS, and JavaScript. There is no backend, database, real login, real upload system, or real authentication yet.

## Project Files

### `index.html`

The homepage introduces Konnekt, shows featured creators, highlights Konnekt Selects, and sends visitors to Explore or Submit Work.

It also includes the premium homepage hero. The hero has stronger brand copy plus a cinematic visual stack:

```html
<div class="hero-visual" aria-hidden="true">
    ...
</div>
```

That visual stack is decorative, so it uses `aria-hidden="true"`.

The featured creator cards on the homepage are generated from `data.js`. The HTML only provides an empty container:

```html
<div class="creator-grid" data-featured-creators></div>
```

JavaScript fills that container with the first few creators from the fake creator array.

### `explore.html`

The Explore page is now a template page.

It no longer contains repeated hardcoded creator cards. Instead, it has an empty container:

```html
<div class="explore-grid"></div>
```

JavaScript fills that grid with cards from `data.js`.

### `creator-profile.html`

The creator profile page is now reusable.

It reads the creator id from the URL:

```text
creator-profile.html?id=andre-miles
```

Then JavaScript finds that creator inside `data.js` and fills the page with the correct name, images, bio, stats, badges, links, gallery, projects, and videos.

### `project.html`

The project detail page is also reusable.

It reads a project id from the URL:

```text
project.html?id=after-hours
```

Then JavaScript searches every creator's `featuredProjects` list, finds that project, and fills the page with the project title, creator, category, description, media, credits, tools, year, tags, and creator CTA.

### `about.html`

The About page explains Konnekt's mission, who the platform helps, and how creator discovery works.

It is still a frontend-only page, but it makes the MVP feel more like a real startup product by explaining the purpose behind the interface.

### `saved.html`

The Saved Items page is a frontend-only mockup for saved creators and saved projects.

It uses example data from `data.js`, but it does not store anything for real yet. Real saved lists will need accounts, authentication, and a backend later.

### `README.md`

The README is the project introduction file.

It explains what Konnekt is, what features exist, how to run the project locally, what is still frontend-only, and what could be built next.

### `data.js`

This file stores the fake creator data.

It creates one JavaScript array:

```js
window.konnektCreators = [
    {
        id: "maya-chen",
        name: "Maya Chen",
        category: "filmmaker",
        role: "Director of Photography",
        location: "Chicago, IL"
    }
];
```

The real file has more fields and multiple creators.

### `script.js`

This file reads `data.js`, builds Explore cards, powers search and filters, fills dynamic profile pages, controls the media lightbox, opens the mobile nav, and shows frontend-only form messages.

It also builds homepage featured creator cards and controls the frontend-only Save Creator and Save Project button states.

### `style.css`

This file controls the dark Konnekt visual style, responsive layouts, cards, forms, buttons, nav, lightbox, and mobile behavior.

The latest polish pass also added:

- a text/CSS Konnekt wordmark treatment
- cinematic hero image framing
- richer card shadows and borders
- smoother hover states
- lightweight fade-up animation
- responsive mobile adjustments for the hero and cards

### `favicon.svg`

The favicon is a small SVG icon used by the browser tab.

Every HTML page links it like this:

```html
<link rel="icon" href="favicon.svg" type="image/svg+xml">
```

## What `data.js` Does

Before this refactor, fake creator information was repeated directly inside HTML.

That meant every creator card had to be manually written in `explore.html`, and the profile page was mostly locked to one sample creator.

Now fake creator data lives in one place: `data.js`.

Each creator object includes:

- `id`
- `name`
- `category`
- `role`
- `location`
- `bio`
- `shortDescription`
- `profileImage`
- `bannerImage`
- `tags`
- `stats`
- `badges`
- `socialLinks`
- `gallery`
- `featuredProjects`
- `videos`

Example:

```js
{
    id: "maya-chen",
    name: "Maya Chen",
    category: "filmmaker",
    role: "Director of Photography",
    location: "Chicago, IL",
    tags: ["Cinematography", "Music Videos", "Low Light"]
}
```

The `id` is very important. It connects an Explore card to the correct profile page.

Each project inside `featuredProjects` also has its own `id`.

Project ids connect project cards to the dynamic project page.

Example:

```js
{
    id: "after-hours",
    creatorId: "maya-chen",
    title: "After Hours",
    category: "Music Video"
}
```

The `creatorId` connects the project back to the creator who made it.

## How Data Flows Into Explore

The Explore page loads files in this order:

```html
<script src="data.js"></script>
<script src="script.js"></script>
```

This matters because `data.js` must load first.

`data.js` creates:

```js
window.konnektCreators
```

Then `script.js` reads it:

```js
const creators = window.konnektCreators || [];
```

After that, `renderExploreCards()` loops through every creator and creates card HTML:

```js
exploreGrid.innerHTML = creators.map((creator) => `
    <article class="explore-card">
        ...
    </article>
`).join("");
```

Beginner translation:

1. `data.js` stores the creator list.
2. `script.js` grabs that list.
3. JavaScript loops through the list.
4. Each creator becomes one card.
5. The cards are inserted into `.explore-grid`.

This is better than writing the same HTML card six times.

## How Data Flows Into The Homepage

The homepage also loads:

```html
<script src="data.js"></script>
<script src="script.js"></script>
```

`index.html` has this empty featured creator grid:

```html
<div class="creator-grid" data-featured-creators></div>
```

Then `script.js` runs:

```js
renderHomepageCreators();
```

That function takes the first few creators from `window.konnektCreators` and builds premium homepage creator cards.

Beginner translation:

1. `data.js` stores the creator information.
2. `index.html` provides a place for featured creators.
3. `script.js` creates the cards.
4. The homepage updates automatically if the creator data changes.

This means the homepage no longer needs repeated hardcoded creator card HTML.

## How Data Flows Into Konnekt Selects

The Konnekt Selects section on the homepage is also generated from `data.js`.

`index.html` provides an empty container:

```html
<div class="selects-grid" data-konnekt-selects></div>
```

Then `script.js` runs:

```js
renderKonnektSelects();
```

That function picks fake recognition items from the creator and project data:

- Featured This Month uses a creator.
- Top Film Picks uses a project.
- Weekly Photo Spotlight uses a project.

Beginner translation:

1. `data.js` stores creators and their projects.
2. `script.js` chooses a few items to feature.
3. JavaScript creates the Selects cards.
4. The card images, titles, descriptions, and links come from the data.

This makes the homepage feel more like a real discovery platform because featured sections can reuse the same creator/project data as the rest of the site.

## How View Profile Links Work

Each generated Explore card includes a profile link:

```js
<a href="creator-profile.html?id=${creator.id}">View Profile</a>
```

If the creator id is `sofia-reyes`, the final link becomes:

```text
creator-profile.html?id=sofia-reyes
```

The `?id=sofia-reyes` part is called a query string.

It lets one HTML page show different data depending on the URL.

## How Project Links Work

Project cards on creator profiles now link to `project.html`.

Example:

```js
<a href="project.html?id=${project.id}">View Project</a>
```

If the project id is `quiet-signal`, the final link becomes:

```text
project.html?id=quiet-signal
```

That lets one project page show many different fake projects.

## How Profile Pages Use URL IDs

The profile page does not need a separate HTML file for every creator.

Instead, `script.js` uses:

```js
const params = new URLSearchParams(window.location.search);
const creatorId = params.get("id");
```

This reads the `id` from the URL.

Then JavaScript finds the matching creator:

```js
creators.find((creator) => creator.id === creatorId);
```

If the URL is:

```text
creator-profile.html?id=andre-miles
```

JavaScript looks for:

```js
id: "andre-miles"
```

Then it fills the profile template with Andre's data.

## How Project Pages Use URL IDs

`project.html` works almost the same way as `creator-profile.html`.

The script reads the project id from the URL:

```js
const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");
```

Projects are stored inside creators, so `script.js` first makes a flat project list:

```js
const projects = creators.flatMap((creator) => {
    return creator.featuredProjects.map((project) => {
        return {
            ...project,
            creatorName: creator.name
        };
    });
});
```

Beginner translation:

1. Each creator owns their own projects in `data.js`.
2. JavaScript gathers all those projects into one list.
3. The URL tells JavaScript which project id to find.
4. The matching project fills `project.html`.
5. The page links back to the creator with `creatorId`.

## How JavaScript Generates Profile Content

`creator-profile.html` has placeholder containers like:

```html
<h1 data-profile-name>Creator Name</h1>
<p data-profile-bio></p>
<div data-profile-gallery></div>
```

JavaScript updates those containers:

```js
document.querySelector("[data-profile-name]").textContent = creator.name;
document.querySelector("[data-profile-bio]").textContent = creator.bio;
document.querySelector("[data-profile-gallery]").innerHTML = renderGallery(creator.gallery);
```

Beginner translation:

HTML provides empty spots.

`data.js` provides the information.

`script.js` puts the information into the empty spots.

## How JavaScript Generates Project Content

`project.html` has placeholder containers like:

```html
<h1 data-project-title>Project title</h1>
<p data-project-description></p>
<div data-project-media></div>
```

JavaScript fills them:

```js
document.querySelector("[data-project-title]").textContent = project.title;
document.querySelector("[data-project-description]").textContent = project.description;
document.querySelector("[data-project-media]").innerHTML = renderProjectMedia(project.media);
```

The project page also fills:

- main image
- creator name
- year
- credits
- tools used
- tags
- View Creator buttons

## Shared Footer

Every page now has the same footer.

The footer includes:

- Konnekt logo
- Short MVP description
- About link
- Explore link
- Submit Work link
- Log In link
- Sign Up link

This makes the site feel more complete and gives users a consistent way to move around.

Right now the footer is repeated in each HTML file. Later, if the project moves to a framework or backend, the footer could become one reusable component.

## Branding And Visual Polish

The latest visual pass keeps Konnekt frontend-only, but makes it feel more like a real cinematic platform.

The logo is still text, but CSS gives it a simple wordmark treatment:

```css
.logo::before {
    content: "K";
}
```

That creates a small branded mark before the Konnekt name without needing a design tool or image file.

The homepage hero now has:

- stronger emotional headline copy
- a cinematic background image
- a layered visual image stack
- more polished buttons
- small proof chips for platform signals

Cards now feel more premium because CSS adds:

- deeper shadows
- sharper hover movement
- subtle image zoom
- better border color changes
- stronger visual hierarchy

The animation is intentionally simple:

```css
@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(18px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

There is also a `prefers-reduced-motion` media query so users who prefer less motion are respected.

## Saved Page Mockup

`saved.html` shows what a future saved list could look like.

The page has two empty containers:

```html
<div class="explore-grid" data-saved-creators></div>
<div class="project-grid" data-saved-projects></div>
```

Then `script.js` runs:

```js
renderSavedItems();
```

That function uses example items from the fake data:

- The first few creators become saved creator cards.
- The first few projects become saved project cards.

Important: this is still a mockup.

No creator or project is saved to a real account, database, or browser storage yet.

## Save UI Mockups

Konnekt now has frontend-only Save buttons.

Examples:

- Save Creator
- Save Project

These buttons do not save anything for real yet.

There is no database, account system, or browser storage connected.

The JavaScript only toggles the button style and text:

```js
button.classList.toggle("is-saved");
```

Beginner translation:

The button visually acts like saving works, but no data is stored anywhere.

This is useful in an MVP because it lets you design and test the user experience before building real accounts and saved lists.

## Search And Filters

Search still works after the refactor.

For each creator, JavaScript builds searchable text from:

- name
- role
- category
- location
- short description
- tags

That happens in:

```js
getCreatorSearchText(creator)
```

So a user can search things like:

- `maya`
- `editor`
- `chicago`
- `music videos`
- `portraits`

Filters still work with these categories:

- `all`
- `filmmaker`
- `photographer`
- `editor`

The filter buttons use `data-filter`.

The generated cards use `data-category`.

JavaScript compares them to decide which cards should stay visible.

## How The Lightbox Still Works

The profile gallery is generated dynamically from `creator.gallery`.

Every generated gallery image gets this class:

```html
class="lightbox-image"
```

After the profile is rendered, `setupLightbox()` finds those images and attaches click events.

That is why the order at the bottom of `script.js` matters:

```js
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
```

The profile or project content must be created before the lightbox looks for gallery images. Save buttons are also created dynamically, so JavaScript needs to build the cards first, then attach button behavior.

## Why The README Matters

`README.md` is useful when the project is uploaded to GitHub or shared with someone else.

It quickly answers:

- What is Konnekt?
- What features are included?
- What tech stack does it use?
- How do I run it locally?
- What is intentionally not built yet?
- What should be added in the future?

That helps friends, creators, collaborators, or future developers understand the project without reading every file first.

## Why This Is Better Than Hardcoding

Hardcoding means writing each card or profile by hand in HTML.

That works for one or two creators, but it becomes messy fast.

The new approach is better because:

- One creator's information lives in one object.
- Homepage featured creator cards can reuse the same creator data.
- Explore cards are generated automatically.
- Profile pages are generated automatically.
- Project pages are generated automatically.
- Adding a creator means adding one object to `data.js`.
- Adding a project means adding one object inside a creator's `featuredProjects`.
- Search and filters use the same data source.
- The project is closer to how real apps are structured.

## How To Add A New Fake Creator

Open `data.js`.

Copy one creator object.

Paste it inside the array.

Change:

- `id`
- `name`
- `category`
- `role`
- `location`
- images
- bio
- tags
- projects
- gallery

Make sure the `id` is unique.

Good id examples:

```js
id: "taylor-james"
id: "river-studio"
id: "nia-carter"
```

Then visit:

```text
creator-profile.html?id=taylor-james
```

If the id matches, the profile page will display that creator.

## How To Add A New Fake Project

Open `data.js`.

Find the creator who owns the project.

Add a new object inside that creator's `featuredProjects` array.

Include:

- `id`
- `creatorId`
- `title`
- `category`
- `description`
- `thumbnail`
- `media`
- `credits`
- `tools`
- `year`
- `tags`

Good project id examples:

```js
id: "summer-reel"
id: "street-portraits"
id: "founder-film"
```

Then visit:

```text
project.html?id=summer-reel
```

If the id matches, the project page will display that project.

## Current Frontend-Only Limits

These features are still mockups:

- Login
- Signup
- Submit Work form
- Upload placeholder
- Contact creator flow
- Video playback
- Saved accounts
- Real creator database

That is intentional.

The current goal is to make the frontend structure clean before adding backend complexity.

## Next Best Improvements

The next logical improvements are:

- Add simple localStorage for saved creators and projects.
- Add richer Explore sorting, like newest, most viewed, or recently featured.
- Add more fake creators and projects to stress test the layout.
- Add a small deployment checklist for GitHub Pages or Netlify.
- Add a real backend later with Supabase or Firebase when the frontend flow feels ready.

This refactor sets up Konnekt for those next steps because creator data is now reusable instead of scattered through repeated HTML.
