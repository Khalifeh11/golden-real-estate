# MongoDB Dump Analysis — Golden Land Real Estate

## Overview

**Database:** `goldenland-real-estate` (ApostropheCMS export)
**Format:** Newline-delimited JSON + BSON backups
**Collections:** 2 — `aposDocs` (45,541 docs, 67MB) and `aposAttachments` (37,409 docs, 16MB)

---

## 1. Collections & Document Counts

| Collection | Count | Purpose |
|---|---|---|
| **aposDocs** | 45,541 | All CMS content (properties, agents, pages, inquiries, users) |
| **aposAttachments** | 37,409 | Image/file metadata (dimensions, crops, ownership) |

ApostropheCMS stores everything in a single `aposDocs` collection, differentiated by `type`:

| Type | Count | Purpose |
|---|---|---|
| `apostrophe-image` | 37,285 | Image asset records |
| `property` | 7,953 | Real estate listings |
| `contact-form` | 236 | Inquiry submissions |
| `agent` | 57 | Broker/agent profiles |
| `apostrophe-user` | 2 | Admin accounts |
| `apostrophe-group` | 2 | Permission groups (admin, guest) |
| `apostrophe-global` | 1 | Site-wide settings (footer, contact info) |
| `home` | 1 | Homepage |
| `properties-page` | 1 | Properties listing page |
| `agents-page` | 1 | Agents listing page |
| `contactUs` | 1 | Contact page |
| `trash` | 1 | Trash container |

---

## 2. Property Collection — Complete Field Analysis

**Total properties:** 7,953
**Fields per document:** ~34

### All Fields with Types & Sample Values

| Field | Type | Coverage | Sample Value | Notes |
|---|---|---|---|---|
| `_id` | string | 100% | `"cjn30ca59000m6nxy1o2z8bv7"` | ApostropheCMS CUID |
| `type` | string | 100% | `"property"` | Always "property" |
| `title` | string | 100% | `"Apartment in Dbayeh"` | Listing title |
| `slug` | string | 100% | `"apartment-in-dbayeh-1"` | URL slug (unique) |
| `status` | string | **66%** | `"forSale"`, `"forRent"`, `"sold"`, `"underOffer"` | ~34% null/missing |
| `price` | MongoInt | ~100% | `{"$numberInt": "269000"}` | Integer, likely USD |
| `currency` | string | low | — | Mostly empty |
| `space` | string | ~100% | `"150"` | Square meters (string) |
| `area` | string | ~100% | `"150"` | Same as space — redundant |
| `city` | string | ~87% | `"Dbayeh"` | 971 properties have empty city |
| `district` | string | low | — | Mostly null/empty |
| `country` | string | partial | `"lebanon"`, `"Lebanon"`, `"greece"` | Inconsistent casing |
| `numberOfRooms` | string | **66%** | `"3"` | Missing for land parcels |
| `numberOfBathrooms` | string | **66%** | `"2"` | Missing for land parcels |
| `numberOfParkings` | string | partial | `"1"` | Often null |
| `reference` | string | low | `"114845"` | Old MLS-style ref, mostly null |
| `commission` | string | low | `"2.5"` | Percentage, mostly null |
| `description` | array | ~100% | Rich-text block array | ApostropheCMS area format |
| `features` | array[string] | high | `["Storage area", "Maid room", "Terrace"]` | 1000+ unique values |
| `images` | object (area) | ~100% | Area with `pieceIds` referencing `apostrophe-image` docs | Multiple images |
| `thumbnail` | object (area) | ~100% | Same area format, single image | Featured image |
| `mapLatitude` | string | high | `"33.9167"` | Decimal string |
| `mapLongitude` | string | high | `"35.5833"` | Decimal string |
| `waterfront` | string | low | `""` or numeric | Often empty |
| `builtIn` | string | low | Year string | Often empty |
| `view` | string | low | — | Often empty |
| `garden` | string | low | — | Often empty |
| `terrace` | string | low | — | Often empty |
| `agentId` | string | ~100% | `"cjnmsdgf2008umbxyayndq9xj"` | Ref to agent doc |
| `agent` | string | ~100% | Same as agentId | **Redundant** |
| `published` | boolean | 100% | `true` | — |
| `trash` | boolean | 100% | `false` | Soft delete flag |
| `tags` | array | 100% | `[]` | **Always empty — unused** |
| `createdAt` | MongoDate | 100% | `{"$date":{"$numberLong":"1539167083089"}}` | — |
| `updatedAt` | MongoDate | 100% | — | — |
| `titleSortified` | string | 100% | `"apartment in dbayeh"` | Lowercase title (Apostrophe internal) |
| `highSearchText` / `lowSearchText` | string | 100% | Concatenated search text | Apostrophe search index |
| `highSearchWords` | array[string] | 100% | Tokenized words | Apostrophe search index |
| `searchSummary` | string | 100% | — | Apostrophe search index |
| `historicUrls` | array[string] | 100% | Old URL paths | Apostrophe SEO redirects |
| `advisoryLock` | object | partial | Edit lock data | Apostrophe CMS internal |
| `docPermissions` / `viewGroupsIds` / `editGroupsIds` / `viewUsersIds` / `editUsersIds` | arrays | 100% | Permission arrays | Apostrophe ACL |

### Status Distribution

| Status | Count |
|---|---|
| forSale | 3,962 |
| forRent | 1,149 |
| sold | 144 |
| underOffer | 8 |
| null/missing | 2,690 |

### Geographic Distribution

| Country | Count |
|---|---|
| Lebanon | 6,644 |
| Greece | 467 |
| Cyprus | 101 |
| Montenegro | 13 |
| Spain | 5 |
| United States | 4 |
| Portugal | 1 |

