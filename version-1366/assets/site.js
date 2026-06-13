(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var localFilter = document.querySelector('[data-local-filter]');
    var filterList = document.querySelector('[data-filter-list]');

    if (localFilter && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-search]'));

        localFilter.addEventListener('input', function () {
            var keyword = localFilter.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('is-filter-hidden', keyword && haystack.indexOf(keyword) === -1);
            });
        });
    }

    var rankFilter = document.querySelector('[data-rank-filter]');
    var rankList = document.querySelector('[data-rank-list]');

    if (rankFilter && rankList) {
        var rows = Array.prototype.slice.call(rankList.querySelectorAll('.rank-row'));

        rankFilter.addEventListener('input', function () {
            var keyword = rankFilter.value.trim().toLowerCase();

            rows.forEach(function (row) {
                row.classList.toggle('is-filter-hidden', keyword && row.textContent.toLowerCase().indexOf(keyword) === -1);
            });
        });
    }

    var searchResults = document.querySelector('[data-search-results]');
    var searchTitle = document.querySelector('[data-search-title]');
    var searchInput = document.querySelector('[data-search-input]');

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderMovieCard(movie) {
        var tags = movie.tags.slice(0, 4).map(function (tag) {
            return '<span>' + escapeHTML(tag) + '</span>';
        }).join('');

        return [
            '<article class="movie-card">',
            '<a class="movie-cover" href="' + escapeHTML(movie.url) + '">',
            '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '">',
            '<span class="score-badge">' + escapeHTML(movie.score) + '</span>',
            '</a>',
            '<div class="movie-content">',
            '<div class="movie-meta"><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.type) + '</span></div>',
            '<h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>',
            '<p>' + escapeHTML(movie.oneLine) + '</p>',
            '<div class="movie-tags">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    if (searchResults) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();

        if (searchInput) {
            searchInput.value = query;
        }

        if (searchTitle) {
            searchTitle.textContent = query ? '“' + query + '” 的搜索结果' : '推荐浏览';
        }

        fetch('./assets/search-index.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (movies) {
                var keyword = query.toLowerCase();
                var result = movies;

                if (keyword) {
                    result = movies.filter(function (movie) {
                        return movie.search.indexOf(keyword) !== -1;
                    });
                }

                result = result.slice(0, 120);

                if (!result.length) {
                    searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片，请更换关键词。</div>';
                    return;
                }

                searchResults.innerHTML = result.map(renderMovieCard).join('');
            })
            .catch(function () {
                searchResults.innerHTML = '<div class="empty-state">搜索暂时不可用，请从分类页继续浏览。</div>';
            });
    }
})();
