(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initMenu() {
        var button = select('[data-menu-button]');
        var panel = select('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = select('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = select('[data-hero-prev]', hero);
        var next = select('[data-hero-next]', hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initLocalFilter() {
        var input = select('[data-local-filter]');
        if (!input) {
            return;
        }
        var cards = selectAll('[data-card]');
        input.addEventListener('input', function () {
            var keyword = normalize(input.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search-text'));
                card.hidden = keyword && text.indexOf(keyword) === -1;
            });
        });
    }

    function initSearchPage() {
        var form = select('[data-search-form]');
        var input = select('[data-site-search]');
        var results = select('[data-search-results]');
        if (!form || !input || !results) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function render(query) {
            var keyword = normalize(query);
            var data = window.MOVIE_SEARCH_DATA || [];
            results.innerHTML = '';
            if (!keyword) {
                return;
            }
            var matched = data.filter(function (movie) {
                return normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine).indexOf(keyword) !== -1;
            }).slice(0, 80);
            var title = document.createElement('h2');
            title.className = 'search-title';
            title.textContent = matched.length ? '搜索结果' : '未找到相关内容';
            results.appendChild(title);
            if (!matched.length) {
                return;
            }
            var grid = document.createElement('div');
            grid.className = 'movie-grid';
            grid.innerHTML = matched.map(function (movie) {
                var tagHtml = movie.tags.slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');
                return '<a class="movie-card" href="' + escapeHtml(movie.detail) + '">' +
                    '<span class="poster-wrap">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
                    '</span>' +
                    '<span class="card-body">' +
                    '<strong>' + escapeHtml(movie.title) + '</strong>' +
                    '<em>' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.genre) + '</em>' +
                    '<span class="card-line">' + escapeHtml(movie.oneLine) + '</span>' +
                    '<span class="tag-row">' + tagHtml + '</span>' +
                    '</span>' +
                    '</a>';
            }).join('');
            results.appendChild(grid);
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = new URL(window.location.href);
            if (query) {
                url.searchParams.set('q', query);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState(null, '', url.toString());
            render(query);
        });

        render(initial);
    }

    function initPlayers() {
        selectAll('[data-player]').forEach(function (player) {
            var video = select('video', player);
            var overlay = select('.player-overlay', player);
            if (!video || !overlay) {
                return;
            }
            var source = video.getAttribute('data-hls');
            var prepared = false;

            function prepare() {
                if (prepared || !source) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    player.hls = hls;
                } else {
                    video.src = source;
                }
                prepared = true;
            }

            function play() {
                prepare();
                overlay.classList.add('is-hidden');
                video.setAttribute('controls', 'controls');
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {});
                }
            }

            overlay.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (!prepared || video.paused) {
                    play();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initLocalFilter();
        initSearchPage();
        initPlayers();
    });
})();
