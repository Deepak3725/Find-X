# Find X Website

A secure, single-page website for Find X, a practical business consultancy focused on sustainable growth. The site is built with plain HTML, CSS, and JavaScript, with no build step and no runtime third-party dependencies.

## Overview

The site contains:

- A hero section with a typewriter headline and an interactive 3D globe (Three.js, included locally)
- Our Approach: three process cards with detail panels
- What We Can Help With: three service cards with detail panels
- Our Vision: a full-width image slideshow with typed headings, plus three summary cards
- Get in Touch: contact actions
- A footer with contact details, social links, and a decorative divider

## Project Structure
Find_X/
├── index.html
├── _headers
├── SECURITY.md
├── README.md
├── css/
│ └── style.css
├── js/
│ ├── main.js
│ ├── globe.js
│ └── vendor/
│ └── three.min.js
└── assets/
├── fonts/
│ ├── PlayfairDisplay-Bold.woff2
│ ├── Lato-Regular.woff2
│ └── Lato-Bold.woff2
├── icons/
│ ├── search.svg
│ ├── lightbulb.svg
│ ├── trending-up.svg
│ ├── settings.svg
│ ├── computer.svg
│ ├── leaf.svg
│ ├── heritage.svg
│ ├── growth.svg
│ ├── technology.svg
│ ├── email.svg
│ ├── phone.svg
│ ├── location.svg
│ ├── facebook.svg
│ ├── whatsapp.svg
│ ├── telegram.svg
│ └── close.svg
├── images/
│ ├── logo.png
│ ├── background.png
│ ├── globe.png
│ ├── globe-map.png
│ ├── outer.png
│ ├── footer-bg.png
│ └── footer-divider.jpeg
└── vision/
├── vision-1.png
├── vision-2.png
├── vision-3.png
├── vision-4.png
├── vision-5.png
└── vision-6.png



## Requirements

- A current version of Chrome, Edge, Firefox, or Safari
- WebGL support for the 3D globe. Without it, a static image is shown instead.
- Any static file host, such as Netlify, Cloudflare Pages, Apache, or Nginx

No Node.js, npm, or build tools are required.

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

## Deployment

1. Deploy only the production files: `index.html`, `_headers`, `css/`, `js/`, and `assets/`.
2. Do not deploy `.git`, backups, drafts, `.env` files, or development notes.
3. Serve the site over HTTPS only.
4. Apply the security headers in `_headers`, or the equivalent in the server configuration. See `SECURITY.md` for the full hosting requirements.
5. Complete the pre-launch checklist in `SECURITY.md`, section 9.

### GitHub Pages

1. Create a public repository, upload the project files, and commit.
2. Go to **Settings → Pages**, set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`, and save.
3. The site is then available at `https://YOUR-USERNAME.github.io/find-x/`.

GitHub Pages does not read `_headers`, so the HTTP security headers will not apply on that host. The Content Security Policy meta tag in `index.html` still applies.

## Before Launch

- Confirm all social and contact links point to the correct accounts, and replace any placeholder links.
- Confirm the Three.js integrity hash on the script tag matches the live file. Regenerate it whenever `js/vendor/three.min.js` changes. From PowerShell, in the project folder:
  ```powershell
  $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path "js\vendor\three.min.js"))
  $sha = [System.Security.Cryptography.SHA384]::Create()
  "sha384-" + [System.Convert]::ToBase64String($sha.ComputeHash([byte[]]$bytes))
  ```
- Replace the remaining "TODO-CONTENT" placeholder in the hero section with final copy.
- Confirm the contact details (email, phone, and social links) with the project lead.
- Add the final logo as an SVG file alongside the PNG.
- Run the checks in `SECURITY.md`, section 9.

## Customising Content

| What to change | Where |
|---|---|
| Hero headline phrases | `PHRASES` array in `js/main.js` |
| Typing and erasing speed | `TYPE_MS`, `ERASE_MS`, `CHAR_MS` in `js/main.js` |
| Slideshow timing | `SHOW_MS` in `js/main.js` |
| Slideshow order | The `vision-slide` blocks in `index.html` |
| Globe size and position | `GLOBE_RADIUS` in `js/globe.js`, and `.hero-visual` in `css/style.css` |
| Globe sensitivity and momentum | `DRAG_SENS`, `FLING_MAX`, `FRICTION` in `js/globe.js` |
| Colours | `:root` variables at the top of `css/style.css` and the footer variables |
| Contact details | `mailto:`, `tel:`, and social links in the header, the contact section, and the footer |
| Text and images | `index.html`. Replace an image by saving a file with the same name in the same folder. |

## Security

Security controls are described in `SECURITY.md`. In summary:

- A strict Content Security Policy blocks inline scripts, third-party scripts, and framing.
- The page never builds HTML from user input. No `innerHTML`, `eval`, or `document.write` is used.
- Every external link opens with `rel="noopener noreferrer"`.
- Three.js is served locally with a Subresource Integrity hash.
- The site has no forms, no analytics, and no tracking.

To report a security issue, follow `SECURITY.md`, section 11. Do not publish details before the issue is fixed.

## Accessibility

- Semantic landmarks (`header`, `main`, `nav`, `footer`) and a skip link
- Keyboard support for cards and panels: Enter or Space to open, Escape to close
- Visible focus styles on interactive elements
- Animations stop when the user has enabled reduced motion
- The decorative 3D globe is hidden from screen readers, and a static fallback image is shown if WebGL is unavailable

## Browser Notes

- The `:has()` selector and `mask-image` are used in a few places. Current versions of all major browsers support them.
- The 3D globe requires WebGL. Without it, the static image is shown.
- Mail links try the default mail app first. If none opens, a Gmail compose window opens in a new tab.

## Team and Roles

| Member | Role | Contributions |
|---|---|---|
| Karma T Lhendup | Design and content lead | Wireframe, colour palette, logo drafts, page text, image direction |
| Deepak Luitel | Development and testing lead | HTML, responsive CSS, JavaScript, accessibility and browser testing |

Both members contributed code and reviewed the whole page. See the Git history for individual commits.

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