# Konnekt backend integration contract (planning only)

This repository is a **static frontend**. Neither this document nor the Credit Match demo implements authentication, database persistence, notifications, review, or verification. PR #31 and PR #32 remain unmerged pending review.

## Existing integration boundaries

- `data.js` is the current read-only creator/project source. `script.js` owns existing project credits and Featured In rendering. Do not replace these when introducing an API.
- `credit-match-core.js` provides pure URL/name normalization and a **candidate** lookup. It cannot authenticate a claimant.
- `credit-match-data.js` is the replaceable async lookup adapter. `credit-match.js` owns only UI state. A production adapter should call a trusted API, never directly authorize a claim from the browser.
- `credit-match-examples.js` contains **demo-only** data; do not migrate it as a verified film, owner, or identity.
- `collections.js` currently stores private collections in browser localStorage. Its IDs reference existing creators/projects, not copied project records. Later replace storage reads/writes with an authenticated collections repository; migration should be opt-in, deduplicated and explicitly confirmed.

## Stable record design

Keep stable opaque IDs, not names or URLs, as primary keys.

| Record | Key fields | Rule |
| --- | --- | --- |
| users | id, auth_subject, status | A login is not proof of a film credit |
| creators | id, user_id (nullable), display_name | No public stub profile from a credit |
| projects | id, title, manager_creator_id, rights_notes | One canonical project, ownership separate from credits |
| project_media | id, project_id, provider, provider_media_id, canonical_url | Unique(provider, provider_media_id) prevents duplicate YouTube uploads |
| project_credits | id, project_id, display_name, role, verified_creator_id (nullable), attribution_status | A credit may exist without an account; one person can have multiple roles |
| credit_match_requests | id, project_id, credit_id, claimant_user_id, involvement, status, submitted_at | No public claim until approved |
| credit_match_evidence | id, request_id, private_storage_key, metadata | Private storage and scoped access, never public URLs |
| credit_match_confirmations | id, request_id, responder_user_id, decision, created_at | Manager's answer is evidence, not a final veto |
| credit_match_reviews | id, request_id, reviewer_user_id, decision, reason, created_at | Independent decision, record rationale |
| credit_match_appeals | id, request_id, appellant_user_id, status, resolution | Support disputed decisions |
| notifications | id, recipient_user_id, event_type, reference_id, read_at | No fake notification in frontend |
| audit_events | id, actor_user_id, entity_type, entity_id, action, before_json, after_json, created_at | Append-only, restricted |
| collections / collection_items | id, user_id, name / collection_id, entity_type, entity_id | Unique user ownership; references canonical IDs |

**Featured In** should query approved `project_credits.verified_creator_id` links, not copy the project or grant edit permission. Existing `approved === true` rendering can be adapted through a view/DTO while retaining its behavior. The project manager and rights holder remain separate from verified contributors.

## API contract proposal (not implemented)

- `POST /api/projects/lookup` with `{ youtubeUrl, submitterName }` → `{ kind: "invalid"|"new"|"duplicate"|"credit-match", project?: {id,title}, credits?: [{id,name,role}] }`. This response is a **hint**, not verification.
- `POST /api/credit-match-requests` authenticated, with `{projectId,creditId,involvement,notes}` → `{requestId,status:"pending"}`. Enforce rate limits, idempotency, server-side URL/credit revalidation, and permission checks.
- `POST /api/credit-match-requests/:id/confirmations` authenticated authorized manager only; choices yes/no/cannot_confirm.
- `POST /api/credit-match-requests/:id/evidence` authenticated claimant, signed private upload flow; malware checks and access control.
- `POST /api/credit-match-requests/:id/reviews` restricted reviewer only; approved/rejected/needs_more_information.
- `POST /api/credit-match-requests/:id/appeals` authenticated claimant, within defined policy window.
- `GET /api/creators/:id/featured-in` returns project references and actual approved roles, no project duplication.
- `GET/POST/PATCH/DELETE /api/me/collections` and item operations, authenticated and owner-scoped.

Use consistent DTOs; don't return private evidence or review notes to public clients. Use server-derived user IDs, never accept claimant identity from a form field.

## Request lifecycle

`candidate → pending_claimant → awaiting_manager_confirmation → under_review → approved | rejected | needs_more_information → appealed → resolved`.

No manager response after a defined interval should move to independent review, not auto-approve or permanently block. Approval atomically links the verified creator to the **existing credit**, with audit record and no change to project ownership. Name matching alone must never set `verified_creator_id`. Rejections and uncertain responses do not link anything. Option C attribution corrections are a separate independently reviewed action.

## Security and rollout gates

1. Enable authentication and strict row-level access policies before public use. Public projects/approved credits may be readable; claims, evidence, confirmations, and audits are restricted.
2. Enforce canonical YouTube provider IDs on the server with unique database constraints and transactional duplicate checks. Client-only checks are advisory.
3. Add moderation/abuse limits, evidence retention/deletion rules, notification delivery, and review/appeal permissions.
4. Migrate `data.js` project and creator IDs with an explicit ID map, preserve artwork and credits; never treat demo records as verified.
5. Replace only the `credit-match-data.js` adapter and read models first; keep `credit-match.js`, existing Credits and Featured In rendering compatible.
6. Run tests for concurrent duplicate submissions, spoofed names, unauthorized confirmations, missing managers, disputes, appeal, evidence privacy, and existing portfolio regression.
7. Deploy behind a feature flag; test on 320, 375, 390, 430, 768, 1024, 1440, 1920 px widths and with keyboard/screen reader.

No production database or backend has been provisioned by this work.
