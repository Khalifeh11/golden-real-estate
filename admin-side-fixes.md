# Admin Dashboard Fixes

## Completed

### 1. Features UI in PropertyForm
**Files:** `src/lib/constants.ts`, `src/components/admin/PropertyForm.tsx`

- Added `PREDEFINED_FEATURES` array (15 features) to constants
- Added "Features" section with checkbox grid (3 cols desktop, 2 mobile)
- Custom feature input with Add button + Enter key support
- Removable tags for custom features
- Uses `watch("features")` + `setValue("features", ...)` pattern

### 2. Agent photo upload in AgentForm
**File:** `src/components/admin/AgentForm.tsx`

- Replace URL text input with image upload (reuse R2 upload infrastructure)
- Circular image preview of uploaded photo
- Upload to R2, store resulting URL in `photoUrl` field

### 3. Soft-delete agents + orphan cascade
**Files:** `src/app/api/agents/[id]/route.ts`, `src/app/api/agents/route.ts`, `src/app/admin/agents/page.tsx`

- DELETE handler sets `trash: true` instead of hard-deleting
- Unsets `agentId` on all orphaned properties after soft-delete
- GET endpoint filters out trashed agents
- Updated confirmation dialog text

## Still Open

### 4. Trash & restore system (#14 in PLAN.md)
Soft-deleted agents vanish with no recovery path. Need a trash system across all deletable entities:
- Add `trash` field to Property and ContactRequest models
- Convert Property and Contact DELETE handlers to soft-delete
- Build `/admin/trash` page with tabs (Properties / Agents / Contacts)
- Restore and Permanently Delete actions per item
- Add "Trash" link to AdminSidebar

### 5. Contact delete/archive (#15 in PLAN.md)
Contacts accumulate with no way to remove or archive. Currently only read/responded toggles exist. Depends on #4 trash system.

### 6. Dead code cleanup (#5 in PLAN.md)
- `imageRefs` field — never populated by admin, never read by public
- `commission`, `latitude`, `longitude` — in model but unused in admin or public
- Low priority, separate PR
