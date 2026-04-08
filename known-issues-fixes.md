Here is Claude's plan: ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
Fix Known Issues — Batch 1 (P0 + P1)

Context
PLAN.md lists 9 known issues. This plan tackles the 5
highest-priority bugs in 4 sequential batches. The remaining 4 lower-priority issues (#2, #3, #4, #5) will be
addressed in a follow-up.

---

Batch 1 — Image Loss on Edit (Bug #7) — P0
Problem: Editing a property destroys all its images. The
edit page doesn't pass images to the form, so state
initializes as [] and the PUT overwrites the DB.

File: src/app/admin/properties/[id]/edit/page.tsx
Change: Add one line at line 38, before the closing }: images: property.images ?? [],

                               The rest of the pipeline (PropertyForm state init,

PropertyImageUpload, PUT route) already handles images
correctly — only this hand-off was missing.
--- Batch 2 — Validator + API Hardening (Bug #1, #8D, #8E)

       2A. Empty category crashes search (Bug #1)

                   Problem: Home page form sends category="" when unselected.

Zod rejects "" since it's not in the enum.
File: src/lib/validators.ts line 29

Change:
// Before
category: z.enum(["FOR_SALE", "FOR_RENT"]).optional(),

// After — empty string becomes undefined
category: z.enum(["FOR_SALE",
"FOR_RENT"]).or(z.literal("").transform(() =>
undefined)).optional(),

Apply same pattern to q (line 28) to handle whitespace-only
searches:
// Before
q: z.string().optional(),

// After — trim whitespace, convert empty to undefined
q: z.string().transform(s => s?.trim() ||
undefined).optional(),

Also apply to propertyGroup (line 30) and other string enum
fields that could receive empty strings from forms:
propertyGroup: z.enum(["RESIDENTIAL", "COMMERCIAL",
"LAND"]).or(z.literal("").transform(() =>
undefined)).optional(),

2B. API exposes non-active properties (Bug #8E)

Problem: GET /api/properties has no default status:
"ACTIVE" filter — anyone can request ?status=SOLD.

File: src/app/api/properties/route.ts lines 42-43

Change: Default to ACTIVE for unauthenticated requests;
allow status filtering for admin/agent:
const session = await auth();
const isAdmin = session?.user?.role && ["ADMIN",
"AGENT"].includes(session.user.role);
const status = searchParams.get("status");
if (isAdmin && status) {
filter.status = status;
} else {
filter.status = "ACTIVE";
}

2C. Trim whitespace in API query param (Bug #8D)

File: src/app/api/properties/route.ts line 24

Change: const q = searchParams.get("q")?.trim();

---

Batch 3 — Filter UX Fixes (Bug #8A, #8B, #8C)

3A. Slider state not reset on category switch (#8A, #8C)

Problem: Switching category changes slider bounds via
getSliderConfig(), but dragPriceRange/dragAreaRange state
persists, causing clamped/broken values.

File: src/components/PropertyFilters.tsx

Change: Add a useEffect after the drag state declarations
(~line 98):
useEffect(() => {
setDragPriceRange(null);
setDragAreaRange(null);
}, [activeCategory]);

The category toggle already clears
minPrice/maxPrice/minArea/maxArea from URL params (lines
148-151), so this just resets the transient drag state to
match.

3B. Filter options not category-aware (#8B)

Problem: getFilterOptions() returns all property types
regardless of selected category.

File: src/lib/properties.ts lines 84-109

Changes:

1.  Add category?: string to the context parameter
2.  Apply category to activeFilter if present:
    if (context?.category) activeFilter.category =
    context.category;
3.  Also fetch features (currently hardcoded as []):
    const [countries, cities, districts, propertyTypes,
    features] = await Promise.all([
    PropertyModel.distinct("country", activeFilter),
    PropertyModel.distinct("city", cityFilter),
    PropertyModel.distinct("district", districtFilter),
    PropertyModel.distinct("propertyType", activeFilter),
    PropertyModel.distinct("features", activeFilter),
    ]);
    return { countries, cities, districts, propertyTypes,
    features: features.filter(Boolean).sort() };

3C. Pass category to getFilterOptions

File: src/app/properties/page.tsx lines 28-31

Change: Add category to the context object:
getFilterOptions({
category: typeof params.category === "string" ?
params.category : undefined,
country: typeof params.country === "string" ?
params.country : undefined,
city: typeof params.city === "string" ? params.city :
undefined,
}),

---

Batch 4 — Featured Properties + Description HTML (Bug #6,
#9)

4A. Add getFeaturedProperties() query

File: src/lib/properties.ts (add after searchProperties)

export async function getFeaturedProperties(limit = 6):
Promise<PropertyCardData[]> {
await dbConnect();
const docs = await PropertyModel.find({ status: "ACTIVE",
isFeatured: true })
.sort({ createdAt: -1 })
.limit(limit)
.lean();
return (docs as unknown as
Property[]).map(toPropertyCardData);
}

4B. Wire home page to DB

File: src/app/page.tsx

1.  Delete the FEATURED_PROPERTIES constant (lines 10-90)
2.  Add import: import { getFeaturedProperties } from
    "@/lib/properties";
3.  Make component async: export default async function
    Home() {
4.  Fetch at top of component: const featuredProperties =
    await getFeaturedProperties();
5.  Replace FEATURED_PROPERTIES.map( →
    featuredProperties.map(
6.  Wrap featured section in {featuredProperties.length > 0
    && ( ... )} so it hides gracefully when none are featured

4C. Strip HTML from descriptions

File: src/app/properties/[slug]/page.tsx

Add a small helper (top of file or in lib/utils.ts):
function stripHtml(html: string): string {
return html.replace(/<[^>]\*>/g, "");
}

Apply in two places:

- SEO meta description (line 24-25): property.description ?
  stripHtml(property.description).slice(0, 160) : ...
- Description rendering (line 186): stripHtml(property.desc
  ription).split("\n").filter(Boolean).map(...)

---

Files Modified (Summary)

┌─────────────────────────────────────────────┬─────────┐
│ File │ Batches │
├─────────────────────────────────────────────┼─────────┤
│ src/app/admin/properties/[id]/edit/page.tsx │ 1 │
├─────────────────────────────────────────────┼─────────┤
│ src/lib/validators.ts │ 2 │
├─────────────────────────────────────────────┼─────────┤
│ src/app/api/properties/route.ts │ 2 │
├─────────────────────────────────────────────┼─────────┤
│ src/components/PropertyFilters.tsx │ 3 │
├─────────────────────────────────────────────┼─────────┤
│ src/lib/properties.ts │ 3, 4 │
├─────────────────────────────────────────────┼─────────┤
│ src/app/properties/page.tsx │ 3 │
├─────────────────────────────────────────────┼─────────┤
│ src/app/page.tsx │ 4 │
├─────────────────────────────────────────────┼─────────┤
│ src/app/properties/[slug]/page.tsx │ 4 │
└─────────────────────────────────────────────┴─────────┘

---

Verification

After each batch, run:
npm run build && npm run lint

Manual testing per batch:

1.  Batch 1: Edit a property with images → save → confirm
    images persist
2.  Batch 2: Home page search with empty category → should
    load properties page without error. Hit
    /api/properties?status=SOLD unauthenticated → should only
    return ACTIVE
3.  Batch 3: Switch between For Sale / For Rent → sliders
    reset, property types update per category
4.  Batch 4: Mark properties as featured in admin → verify
    they appear on home page. View a property with HTML in
    description → tags should be stripped
