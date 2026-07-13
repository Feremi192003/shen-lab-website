# Shen Laboratory Website

A fast, accessible static website for the Shen Laboratory at the University of Maryland School of Pharmacy.

## What is included

- A redesigned editorial homepage with a custom molecular SVG animation
- A complete research architecture with five rich research-detail pages
- A searchable publication browser
- Automatic publication synchronization from the lab's public Zotero group
- Responsive navigation, reduced-motion support, semantic HTML, and keyboard focus behavior
- GitHub Pages–compatible relative paths and `.nojekyll`

## Preview locally

The publication browser loads JSON, so use a local server instead of double-clicking the HTML file:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy

Copy these files into the root of the existing repository, then run:

```bash
git add .
git commit -m "Finalize homepage research pages and publication library"
git push origin main
```

GitHub Pages should publish from:

- Branch: `main`
- Folder: `/ (root)`

## Publication synchronization

The repository includes:

- `scripts/sync-publications.mjs`
- `.github/workflows/sync-publications.yml`

On the first push, GitHub Actions fetches the complete public Zotero group library and replaces the curated launch snapshot in `data/publications.json`. It then checks weekly for updates.

You can also run the sync manually:

```bash
node scripts/sync-publications.mjs
```

The public Zotero group is `2660547`.

## Content still requiring lab approval

The design and research migration are complete, but the lab should confirm:

- Preferred wording for unpublished/submitted manuscripts
- Whether all Zotero items should be public
- Final team photos and biographies
- Current openings and contact-form handling
- University branding and accessibility review
