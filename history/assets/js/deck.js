(function () {
  "use strict";

  var deck = document.getElementById("deck");
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var progress = document.getElementById("progress");
  var current = 0;

  // Масштабирование сцены 1280×720 под любой экран.
  function fit() {
    var pad = 24;
    var scale = Math.min(
      (window.innerWidth - pad) / 1280,
      (window.innerHeight - pad) / 720
    );
    deck.style.transform = "scale(" + scale + ")";
  }

  function render() {
    slides.forEach(function (slide, index) {
      slide.classList.toggle("is-active", index === current);
    });
    progress.style.width = ((current + 1) / slides.length) * 100 + "%";
    document.title =
      slides[current].dataset.nav + " — Симон Боливар, 8 класс";
    if (history.replaceState) {
      history.replaceState(null, "", "#" + (current + 1));
    }
  }

  function go(index) {
    var next = Math.max(0, Math.min(slides.length - 1, index));
    if (next === current) return;
    current = next;
    render();
  }

  function fromHash() {
    var n = parseInt((location.hash || "").replace("#", ""), 10);
    return isNaN(n) ? 0 : Math.max(0, Math.min(slides.length - 1, n - 1));
  }

  // Номера слайдов в подвале.
  slides.forEach(function (slide, index) {
    var counter = slide.querySelector(".counter");
    if (counter) {
      counter.textContent =
        (index + 1 < 10 ? "0" : "") + (index + 1) + " / " + slides.length;
    }
  });

  document.addEventListener("keydown", function (event) {
    var key = event.key;
    if (key === "ArrowRight" || key === "PageDown" || key === " " || key === "Enter") {
      event.preventDefault();
      go(current + 1);
    } else if (key === "ArrowLeft" || key === "PageUp" || key === "Backspace") {
      event.preventDefault();
      go(current - 1);
    } else if (key === "Home") {
      event.preventDefault();
      go(0);
    } else if (key === "End") {
      event.preventDefault();
      go(slides.length - 1);
    } else if (key === "f" || key === "F" || key === "а" || key === "А") {
      toggleFullscreen();
    } else if (key === "Escape") {
      if (document.fullscreenElement) document.exitFullscreen();
    }
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
  }

  document.getElementById("next").addEventListener("click", function () {
    go(current + 1);
  });
  document.getElementById("prev").addEventListener("click", function () {
    go(current - 1);
  });

  // Свайпы для планшета.
  var startX = null;
  document.addEventListener("touchstart", function (event) {
    startX = event.touches[0].clientX;
  }, { passive: true });
  document.addEventListener("touchend", function (event) {
    if (startX === null) return;
    var dx = event.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  window.addEventListener("resize", fit);
  window.addEventListener("hashchange", function () {
    var index = fromHash();
    if (index !== current) {
      current = index;
      render();
    }
  });

  current = fromHash();
  fit();
  render();
})();
