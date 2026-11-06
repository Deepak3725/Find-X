# Deploying the Find X Website

This guide explains how to put the Find X website online, connect your domain, and keep it secure. Follow **one** of the two production options: Netlify (simplest) or Cloudflare Pages. No coding is needed; everything is done in the host's dashboard.

GitHub Pages is covered at the end for demonstrations only.

---

## 1. Before you start

You will need:

- [ ] Access to the website's **GitHub repository** (the development team can add you).
- [ ] A free account on **Netlify** (https://www.netlify.com) **or** **Cloudflare** (https://dash.cloudflare.com).
- [ ] Access to your **domain** registrar account (where the domain name was bought), if you are using your own domain.
- [ ] **Two-factor authentication** switched on for GitHub, the hosting account, and the domain registrar. Use an authenticator app, not SMS.

The website is published from the `main` branch. Every time the team updates `main`, the host rebuilds and republishes the site automatically.

---

## 2. Option A: Netlify (recommended)

### 2.1 Create the site

1. Sign in to Netlify and choose **Add new site → Import an existing project**.
2. Choose **GitHub** and allow Netlify to access the Find X repository.
3. Select the repository and the **`main`** branch.
4. Leave **Build command** and **Publish directory** empty. The project's `netlify.toml` file sets them (`sh build.sh` and `dist`).
5. Click **Deploy**. After about a minute, Netlify shows a temporary address such as `https://find-x-123.netlify.app`.

### 2.2 Security settings (required)

In **Site configuration**:

- **Build & deploy → Post processing → Snippet injection:** make sure the list is **empty**. Added snippets would be blocked by the site's security policy.
- **Forms → Form detection:** **disable** (the site has no forms).
- **Build & deploy → Branches and deploy contexts:** set **Deploy previews** and **Branch deploys** to **None**, unless the team needs them.
- **Team settings → Members:** every member uses two-factor authentication; remove anyone who no longer needs access.

### 2.3 Connect your domain

1. **Domain management → Add a domain** and enter your domain, for example `findx.com`.
2. Follow Netlify's instructions to update the DNS records at your registrar (or move DNS to Netlify).
3. Under **HTTPS**, wait until the certificate shows as active (usually a few minutes). HTTPS and the redirect from `http://` to `https://` are then automatic.

---

## 3. Option B: Cloudflare Pages

### 3.1 Create the site

1. Sign in to Cloudflare and open **Workers & Pages → Create → Pages → Connect to Git**.
2. Choose **GitHub** and select the Find X repository.
3. Set the build settings exactly as follows:

   | Setting | Value |
   |---|---|
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `sh build.sh` |
   | Build output directory | `dist` |

4. Click **Save and Deploy**. Cloudflare shows a temporary address such as `https://find-x.pages.dev`.

### 3.2 Security settings (required)

These Cloudflare features change the page or add scripts. They **must be off**, or they can break parts of the site or trigger security-policy errors:

| Where | Setting | Value |
|---|---|---|
| Scrape Shield | Email Address Obfuscation | **Off** |
| Speed → Optimization | Rocket Loader | **Off** |
| Zaraz | Zaraz | **Not enabled** |
| Analytics → Web Analytics | Automatic setup / JS snippet | **Off** |

These settings should be **on**:

| Where | Setting | Value |
|---|---|---|
| SSL/TLS → Overview | Encryption mode | **Full (strict)** |
| SSL/TLS → Edge Certificates | Always Use HTTPS | **On** |
| SSL/TLS → Edge Certificates | Minimum TLS Version | **TLS 1.2** |
| SSL/TLS → Edge Certificates | TLS 1.3 | **On** |
| Security → Bots | Bot Fight Mode | On (optional) |

Also:

- **Pages project → Settings → Preview deployments:** disable, or protect them with Cloudflare Access.
- **Manage account → Members:** two-factor authentication for every member, with the lowest role each person needs.

### 3.3 Connect your domain

1. In the Pages project, open **Custom domains → Set up a custom domain**.
2. Enter your domain. If the domain already uses Cloudflare DNS, the record is added for you; otherwise follow the on-screen DNS instructions.
3. Wait until the domain shows **Active**. HTTPS is then automatic.

---

## 4. Domain security (both options)

At your domain registrar:

- [ ] Turn on **registrar lock** (also called transfer lock).
- [ ] Turn on **DNSSEC** if the registrar supports it.
- [ ] Add a **CAA record** so only your host's certificate authorities can issue certificates for the domain. Netlify uses `letsencrypt.org`; Cloudflare uses `letsencrypt.org`, `pki.goog` and `digicert.com`. Your host's support pages list the exact values.

---

## 5. Check the live site

After the first deploy and after connecting the domain, check the following. Replace `your-domain` with the real address.

| Check | How | Expected result |
|---|---|---|
| Security headers | Enter the address at https://securityheaders.com | Grade **A** or **A+** |
| Overall security | Enter the address at https://developer.mozilla.org/en-US/observatory | Grade **A** or higher |
| HTTPS | Enter the address at https://www.ssllabs.com/ssltest/ | Grade **A** or higher |
| HTTP redirect | Open `http://your-domain` | Moves to `https://` automatically |
| Private files hidden | Open `https://your-domain/README.md` | Shows the "Page not found" page |
| Security contact | Open `https://your-domain/.well-known/security.txt` | Shows the contact email |
| Page works | Open the site on a computer, a tablet and a phone | Globe, slideshow arrows and swiping, and the "Let's Connect" and "Call Us" buttons all work |
| No errors | In Chrome, press F12 → **Console** tab, then reload | No red "Content Security Policy" messages |

If any check fails, contact the development team (section 9).

---

## 6. Updating the website

- All changes are made by the development team in the GitHub repository and merged into `main`. The host then republishes automatically within a minute or two.
- Do **not** upload or edit files directly in the hosting dashboard. Changes made that way are not recorded and can be overwritten.
- Visitors see updates straight away; pages are set never to show an old copy.

## 7. Undoing a bad update (rollback)

- **Netlify:** **Deploys** → choose the last good deploy → **Publish deploy**.
- **Cloudflare Pages:** **Deployments** → open the last good deployment → **⋯ → Rollback to this deployment**.

The previous version is live again within seconds. Then tell the development team what happened.

## 8. Yearly maintenance

- [ ] Renew the `Expires` date in `.well-known/security.txt` (currently **06/11/2027**). The development team can do this in a minute.
- [ ] Review who has access to GitHub, the host and the registrar, and remove anyone who no longer needs it.
- [ ] Re-run the checks in section 5.
- [ ] Confirm the domain and its auto-renewal are paid up.

---

## 9. GitHub Pages (demonstrations only)

GitHub Pages is free and quick, and is fine for showing the site to others. It is **not** suitable for the official launch, because it cannot apply the site's security headers and it makes the project's notes (README, security policy, this guide) publicly readable.

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose `main` and `/ (root)`, and click **Save**.
3. After a minute, the demo is available at `https://<github-username>.github.io/<repository-name>/`.

Do not share the GitHub Pages address as the official website. Turn it off again (**Source → None**) once the production site is live.

---

## 10. Project team and contacts

| Name | Role |
|---|---|
| Deepak Luitel | Web Developer Head (development, security, deployment) |
| Karma T Lhendup | Web Design Head (layout, colours, content) |
| Yeshey Ngedup Dorji | Logo and Background Design |

Technical and security contact: **12250025.gcit@rub.edu.bt**

For full technical details, see `README.md`. For security controls and the complete pre-launch checklist, see `security.md`.
