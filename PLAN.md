# Golden Land Real Estate — Implementation Plan

## Context
Rebuilding a real estate website for Golden Land Real Estate. Migrating from ApostropheCMS (MongoDB) to Next.js (App Router) + PostgreSQL. Existing data: ~7,953 properties, 57 agents, 37K+ images, 237 contact forms.

---

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon cloud) + Prisma ORM
- **Auth**: NextAuth.js v5 (credentials + Google OAuth)
- **Image Storage**: Cloudflare R2 (S3-compatible, no egress fees)
- **Hosting**: Vercel + Neon PostgreSQL
- **Key Libraries**: Zod (validation), react-hook-form (forms), Radix UI (accessible primitives), @aws-sdk/client-s3 (R2 uploads), lucide-react (icons), sonner (toasts), Resend (emails)

---

## Pages
| Page | Route | Auth |
|------|-------|------|
| Home | `/` | Public |
| About Us | `/about` | Public |
| Agents | `/agents` | Public |
| Agent Profile | `/agents/[id]` | Public |
| Properties | `/properties` | Public |
| Property Detail | `/properties/[id]` | Public |
| Login | `/auth/login` | Public |
| Register | `/auth/register` | Public |
| Dashboard | `/dashboard` | User |
| My Properties | `/dashboard/my-properties` | User |
| Submit Property | `/dashboard/submit-property` | User |
| Favorites | `/dashboard/favorites` | User |
| Admin Overview | `/admin` | Admin |
| Manage Properties | `/admin/properties` | Admin |
| Review Submissions | `/admin/properties/pending` | Admin |
| Add Property | `/admin/properties/new` | Admin |
| Manage Agents | `/admin/agents` | Admin |
| Contact Submissions | `/admin/contacts` | Admin |
| Manage Users | `/admin/users` | Admin |

---

## Project Structure

```
golden-real-estate/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                   # Countries, regions
│   └── migrations/
├── scripts/
│   └── migrate-data.ts           # Migration script: MongoDB JSON → PostgreSQL
├── public/images/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (Navbar + Footer)
│   │   ├── page.tsx              # Home
│   │   ├── globals.css
│   │   ├── about/page.tsx
│   │   ├── agents/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── properties/
│   │   │   ├── page.tsx          # Listings + search/filter
│   │   │   └── [id]/page.tsx     # Detail (SSR for SEO)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # Sidebar + auth guard
│   │   │   ├── page.tsx
│   │   │   ├── my-properties/page.tsx
│   │   │   ├── submit-property/page.tsx
│   │   │   └── favorites/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin sidebar + admin auth guard
│   │   │   ├── page.tsx          # Overview/stats
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx      # All properties management
│   │   │   │   ├── pending/page.tsx  # Submissions review
│   │   │   │   └── new/page.tsx  # Add property
│   │   │   ├── agents/
│   │   │   │   └── page.tsx      # Agent management
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx      # Contact submissions
│   │   │   └── users/
│   │   │       └── page.tsx      # User management
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── properties/route.ts        # GET (search), POST (create)
│   │       ├── properties/[id]/route.ts   # GET, PUT, DELETE
│   │       ├── properties/favorites/route.ts
│   │       ├── agents/route.ts
│   │       ├── contact/route.ts
│   │       ├── upload/route.ts
│   │       ├── locations/route.ts
│   │       └── admin/
│   │           ├── stats/route.ts
│   │           ├── contacts/route.ts
│   │           ├── contacts/[id]/route.ts
│   │           └── users/[id]/role/route.ts
│   ├── components/
│   │   ├── ui/         # Button, Input, Select, Slider, Modal, Card, Badge, Skeleton, Pagination, ImageGallery
│   │   ├── layout/     # Navbar, Footer, MobileMenu, DashboardSidebar
│   │   ├── property/   # PropertyCard, PropertyGrid, PropertySearchBar, PropertyFilters, PropertyDetail, PropertyForm, PropertyImageUpload
│   │   ├── home/       # HeroSection, FeaturedProperties, StatsSection
│   │   ├── agent/      # AgentCard, ContactAgentForm
│   │   ├── auth/       # LoginForm, RegisterForm, AuthGuard
│   │   └── admin/      # AdminSidebar, StatsCard, PropertyTable, AgentForm, ContactTable, UserTable
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── auth.ts          # NextAuth config
│   │   ├── r2.ts            # Cloudflare R2 client + upload helpers
│   │   ├── validators.ts    # Zod schemas
│   │   ├── utils.ts         # formatPrice, slugify, etc.
│   │   └── constants.ts     # Property types hierarchy, countries
│   ├── hooks/
│   │   ├── usePropertySearch.ts  # URL-synced search state
│   │   ├── useFavorites.ts
│   │   └── useDebounce.ts
│   └── types/index.ts
```

---

## Database Schema (Prisma)

