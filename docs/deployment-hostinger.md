# Hostinger Premium Web Hosting — isolated private preview

No public deployment or domain configuration has been performed. These are instructions for the owner **after approval to upload a private preview**. Full boundary provenance is not cleared; use only the boundary-free preview package.

## What is ready

- `artifacts/iui-hostinger-private-preview.zip`: production-compiled React/Vite static files, suitable for PHP/HTML shared hosting. No Node server, database, API key or build tool is required on Hostinger.
- `artifacts/iui-hostinger-private-preview-manifest.json`: package SHA256 and per-file hashes, source commit/working-tree state, geometry-exclusion audit and access-default declaration.
- Static entries: `index.html`, hashed JS/CSS in `assets/`, `data/boundaries.json` with `collection: null`, `robots.txt`, and `.htaccess`.
- Administrative polygons, uploaded geometry, raw source evidence, Python files, repository files, credentials and source maps are excluded. Approximate reference markers are retained as navigation aids; they are not boundary geometry.
- Indonesian/English UI and the supplied verified SP2020 comparison are retained, with existing verification/reuse limitations visible.

`npm run build` produces the full development artifact in `dist/`, **which contains uncleared geometry**. Do not upload it. The correct command for this fallback is:

```sh
npm ci
npm run package:hostinger-preview
```

The preview output is `dist-private-preview/`; packaging emits the ZIP and audit manifest. The audit fails if unapproved files or distinctive supplied boundary coordinates appear. Package generation does not upload anything.

## Keep the new website separate from binichsan.com

1. Choose/register the **new domain**. This document uses `NEW-IUI-DOMAIN` as a placeholder; replace it with the real domain. It is not an actual configured hostname.
2. In Hostinger hPanel's **Websites** area, add a **separate website** using a PHP/HTML/empty-site hosting option (labels vary). Confirm your subscription has an available website slot. Do not replace an existing website to free a slot.
3. Assign the new domain to that new website. It must have its **own document root**, not an alias, parked domain, redirect or shared root for binichsan.com.
4. Open the new site's dashboard and File Manager. Confirm both the selected domain and document-root path before touching any file. A typical root is `/home/ACCOUNT/domains/NEW-IUI-DOMAIN/public_html`, but use the actual path shown by hPanel.
5. Leave binichsan.com's files, application, `.htaccess`, DNS, database and SSL configuration unchanged. Do not enable a cross-domain redirect or copy its authentication configuration.

If the new domain is registered elsewhere, point **only that domain** to the Hostinger nameservers or A/AAAA records supplied for the new website. Do not invent an IP address or reuse DNS values from this document. Allow propagation, issue SSL for the new hostname, and enable HTTPS for the new website. Preserve existing email records if the new domain already has mail.

## Upload after approval, with access denied by default

1. Download the ZIP and manifest. Optionally compare the ZIP SHA256 with the manifest before upload.
2. In the **new website's** File Manager, select its document root. Preserve/archive any existing new-site files outside the web root before replacing them. Do not modify the old site's root.
3. Upload and extract the ZIP so `index.html` and `.htaccess` sit directly inside the new document root. Do not leave them nested inside `dist-private-preview/`. Enable hidden-file display to verify `.htaccess` was extracted. Archive files use mode 0644; confirm extracted directories have normal 0755 permissions in File Manager.
4. Remove the uploaded ZIP from the document root after extraction. Keep your local archive/manifest for rollback and audit. Never upload the Git repository, `public/`, `docs/`, or the full `dist/` directory.
5. Before configuring authentication, unauthenticated requests should be denied (normally HTTP 403) by the included `Require all denied`. If content is served without authentication, stop and investigate whether `.htaccess` is being applied; do not remove protection to troubleshoot the app.

The package contains no domain-specific redirect and uses root-relative Vite asset paths. Hash routes such as `/#compare` need no SPA rewrite rules and work on a domain root. A subfolder deployment would require rebuilding with the corresponding Vite base path; this package targets the **new domain's root**.

## Configure private access on the new site

Use Hostinger's directory password-protection feature if available for this website/root. Have it protect the **entire new document root**, including `/assets/` and `/data/`, not just `index.html`. Use unique credentials managed securely in hPanel; never put them in source control or send them in chat.

