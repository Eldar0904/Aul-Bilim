(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.compare-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.compare-dot'));
  var current = 0;
  var timer;

  function updatePlaceholders() {
    var lang = document.documentElement.getAttribute('data-lang') === 'ru' ? 'ru' : 'kk';
    document.querySelectorAll('.compare-slide image-slot').forEach(function (slot) {
      var value = slot.getAttribute('data-placeholder-' + lang);
      if (value) slot.setAttribute('placeholder', value);
    });
  }

  function show(index) {
    current = index;
    slides.forEach(function (slide) { slide.classList.toggle('is-active', Number(slide.dataset.index) === index); });
    dots.forEach(function (dot) { dot.classList.toggle('is-active', Number(dot.dataset.index) === index); });
    updatePlaceholders();
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function () { show((current + 1) % dots.length); }, 4000);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () { show(Number(dot.dataset.index)); restart(); });
  });
  document.querySelectorAll('.lang-switch button').forEach(function (button) {
    button.addEventListener('click', function () { show(current); });
  });
  show(0);
  restart();
}());
