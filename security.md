# Security Policy: Find X Website

## 1. Purpose

This document describes the security controls built into the Find X website, the settings the hosting provider must apply, and the operating practices that keep the site secure after launch. It applies to the code in this repository and to the hosting account where the site is deployed.

## 2. Scope

In scope: `index.html`, `css/style.css`, `js/main.js`, `js/globe.js`, the `_headers` file, all files in `assets/`, and the hosting configuration.

Out of scope: the browser, the user's device, and third-party services (Google Maps, WhatsApp, Telegram, Facebook, mail clients) except for how this site links to them.

## 3. Threat Model

| Threat | Example | Primary control |
|---|---|---|
| Defacement or content change | Attacker replaces text or images | Restricted hosting access, 2FA, versioned source control, backups, file-integrity monitoring |
| Injected scripts (XSS) | Attacker runs code on visitors' browsers | Strict Content Security Policy, no `innerHTML`, no inline scripts, no `eval` |
| Unauthorised third-party content or ads | Ad network script added to the page | Content Security Policy allows only `'self'` scripts and images |
| Clickjacking | Site embedded in a hostile frame | `frame-ancestors 'none'`, `X-Frame-Options: DENY`, and a framing guard in `main.js` |
| Tampered libraries | Modified `three.min.js` | Subresource Integrity hash on the script tag |
| Data theft via links | New tab gains control of the page (tabnabbing) | `rel="noopener noreferrer"` on all external links |
| Protocol downgrade | Traffic sent over plain HTTP | HTTPS only, HSTS with preload, `upgrade-insecure-requests` |
| Account takeover | Stolen hosting or domain password | Strong unique passwords, 2FA, registrar lock, least-privilege accounts |
| Sensitive file exposure | `.git` folder or backup files publicly readable | Deploy only the site files, disable directory listing, block dotfiles |

Note on DevTools: any visitor can inspect and modify the page in their own browser. No website can prevent that. The site is protected in the sense that a modified page cannot change the server's files, cannot load third-party code under the policy, and cannot send data to other sites. The authoritative content lives on the server and in the source repository.

## 4. Controls Implemented in the Code

1. **Content Security Policy** (`index.html` meta tag and `_headers`). Default is `'none'`. Scripts, styles, images, and fonts come only from the same origin. No `unsafe-inline`, no `unsafe-eval`, no remote scripts, no frames, no plugins, no workers, and no form submission.
2. **No dynamic HTML.** All text in the page is static, or set with `textContent` and `nodeValue`. No `innerHTML`, `outerHTML`, `document.write`, or `eval` is used.
3. **No user input is processed.** The site has no forms and no search fields. Contact uses `mailto:` and `tel:` links, which are handled by the visitor's device.
4. **Safe external links.** Every link that opens a new tab uses `target="_blank"` with `rel="noopener noreferrer"`.
5. **Framing protection.** `main.js` breaks out of any frame that embeds the site. The headers block framing in browsers that support them.
6. **Strict MIME handling.** `X-Content-Type-Options: nosniff` stops browsers from guessing file types.
7. **Minimal permissions.** `Permissions-Policy` disables camera, microphone, location, payments, USB, Bluetooth, and sensors.
8. **Isolation.** `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy` stop other sites from reading or embedding the site's resources.
9. **No tracking or analytics.** The site loads no third-party scripts, so no visitor data is sent to advertising or analytics services.
10. **Reduced motion respected.** Animations stop for users who request it.
11. **No secrets in the code.** No API keys, passwords, or tokens are stored in any file.
12. **No comments in the shipped code.** Comments are removed to avoid exposing internal notes.

## 5. Hosting Requirements (for the hosting provider)

The provider must apply these settings before launch. Each item is required unless marked optional.

