(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = qs('.hero-slider');
        if (!slider) {
            return;
        }
        var slides = qsa('.hero-slide', slider);
        var dots = qsa('.hero-dots button', slider);
        var previous = qs('.hero-prev', slider);
        var next = qs('.hero-next', slider);
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                activate(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                activate(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                activate(i);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    function setupCardFilter() {
        var input = qs('[data-filter-input]');
        if (!input) {
            return;
        }
        var cards = qsa('.movie-card[data-search-text]');
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = card.getAttribute('data-search-text') || '';
                card.style.display = !value || haystack.indexOf(value) !== -1 ? '' : 'none';
            });
        });
    }

    function setupSearchPage() {
        var results = qs('[data-search-results]');
        if (!results || typeof SITE_MOVIES === 'undefined') {
            return;
        }
        var form = qs('[data-search-form]');
        var input = qs('[data-search-query]');
        var empty = qs('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input) {
            input.value = initial;
        }

        function createCard(movie) {
            var article = document.createElement('article');
            article.className = 'movie-card';
            article.innerHTML = [
                '<a href="' + movie.url + '" class="movie-link">',
                '<span class="poster-wrap">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-shade"></span>',
                '<span class="play-mark">▶</span>',
                '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
                '</span>',
                '<span class="card-body">',
                '<strong>' + escapeHtml(movie.title) + '</strong>',
                '<em>' + escapeHtml(movie.category) + '</em>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<span class="tag-row">' + movie.tags.slice(0, 2).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('') + '</span>',
                '</span>',
                '</a>'
            ].join('');
            return article;
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function render(query) {
            var keyword = String(query || '').trim().toLowerCase();
            results.innerHTML = '';
            if (!keyword) {
                if (empty) {
                    empty.style.display = '';
                    empty.textContent = '输入片名、类型、年份或关键词即可搜索影片。';
                }
                return;
            }
            var matches = SITE_MOVIES.filter(function (movie) {
                return movie.searchText.indexOf(keyword) !== -1;
            }).slice(0, 120);
            if (empty) {
                empty.style.display = matches.length ? 'none' : '';
                empty.textContent = matches.length ? '' : '未找到相关影片。';
            }
            matches.forEach(function (movie) {
                results.appendChild(createCard(movie));
            });
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = input ? input.value.trim() : '';
                var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
                window.history.replaceState(null, '', nextUrl);
                render(query);
            });
        }
        render(initial);
    }

    function initMoviePlayer(mediaUrl) {
        var shell = qs('[data-player]');
        if (!shell) {
            return;
        }
        var video = qs('video', shell);
        var layer = qs('[data-player-start]', shell);
        if (!video || !mediaUrl) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(mediaUrl);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = mediaUrl;
        } else {
            video.src = mediaUrl;
        }

        function playVideo() {
            if (layer) {
                layer.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener('click', playVideo);
        }
        video.addEventListener('play', function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupCardFilter();
        setupSearchPage();
    });
})();
