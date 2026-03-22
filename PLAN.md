# Golden Land Real Estate — Implementation Plan

## Context
Rebuilding a real estate website for Golden Land Real Estate. Migrating from ApostropheCMS to Next.js (App Router). Keeping MongoDB as the database — the data is already there, and the semi-structured nature of real estate listings (different fields per property type) fits MongoDB naturally. Existing data: ~7,953 properties, 57 agents, 37K+ images, 236 contact forms.

---

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas (migrating existing data from ApostropheCMS MongoDB)
- **ODM**: Mongoose
- **Auth**: NextAuth.js v5 (credentials + Google OAuth)
- **Image Storage**: Cloudflare R2 (S3-compatible, no egress fees)
- **Hosting**: Vercel + MongoDB Atlas
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
├── scripts/
│   ├── cleanup-data.ts              # Cleanup script: strip CMS internals, fix types, rename fields
│   └── upload-images.ts             # Batch upload images to R2 (run on cloud VM)
├── public/images/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout (Navbar + Footer)
│   │   ├── page.tsx                 # Home
│   │   ├── globals.css
│   │   ├── about/page.tsx
│   │   ├── agents/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── properties/
│   │   │   ├── page.tsx             # Listings + search/filter
│   │   │   └── [id]/page.tsx        # Detail (SSR for SEO)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx           # Sidebar + auth guard
│   │   │   ├── page.tsx
│   │   │   ├── my-properties/page.tsx
│   │   │   ├── submit-property/page.tsx
│   │   │   └── favorites/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx           # Admin sidebar + admin auth guard
│   │   │   ├── page.tsx             # Overview/stats
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx         # All properties management
│   │   │   │   ├── pending/page.tsx # Submissions review
│   │   │   │   └── new/page.tsx     # Add property
│   │   │   ├── agents/
│   │   │   │   └── page.tsx         # Agent management
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx         # Contact submissions
│   │   │   └── users/
│   │   │       └── page.tsx         # User management
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── properties/route.ts         # GET (search), POST (create)
│   │       ├── properties/[id]/route.ts    # GET, PUT, DELETE
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
│   │   ├── mongodb.ts       # Mongoose connection singleton
│   │   ├── auth.ts          # NextAuth config
│   │   ├── r2.ts            # Cloudflare R2 client + upload helpers
│   │   ├── validators.ts    # Zod schemas (per-type validation)
│   │   ├── utils.ts         # formatPrice, slugify, etc.
│   │   └── constants.ts     # Property types hierarchy, countries
│   ├── models/
│   │   ├── Property.ts      # Mongoose schema + model
│   │   ├── Agent.ts         # Mongoose schema + model
│   │   ├── User.ts          # Mongoose schema + model
│   │   ├── Favorite.ts      # Mongoose schema + model
│   │   └── ContactRequest.ts # Mongoose schema + model
│   ├── hooks/
│   │   ├── usePropertySearch.ts  # URL-synced search state
│   │   ├── useFavorites.ts
│   │   └── useDebounce.ts
│   └── types/index.ts
```

---

## Database Schema (Mongoose)

### Property
```ts
{
  title: String,              // required
  slug: String,               // required, unique
  referenceNumber: String,    // unique, sparse (old `reference` or auto-generated "GL-XXXXX")
  description: String,        // extracted HTML from ApostropheCMS area blocks
  price: Number,              // converted from string
  currency: String,           // default "USD"
  category: String,           // "FOR_SALE" | "FOR_RENT" — derived from old `status`
  propertyGroup: String,      // "RESIDENTIAL" | "COMMERCIAL" | "LAND" — auto-classified from title
  propertyType: String,       // "Apartment" | "Villa" | "Land" | etc. — auto-classified from title
  status: String,             // "ACTIVE" | "PENDING" | "SOLD" | "UNDER_OFFER" | "INACTIVE"
  country: String,            // normalized casing
  city: String,               // from old `city`
  district: String,           // from old `district`
  latitude: Number,           // converted from string
  longitude: Number,          // converted from string
  bedrooms: Number,           // only present for residential (old `numberOfRooms`)
  bathrooms: Number,          // only present for residential (old `numberOfBathrooms`)
  parkings: Number,           // optional (old `numberOfParkings`)
  areaSqm: Number,            // converted from string (old `space`)
  yearBuilt: Number,          // optional
  furnished: Boolean,         // optional
  waterfront: Boolean,        // optional
  view: String,               // optional
  features: [String],         // flexible array
  images: [{                  // replaces ApostropheCMS area structure
    url: String,              // R2 URL
    thumbnailUrl: String,     // R2 thumbnail URL
    altText: String,
    order: Number
  }],
  agentId: ObjectId,          // ref → Agent
  userId: ObjectId,           // ref → User (for user-submitted properties)
  commission: Number,         // optional, percentage
  isFeatured: Boolean,        // default false
  views: Number,              // default 0
  createdAt: Date,            // preserved from old data
  updatedAt: Date
}
```

Documents only contain the fields they have — a land listing won't have `bedrooms`, `bathrooms`, or `furnished`. No nulls, no wasted fields.

### Agent
```ts
{
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  bio: String,
  photoUrl: String,           // R2 URL (migrated from old thumbnail)
  createdAt: Date,
  updatedAt: Date
}
```

### User
```ts
{
  name: String,
  email: String,              // unique
  passwordHash: String,
  image: String,              // Google OAuth avatar
  role: String,               // "USER" | "AGENT" | "ADMIN", default "USER"
  phone: String,
  // NextAuth fields:
  emailVerified: Date,
  accounts: [{ provider, providerAccountId, ... }]
}
```

### Favorite
```ts
{
  userId: ObjectId,           // ref → User
  propertyId: ObjectId,       // ref → Property
  createdAt: Date
}
// Compound unique index on { userId, propertyId }
```

### ContactRequest
```ts
{
  propertyId: ObjectId,       // ref → Property (optional — general inquiries)
  propertySlug: String,       // preserved from old data (old contact forms reference by slug)
  name: String,
  email: String,
  phone: String,
  message: String,
  isRead: Boolean,            // default false
  isResponded: Boolean,       // default false
  createdAt: Date
}
```

### Indexes
```
Property: { slug: 1 } unique
Property: { category: 1, status: 1, country: 1, city: 1 }
Property: { propertyGroup: 1, propertyType: 1 }
Property: { price: 1 }
Property: { areaSqm: 1 }
Property: { agentId: 1 }
Property: { title: "text", description: "text" }   // text search
Favorite: { userId: 1, propertyId: 1 } unique
ContactRequest: { createdAt: -1 }
User: { email: 1 } unique
```

---

## Data Cleanup Strategy

### What Changed (vs old PostgreSQL plan)
Instead of a full ETL migration to a new database, we clean up the existing MongoDB data in-place. The data stays in MongoDB — we just strip ApostropheCMS cruft and reshape documents.

### Cleanup Script (`scripts/cleanup-data.ts`)

Runs directly against the MongoDB database. Operations:

1. **Strip ApostropheCMS internal fields** from all property documents:
   - Remove: `type`, `titleSortified`, `highSearchText`, `lowSearchText`, `highSearchWords`, `searchSummary`, `historicUrls`, `advisoryLock`, `docPermissions`, `viewGroupsIds`, `editGroupsIds`, `viewUsersIds`, `editUsersIds`, `tags` (always empty)
   - Remove redundant: `agent` (duplicate of `agentId`), `area` (duplicate of `space`)

2. **Rename fields:**
   - `numberOfRooms` → `bedrooms`
   - `numberOfBathrooms` → `bathrooms`
   - `numberOfParkings` → `parkings`
   - `space` → `areaSqm`
   - `mapLatitude` → `latitude`
   - `mapLongitude` → `longitude`
   - `reference` → `referenceNumber`

3. **Convert types** (strings → numbers):
   - `price`: string → Number
   - `bedrooms`, `bathrooms`, `parkings`: string → Number
   - `areaSqm`: string → Number
   - `latitude`, `longitude`: string → Number
   - `commission`: string → Number

4. **Derive new fields from old `status`:**
   - `forSale` → `category: "FOR_SALE"`, `status: "ACTIVE"`
   - `forRent` → `category: "FOR_RENT"`, `status: "ACTIVE"`
   - `sold` → `category: "FOR_SALE"`, `status: "SOLD"`
   - `underOffer` → `category: "FOR_SALE"`, `status: "UNDER_OFFER"`
   - null/missing → `category: null`, `status: "INACTIVE"`
   - `trash: true` → `status: "INACTIVE"` (regardless of old status)

5. **Normalize country names:** lowercase → title case (`"lebanon"` → `"Lebanon"`, `"greece"` → `"Greece"`)

6. **Auto-classify property type from title** (same logic as before):
   - Parse title for keywords → set `propertyGroup` + `propertyType`

7. **Extract description HTML** from ApostropheCMS area structure:
   - `description[].content` (where `type === "apostrophe-rich-text"`) → concatenate into single HTML string

8. **Add defaults:**
   - `isFeatured: false`, `views: 0`, `currency: "USD"`

9. **Clean up agent documents** similarly (strip CMS internals, keep profile fields)

10. **Clean up contact-form documents** (rename to match ContactRequest schema)

### Cleanup Order
1. Agents (strip CMS fields, reshape)
2. Properties (full cleanup as above)
3. Contact forms (reshape)
4. Drop unused collections/document types (`apostrophe-image`, `apostrophe-user`, `apostrophe-group`, `apostrophe-global`, page documents)
5. Create indexes

---

## Image Migration Strategy

### Current State
- **~36GB of image files** in 6 tar archives on SwissTransfer (expires in ~15 days)
- **37,409 attachment metadata records** in `aposAttachments` collection
- **Three-layer reference chain:** Property → `apostrophe-image` doc → `aposAttachments` doc → filename
- Average image: 611KB, range: 125px–10,704px wide

### Plan

**Step 1 — Preserve (immediate):**
Download all 6 tar files locally. Don't extract, just save. This is your backup.

**Step 2 — Upload to R2 (when ready, via cloud VM):**
1. Spin up a cheap cloud VM (e.g., Hetzner CX22, ~$4/mo)
2. Download tars to VM, extract
3. Run `scripts/upload-images.ts`:
   - Read `aposAttachments` metadata to map attachment ID → filename
   - Resolve the reference chain: Property → `apostrophe-image` doc → attachment → actual file
   - For each image:
     - Resize to max 2000px wide (full gallery)
     - Generate 400px thumbnail
     - Convert to WebP where possible
     - Upload both sizes to R2: `properties/{propertyId}/{order}.jpg` + `properties/{propertyId}/{order}-thumb.jpg`
   - Update property documents with R2 URLs in the new `images` array format
4. Tear down VM

**Step 3 — Estimated result:**
- Raw: ~36GB → Optimized: ~12-15GB on R2
- Cost: ~$0.18-0.23/mo storage, $0 egress

**During development:** Use placeholder images. No need for 37K images locally.

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/properties` | Search/filter/paginate. Params: q, category, propertyGroup, propertyType, country, city, minPrice, maxPrice, minArea, maxArea, bedrooms, bathrooms, ref, sort, page, limit |
| POST | `/api/properties` | Create listing (auth required, status=PENDING) |
| GET | `/api/properties/[id]` | Single property (increments views) |
| PUT | `/api/properties/[id]` | Update (owner/admin) |
| DELETE | `/api/properties/[id]` | Delete (owner/admin) |
| GET/POST/DELETE | `/api/properties/favorites` | Manage user favorites |
| GET | `/api/agents` | List agents |
| GET | `/api/agents/[id]` | Agent profile + their listings |
| POST | `/api/contact` | Submit inquiry |
| GET | `/api/locations` | Distinct countries + cities tree (aggregation) |
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
- Cascading filters: Country → City (dynamic via aggregation), PropertyGroup → PropertyType (from `constants.ts`)
- Price range slider: $0 → $10,000,000
- Area slider: 0 → 10,000 sqm
- Keyword search: MongoDB text index on title + description
- Reference number: exact match on `referenceNumber`
- Location: filter by `country` and/or `city` fields directly (no join needed)