**Models:**
- `User` — id, name, email, passwordHash, role (USER/AGENT/ADMIN), phone
- `Account`, `Session`, `VerificationToken` — NextAuth required
- `Country` — id, name, slug
- `Region` — id, name, slug, countryId → Country
- `Property` — id, referenceNumber (unique, preserves existing `reference` field), title, slug, description, price, currency, category (FOR_SALE/FOR_RENT), propertyGroup (RESIDENTIAL/COMMERCIAL/LANDS), propertyType (string — "Apartment", "Villa", etc.), status (ACTIVE/PENDING/SOLD/UNDER_OFFER/INACTIVE), regionId, addressLine, latitude, longitude, bedrooms, bathrooms, parkings, areaSqm, floor, totalFloors, yearBuilt, furnished, waterfront, view, builtIn, features (JSON), commission, userId, agentId (→ AgentProfile), isFeatured, views, createdAt, updatedAt
- `PropertyImage` — id, propertyId, url, altText, order
- `Favorite` — userId + propertyId (unique pair)
- `ContactRequest` — propertyId, name, email, phone, message, createdAt
- `AgentProfile` — id, userId (optional), firstName, lastName, email, phone, bio, photoUrl

**Key design decisions:**
- `propertyType` is a string (not enum) — validated via Zod at app layer. Subtypes are numerous and may change.
- Location is Country → Region (two tables, extensible without migrations)
- `features` is JSON array for flexible amenities (pool, garage, etc.)
- `parkings` field added (exists in old data as `numberOfParkings`)
- `waterfront`, `view`, `builtIn` kept as boolean fields (from old data)
- `commission` kept (Decimal) for agent commission tracking
- `latitude`/`longitude` preserved from old data (useful for future map view)
- `AgentProfile` doesn't require a User account — old agents are imported as profiles linked to properties via `agentId`

---

## Data Migration Strategy

### Source Data (ApostropheCMS / MongoDB)
- **Location**: `goldenland-real-estate/aposDocs.json` (~70MB) and `aposAttachments.json` (~17MB)
- **Properties**: 7,953 total (5,549 active, 2,404 trashed)
- **Agents**: 57
- **Images**: 37K+ attachments
- **Contact Forms**: 237
- **Decision**: Migrate everything (trashed → INACTIVE status)

### Source → Target Field Mapping

| Old (MongoDB/ApostropheCMS) | New (PostgreSQL/Prisma) |
|---|---|
| `title` | `title` |
| `slug` | `slug` |
| `price` | `price` |
| `status`: forSale/forRent | `category`: FOR_SALE/FOR_RENT |
| `status`: sold/underOffer | `status`: SOLD/UNDER_OFFER |
| `numberOfRooms` | `bedrooms` |
| `numberOfBathrooms` | `bathrooms` |
| `numberOfParkings` | `parkings` |
| `space` | `areaSqm` |
| `city` | → lookup/create Region |
| `country` | → lookup/create Country |
| `district` | `addressLine` |
| `mapLatitude`/`mapLongitude` | `latitude`/`longitude` |
| `reference` | `referenceNumber` |
| `description` (nested area→rich-text) | `description` (extract HTML from ApostropheCMS area) |
| `waterfront`/`view`/`builtIn` | `waterfront`/`view`/`builtIn` (convert "yes"→true, ""→false) |
| `features` array | `features` JSON |
| `commission` | `commission` |
| `agentId` | `agentId` (mapped to new AgentProfile.id) |
| `published` + `trash` | `status` (ACTIVE if published+!trash, INACTIVE otherwise) |

### Auto-Classification (title keyword parsing)

| Title keyword | propertyGroup | propertyType |
|---|---|---|
| apartment, flat | RESIDENTIAL | Apartment |
| villa | RESIDENTIAL | Villa |
| duplex | RESIDENTIAL | Duplex |
| studio | RESIDENTIAL | Studio |
| chalet | RESIDENTIAL | Chalet |
| house | RESIDENTIAL | House |
| penthouse | RESIDENTIAL | Penthouse |
| townhouse | RESIDENTIAL | Townhouse |
| office | COMMERCIAL | Office |
| shop | COMMERCIAL | Shop |
| warehouse | COMMERCIAL | Warehouse |
| commercial | COMMERCIAL | Other |
| land, plot, lot | LANDS | Other |
| _(no match)_ | RESIDENTIAL | Other |

### Migration Script (`scripts/migrate-data.ts`)
1. Read `aposDocs.json`, filter by `type: "property"`
2. Extract unique countries/cities → create Country + Region records
3. Filter by `type: "agent"` → create AgentProfile records
4. For each property:
   - Map fields per table above
   - Parse title for auto-classification
   - Extract description HTML from nested ApostropheCMS area structure
   - Resolve agent reference
   - Create Property record
5. For each property's images:
   - Cross-reference `aposAttachments.json` for image metadata
   - Upload original image files to Cloudflare R2
   - Create PropertyImage records with R2 URLs
6. Filter by `type: "contact-form"` → create ContactRequest records
7. Log migration summary (migrated counts, skipped, errors)

