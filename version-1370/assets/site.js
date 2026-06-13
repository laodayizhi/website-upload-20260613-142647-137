(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobilePanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  }

  var hero = document.querySelector('.hero');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('.hero-arrow.prev');
    var next = hero.querySelector('.hero-arrow.next');
    var current = 0;
    var timer = null;

    function showHero(index) {
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

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    showHero(0);
    startHero();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyCardFilters() {
    var input = document.querySelector('.card-filter-input');
    var yearSelect = document.querySelector('.card-filter-year');
    var typeSelect = document.querySelector('.card-filter-type');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.search-empty');
    var keyword = normalize(input ? input.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  var filterInput = document.querySelector('.card-filter-input');
  var filterYear = document.querySelector('.card-filter-year');
  var filterType = document.querySelector('.card-filter-type');
  var params = new URLSearchParams(window.location.search);

  if (filterInput && params.get('q')) {
    filterInput.value = params.get('q');
  }

  if (filterYear && params.get('year')) {
    filterYear.value = params.get('year');
  }

  if (filterType && params.get('type')) {
    filterType.value = params.get('type');
  }

  [filterInput, filterYear, filterType].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyCardFilters);
      control.addEventListener('change', applyCardFilters);
    }
  });

  if (filterInput || filterYear || filterType) {
    applyCardFilters();
  }
})();

function initMoviePlayer(options) {
  var video = document.querySelector(options.video);
  var cover = document.querySelector(options.cover);
  var button = document.querySelector(options.button);
  var sourceUrl = options.url;
  var attached = false;
  var hlsInstance = null;

  if (!video || !sourceUrl) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function beginPlay() {
    attachSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var playResult = video.play();

    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      beginPlay();
    });
  }

  if (cover) {
    cover.addEventListener('click', beginPlay);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlay();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
