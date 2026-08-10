from pathlib import Path
import re

root = Path(".")

# Get the new header directly from index.html
index_text = Path("index.html").read_text()

match = re.search(
    r'<header class="site-header">.*?</header>',
    index_text,
    flags=re.DOTALL
)

if not match:
    raise RuntimeError("Could not find header in index.html")

master_header = match.group(0)

# Top-level HTML pages only
for path in root.glob("*.html"):
    if path.name == "index.html":
        continue

    text = path.read_text()

    # Preserve which navigation item is active
    header = master_header

    # Remove Home's active state copied from index.html
    header = header.replace(
        'href="index.html" aria-current="page"',
        'href="index.html"'
    )

    # Make the appropriate link active
    header = header.replace(
        f'href="{path.name}"',
        f'href="{path.name}" aria-current="page"',
        1
    )

    new_text, count = re.subn(
        r'<header class="site-header">.*?</header>',
        header,
        text,
        count=1,
        flags=re.DOTALL
    )

    if count:
        path.write_text(new_text)
        print(f"Updated: {path}")
    else:
        print(f"SKIPPED (no header found): {path}")
