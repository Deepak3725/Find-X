# Find X Website

A secure, single-page website for Find X, a practical business consultancy focused on sustainable growth. The site is built with plain HTML, CSS, and JavaScript, with no frameworks and no runtime third-party dependencies.

## Overview

The site contains:

- A hero section with a typewriter headline and an interactive 3D globe (Three.js, included locally)
- Our Approach: three process cards with detail panels
- What We Can Help With: three service cards with detail panels, and a "Have Some Idea?" contact prompt
- Our Vision: a full-width image slideshow with typed headings, previous/next arrows and swipe support, plus three summary cards
- Get in Touch: contact actions
- A footer with quick links, contact details, and a decorative divider
- A custom 404 page

## Project Structure

```
Find_X/
├── index.html              Main page
├── 404.html                Custom "page not found" page
├── _headers                Security and cache headers (Netlify, Cloudflare Pages)
├── netlify.toml            Netlify build settings
├── build.sh                Copies only the public files into dist/
├── .well-known/
│   └── security.txt        Contact for security reports (RFC 9116)
├── README.md               This file
├── security.md             Security policy and checklist
├── Deploy.md               Deployment guide for the client
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── globe.js
│   └── vendor/
│       └── three.min.js    Three.js r128 (official build, integrity-checked)
└── assets/
    ├── fonts/              Lato (Regular, Bold), Playfair Display (Bold, Black)
    ├── icons/              analytics, close, email, facebook, gauge, heritage, leaf, left,
    │                       lightbulb, location, nav-approach, nav-contact, nav-home,
    │                       nav-services, nav-vision, phone, property, right, search,
    │                       telegram, tree, trending-up, video, whatsapp (.svg)
    ├── images/             logo, background, globe, globe-fallback, globe-map, outer, footer-bg,
    │                       mobile_footer (.png), footer-divider (.jpeg)
    └── vision/             vision-1.png to vision-6.png
```

`email.svg`, `facebook.svg`, `heritage.svg`, `telegram.svg` and `whatsapp.svg` are kept for future use; the page does not currently show them.

## Requirements

- A current version of Chrome, Edge, Firefox, or Safari
- WebGL support for the 3D globe. Without it, a static image is shown instead.
- Hosting: **Netlify** or **Cloudflare Pages** for production. GitHub Pages for demonstrations only.

No Node.js, npm, or frameworks are required. The only build step is `build.sh`, a short shell script that the host runs automatically.

## Running Locally

The site uses relative paths and should be served over HTTP. Opening `index.html` directly from the file system can block scripts and fonts in some browsers.

**Option 1: VS Code with Live Server.** Install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.

**Option 2: Python** (installed on most systems):

```bash
cd Find_X
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

After any change, refresh with **Ctrl + Shift + F5** to clear cached files.

To test on a phone, connect it to the same Wi-Fi and open `http://<your-computer's-IP>:8000`.

## Deployment

Full step-by-step instructions, including the dashboard settings for each host, are in **`Deploy.md`**. In short:

| Host | Purpose | Build command | Publish folder | Security headers |
|---|---|---|---|---|
| Netlify | Production | `sh build.sh` (set in `netlify.toml`) | `dist` | Applied from `_headers` |
| Cloudflare Pages | Production | `sh build.sh` | `dist` | Applied from `_headers` |
| GitHub Pages | Demo only | none | repository root | Not applied (see `security.md`, section 6) |

`build.sh` publishes only `index.html`, `404.html`, `_headers`, `css/`, `js/`, `assets/` and `.well-known/`. Documentation, editor settings and Git files are never published.

## Before Launch

- Confirm the phone number (+61 0411 916 797) with the project lead.
- Confirm the Three.js integrity hash on the script tag matches the live file. Regenerate it whenever `js/vendor/three.min.js` changes. From PowerShell, in the project folder:
  ```powershell
  $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path "js\vendor\three.min.js"))
  $sha = [System.Security.Cryptography.SHA384]::Create()
  "sha384-" + [System.Convert]::ToBase64String($sha.ComputeHash([byte[]]$bytes))
  ```
- Renew the `Expires` date in `.well-known/security.txt` before it passes (currently 06/11/2027).
- Add the final logo as an SVG file alongside the PNG.
- Run the checks in `security.md`, section 9.

## Customising Content

| What to change | Where |
|---|---|
| Hero headline phrases | `PHRASES` array in `js/main.js` |
| Typing and erasing speed | `TYPE_MS`, `ERASE_MS`, `CHAR_MS` in `js/main.js` |
| Slideshow timing | `SHOW_MS` in `js/main.js` |
| Slideshow order | The `vision-slide` blocks in `index.html` |
| Slideshow arrows | `assets/icons/left.svg`, `assets/icons/right.svg`, and `.vision-arrow` in `css/style.css` |
| Swipe distance | `SWIPE_MIN` in `js/main.js` |
| Globe size and position | `GLOBE_RADIUS` in `js/globe.js`, and `.hero-visual` in `css/style.css` |
| Globe sensitivity and momentum | `DRAG_SENS`, `FLING_MAX`, `FRICTION` in `js/globe.js` |
| Colours | `:root` variables at the top of `css/style.css` and the footer variables |
| Phone number | `tel:` links in the header ("Let's Connect"), the "Have Some Idea?" block, the contact section, and the footer |
| Text and images | `index.html`. Replace an image by saving a file with the same name in the same folder. |

