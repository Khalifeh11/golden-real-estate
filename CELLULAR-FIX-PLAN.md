# Fix: Site unreachable on cellular data (works on WiFi)

## Root cause
The site loads on WiFi but fails on some mobile carriers. It is **not** an app/code,
SSL, or Vercel-config problem — Vercel shows "Valid Configuration".

The custom domain is pinned to Vercel's anycast IPs:

| Hostname | A records | Cellular |
|---|---|---|
| `goldenrealestate.vercel.app` | `64.29.17.67` / `216.198.79.67` | ✅ works |
| `www.goldenlandrealestate.net` | `64.29.17.1` / `216.198.79.1` | ❌ fails |

Both are IPv4-only (no AAAA). The carrier can route to `.67` but **not** to the
`.1` IPs Vercel assigned the custom domain. Confirmed by test: `.vercel.app` loads
on cellular, the custom domain does not.

## The fix: put Cloudflare's proxy in front of Vercel
Visitors then hit Cloudflare's universally-routable anycast IPs; Cloudflare fetches
from Vercel behind the scenes. Also gives IPv6 for free.

Accounts needed: Cloudflare (already have it — used for R2), GoDaddy (registrar),
Vercel. R2 is unaffected (it uses `pub-...r2.dev`, independent of this domain).

### Steps

1. **Cloudflare → Add a site** → `goldenlandrealestate.net` → Free plan.
   Cloudflare auto-scans and imports existing DNS records.

2. **Verify the email records imported** (moving nameservers moves ALL DNS — if these
   are missing, email breaks). Must be present, all **DNS-only / grey cloud**:
   - `MX` → `goldenlandrealestate-net.mail.protection.outlook.com` (Microsoft 365)
   - `TXT` root → `v=spf1 include:spf.protection.outlook.com -all`
   - `TXT` root → `MS=ms76203150` (M365 verification)
   - `TXT` `send` → `v=spf1 include:amazonses.com ~all` (Resend)
   - `TXT` `_dmarc` → DMARC record
   - DKIM TXT (`email._domainkey` / `resend._domainkey`) — the long `p=MIG...` key
   - Resend subdomains: `send`, `resend`, `email`, `bounces`

3. **Set the website records** (the actual fix — proxied):
   | Type | Name | Value | Proxy |
   |---|---|---|---|
   | CNAME | `www` | `cname.vercel-dns.com` | 🟠 Proxied (orange) |
   | CNAME | `@` (apex) | `cname.vercel-dns.com` | 🟠 Proxied (orange) |

   Orange cloud is the whole point. Email records stay grey (DNS-only).

4. **SSL/TLS → Overview → set mode = Full (strict).**
   Flexible causes an infinite redirect loop (Vercel forces HTTPS).

5. **GoDaddy → change nameservers** from `ns1/ns2.vercel-dns.com` to the two
   Cloudflare nameservers shown in Cloudflare. Save. Propagation: 15 min–24 hr.

6. **Verify:** Cloudflare emails "site is active". Re-test on cellular. Send/receive
   a test email to confirm M365 + Resend still work.

### Expected quirk (not a bug)
Vercel's Domains page may show ⚠️ "Invalid Configuration" because it now sees
Cloudflare's IPs. The site still works — Vercel routes by hostname, not IP.
Do NOT remove the domain to "fix" it.

## Lower-risk alternative (try first if nervous about email)
Inside **Vercel's** DNS only (no nameserver change, email untouched):
change `www` to a CNAME → `cname.vercel-dns.com`. Might land on a better-routed IP.
Not guaranteed, fully reversible, 2 minutes.

## Unrelated but urgent
Domain **expires 2026-07-16** (GoDaddy). Renew it — otherwise the site goes dark
in July regardless of this fix.
