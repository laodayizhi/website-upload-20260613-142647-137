(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var carousel = document.querySelector('[data-hero-carousel]');
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
            var prev = carousel.querySelector('[data-hero-prev]');
            var next = carousel.querySelector('[data-hero-next]');
            var index = 0;

            function show(nextIndex) {
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle('is-active', itemIndex === index);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle('is-active', itemIndex === index);
                });
            }

            if (slides.length > 1) {
                if (prev) {
                    prev.addEventListener('click', function () {
                        show(index - 1);
                    });
                }
                if (next) {
                    next.addEventListener('click', function () {
                        show(index + 1);
                    });
                }
                dots.forEach(function (dot, itemIndex) {
                    dot.addEventListener('click', function () {
                        show(itemIndex);
                    });
                });
                window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
            show(0);
        }

        var filterScopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        filterScopes.forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var count = scope.querySelector('[data-visible-count]');
            var noResults = scope.querySelector('[data-no-results]');

            function normalize(value) {
                return (value || '').toString().toLowerCase().trim();
            }

            function matchesYear(cardYear, selectedYear) {
                if (!selectedYear) {
                    return true;
                }
                if (selectedYear === '2022') {
                    var numericYear = parseInt(cardYear, 10);
                    return !numericYear || numericYear <= 2022;
                }
                return cardYear === selectedYear;
            }

            function update() {
                var query = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.category,
                        card.dataset.tags
                    ].join(' '));
                    var ok = !query || haystack.indexOf(query) !== -1;
                    selects.forEach(function (select) {
                        var field = select.getAttribute('data-filter');
                        var selected = select.value;
                        if (!selected || !ok) {
                            return;
                        }
                        if (field === 'year') {
                            ok = matchesYear(card.dataset.year || '', selected);
                        } else {
                            ok = (card.dataset[field] || '').indexOf(selected) !== -1;
                        }
                    });
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible.toString();
                }
                if (noResults) {
                    noResults.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', update);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', update);
            });
            update();
        });
    });

    window.initStaticMoviePlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !streamUrl) {
            return;
        }
        var initialized = false;
        var hlsInstance = null;

        function setupStream() {
            if (initialized) {
                return;
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function startPlayback() {
            setupStream();
            if (overlay) {
                overlay.hidden = true;
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        setupStream();
        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.hidden = true;
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