## Security

Security controls are described in `security.md`. In summary:

- A strict Content Security Policy allows only the site's own scripts, styles, images and fonts. Inline scripts, third-party scripts, ads, trackers, network requests and framing are blocked.
- Trusted Types blocks any attempt to inject HTML or script through the page.
- The page never builds HTML from text. No `innerHTML`, `eval`, or `document.write` is used.
- Security headers in `_headers`: HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, cross-origin isolation, and safe cache rules.
- Three.js is served locally with a Subresource Integrity hash, and is verified identical to the official r128 release.
- Every external link opens with `rel="noopener noreferrer"`.
- Only the website files are published (`build.sh`); a custom 404 page reveals nothing about the server.
- All icons are checked: no scripts or external references.
- The site has no forms, no analytics, and no tracking.

To report a security issue, follow `security.md`, section 11, or the contact in `/.well-known/security.txt`. Do not publish details before the issue is fixed.

## Accessibility

- Semantic landmarks (`header`, `main`, `nav`, `footer`) and a skip link
- Keyboard support for cards and panels: Enter or Space to open, Escape to close
- Visible focus styles on interactive elements
- Animations stop when the user has enabled reduced motion
- The decorative 3D globe is hidden from screen readers, and a static fallback image is shown if WebGL is unavailable

## Browser Notes

- The `:has()` selector and `mask-image` are used in a few places. Current versions of all major browsers support them.
- The 3D globe requires WebGL. Without it, the static image is shown.
- The "Let's Connect" and "Call Us" buttons open the phone dialler on phones, or the default calling app on computers.
- The Vision slideshow can be changed with the arrows, by swiping on touch screens, or by dragging with a mouse.

## Team and Roles

| Member | Role | Contributions |
|---|---|---|
| Deepak Luitel | Web Developer Head | HTML, responsive CSS, JavaScript, security, accessibility and browser testing, deployment |
| Karma T Lhendup | Web Design Head | Wireframe, colour palette, layout, page text, image direction |
| Yeshey Ngedup Dorji | Logo and Background Design | Logo design, hero and footer backgrounds |

All members reviewed the whole page. See the Git history for individual commits.

## Image and Asset Credits

All images were generated with ChatGPT (OpenAI) for this project, using a reference sketch and sample imagery as creative direction. No photographs or artwork were copied from third parties.

| Asset | Used for | Source | Licence or permission | Date checked |
|---|---|---|---|---|
| `assets/images/background.png` | Hero background | Generated with ChatGPT (OpenAI) for this project | OpenAI terms of use for the account | 30/10/2026 |
| `assets/images/globe.png` | Static globe fallback | Generated with ChatGPT (OpenAI) for this project | OpenAI terms of use for the account | 30/10/2026 |
| `assets/images/globe-map.png` | Globe texture | Generated with ChatGPT (OpenAI) for this project | OpenAI terms of use for the account | 30/10/2026 |
| `assets/images/outer.png` | Orbit ring | Generated with ChatGPT (OpenAI) for this project | OpenAI terms of use for the account | 30/10/2026 |
| `assets/images/footer-bg.png` | Footer background | Generated with ChatGPT (OpenAI) for this project | OpenAI terms of use for the account | 30/10/2026 |
| `assets/images/footer-divider.jpeg` | Greek-key divider | Generated with ChatGPT (OpenAI) for this project | OpenAI terms of use for the account | 30/10/2026 |
| `assets/images/logo.png` | Logo | Designed by the team, generated with ChatGPT (OpenAI) from the team sketch | Created for Find X | 30/10/2026 |
| `assets/vision/vision-1.png` to `vision-6.png` | Our Vision slideshow | Generated with ChatGPT (OpenAI) for this project | OpenAI terms of use for the account | 30/10/2026 |

**Icons:** All icons in `assets/icons/` were created with Claude AI (Anthropic) for this project. No third-party icon sets are used. Date checked: 29/10/26.

**Typefaces**

| Font | Source | Licence |
|---|---|---|
| Playfair Display | Google Fonts | SIL Open Font License 1.1 |
| Lato | Google Fonts | SIL Open Font License 1.1 |

**Libraries**

| Library | Version | Licence | Source |
|---|---|---|---|
| Three.js | r128 | MIT License | https://threejs.org |

## Licence

All content, design, and code are the property of Find X unless otherwise stated. Third-party components keep their own licences, as noted above.

## Contact

Email: 12250025.gcit@rub.edu.bt