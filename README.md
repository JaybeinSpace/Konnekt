# Konnekt

Konnekt is a dark-themed portfolio and discovery platform for emerging filmmakers and photographers.

The goal is to help new visual creators showcase their work, get discovered, and connect with future opportunities. This project is currently a frontend-only MVP built with beginner-friendly HTML, CSS, and JavaScript.

## Live Demo

Vercel: `https://your-konnekt-vercel-url.vercel.app`

Replace this with the active Vercel production URL from your Vercel dashboard.

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
- Saved Items page mockup for saved creators and projects
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
- No real saved-item storage

All creator and project data is fake sample data stored in `data.js`.

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
- Add real saved creators and saved projects
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