- Serve the site over HTTPS only, with a valid certificate that renews automatically.
- Apply the headers in `_headers` (or the equivalent in the server configuration).
- Disable directory listing, so folder contents cannot be browsed.
- Deploy only the production files: `index.html`, `css/`, `js/`, `assets/`, and `_headers`. Do not deploy `.git`, `node_modules`, `.env` files, backups, drafts, or this document if the host does not need it.
- Block access to dotfiles (for example `.git`, `.env`, `.DS_Store`).
- Return a custom 404 page that reveals nothing about the server.
- Enable DDoS protection and a web application firewall if available, such as Cloudflare.
- Enable rate limiting on the site.
- Keep the hosting software and operating system patched automatically.
- Enable daily encrypted backups, with at least 30 days of retention, stored off the hosting server.
- Enable file-integrity monitoring or deployment checks, so unexpected changes are reported.
- Enable uptime and error monitoring with alerts to the site owner.
- Set DNS records to require a registrar lock and two-factor authentication on the registrar account.
- Enable DNSSEC if the registrar supports it.
- Add a CAA DNS record, limiting which authorities can issue certificates.
- (Optional) Enable HSTS preload submission at hstspreload.org once HTTPS is confirmed working.

## 6. Account Security

- Use unique passwords of at least 16 characters, stored in a password manager.
- Enable two-factor authentication on the hosting, domain registrar, email, source control, and CDN accounts. Use an authenticator app or a hardware key, not SMS.
- Give each person the least access they need. Do not share logins.
- Remove access for anyone who leaves the project, the same day.
- Review account activity logs monthly.
- Never send passwords, API keys, or tokens by email or chat.

## 7. Change Control

- Keep all source files in a version-control repository with access limited to named people.
- Require a review before any change goes live.
- Deploy from the repository, not by editing files directly on the server.
- Keep a record of every deployment, with the date, the person, and the change.
- Keep a copy of the last working version so a rollback takes minutes.

## 8. Dependencies

- Three.js is vendored locally at `js/vendor/three.min.js` (r128). It is loaded with a Subresource Integrity hash. Do not update it without re-generating the hash.
- No npm packages, CDNs, or remote fonts are used at runtime.
- Check quarterly for known vulnerabilities in any library that is added in future.

## 9. Pre-Launch Checklist

- [ ] The Telegram link is replaced. It currently points to the placeholder `https://t.me/your_username`.
- [ ] The Three.js `integrity` attribute is set, using the hash from section 4 of the delivery notes.
- [ ] The `_headers` file (or equivalent) is active. Verify with https://securityheaders.com and https://observatory.mozilla.org.
- [ ] The Content Security Policy is checked in the browser console. There should be no violation messages on a normal visit.
- [ ] The site has been tested in Chrome, Edge, Firefox, and Safari, on desktop and on a phone.
- [ ] Every external link opens in a new tab and the page still works.
- [ ] Directory listing is off. Visiting `/assets/` returns an error, not a file list.
- [ ] Visiting `http://` redirects to `https://`.
- [ ] Visiting `/.git/` returns an error.
- [ ] The site loads with no third-party requests (check the Network tab in DevTools).
- [ ] The site has been scanned with an SSL test (https://www.ssllabs.com/ssltest/) and achieves grade A or higher.
- [ ] A backup has been restored successfully at least once.
- [ ] Two-factor authentication is enabled on every account listed in section 6.

## 10. Monitoring and Incident Response

Signs of an incident include unexpected content changes, new scripts or links that the owner did not approve, unexplained traffic spikes, redirects to other sites, and alerts from monitoring.

If an incident is suspected:

1. Take the site offline or restore the last known good version from the repository.
2. Change the passwords and revoke active sessions on every hosting, registrar, and source control account.
3. Check the deployment history and the access logs for the time of the change.
4. Restore from backup if content was altered.
5. Record what happened, what was changed, and what was done.
6. Review the controls in this document and update them if a gap was found.

## 11. Reporting a Vulnerability

If you find a security issue in this website, please report it privately and do not publish details before the issue is fixed.

Email: 12250025.gcit@rub.edu.bt
Subject line: `Security report: Find X website`

Include the page address, the steps to reproduce, and what you observed. We will acknowledge the report, investigate, and tell you when it is fixed.

## 12. Limits of This Policy

No website is perfectly secure. This policy reduces risk, makes attacks harder and more visible, and limits the damage from any attack that succeeds. Review this document after any change to the site, the hosting, or the team, and at least once a year.

Last reviewed: at delivery.