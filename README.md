# Konnekt

Konnekt is a dark-themed portfolio and discovery platform for emerging filmmakers and photographers.

The goal is to help new visual creators showcase their work, get discovered, and connect with future opportunities. This project is currently a frontend-only MVP built with beginner-friendly HTML, CSS, and JavaScript.

## Live Demo

Vercel: https://konnekt-cyan.vercel.app/

## Features

- Modern dark homepage for the Konnekt platform
- Premium cinematic hero and Konnekt wordmark treatment
- Explore Creators page with search and role filters
- Dynamic creator profile pages powered by fake data
- Dynamic project detail pages powered by fake data
- Konnekt Selects recognition section generated from creator/project data
- Media gallery lightbox for creator work
- Submit Your Work page with a frontend-only form mockup
- Login and signup UI mockups
- About page explaining the platform mission
- Saved Items page using browser-only saved creators and projects
- Responsive layouts for desktop and mobile
- Lightweight hover and entrance animations

## Tech Stack

- HTML
- CSS
- JavaScript

No frameworks are used yet, which keeps the project easier to understand while the core frontend structure is being built.

## Current Status

Konnekt is frontend-only right now.

That means there is currently:

- No backend
- No database
- No real authentication
- No real account system
- No real media upload or file storage
- No account-based saved-item storage

All creator and project data is fake sample data stored in `data.js`. Saved creators and projects use browser `localStorage` only, so they stay frontend-only and are not connected to accounts.

## How To Run Locally

Open `index.html` in a browser.

Because the project is plain HTML, CSS, and JavaScript, it does not need an install step.

Optional: you can also run it with a simple local static server if you prefer:

```bash
npx serve .
```

Then open the local URL shown in the terminal.

## Main Files

- `index.html`: Homepage
- `explore.html`: Creator discovery page
- `creator-profile.html`: Dynamic creator profile template
- `project.html`: Dynamic project detail template
- `submit.html`: Frontend-only submission form mockup
- `saved.html`: Frontend-only saved items mockup
- `about.html`: Mission and platform explanation
- `login.html`: Login UI mockup
- `signup.html`: Signup UI mockup
- `data.js`: Fake creator and project data
- `script.js`: Dynamic rendering, search, filters, lightbox, and UI behavior
- `style.css`: Dark visual design and responsive layout
- `favicon.svg`: Simple Konnekt browser icon
- `CODE_WALKTHROUGH.md`: Beginner-friendly explanation of how the code works

## Future Roadmap

- Add real creator accounts
- Add backend and database support
- Add real login and signup
- Add real project submissions
- Add media upload and storage
- Replace browser-only saved items with account-based saved lists
- Add individual creator dashboard tools
- Add richer discovery filters and sorting
- Add creator contact or opportunity request flows

## Beginner Notes

The project is intentionally organized like a small frontend app:

1. HTML pages provide the structure.
2. `data.js` stores fake creators and projects.
3. `script.js` reads the data and generates cards/pages dynamically.
4. `style.css` controls the shared Konnekt design system.

This makes Konnekt easier to scale before adding a real backend later.


## Konnekt Gallery (Exhibition 001)

Konnekt Gallery is the visual-arts companion to Konnekt Watch. Gallery is a frontend-only editorial exhibition at `gallery.html` using the **existing** `window.konnektCreators` records from `data.js`. It currently features only the real artist Jaelyn Ramos and her existing nine artwork project entries. No additional artists, titles, artist statements, or backend services are introduced.

- `gallery.html`: featured artwork, artist introduction (unchanged biography), and responsive collection.
- `gallery-artwork.html?id=<project-id>`: immersive artwork view, available medium, linked artist and original project, plus previous/next navigation (keyboard Left/Right also supported).
- `gallery.js`: selects the featured real creator, reads `featuredProjects`, and renders the pages; expand `ARTIST_IDS` only when another real artist's content is ready.
- `gallery.css`: isolated exhibition styling so existing Konnekt and Watch styling stays intact.

Some existing artwork titles are explicitly provisional in `data.js`. Gallery shows “Untitled work” for those pieces until Jaelyn confirms official titles; no placeholder descriptions are displayed. Gallery uses the existing painting type as the available medium/category rather than inventing material specifications. This is not an upload, payment, or authentication system.


## Discovery, KONNEKT Action, Credits and Featured In (frontend MVP)

- **Explore** (`explore.html`, `script.js`): existing creator search, category, specialty, location and availability filters remain. A Creators/Projects switch now enables work-first browsing using the same `data.js` records. Creator/project searches include names, disciplines, roles, locations, titles and available credit text. Real creators appear before demo profiles, and project cards label demo content.
- **KONNEKT Action** (`creator-profile.html`, `script.js`): creator profile contact panel with keyboard Escape close, visible close button, and options based strictly on creator-approved data. Existing public social links are shown when available. Email draft inquiries require BOTH a real `contactEmail` and an explicit `contactOptions` approval flag. No emails are sent by Konnekt and no services are assumed. For example, only with permission add `contactOptions: { hire: true, collaborate: true, network: true, general: true }` and `contactEmail` to an existing creator. Never insert unapproved contact details.
- **Credits** (`project.html`, `script.js`): optional `credits` entries can be existing strings such as `"Artist: Jaelyn Ramos"`, or structured objects such as `{ name: "Creator Name", role: "Editor", creatorId: "existing-creator-id", approved: true }`. Structured external contributors can use `url` instead of `creatorId` when approved. Show up to five key credits and toggle full list when needed. Project owners are linked by exact existing name. Credits are project-supplied attribution, **not independently verified**. Do not insert example names into real project records.
- **Featured In**: a creator profile lists projects belonging to *other* creators only when a structured credit explicitly references their `creatorId` and has `approved: true`. This is a display marker for pre-approved data entered by maintainers, not an independent identity verification system. Original projects are linked rather than duplicated.
- **Future backend only**: claim credit, request credit, evidence storage, disputes, appeals, moderation, credit history, notifications, in-platform messages and account-based confirmations. Credit Standard Option C requires independent review and appeal; it is a **policy for future implementation**, not a working frontend verification flow.

### Manual QA checklist

1. Test Explore Creators and Projects tabs on mobile and desktop; combine search with category, location, specialty, availability and Clear filters.
2. Open Jaelyn's profile: KONNEKT must expose her approved Instagram link, but must not claim commissions or send messages.
3. Open an existing artwork project: the artist credit must display and link to Jaelyn; projects with no credits should not crash.
4. Check that Featured In is hidden without approved linked contributor records and that saved items, Gallery and Watch remain unaffected.
5. Test keyboard focus and Escape behavior in the KONNEKT panel, plus small-screen layout.
