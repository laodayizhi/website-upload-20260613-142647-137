(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (value) {
                    event.preventDefault();
                    window.location.href = "./search.html?q=" + encodeURIComponent(value);
                }
            });
        });

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var region = panel.querySelector("[data-filter-region]");
            var type = panel.querySelector("[data-filter-type]");
            var list = panel.parentElement.querySelector("[data-filter-list]") || document.querySelector("[data-filter-list]");
            var noResult = panel.parentElement.querySelector("[data-no-result]") || document.querySelector("[data-no-result]");
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")) : [];

            function apply() {
                var q = normalize(input ? input.value : "");
                var y = year ? year.value : "";
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var ok = true;
                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && card.getAttribute("data-year") !== y) {
                        ok = false;
                    }
                    if (r && card.getAttribute("data-region") !== r) {
                        ok = false;
                    }
                    if (t && card.getAttribute("data-type") !== t) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        shown += 1;
                    }
                });

                if (noResult) {
                    noResult.classList.toggle("is-visible", shown === 0);
                }
            }

            [input, year, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    });
})();
