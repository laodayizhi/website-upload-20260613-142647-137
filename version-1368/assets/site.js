(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = document.body.classList.toggle("menu-open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
      button.textContent = opened ? "×" : "☰";
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    start();
  }

  function textOf(card) {
    return (card.getAttribute("data-title") || "").toLowerCase();
  }

  function setupFiltering() {
    var filter = document.querySelector(".page-filter");
    var sort = document.querySelector(".page-sort");
    var grid = document.querySelector("[data-sortable-grid]");
    var status = document.querySelector(".filter-status");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    function render() {
      var q = filter ? filter.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        card.hidden = q && textOf(card).indexOf(q) === -1;
      });
      if (status) {
        status.textContent = q ? "显示相关影片" : "片库内容";
      }
    }
    function sortCards() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      cards.sort(function (a, b) {
        if (value === "title") {
          return textOf(a).localeCompare(textOf(b), "zh-Hans-CN");
        }
        var av = Number(a.getAttribute("data-" + value) || 0);
        var bv = Number(b.getAttribute("data-" + value) || 0);
        return bv - av;
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      render();
    }
    if (filter) {
      filter.addEventListener("input", render);
    }
    if (sort) {
      sort.addEventListener("change", sortCards);
      sortCards();
    } else {
      render();
    }
  }

  function setupSearchPage() {
    var input = document.querySelector(".search-page-input");
    var grid = document.querySelector("[data-search-grid]");
    var status = document.querySelector(".search-panel .filter-status");
    if (!input || !grid) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    input.value = q;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    function render() {
      var value = input.value.trim().toLowerCase();
      var any = false;
      cards.forEach(function (card) {
        var matched = !value || textOf(card).indexOf(value) !== -1;
        card.hidden = !matched;
        if (matched) {
          any = true;
        }
      });
      if (status) {
        status.textContent = any ? (value ? "显示相关影片" : "片库检索结果") : "没有找到相关影片";
      }
    }
    input.addEventListener("input", render);
    render();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFiltering();
    setupSearchPage();
  });
})();

function initStaticPlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);
  if (!video) {
    return;
  }
  var frame = video.closest(".video-frame");
  var button = frame ? frame.querySelector("[data-play-button]") : null;
  var hlsInstance = null;
  function attach() {
    if (video.getAttribute("data-ready") === "1") {
      return;
    }
    video.setAttribute("data-ready", "1");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }
  function play() {
    attach();
    if (frame) {
      frame.classList.add("is-playing");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }
  if (button) {
    button.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.getAttribute("data-ready") !== "1") {
      play();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance && hlsInstance.destroy) {
      hlsInstance.destroy();
    }
  });
}
