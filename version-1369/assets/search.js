(function () {
  const form = document.querySelector('[data-site-search]');
  const input = document.querySelector('[data-site-search-input]');
  const results = document.querySelector('[data-search-results]');
  const title = document.querySelector('[data-search-title]');
  const data = Array.isArray(window.MovieSearchIndex) ? window.MovieSearchIndex : [];

  if (!form || !input || !results) {
    return;
  }

  function card(item) {
    const tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="card-cover" href="' + item.url + '" style="background-image: url(\'' + item.cover + '\');" aria-label="' + escapeHtml(item.title) + '">',
      '    <span class="play-chip">播放</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '    <div class="meta-row">',
      '      <span>' + escapeHtml(item.region) + '</span>',
      '      <span>' + escapeHtml(item.type) + '</span>',
      '      <span>' + escapeHtml(item.year) + '</span>',
      '    </div>',
      '    <div class="tag-row search-tags">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function render(query) {
    const keyword = query.trim().toLowerCase();
    const items = keyword
      ? data.filter(function (item) {
          const haystack = [
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            item.oneLine,
            (item.tags || []).join(' ')
          ].join(' ').toLowerCase();
          return haystack.indexOf(keyword) !== -1;
        }).slice(0, 80)
      : data.slice(0, 60);

    results.innerHTML = items.map(card).join('');

    if (title) {
      title.textContent = keyword ? '与“' + query + '”相关的影片' : '热门推荐';
    }
  }

  input.value = getQuery();
  render(input.value);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = input.value.trim();
    const url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
    window.history.replaceState({}, '', url);
    render(query);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });
}());
