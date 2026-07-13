const list = document.querySelector('#publication-list');
const search = document.querySelector('#publication-search');
const yearSelect = document.querySelector('#publication-year');
const count = document.querySelector('#publication-count');

let publications = [];

function render() {
  const query = search.value.trim().toLowerCase();
  const selectedYear = yearSelect.value;
  const filtered = publications.filter((publication) => {
    const searchable = [publication.title, publication.authors, publication.journal, publication.type, publication.year].join(' ').toLowerCase();
    return (!query || searchable.includes(query)) && (!selectedYear || String(publication.year) === selectedYear);
  });

  count.textContent = `${filtered.length} publication${filtered.length === 1 ? '' : 's'}`;
  list.innerHTML = filtered.length ? filtered.map((publication) => `
    <article class="publication-item">
      <div class="publication-year">${publication.year}</div>
      <div>
        <span class="tag">${publication.type}</span>
        <h2>${publication.title}</h2>
        <p class="publication-meta">${publication.authors} · <em>${publication.journal}</em></p>
      </div>
      <a class="button button-secondary" href="${publication.url}">View paper</a>
    </article>
  `).join('') : '<p>No publications match those filters.</p>';
}

fetch('data/publications.json')
  .then((response) => {
    if (!response.ok) throw new Error('Could not load publications.');
    return response.json();
  })
  .then((data) => {
    publications = data.sort((a, b) => b.year - a.year);
    [...new Set(publications.map((item) => item.year))].sort((a,b) => b-a).forEach((year) => {
      yearSelect.insertAdjacentHTML('beforeend', `<option value="${year}">${year}</option>`);
    });
    render();
  })
  .catch(() => {
    list.innerHTML = '<p>Publications could not be loaded. Open this site through a local or hosted web server rather than directly from the file system.</p>';
  });

search.addEventListener('input', render);
yearSelect.addEventListener('change', render);