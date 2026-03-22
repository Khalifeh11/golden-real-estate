# Task Division — 2 People

## What's Already Done
- Mongoose models (Property, Agent, User, ContactRequest) — all complete
- DB connection singleton (`lib/mongodb.ts`)
- Migration script (`scripts/migrate-mongo.ts`) — production-ready, not yet run
- Next.js 16 + Tailwind + TypeScript scaffolded
- No components, no API routes, no pages, no auth yet

## Remaining Dependencies (install together)
NextAuth v5, Zod, react-hook-form, Radix UI, @aws-sdk/client-s3, lucide-react, sonner, Resend, bcrypt

---

## Shared Setup (do together first, ~1 session)
Before splitting, both people should align on:
1. Install all remaining dependencies
2. `lib/constants.ts` — property types hierarchy, countries list
3. `lib/utils.ts` — formatPrice, slugify, helpers
4. `lib/validators.ts` — Zod schemas (both people will use these)
5. `types/index.ts` — shared TypeScript types
6. `lib/auth.ts` — NextAuth config (credentials provider, session strategy)
7. `api/auth/[...nextauth]/route.ts`
8. Seed script for initial admin user
9. Run migration script against the database

---

## Person A: Public Site + Properties

Everything the visitor sees. Works top-down from layout → pages → components.

### Phase 1 — Layout & Static Pages
- [ ] `components/layout/Navbar.tsx` — responsive, mobile menu, links
- [ ] `components/layout/Footer.tsx`
- [ ] `components/layout/MobileMenu.tsx`
- [ ] Wire Navbar + Footer into root `layout.tsx`
- [ ] Home page (`app/page.tsx`) — hero section, featured properties, stats
- [ ] `components/home/HeroSection.tsx`
- [ ] `components/home/FeaturedProperties.tsx`
- [ ] `components/home/StatsSection.tsx`
- [ ] About page (`app/about/page.tsx`)

### Phase 2 — Properties (the core feature)
- [ ] UI primitives: Button, Input, Select, Slider, Badge, Skeleton, Pagination, Modal, Card
- [ ] `GET /api/properties` — search/filter/paginate endpoint
- [ ] `GET /api/properties/[id]` — single property (increments views)
- [ ] `GET /api/locations` — distinct countries + cities tree
- [ ] `components/property/PropertyCard.tsx`
- [ ] `components/property/PropertyGrid.tsx` + view toggle (grid/list)
- [ ] `components/property/PropertySearchBar.tsx`
- [ ] `components/property/PropertyFilters.tsx`
- [ ] `hooks/usePropertySearch.ts` — URL-synced search state
- [ ] `hooks/useDebounce.ts`
- [ ] Properties listing page (`app/properties/page.tsx`)
- [ ] Property detail page (`app/properties/[id]/page.tsx`) — SSR + SEO metadata
- [ ] `components/ui/ImageGallery.tsx` — lightbox

### Phase 3 — Agents & Contact (public side)
- [ ] Agents listing page (`app/agents/page.tsx`)
- [ ] `components/agent/AgentCard.tsx`
- [ ] Agent profile page (`app/agents/[id]/page.tsx`) — bio + their listings
- [ ] `GET /api/agents` + `GET /api/agents/[id]`
- [ ] Contact form component (`components/agent/ContactAgentForm.tsx`)
- [ ] `POST /api/contact` — submit inquiry + email via Resend

### Phase 4 — Polish
- [ ] SEO: `generateMetadata` on all pages, sitemap.xml, robots.txt, JSON-LD
- [ ] Loading skeletons + Suspense boundaries
- [ ] `error.tsx` + `not-found.tsx` pages
- [ ] Responsive design audit

---

## Person B: Admin Panel + Auth

Everything behind login. Works from auth → layout → CRUD pages.

### Phase 1 — Auth
- [ ] Login page (`app/auth/login/page.tsx`)
- [ ] `components/auth/LoginForm.tsx`
- [ ] `components/auth/AuthGuard.tsx` — wraps admin routes, checks session/role

### Phase 2 — Admin Foundation
- [ ] Admin layout (`app/admin/layout.tsx`) — sidebar + auth guard
- [ ] `components/admin/AdminSidebar.tsx`
- [ ] Admin overview page (`app/admin/page.tsx`) — stats cards
- [ ] `components/admin/StatsCard.tsx`
- [ ] `GET /api/admin/stats` — dashboard stats (MongoDB aggregation)

### Phase 3 — Property Management (CRUD)
- [ ] `POST /api/properties` — create listing (auth required, Zod validation)
- [ ] `PUT /api/properties/[id]` — update (auth required)
- [ ] `DELETE /api/properties/[id]` — delete (admin only)
- [ ] `PATCH /api/properties/[id]/status` — change status (approve/reject/feature)
- [ ] Auto-generate referenceNumber ("GL-XXXXX") for new properties
- [ ] `POST /api/upload` — image upload to R2
- [ ] `lib/r2.ts` — Cloudflare R2 client + upload helpers
- [ ] `components/property/PropertyForm.tsx` — multi-section form (fields vary by propertyGroup)
- [ ] `components/property/PropertyImageUpload.tsx`
- [ ] Property management page (`app/admin/properties/page.tsx`) — table, edit/delete, toggle featured
- [ ] `components/admin/PropertyTable.tsx`
- [ ] Add property page (`app/admin/properties/new/page.tsx`)

### Phase 4 — Agent, Contact & User Management
- [ ] Agent management page (`app/admin/agents/page.tsx`) — add/edit/remove, upload photos
- [ ] `components/admin/AgentForm.tsx`
- [ ] Contact submissions page (`app/admin/contacts/page.tsx`) — view all, mark read/responded
- [ ] `components/admin/ContactTable.tsx`
- [ ] `GET /api/admin/contacts` + `PATCH /api/admin/contacts/[id]`
- [ ] User management page (`app/admin/users/page.tsx`) — create users, change roles
- [ ] `components/admin/UserTable.tsx`
- [ ] `POST /api/admin/users` + `PATCH /api/admin/users/[id]/role`

### Phase 5 — Polish
- [ ] Toast notifications (sonner) for all admin actions
- [ ] Form validation UX (react-hook-form + Zod error display)
- [ ] Image upload to R2 (when R2 bucket is ready)

---

## Dependency Map (what blocks what)

```
Shared Setup (auth, types, validators, constants)
    ├── Person A can start immediately after
    │   └── Properties API needed before Properties pages
    │   └── Agents API needed before Agent pages
    └── Person B can start immediately after
        └── Auth needed before Admin layout
        └── Admin layout needed before all admin pages
        └── Property write APIs independent of read APIs
```

**Key coordination points:**
1. Person A builds `GET` property/agent routes; Person B builds `POST/PUT/DELETE` routes on the same files → agree on file structure upfront
2. Both share `components/ui/` primitives — Person A builds them first, Person B reuses
3. Person B's `PropertyForm` reuses Person A's UI primitives (Button, Input, Select, etc.)
4. `PropertyCard` (Person A) is reused in admin property listing (Person B) — coordinate

## Suggested Workflow
- Shared setup on day 1 together
- Then work in parallel, merging frequently
- Person A starts with layout + home page → properties
- Person B starts with login + admin layout → property CRUD
- Meet up when Person A finishes UI primitives (Person B needs them for forms)