The included deny rule is a deliberate starting state. Once root-level Basic authentication is configured, inspect the resulting access block. It should use `AuthType Basic`, a site-specific `AuthUserFile` and `Require valid-user`. Replace/remove the default `Require all denied` only as part of that verified authentication configuration. Preserve the no-index and no-store headers.

A representative access block is:

```apache
AuthType Basic
AuthName "IUI private review"
AuthUserFile "/ABSOLUTE/PATH/OUTSIDE/THE/WEB/ROOT/.htpasswd-iui-preview"
Require valid-user
```

This is a template, **not a usable password setup**. Use the actual path and password file created for this new website. Keep the password file outside its public document root. Do not copy a credential file from binichsan.com. If hPanel cannot configure root protection, ask Hostinger support to configure it rather than publishing an unprotected preview.

`robots.txt`, robots meta tags and `X-Robots-Tag` discourage indexing; they do not provide privacy. A client-side login screen or a JavaScript password is also not sufficient.

## Verify on Hostinger before sharing access

Hostinger/Apache/LiteSpeed authentication, SSL, DNS and response headers have **not** been exercised in this environment. The local Vite test server does not interpret `.htaccess`; owner-side checks are required after approved upload.

- In a fresh private browser window, requests to `/`, a concrete `/assets/FILE.js` from the manifest, and `/data/boundaries.json` must require credentials (normally HTTP 401 after Basic auth is configured). Default-denied 403 before configuration is expected.
- After login, `/` and the real asset URLs should return 200 over HTTPS; the UI should load without mixed-content or asset errors. Verify both languages and mobile layout.
- The map must show reference points and a message that administrative boundaries are withheld. The boundary checkbox must be disabled. `/data/boundaries.json` must contain `status: blocked`, `reason: provenance-withheld`, and `collection: null`.
- Check comparison values: Yogyakarta 373,589; Sleman 1,125,804; Bantul 985,770 (localized separators differ). Source links and limitations must remain visible.
- Uploaded boundary/source paths must not exist on the server. The ZIP/manifest and `.htpasswd` must not be downloadable from the website root.
- Check `X-Robots-Tag: noindex, nofollow, noarchive` and no directory listing. Network/browser access to OpenStreetMap is a separate dependency; its failure must not break navigation/comparisons. Follow OSM tile policy; use a suitable tile provider before substantial public traffic.
- Confirm binichsan.com still serves its existing website and has no changed redirect, files or DNS.

Use hPanel's actual new-site host/IP information. No credentials or domain values are embedded in the artifact.

## Final validation and rollback

Development checks (including the retained real geometry):

```sh
IUI_GIS_PYTHON=/tmp/iui-gis-venv/bin/python npm run data:validate
npm run typecheck
npm run build
npm test
npm run package:hostinger-preview
npm run test:private-preview
```

The Python environment requires `pip install -r scripts/requirements-geospatial.txt`. `data:validate:release` intentionally remains blocked while source notices and upstream geometry equality are unresolved; building this boundary-free private preview does not clear that gate or authorize public deployment.

For rollback, restore only the **new website's** prior reviewed package and its protected configuration. Do not reset the feature branch, change the main branch, or touch binichsan.com. A public release with polygons requires completing `docs/geoboundaries-provenance.md`, passing release validation, and explicit approval.

## Ringkasan Bahasa Indonesia

Gunakan paket `iui-hostinger-private-preview.zip`, bukan hasil `dist/` pengembangan yang masih memuat geometri belum selesai ditinjau. Paket pratinjau tidak menyertakan poligon/sumber asli, dan `.htaccess` menolak akses secara bawaan. Setelah ada persetujuan unggah, buat situs PHP/HTML **baru** dengan domain dan document root terpisah; jangan ubah berkas/DNS/SSL binichsan.com. Pasang SSL dan autentikasi direktori pada seluruh root situs baru sebelum berbagi akses. Periksa bahwa pengunjung tanpa kredensial tidak dapat mengakses HTML, aset, maupun data; setelah login, uji kedua bahasa dan perbandingan SP2020. Keamanan server Hostinger belum diuji dari lingkungan ini dan harus diverifikasi setelah unggah yang disetujui. Pratinjau ini tidak menyatakan lisensi batas sudah layak rilis publik.
