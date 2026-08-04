(function () {
  var subjects = ['Кабинет физики', 'Кабинет химии', 'Кабинет биологии'];
  var slides = Array.prototype.slice.call(document.querySelectorAll('.compare-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.compare-dot'));
  var label = document.querySelector('.compare-subject');
  var current = 0;
  var timer;

  function show(index) {
    current = index;
    slides.forEach(function (slide) { slide.classList.toggle('is-active', Number(slide.dataset.index) === index); });
    dots.forEach(function (dot) { dot.classList.toggle('is-active', Number(dot.dataset.index) === index); });
    if (label) label.textContent = subjects[index];
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function () { show((current + 1) % subjects.length); }, 4000);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () { show(Number(dot.dataset.index)); restart(); });
  });
  show(0);
  restart();
}());
