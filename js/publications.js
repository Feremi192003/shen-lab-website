const API_URL = 'https://api.zotero.org/groups/2660547/items/top';
const localUrl = 'data/publications.json';

const elements = {
  list: document.querySelector('#publication-list'),
  search: document.querySelector('#publication-search'),
  year: document.querySelector('#publication-year'),
  topic: document.querySelector('#publication-topic'),
  sort: document.querySelector('#publication-sort'),
  count: document.querySelector('#publication-count'),
  source: document.querySelector('#publication-source')
};

let publications = [];
let metadata = {};

const html = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

function creatorName(creator) {
  if (creator.name) return creator.name;
  return [creator.lastName, creator.firstName].filter(Boolean).join(', ');
}

function transformZoteroItem(item) {
  const data = item.data || item;
  const yearMatch = String(data.date || '').match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? Number(yearMatch[0]) : 0;
  const authors = (data.creators || []).map(creatorName).filter(Boolean).join('; ');
  const topics = (data.tags || []).map((tag) => tag.tag).filter(Boolean);
  const journal = data.publicationTitle || data.bookTitle || data.conferenceName ||
    data.institution || data.publisher || data.repository || data.type || '';
  const doi = (data.DOI || '').replace(/^https?:\/\/doi\.org\//i, '');
  const url = data.url || (doi ? `https://doi.org/${doi}` : '');
  const typeMap = {
    journalArticle: 'Journal article', conferencePaper: 'Conference paper',
    bookSection: 'Book chapter', preprint: 'Preprint', report: 'Report',
    thesis: 'Thesis', computerProgram: 'Software', document: 'Document',
    book: 'Book'
  };

  return {
    year,
    type: typeMap[data.itemType] || data.itemType || 'Publication',
    title: data.title || 'Untitled publication',
    authors,
    journal,
    volume: data.volume || '',
    issue: data.issue || '',
    pages: data.pages || '',
    doi,
    url,
    topics
  };
}

async function fetchZoteroLibrary() {
  const all = [];
  let start = 0;
  while (true) {
    const url = `${API_URL}?format=json&limit=100&start=${start}&sort=date&direction=desc&v=3`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Zotero request failed: ${response.status}`);
    const batch = await response.json();
    all.push(...batch);
    if (batch.length < 100) break;
    start += 100;
  }
  return all
    .filter((item) => !['attachment', 'note', 'annotation'].includes(item.data?.itemType))
    .map(transformZoteroItem)
    .filter((item) => item.title && item.year);
}

async function loadLibrary() {
  let localData;
  try {
    const localResponse = await fetch(localUrl, { cache: 'no-store' });
    if (!localResponse.ok) throw new Error('Local publication snapshot unavailable');
    localData = await localResponse.json();
    publications = Array.isArray(localData) ? localData : localData.publications || [];
    metadata = Array.isArray(localData) ? {} : localData.meta || {};
    initializeFilters();
    render();
  } catch (error) {
    elements.list.innerHTML = '<p class="publication-error">The local publication snapshot could not be loaded.</p>';
  }

  try {
    const live = await fetchZoteroLibrary();
    if (live.length > publications.length) {
      publications = live;
      metadata = { source: 'Live data from the Shen Lab public Zotero library', count: live.length };
      initializeFilters(true);
      render();
    }
  } catch (error) {
    // The static snapshot remains available. A GitHub Action also refreshes it after deployment.
  }
}

function initializeFilters(reset = false) {
  const selectedYear = elements.year.value;
  const selectedTopic = elements.topic.value;
  if (reset) {
    elements.year.innerHTML = '<option value="">All years</option>';
    elements.topic.innerHTML = '<option value="">All topics</option>';
  } else if (elements.year.options.length > 1) {
    return;
  }

  [...new Set(publications.map((item) => item.year).filter(Boolean))]
    .sort((a, b) => b - a)
    .forEach((year) => elements.year.insertAdjacentHTML('beforeend', `<option value="${year}">${year}</option>`));

  [...new Set(publications.flatMap((item) => item.topics || []).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .forEach((topic) => elements.topic.insertAdjacentHTML('beforeend', `<option value="${html(topic)}">${html(topic)}</option>`));

  if ([...elements.year.options].some((o) => o.value === selectedYear)) elements.year.value = selectedYear;
  if ([...elements.topic.options].some((o) => o.value === selectedTopic)) elements.topic.value = selectedTopic;
}

function filteredPublications() {
  const query = elements.search.value.trim().toLowerCase();
  const year = elements.year.value;
  const topic = elements.topic.value;
  const sort = elements.sort.value;

  const filtered = publications.filter((publication) => {
    const searchable = [
      publication.title, publication.authors, publication.journal,
      publication.doi, publication.type, publication.year,
      ...(publication.topics || [])
    ].join(' ').toLowerCase();

    return (!query || searchable.includes(query)) &&
      (!year || String(publication.year) === year) &&
      (!topic || (publication.topics || []).includes(topic));
  });

  return filtered.sort((a, b) => {
    if (sort === 'oldest') return (a.year - b.year) || a.title.localeCompare(b.title);
    if (sort === 'title') return a.title.localeCompare(b.title);
    return (b.year - a.year) || a.title.localeCompare(b.title);
  });
}

function citationLine(publication) {
  const details = [
    publication.journal,
    publication.volume,
    publication.pages
  ].filter(Boolean).join(' · ');
  return details || publication.type;
}

function render() {
  const filtered = filteredPublications();
  elements.count.textContent = `${filtered.length} of ${publications.length} publication${publications.length === 1 ? '' : 's'}`;
  elements.source.textContent = metadata.source || 'Shen Lab publication data';

  if (!filtered.length) {
    elements.list.innerHTML = '<div class="empty-state"><h2>No matching publications</h2><p>Try a different title, author, year, or topic.</p></div>';
    return;
  }

  let previousYear = null;
  elements.list.innerHTML = filtered.map((publication) => {
    const yearHeading = publication.year !== previousYear
      ? `<h2 class="publication-year-heading"><span>${publication.year || 'Undated'}</span></h2>`
      : '';
    previousYear = publication.year;
    const topicTags = (publication.topics || []).slice(0, 4)
      .map((topic) => `<span>${html(topic)}</span>`).join('');
    const link = publication.url
      ? `<a class="publication-link" href="${html(publication.url)}" aria-label="Open ${html(publication.title)}">Open paper ↗</a>`
      : '';
    const doi = publication.doi
      ? `<span class="doi">DOI ${html(publication.doi)}</span>`
      : '';

    return `${yearHeading}
      <article class="publication-record">
        <div class="publication-record-main">
          <div class="publication-tags">${topicTags}</div>
          <h3>${html(publication.title)}</h3>
          <p class="publication-authors">${html(publication.authors)}</p>
          <p class="publication-venue"><em>${html(citationLine(publication))}</em>${doi}</p>
        </div>
        <div class="publication-record-action">${link}</div>
      </article>`;
  }).join('');
}

['input', 'change'].forEach((eventName) => {
  elements.search.addEventListener(eventName, render);
  elements.year.addEventListener(eventName, render);
  elements.topic.addEventListener(eventName, render);
  elements.sort.addEventListener(eventName, render);
});

loadLibrary();