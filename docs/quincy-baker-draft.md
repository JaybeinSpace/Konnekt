# Quincy Baker / The Devil in My House — staging and approval

**Status: draft, not approved for publication.** This change is intentionally proposed in an **unmerged draft pull request**. Do not deploy or merge it into the production branch until Quincy approves his creator profile, and the film's public presentation is reviewed.

## Single canonical film record

The short film is defined once in `window.konnektStandaloneProjects` in `data.js`:
- Project ID: `the-devil-in-my-house`
- Official source: `https://www.youtube.com/watch?v=SJnMvchdG_E`
- Provider media ID: `SJnMvchdG_E`
- Submitter: Quincy Baker (Director of Photography), permission to feature supplied to Konnekt
- Director and editor: Alayna Williams
- Copyright owner: **not confirmed**; not assigned to Quincy or Alayna
- Full 11 named cast/crew credits are stored on the film record

Do not copy the film into `quincy-baker.featuredProjects` or create another project ID for another contributor. In `watch.js`, the film appears in the Short Films row and uses a privacy-enhanced official YouTube embed with a link to the original URL. The video is never downloaded or rehosted. The same canonical film record is also surfaced in **Discover → For You** and **Discover → Film & Motion**, in both Feed and Grid layouts. Discover credits Quincy as the **submitter and Director of Photography**, never as owner, and offers project and Watch links rather than linking to his unapproved draft profile. Its saved project ID works with Saved and Collections. Playback/embedding rights still need live verification by a reviewer; a standard iframe URL does not prove playback will succeed.

## Unpublished creator draft

`window.konnektCreatorDrafts` contains Quincy’s factual profile draft. It is **not** in `window.konnektCreators` (the public directory). Its profile route returns no creator without the explicit draft preview flag:
`creator-profile.html?id=quincy-baker&draftPreview=1`.

**Important:** A query parameter is not real access control. The draft text is also present in a static JavaScript file, so this is suitable for code review, not a secure private review portal. **Do not publish the preview or merge this profile into a public deployment before approval.** Replace the preview mechanism with authenticated, authorized review before backend launch. A draft pull request might automatically create a preview deployment depending on Vercel settings; review preview protection before sharing any preview links.

The existing creator profile template shows Quincy’s role and temporary factual bio, submitted profile photograph (pending Quincy’s approval), empty Work section, and a **draft-only** Featured In card. The supplied Instagram link **[@takenwithqair](https://www.instagram.com/takenwithqair/)** appears in the existing social-link section of the draft preview with `verificationStatus: pending` and an ownership-confirmation notice. This is a submitted handle, **not proof Quincy owns or controls the account**. Confirm directly with Quincy through a trusted channel (for example, an authenticated claim or a confirmation from the account) before publishing or marking it verified. Contact, sharing, saving, public stats, gallery, and media are suppressed. No account is created. No creator-managed or verified status is asserted.

The film's Quincy credit contains `pendingCreatorId: "quincy-baker"` and `approved: false`, not an approved account link. The public project-credit renderer therefore does **not** link to an unapproved profile. Draft preview Featured In reads this pending reference only for review. Real account matching requires the Credit Match verification process.

## Required approval and backend migration

1. Obtain Quincy's explicit profile/bio permission and approval of the supplied profile photograph, plus any location, links, and contact options; make no assumptions.
2. Confirm submission permission scope for display and verify whether the actual YouTube video can be embedded.
3. Record authentic rights holder/authorized project manager when known. Neither submitter status nor a camera credit grants ownership/control.
4. After approval, migrate creator into a real profile with an explicit `publication_status`, and provide secure account claim/activation through Supabase Auth (when configured).
5. An authorized review process may convert `pendingCreatorId` into an approved, verified contributor link only after identity review. Keep project ownership separate.
6. Migrate the single film into `projects` + `project_media` (unique provider/media ID) and cast/crew into `project_credits` using stable IDs. The film belongs in a verified contributor's Featured In via a join/query, not duplicated media.
7. Before production: validate at 320/375/390/430/768/1024/1440px, keyboard navigation, touch targets, privacy, visibility flags, Watch playback, and project credits.

## Tests

Run `node --test tests/*.test.cjs`. New coverage checks one film record, exact supplied cast/crew, no publicly listed Quincy profile, draft-only Work and pending credit, and Watch card/embed rendering.

This PR deliberately does not implement authentication, claims, secure draft review, or backend storage.

## Discover 30-second preview (frontend only)

- Discover displays an optional **Preview 30s** action for projects with a valid YouTube video ID. The video **never auto-plays while scrolling**, including on mobile. Clicking/tapping opens a keyboard-accessible native dialog with the official privacy-enhanced YouTube iframe.
- `previewStartSeconds` and `previewDurationSeconds` are project fields; the film currently uses seconds **0 through 30**. The corresponding embed URL uses YouTube's `start` and `end` player parameters. Future authorized curation may choose another 30-second segment by changing the start time, without editing or hosting video bytes.
- Clicking Close, pressing Escape, changing Discover's view/filter, or hiding the page unloads the iframe to stop playback. The preview provides a direct link to the full official YouTube video.
- Actual video playback may be blocked by YouTube embed restrictions, network conditions or browser autoplay rules; users can open the original film. Browser CI tests validate iframe URL parameters, button visibility, modal focus/closing and size at **390px** and **1440px**, using a mocked iframe response. They **do not** prove live streaming is permitted.
- No extra project is created; the existing film ID, credits, rights notes, and Quincy draft approval status are untouched by the preview.
