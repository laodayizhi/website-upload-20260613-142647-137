(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const nextButton = hero.querySelector('[data-hero-next]');
    const prevButton = hero.querySelector('[data-hero-prev]');
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    const input = filterForm.querySelector('[data-filter-input]');
    const select = filterForm.querySelector('[data-filter-select]');
    const cards = Array.from(document.querySelectorAll('[data-filter-grid] [data-card]'));

    function applyFilter() {
      const keyword = (input ? input.value : '').trim().toLowerCase();
      const selectedYear = select ? select.value : '';

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.region
        ].join(' ').toLowerCase();
        const year = card.dataset.year || '';
        const matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchesYear = !selectedYear ||
          year === selectedYear ||
          (selectedYear === '2022' && Number(year.replace(/\D/g, '')) <= 2022);
        card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
  }
}());
