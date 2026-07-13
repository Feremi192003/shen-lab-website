import { writeFile } from 'node:fs/promises';

const API_URL = 'https://api.zotero.org/groups/2660547/items/top';
const OUTPUT = new URL('../data/publications.json', import.meta.url);

function creatorName(creator) {
  if (creator.name) return creator.name;
  return [creator.lastName, creator.firstName].filter(Boolean).join(', ');
}

function transform(item) {
  const data = item.data || item;
  const yearMatch = String(data.date || '').match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? Number(yearMatch[0]) : 0;
  const doi = (data.DOI || '').replace(/^https?:\/\/doi\.org\//i, '');
  const typeMap = {
    journalArticle: 'Journal article',
    conferencePaper: 'Conference paper',
    bookSection: 'Book chapter',
    preprint: 'Preprint',
    report: 'Report',
    thesis: 'Thesis',
    computerProgram: 'Software',
    document: 'Document',
    book: 'Book'
  };

  return {
    year,
    type: typeMap[data.itemType] || data.itemType || 'Publication',
    title: data.title || 'Untitled publication',
    authors: (data.creators || []).map(creatorName).filter(Boolean).join('; '),
    journal: data.publicationTitle || data.bookTitle || data.conferenceName ||
      data.institution || data.publisher || data.repository || '',
    volume: data.volume || '',
    issue: data.issue || '',
    pages: data.pages || '',
    doi,
    url: data.url || (doi ? `https://doi.org/${doi}` : ''),
    topics: (data.tags || []).map((tag) => tag.tag).filter(Boolean)
  };
}

async function fetchAll() {
  const items = [];
  for (let start = 0; ; start += 100) {
    const url = `${API_URL}?format=json&limit=100&start=${start}&sort=date&direction=desc&v=3`;
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Zotero-API-Version': '3',
        'User-Agent': 'Shen-Lab-Website-Publication-Sync/1.0'
      }
    });
    if (!response.ok) throw new Error(`Zotero API returned ${response.status}`);
    const batch = await response.json();
    items.push(...batch);
    if (batch.length < 100) break;
  }
  return items;
}

const rawItems = await fetchAll();
const publications = rawItems
  .filter((item) => !['attachment', 'note', 'annotation'].includes(item.data?.itemType))
  .map(transform)
  .filter((item) => item.title && item.year)
  .sort((a, b) => (b.year - a.year) || a.title.localeCompare(b.title));

const payload = {
  meta: {
    source: 'Shen Lab public Zotero library',
    zoteroGroup: 2660547,
    updated: new Date().toISOString(),
    count: publications.length
  },
  publications
};

await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Wrote ${publications.length} publications to ${OUTPUT.pathname}`);
