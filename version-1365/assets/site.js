import { H as Hls } from './hls.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

function initImageFallback() {
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      const shell = image.closest('.poster-shell');
      if (shell) {
        shell.classList.add('is-missing');
      }
      image.remove();
    }, { once: true });
  });
}

function initHero() {
  const hero = $('[data-hero]');
  if (!hero) return;

  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  const prev = $('[data-hero-prev]', hero);
  const next = $('[data-hero-next]', hero);
  if (slides.length <= 1) return;

  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5500);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  prev?.addEventListener('click', () => {
    show(index - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    start();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  start();
}

function initPlayer() {
  const video = $('#movie-player');
  if (!video) return;

  const source = video.dataset.src;
  const overlay = $('[data-play-overlay]');
  if (!source) return;

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else {
    video.insertAdjacentHTML(
      'afterend',
      '<div class="player-message">当前浏览器不支持 HLS 播放，请更换新版浏览器访问。</div>',
    );
  }

  overlay?.addEventListener('click', async () => {
    try {
      await video.play();
      overlay.classList.add('hidden');
    } catch (error) {
      overlay.classList.remove('hidden');
    }
  });

  video.addEventListener('play', () => overlay?.classList.add('hidden'));
  video.addEventListener('pause', () => overlay?.classList.remove('hidden'));
}

function initSearch() {
  const form = $('[data-search-form]');
  const results = $('[data-search-results]');
  const info = $('[data-search-info]');
  if (!form || !results || !window.MOVIE_DATA) return;

  const params = new URLSearchParams(window.location.search);
  const qInput = form.elements.q;
  const categoryInput = form.elements.category;
  qInput.value = params.get('q') || '';
  categoryInput.value = params.get('category') || '';

  const renderCard = (movie) => {
    const tags = (movie.tags || []).slice(0, 2).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('');
    return `
      <article class="movie-card">
        <a class="card-cover" href="${escapeAttribute(movie.url)}">
          <div class="poster-shell" data-cover-label="${escapeAttribute(movie.title.slice(0, 12))}">
            <img src="${escapeAttribute(movie.cover)}" alt="${escapeAttribute(movie.title)}" loading="lazy">
          </div>
          <span class="card-category">${escapeHtml(movie.category)}</span>
          <span class="card-year">${escapeHtml(movie.year)}</span>
          <span class="play-mask">▶</span>
        </a>
        <div class="card-body">
          <h3><a href="${escapeAttribute(movie.url)}">${escapeHtml(movie.title)}</a></h3>
          <p>${escapeHtml(movie.oneLine || movie.summary || '')}</p>
          <div class="card-foot">
            <span>${escapeHtml(movie.region)}</span>
            <span>热度 ${escapeHtml(String(movie.hotScore))}</span>
          </div>
          <div class="tag-list">${tags}</div>
        </div>
      </article>`;
  };

  const run = () => {
    const q = qInput.value.trim().toLowerCase();
    const category = categoryInput.value.trim();
    const matched = window.MOVIE_DATA.filter((movie) => {
      const inCategory = !category || movie.category === category;
      const text = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        movie.summary,
        ...(movie.tags || []),
      ].join(' ').toLowerCase();
      return inCategory && (!q || text.includes(q));
    }).slice(0, 120);

    results.innerHTML = matched.map(renderCard).join('');
    initImageFallback();
    if (info) {
      info.textContent = matched.length
        ? `找到 ${matched.length} 条结果，最多显示前 120 条。`
        : '没有找到匹配结果，请更换关键词。';
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (qInput.value.trim()) next.set('q', qInput.value.trim());
    if (categoryInput.value.trim()) next.set('category', categoryInput.value.trim());
    window.history.replaceState(null, '', `${window.location.pathname}?${next.toString()}`);
    run();
  });

  categoryInput.addEventListener('change', run);
  qInput.addEventListener('input', () => {
    window.clearTimeout(qInput.searchTimer);
    qInput.searchTimer = window.setTimeout(run, 160);
  });

  run();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initImageFallback();
  initHero();
  initPlayer();
  initSearch();
});