**Top Lebanese cities:** Matn (1,458), Keserwan (417), Dbayeh (229), Mazraat Yachouh (224), Achrafieh (158), Naccache (137), Bauchrieh (123), Beirut (123)

---

## 3. Tags, Amenities & Features

- **`tags` field:** Always empty array — **completely unused**
- **`features` field:** Array of strings, heavily used with **1000+ unique values**

**Top features (by frequency):**
- Storage area (797), Maid room (745), Indoor parking spots (421)
- Terrace (364), Prime location (339), Visitors parking (338)
- Doorbell video intercom (262), Fully furnished (242)
- Fully equipped kitchen (177), Brand new (151)
- Covered parking (111+), Chimney/fireplace (71+), Garden (67), Decorated (60)

**Note:** Feature strings have inconsistencies — typos, varied casing, near-duplicates. Will need cleanup during migration.

---

## 4. Typical Property Documents

```json
{
  "_id": "cjn30ca59000m6nxy1o2z8bv7",
  "type": "property",
  "title": "Apartment in Dbayeh",
  "slug": "apartment-in-dbayeh-1",
  "status": "forSale",
  "price": {"$numberInt": "269000"},
  "space": "150",
  "area": "150",
  "city": "Dbayeh",
  "country": "lebanon",
  "numberOfRooms": "3",
  "numberOfBathrooms": "2",
  "numberOfParkings": "1",
  "features": ["Storage area", "Maid room", "Indoor parking spots"],
  "description": [{"_id": "...", "type": "apostrophe-rich-text", "content": "<p>Beautiful apartment...</p>"}],
  "agentId": "cjnmsdgf2008umbxyayndq9xj",
  "mapLatitude": "33.9167",
  "mapLongitude": "35.5833",
  "images": {
    "type": "area",
    "items": [{
      "by": "id",
      "pieceIds": ["cjn7wxi6o00dt6nxyfg0hqpjl"],
      "relationships": {
        "cjn7wxi6o00dt6nxyfg0hqpjl": {"x": 27.18, "y": 24.47}
      },
      "type": "apostrophe-images"
    }]
  },
  "thumbnail": { "/* same area structure, single image */" : "" },
  "published": true,
  "trash": false,
  "tags": [],
  "createdAt": {"$date": {"$numberLong": "1539167083089"}},
  "updatedAt": {"$date": {"$numberLong": "1771578564238"}}
}
```

---

## 5. How Agents Are Referenced

**Pattern:** ObjectId string reference (NOT embedded)

- `agentId` field on property → references `_id` of an `agent` document
- `agent` field is a **redundant duplicate** of `agentId` (same value)
- **57 agent documents** with full profiles: firstName, lastName, email, phoneNumber, biography, thumbnail
- **Heavy consolidation:** ~99% of properties point to a single agent (`cjnmsdgf2008umbxyayndq9xj`)

---

## 6. How Images Are Stored

**Three-layer system:**

1. **Property doc** → `images` / `thumbnail` fields contain an "area" with `pieceIds` array
2. **`apostrophe-image` doc** (in aposDocs) → contains attachment reference + metadata
3. **`aposAttachments` doc** → actual file metadata (name, extension, dimensions, MD5, crops)

**Image files are NOT in the database** — they were served from disk/CDN. The DB only stores metadata.

**aposAttachments stats:**
- 37,409 total (99.99% images: 96.2% jpg, 2.1% gif, 1.7% png)
- 4 DOCX files (orphaned, unlinked)
- Average file size: 611KB
- Dimension range: 125px–10,704px wide
- 126 images have crop variants

---

## 7. Users & Roles

**Minimal:**
- 2 `apostrophe-user` docs (admin accounts only)
- 2 `apostrophe-group` docs: "admin" (full permissions) and "guest" (no permissions)
- No customer/public user accounts
- No password hashes in export (sanitized)

---

## 8. Inquiries / Contact Forms

**236 `contact-form` documents:**

```json
{
  "_id": "unique-id",
  "type": "contact-form",
  "title": "Subject line",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+961...",
  "property": "/properties/apartment-in-dbayeh",
  "message": "I'm interested in this property...",
  "published": true,
  "createdAt": {"$date": {}},
  "updatedAt": {"$date": {}}
}
```

**Note:** Properties referenced by URL slug path, not ObjectId.

---

## 9. Unused / Legacy Fields

### Completely Unused
- **`tags`** — empty array on every property (features array is used instead)
- **`currency`** — field exists but empty
- **4 DOCX attachments** — orphaned, linked to no documents

### Redundant
- **`agent`** vs **`agentId`** — identical values, only one needed
- **`space`** vs **`area`** — identical values, only one needed

### Apostrophe CMS Internal (drop during migration)
- `titleSortified`, `highSearchText`, `highSearchWords`, `lowSearchText`, `searchSummary` — search indexing
- `historicUrls` — URL redirect history
- `advisoryLock` — edit locking
- `docPermissions`, `viewGroupsIds`, `editGroupsIds`, `viewUsersIds`, `editUsersIds` — Apostrophe ACL

---

## 10. Data Quality Issues

1. **Country casing inconsistency:** `"lebanon"` vs `"Lebanon"` vs `"greece"` vs `"Cyprus"`
2. **971 properties with empty city**
3. **2,690 properties (34%) missing status** — likely archived/incomplete
4. **Features need cleanup:** 1000+ unique strings with typos and near-duplicates
5. **All numeric values stored as strings** — price, rooms, bathrooms, coordinates
6. **Description is rich-text HTML** inside ApostropheCMS area blocks — needs extraction