---

## Implementation Phases

### Phase 1: Foundation + Data Cleanup
- Init Next.js + Tailwind + TypeScript
- Set up MongoDB Atlas cluster, import existing data
- Install Mongoose, create connection singleton (`lib/mongodb.ts`)
- Define Mongoose models (`models/`)
- Build and run `scripts/cleanup-data.ts` against MongoDB
- Verify cleaned data (counts, field types, no CMS cruft)
- Create indexes
- Set up Cloudflare R2 bucket
- Set up NextAuth (credentials + Google)
- Build Navbar (responsive + mobile menu) + Footer
- Home page (static hero placeholder)
- About page
- Login + Register pages with working auth
- Set up lib/ utilities (mongodb.ts, auth.ts, r2.ts, constants.ts, validators.ts)

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
- Submit Property form (multi-section, fields shown based on propertyGroup)
- My Properties page (edit/delete)
- Auto-generate referenceNumber for new properties ("GL-XXXXX")
- AuthGuard for protected routes

### Phase 4: Admin Dashboard
- Admin layout with sidebar + AdminGuard (checks role === "ADMIN")
- Admin overview page — stats cards (total properties, agents, users, recent inquiries)
- `GET /api/admin/stats` — dashboard stats endpoint (MongoDB aggregation)
- Property management page — view/edit/delete all properties, toggle featured
- `PATCH /api/properties/[id]/status` — change property status (approve/reject/feature)
- Submission review page — approve or reject PENDING user-submitted listings
- Agent management page — add/edit/remove agent profiles, upload photos
- Contact submissions page — view all inquiries, mark as read/responded
- `GET /api/admin/contacts` + `PATCH /api/admin/contacts/[id]`
- User management page — view users, change roles (User/Agent/Admin)
- `PATCH /api/admin/users/[id]/role`
- All admin API routes check session role before processing

### Phase 5: Favorites, Contact, Agents + Image Migration
- Favorites API + FavoriteButton + useFavorites hook
- Favorites dashboard page
- Contact form + email via Resend
- Agents listing page
- Agent profile page (bio + listings)
- **Run image migration** (cloud VM → R2 → update property docs)

### Phase 6: Polish & Deploy
- SEO: generateMetadata, sitemap.xml, robots.txt, JSON-LD
- next/image optimization with custom R2 loader
- Loading skeletons + Suspense boundaries
- error.tsx + not-found.tsx pages
- Toast notifications
- Responsive design audit
- Deploy to Vercel + connect MongoDB Atlas + R2

---

## Verification
```bash
npm run build && npm run lint
```
