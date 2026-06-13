(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector(".mobile-menu-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            var isOpen = panel.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var previous = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide") || "0"));
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid]"));

        if (!grids.length) {
            return;
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-search]"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-button"));
        var emptyState = document.querySelector("[data-empty-state]");
        var queryParams = new URLSearchParams(window.location.search);
        var initialQuery = queryParams.get("q") || "";
        var activeFilter = "全部";

        searchInputs.forEach(function (input) {
            if (initialQuery) {
                input.value = initialQuery;
            }
        });

        function apply() {
            var keyword = normalize(searchInputs.map(function (input) {
                return input.value;
            }).join(" "));
            var visibleCount = 0;

            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

                cards.forEach(function (card) {
                    var searchBlob = normalize(card.getAttribute("data-search"));
                    var cardType = card.getAttribute("data-type") || "";
                    var matchesKeyword = !keyword || searchBlob.indexOf(keyword) !== -1;
                    var matchesFilter = activeFilter === "全部" || cardType === activeFilter;
                    var isVisible = matchesKeyword && matchesFilter;

                    card.style.display = isVisible ? "" : "none";

                    if (isVisible) {
                        visibleCount += 1;
                    }
                });
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        searchInputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                activeFilter = button.getAttribute("data-filter") || "全部";
                apply();
            });
        });

        apply();
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
