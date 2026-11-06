# Security Policy: Find X Website

## 1. Purpose

This document describes the security controls built into the Find X website, the settings the hosting provider must apply, and the operating practices that keep the site secure after launch. It applies to the code in this repository and to the hosting account where the site is deployed.

Step-by-step deployment instructions are in `Deploy.md`.

## 2. Scope

In scope: `index.html`, `404.html`, `css/style.css`, `js/main.js`, `js/globe.js`, `js/vendor/three.min.js`, the `_headers` file, `netlify.toml`, `build.sh`, `.well-known/security.txt`, all files in `assets/`, and the hosting configuration.

Supported production hosts: **Netlify** and **Cloudflare Pages**. **GitHub Pages** is used for demonstrations only (see section 6).

Out of scope: the browser, the user's device, browser extensions, and third-party services (Google Maps, phone and calling apps) except for how this site links to them.

## 3. Threat Model

| Threat | Example | Primary control |
|---|---|---|
| Defacement or content change | Attacker replaces text or images | Restricted hosting access, 2FA, versioned source control, deploys only from the repository, backups |
| Injected scripts (XSS) | Attacker runs code on visitors' browsers | Strict Content Security Policy, Trusted Types, no `innerHTML`, no inline scripts, no `eval` |
| Unauthorised third-party content or ads | Ad network or tracking script added to the page | Content Security Policy allows only the site's own scripts, styles, images and fonts; no network requests |
| Injection by the hosting platform | CDN feature inserts its own script (for example email obfuscation) | Those features are switched off (section 5); the CSP would block them anyway |
| Clickjacking | Site embedded in a hostile frame | `frame-ancestors 'none'`, `X-Frame-Options: DENY`, and a framing guard in `main.js` |
| Tampered libraries | Modified `three.min.js` | Subresource Integrity hash on the script tag; file verified identical to the official release |
| Data theft via links | New tab gains control of the page (tabnabbing) | `rel="noopener noreferrer"` on all external links; `Cross-Origin-Opener-Policy: same-origin` |
| Protocol downgrade | Traffic sent over plain HTTP | HTTPS only, HSTS, `upgrade-insecure-requests` |
| Account takeover | Stolen hosting or domain password | Strong unique passwords, 2FA, registrar lock, least-privilege accounts |
| Sensitive file exposure | `.git`, notes or editor settings publicly readable | `build.sh` publishes only the website files; everything else returns 404 |
| Stale or cached content | Visitors see an old copy after a fix | `Cache-Control: no-cache` on pages, short cache on code |

Note on DevTools: any visitor can inspect and modify the page in their own browser. No website can prevent that. The site is protected in the sense that a modified page cannot change the server's files, cannot load third-party code under the policy, and cannot send data to other sites. The authoritative content lives on the server and in the source repository.

Note on browser extensions: an extension installed in a visitor's own browser (for example an ad injector) runs outside the website's control. The site cannot load ads itself, and it never sends visitor data anywhere.

## 4. Controls Implemented in the Code

