# Plan: Clickable agent cards + agent listings

Goal: make agent cards clickable again; each agent's page shows their listings.
Status: **approved, not yet implemented** (awaiting explicit go).

## Root cause discovered

The agent→listing link was never a UI problem — it's a **data** problem. The
ApostropheCMS migration never copied the source `property.agent` value into the
new `properties.agentId` field. Only 6 of 7,955 properties have an `agentId`
today, and all 6 are inactive/trashed. That's why the profile page was killed in
`53724bf` (every agent was empty).

The source is fully intact: `aposDocs` (type `property`) has a valid `agent`
string on 7,949 of 7,953 docs. Re-running the mapping fixes everything.

### Payoff (active, non-trash listings after backfill)

| Agent | Active listings |
|---|---|
| Michel Boutros | 1,757 |
| Golden Land (house account — kept) | 1,582 |
| Elias Ghattas | 282 |
| Ali El Masri | 235 |
| Riad Najem | 160 |
| Fuad Mubayed | 41 |

4,057 of 5,062 active listings land on visible agents. The other 1,005 map to
**trashed** agents — they keep a truthful `agentId` but show on no agent page
(`getAgentById` filters `trash`), so no card leaks.

## Decisions

- Scope: **active, non-trash only** (5,062). Inactive/pre-2022 archive stays hidden
  (it's the known duplicate bucket: 217 internal ref-number collisions among the
  703 that map to visible agents — not worth surfacing, near-zero value to real agents).
- Trashed-agent listings: keep truthful `agentId`, agent stays hidden.
- Duplicates: dedupe the empty second "Michel Boutros" doc (`ckww7e5t8…`, 0 listings);
  keep the populated one (`ckww4ow4m…`, 1,757). Confirm by email/phone/photo before trashing.
- Listing volume: **paginate** the agent page (~24/page). Do NOT render all 1,757.
- AgentCard: **keep contact buttons AND make the card clickable** (buttons stop
  propagation). Applies on both the /agents grid and the property detail page.
- Golden Land: **keep** as an agent card.

## Phase 1 — Data (do first, verify before UI)

1. Write migration: set `properties.agentId` from `aposDocs.property.agent` for
   `status: "ACTIVE", trash: { $ne: true }` (5,062 docs). Idempotent + reversible;
   dry-run count first.
2. Dedupe: verify then trash the empty duplicate "Michel Boutros" agent doc.
3. Verify: re-run the per-agent count; confirm the payoff table above.

## Phase 2 — UI (after data verified)

4. Restore deleted files (from `53724bf~1`): `src/app/agents/[id]/{page,loading,not-found}.tsx`,
   `src/components/seo/AgentJsonLd.tsx`.
5. Add **pagination** to the agent page: `getPropertiesByAgentId` gains skip/limit +
   total count; page reads `?page=N`; reuse the existing properties Pagination component.
6. `AgentCard`: make clickable (link to `/agents/[id]`), keep WhatsApp/Call/Email
   buttons with `stopPropagation`.
7. Re-add agent URLs to `src/app/sitemap.ts`.

## Known side effects (expected)

- Property detail pages will now show an agent card for ~4,057 active listings
  (previously ~0). Trashed agents excluded.
- Agent pages remain ACTIVE-only; SOLD (73) / UNDER_OFFER (2) not shown — possible
  later enhancement.
