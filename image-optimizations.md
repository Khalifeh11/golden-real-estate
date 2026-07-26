# Image Optimization — Cost Analysis & Plan

_Golden Land Real Estate · Next.js 16 + MongoDB + Cloudflare R2 · analysis dated 2026-06-15_

## TL;DR

- We hit Vercel **Hobby's 5,000/month image-transformation cap**. This is the only maxed resource (cache writes were climbing at 66K/100K; edge requests/CPU are fine).
- **Cause is structural:** the live catalog is **5,062 ACTIVE listings / 29,655 images**, all full-resolution on R2. 5,062 heroes > 5,000 free transforms → **no free tier can hold** if heroes are optimized on the fly. Cloudflare's free tier is also 5,000.
- Two amplifiers make it worse than it needs to be: an **8-width `deviceSizes` fan-out** and a **4-hour cache TTL that re-bills the same images all month**.
- **Cloudflare is not worth it** — $0.50/1K transforms vs **Vercel Pro's ~$0.05/1K** (10× cheaper) and it needs new infra.
- **Hobby is non-commercial-only** per Vercel's fair-use policy → a real-estate business technically must be on Pro regardless.

## Root cause (three compounding factors)

1. **Catalog size vs free cap.** 5,062 ACTIVE listings, each with a hero that must be optimized at least once. `sitemap.ts` exposes all of them to crawlers (robots.txt allows `/`), so every hero gets requested → transformed. 5,062 > 5,000 = hard wall.
2. **Width fan-out.** Vercel's remote cache key is `{quality, width, url, Accept}`. `formats` is already WebP-only (no AVIF doubling — good), but `deviceSizes` is the full default `[640,750,828,1080,1200,1920,2048,3840]` = up to **8 widths per image**, each a separate billable transformation on cache miss.
3. **Short TTL churn.** `minimumCacheTTL` unset → Next 16 default **4 hours**. Optimized images go STALE after 4h and get **re-transformed/re-billed** on next request. Our R2 images never change, so this churn is pure waste.

## Measured catalog (from MongoDB)

| Metric | Value |
|---|---|
| Total property docs (incl. trash/inactive) | 7,955 |
| **Live docs (ACTIVE, not trash)** | **5,062** |
| **Distinct source images (live)** | **29,655** |
| Images where `thumbnailUrl === url` (i.e. no real thumbnail) | 29,655 / 29,655 |
| Max images on one property | 9 |
| Free transformation cap (Vercel **and** Cloudflare) | 5,000 / month |

> The migration set `thumbnailUrl = url` for every image, so "thumbnails" are full-resolution. We pay to shrink full images on the fly.

## Pipeline audit

| Area | Finding | Lever? |
|---|---|---|
| Property cards | Already prefer `thumbnailUrl` ✓ — but it's full-res | Real thumbnails would help |
| Admin tables / trash pages | Render **no** `<Image>` (text only) | None needed |
| Sitemap | Exposes ~5,062 ACTIVE listings to crawlers | Forces all heroes to transform |
| `formats` | WebP only (Next 16 default) | Already optimal |
| `deviceSizes` / `imageSizes` | Full defaults (8 + 7 widths) | **Trim** |
| `minimumCacheTTL` | Default 4h | **Raise to 31d** |
| `sharp` | **Already a dependency (v0.34.5)**, unused by `migrate-images.ts` | **Use it to pre-size** |
| Static assets (logo 72×48, avatars 80/128px, hero JPGs) | Optimized unnecessarily | `unoptimized` (minor) |
| Galleries / lightbox | Use full-res `images[].url` at up to 100vw | Traffic-bound; use 1280w variant |

## Pricing reality

- **Vercel Pro transformation overage ≈ $0.05 / 1,000** — transformations are NOT the expensive part. 150K/mo ≈ $7.50. Real Pro cost is the **$20 base** + bandwidth.
- **Cloudflare Images** = $0.50 / 1,000 (10× pricier) + needs R2 behind a custom Cloudflare domain + a custom `next/image` loader. **Rejected.**
- **Hobby** = non-commercial personal use only → not a valid long-term home for this site.

## Options to avoid disruption TODAY (limit already reached)

1. **`images: { unoptimized: true }` in `next.config.ts` (free).** Bypasses the optimizer; `next/image` serves originals straight from R2. Zero transformations, nothing can 402. Tradeoff: heavier/slower images until pre-sized. Functional and free.
2. **Upgrade to Vercel Pro (~$20/mo).** Optimizer keeps working; transformations cost pennies. Zero code change. Also resolves the commercial-use ToS issue.

### What the disruption is (Hobby over-limit behavior)
- New transformations (any cache **MISS or STALE**) return **HTTP 402** → `<Image>` shows **`alt` text instead of the photo**.
- Already-cached, still-fresh variants keep working.
- Because TTL is 4h, **previously-working images break as their cache expires** → coverage degrades over hours/days, not all at once.
- **No overage charges** — over-limit simply fails. Resets next billing cycle.

## Recommended plan

**Free code wins (do regardless of path):**
- Set `minimumCacheTTL: 2678400` (31 days) — kills the 4h re-bill churn. Safe: migrated images never change.
- Trim `deviceSizes` to ~`[640, 828, 1200, 1920]` and `imageSizes` to a few small values — caps width fan-out ~50%.
- Add `unoptimized` to logo + agent avatars (and consider static hero JPGs).

**Structural fix (only road to ~$0 recurring; `sharp` already installed):**
- Backfill script (extend `scripts/migrate-images.ts`): generate **640w + 1280w WebP** derivatives for all 29,655 images into R2, point `thumbnailUrl` at the 640w.
- Flip card/listing `<Image>` to `unoptimized` (they already prefer `thumbnailUrl`) → **hero transformations drop to ~zero**.
- Galleries use the 1280w variant. One-time compute, $0 recurring.

**Then:** move to **Pro** for compliance + peace of mind. With the above done, usage cost on top of the $20 base stays near zero.

## Decision matrix

| Path | Effort | Recurring cost | Notes |
|---|---|---|---|
| `unoptimized: true` now | 1 line | $0 | Heavier images; stop-gap, ToS still flags commercial Hobby |
| Free config tweaks | ~5 min | $0 (slows bleed, won't fit <5K alone) | Do anyway |
| Pre-size with sharp + `unoptimized` cards | Medium | ~$0 | The real fix |
| Vercel Pro | None | $20 + pennies | Simplest; fixes ToS; do alongside the tweaks |
| Cloudflare Images | High | $5–15 | Rejected — 10× pricier/transform, new infra |
| Delete inactive listings | — | $0 effect | They're already excluded from the count |

## Diagnostic scripts added
- `scripts/count-image-volume.ts` — counts live listings/images and estimates transforms.
- `scripts/sample-image.ts` — samples an image doc and checks `thumbnailUrl` vs `url`.