### Migration Order
1. Countries + Regions (from unique country/city values)
2. AgentProfiles (from agent documents)
3. Properties (with classification + field mapping)
4. PropertyImages (upload to R2 + create records)
5. ContactRequests

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/properties` | Search/filter/paginate. Params: q, category, propertyGroup, propertyType, countryId, regionId, minPrice, maxPrice, minArea, maxArea, bedrooms, bathrooms, ref, sort, page, limit |
| POST | `/api/properties` | Create listing (auth required, status=PENDING) |
| GET | `/api/properties/[id]` | Single property (increments views) |
| PUT | `/api/properties/[id]` | Update (owner/admin) |
| DELETE | `/api/properties/[id]` | Delete (owner/admin) |
| GET/POST/DELETE | `/api/properties/favorites` | Manage user favorites |
| GET | `/api/agents` | List agents |
| GET | `/api/agents/[id]` | Agent profile + their listings |
| POST | `/api/contact` | Submit inquiry |
| GET | `/api/locations` | Country → Region tree |
| POST | `/api/upload` | Image upload to R2 |
| GET | `/api/admin/stats` | Dashboard stats (counts, recent activity) |
| PATCH | `/api/properties/[id]/status` | Change property status (approve/reject/feature) |
| GET | `/api/admin/contacts` | List all contact submissions with read status |
| PATCH | `/api/admin/contacts/[id]` | Mark contact as read/responded |
| PATCH | `/api/admin/users/[id]/role` | Change user role |

---

## Property Search Architecture

- **Search state lives in URL params** (bookmarkable, shareable, SSR-friendly)
- `usePropertySearch` hook reads from `searchParams`, pushes to `router.push()` with shallow nav
- Cascading filters: Country → Region (dynamic from DB), PropertyGroup → PropertyType (from `constants.ts`)
- Price range slider: $0 → $10,000,000
- Area slider: 0 → 10,000 sqm
- Keyword search: case-insensitive on title, description, addressLine
- Reference number: exact match on `referenceNumber`

---

## Implementation Phases

### Phase 1: Foundation + Migration
- Init Next.js + Tailwind + TypeScript + Prisma
- Write schema.prisma (with all fields from old data), run migration
- Set up Cloudflare R2 bucket
- Build migration script (`scripts/migrate-data.ts`)
- Run migration: import all 7,953 properties, 57 agents, 37K images, 237 contacts
- Verify migrated data counts and integrity
- Set up NextAuth (credentials + Google)
- Build Navbar (responsive + mobile menu) + Footer
- Home page (static hero placeholder)
- About page
- Login + Register pages with working auth
- Set up lib/ utilities (prisma.ts, auth.ts, r2.ts, constants.ts, validators.ts)

### Phase 2: Properties Core
- `GET /api/properties` with full search/filter/pagination
- `GET /api/properties/[id]`
- Properties listing page with all filters (location, category, type, beds, baths, price slider, area slider)
- PropertyCard, PropertyGrid, ViewToggle (grid/list), Pagination
- Property Detail page (SSR + SEO metadata)
- ImageGallery with lightbox
- Build UI primitives: Slider, Select, Badge, Skeleton

### Phase 3: User Dashboard & Submissions
- Image upload to R2
- POST/PUT/DELETE property API routes with Zod validation
- Dashboard layout + sidebar
- Submit Property form (multi-section)
- My Properties page (edit/delete)
- Auto-generate referenceNumber for new properties ("GL-XXXXX")
- AuthGuard for protected routes

### Phase 4: Admin Dashboard
- Admin layout with sidebar + AdminGuard (checks role === ADMIN)
- Admin overview page — stats cards (total properties, agents, users, recent inquiries)
- `GET /api/admin/stats` — dashboard stats endpoint
- Property management page — view/edit/delete all properties, toggle featured
- `PATCH /api/properties/[id]/status` — change property status (approve/reject/feature)
- Submission review page — approve or reject PENDING user-submitted listings
- Agent management page — add/edit/remove agent profiles, upload photos
- Contact submissions page — view all inquiries, mark as read/responded
- `GET /api/admin/contacts` + `PATCH /api/admin/contacts/[id]`
- User management page — view users, change roles (User/Agent/Admin)
- `PATCH /api/admin/users/[id]/role`
- All admin API routes check session role before processing

### Phase 5: Favorites, Contact, Agents
- Favorites API + FavoriteButton + useFavorites hook
- Favorites dashboard page
- Contact form + email via Resend
- Agents listing page
- Agent profile page (bio + listings)

### Phase 6: Polish & Deploy
- SEO: generateMetadata, sitemap.xml, robots.txt, JSON-LD
- next/image optimization everywhere
- Loading skeletons + Suspense boundaries
- error.tsx + not-found.tsx pages
- Toast notifications
- Responsive design audit
- Deploy to Vercel + connect Neon DB + R2

---

## Verification
```bash
npm run build && npm run lint
```
