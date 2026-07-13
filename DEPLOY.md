# Replace and push

From your local `shen-lab-website` repository:

```bash
# Remove the old website files but keep .git
rm -rf css js data research scripts .github
rm -f index.html research.html people.html publications.html resources.html news.html openings.html contact.html 404.html robots.txt README.md .nojekyll

# Copy the CONTENTS of this finalized folder into the repository root.
# Then:
git add .
git commit -m "Finalize homepage research pages and publication library"
git push origin main
```

After the push:

1. Open the repository's **Actions** tab.
2. Confirm **Sync publications** completes successfully.
3. Confirm **Pages build and deployment** completes successfully.
4. Hard-refresh the live website.

If the publication workflow reports a permission error, go to:

**Settings → Actions → General → Workflow permissions → Read and write permissions**

The workflow already declares `contents: write`, which is sufficient for most public repositories.
