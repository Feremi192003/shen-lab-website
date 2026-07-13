# Shen Laboratory Website

A responsive static website for the Shen Laboratory at the University of Maryland.

## Run locally

Because the publications page loads JSON, use a local web server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy with GitHub Pages

1. Push these files to the repository's `main` branch.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose `main` and `/ (root)`, then save.

## Content to replace before launch

- Current team names, photos, titles, and profile links.
- Complete publication data and direct DOI/publisher links.
- Current job openings and application details.
- Confirm the preferred lab email and physical address.
- Add real news posts and dates.
- Add social preview image, favicon, and analytics only if approved.

## Structure

- Top-level HTML pages for primary navigation
- `research/` for research detail pages
- `css/styles.css` for the visual system
- `js/script.js` for responsive navigation
- `js/publications.js` and `data/publications.json` for publication filtering