1. **Content Security Policy** (`index.html` meta tag and `_headers`). Default is `'none'`. Scripts, styles, images, and fonts come only from the same origin. No `unsafe-inline`, no `unsafe-eval`, no remote scripts, no network requests (`connect-src 'none'`), no frames, no plugins, no workers, and no form submission. Trusted Types (`require-trusted-types-for 'script'; trusted-types 'none'`) blocks any attempt to inject HTML or script through the DOM.
2. **No dynamic HTML.** All text in the page is static, or set with `textContent` and `nodeValue`. No `innerHTML`, `outerHTML`, `document.write`, or `eval` is used.
3. **No user input is processed.** The site has no forms and no search fields. Contact uses `tel:` links, which are handled by the visitor's device. The page shows no email address.
4. **Safe external links.** Every link that opens a new tab uses `target="_blank"` with `rel="noopener noreferrer"`.
5. **Framing protection.** `frame-ancestors 'none'` and `X-Frame-Options: DENY` block framing. As a backup, `main.js` hides the page and breaks out if it is ever loaded inside a frame.
6. **Strict MIME handling.** `X-Content-Type-Options: nosniff` stops browsers from guessing file types.
7. **Minimal permissions.** `Permissions-Policy` disables camera, microphone, location, payments, USB, serial, HID, MIDI, motion sensors, screen capture and the Topics advertising API.
8. **Isolation.** `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` and `Origin-Agent-Cluster` stop other sites from reading, embedding or sharing a process with the site.
9. **Legacy protections set safely.** `X-XSS-Protection: 0` disables the old browser XSS filter, which could itself be abused (current OWASP advice). `X-Permitted-Cross-Domain-Policies: none` blocks legacy plug-in access.
10. **No tracking or analytics.** The site loads no third-party scripts, so no visitor data is sent to advertising or analytics services.
11. **Publishing allow-list.** `build.sh` copies only `index.html`, `404.html`, `_headers`, `css/`, `js/`, `assets/` and `.well-known/` into `dist/`. Documentation, editor settings and Git files are never published.
12. **Custom 404 page.** `404.html` reveals nothing about the server, uses the same strict policy and runs no scripts. On Cloudflare Pages it also stops unknown addresses from silently showing the homepage.
13. **Vulnerability contact.** `/.well-known/security.txt` (RFC 9116) tells researchers how to report issues. Renew its `Expires` date every year.
14. **Cache control.** Pages are always revalidated (`no-cache`), code is cached for one hour and images for one week, so security fixes reach visitors quickly.
15. **Reduced motion respected.** Animations stop for users who request it.
16. **No secrets in the code.** No API keys, passwords, or tokens are stored in any file.
17. **No internal notes in the shipped code.** Code comments only describe how the page works; they contain no secrets, credentials, or internal details.

## 5. Hosting Requirements

The provider must apply these settings before launch. Each item is required unless marked optional.

### 5.1 All production hosts

- Serve the site over HTTPS only, with a valid certificate that renews automatically. Redirect all `http://` traffic to `https://`.
- Build with `sh build.sh` and publish the `dist` folder only (configured in `netlify.toml` for Netlify; set by hand for Cloudflare Pages).
- Confirm the headers in `_headers` are active after every deploy (section 9).
- Deploy from the Git repository, not by uploading files by hand, so every change is recorded.
- Use a custom domain with a registrar lock, two-factor authentication on the registrar account, and DNSSEC if supported.
- Add a CAA DNS record, limiting which authorities can issue certificates (for example `letsencrypt.org`, plus `pki.goog` and `digicert.com` on Cloudflare).
- Enable uptime monitoring with alerts to the site owner.
- (Optional) After HTTPS has worked for several weeks, add `; preload` to the `Strict-Transport-Security` header and submit the domain at hstspreload.org. Only do this if every subdomain also uses HTTPS.

### 5.2 Netlify

- **Site configuration → Build & deploy:** leave the build command and publish directory empty in the dashboard; `netlify.toml` sets them.
- **Post processing → Snippet injection:** must be empty. Injected snippets are inline scripts and break the CSP.
- **Forms:** disable form detection (the site has no forms).
- **Deploy previews and branch deploys:** turn off, or protect with a password (Pro plans), so unfinished versions are not public.
- **Team:** enable two-factor authentication for every member; remove anyone who no longer needs access.
- **Domain management → HTTPS:** confirm the certificate is active.

### 5.3 Cloudflare Pages

- **Build settings:** framework preset *None*, build command `sh build.sh`, build output directory `dist`.
- **Turn off features that inject scripts or rewrite the page** (they are blocked by the CSP and can break the site):
  - Scrape Shield → **Email Address Obfuscation**: Off (it injects a script, which the CSP blocks)
  - Speed → **Rocket Loader**: Off
  - **Zaraz**: not enabled
  - **Web Analytics** automatic setup: Off (or use the server-side version, which injects nothing)
- **SSL/TLS:** mode *Full (strict)*, **Always Use HTTPS** on, **Minimum TLS Version** 1.2, **TLS 1.3** on.
- **Security:** Bot Fight Mode on (optional), rate-limiting rule on `/*` (optional, if the plan allows).
- **Preview deployments:** restrict access with Cloudflare Access, or disable them.
- **Account:** two-factor authentication on, least-privilege member roles.

## 6. GitHub Pages (demonstration only)

GitHub Pages is acceptable for showing the site, not for the production launch, because:

- It does not read `_headers`. Framing protection, HSTS, `nosniff`, `Permissions-Policy` and the isolation headers do not apply. The CSP meta tag and the framing guard in `main.js` still work.
- It publishes the whole repository, so `README.md`, `security.md`, `Deploy.md` and editor settings are publicly readable. They contain no secrets.
- The custom `404.html` uses root-relative paths and will appear unstyled under a project URL such as `/find-x/`.

Do not share a GitHub Pages demo link as the official website.

## 7. Account Security

- Use unique passwords of at least 16 characters, stored in a password manager.
- Enable two-factor authentication on the hosting, domain registrar, email, source control, and CDN accounts. Use an authenticator app or a hardware key, not SMS.
- Give each person the least access they need. Do not share logins.
- Remove access for anyone who leaves the project, the same day.
- Review account activity logs monthly.
- Never send passwords, API keys, or tokens by email or chat.

## 8. Change Control and Dependencies

- Keep all source files in a version-control repository with access limited to named people.
- Require a review before any change goes live.
- Deploy from the repository, not by editing files directly on the server.
- Keep a record of every deployment, with the date, the person, and the change. Netlify and Cloudflare Pages keep this history automatically.
- Keep the last working version available, so a rollback takes minutes (both hosts offer one-click rollback).
- Three.js is vendored locally at `js/vendor/three.min.js` (r128). On 06/11/2026 it was verified byte-for-byte identical to the official `three@0.128.0` release (SHA-256 `9274bbcec8d96168626c732b5d31c775aa8cfb7eaa0599bec0c175908a2c1ce2`). It is loaded with a Subresource Integrity hash. Do not update it without re-generating the hash (see `README.md`).
- No npm packages, CDNs, or remote fonts are used at runtime.
- Check quarterly for known vulnerabilities in any library that is added in future.
- If the Content Security Policy changes, update both `index.html` and `_headers` so they match.

## 9. Pre-Launch Checklist

- [x] Social links removed (the Follow Us section and its Telegram placeholder are no longer on the page).
- [x] The Three.js `integrity` attribute is set and matches the official r128 file.
- [x] Every icon in `assets/icons/` checked: no scripts, event handlers, or external references.
- [ ] Phone number (+61 0411 916 797) confirmed with the project lead.
- [ ] The `_headers` file is active. Verify with https://securityheaders.com (target grade A or A+) and https://developer.mozilla.org/en-US/observatory.
- [ ] The browser console shows no Content Security Policy messages on a normal visit (desktop and phone).
- [ ] The site loads with no third-party requests (DevTools → Network tab).
- [ ] The site has been tested in Chrome, Edge, Firefox, and Safari, on desktop, tablet, and phone.
- [ ] Every external link opens in a new tab and the page still works.
- [ ] `/README.md`, `/security.md`, `/.git/config` and `/.vscode/settings.json` return the 404 page.
- [ ] `/.well-known/security.txt` loads and its `Expires` date is in the future.
- [ ] Visiting `http://` redirects to `https://`.
- [ ] The site has been scanned with an SSL test (https://www.ssllabs.com/ssltest/) and achieves grade A or higher.
- [ ] Cloudflare only: Email Address Obfuscation, Rocket Loader and Zaraz are off.
- [ ] Netlify only: Snippet injection is empty.
- [ ] Two-factor authentication is enabled on every account listed in section 7.

## 10. Monitoring and Incident Response

Signs of an incident include unexpected content changes, new scripts or links that the owner did not approve, unexplained traffic spikes, redirects to other sites, and alerts from monitoring.

If an incident is suspected:

1. Roll back to the last known good deployment in the hosting dashboard, or take the site offline.
2. Change the passwords and revoke active sessions on every hosting, registrar, and source control account.
3. Check the deployment history and the access logs for the time of the change.
4. Restore from the repository if content was altered.
5. Record what happened, what was changed, and what was done.
6. Review the controls in this document and update them if a gap was found.

## 11. Reporting a Vulnerability

If you find a security issue in this website, please report it privately and do not publish details before the issue is fixed. The same contact is published at `/.well-known/security.txt`.

Email: 12250025.gcit@rub.edu.bt
Subject line: `Security report: Find X website`

Include the page address, the steps to reproduce, and what you observed. We will acknowledge the report, investigate, and tell you when it is fixed.

## 12. Limits of This Policy

No website is perfectly secure. This policy reduces risk, makes attacks harder and more visible, and limits the damage from any attack that succeeds. Review this document after any change to the site, the hosting, or the team, and at least once a year.

Last reviewed: 06/11/2026.
