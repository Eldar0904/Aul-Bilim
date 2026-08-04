(function () {
  var subjects = {
    kk: ['Физика кабинеті', 'Химия кабинеті', 'Биология кабинеті'],
    ru: ['Кабинет физики', 'Кабинет химии', 'Кабинет биологии']
  };
  var slides = Array.prototype.slice.call(document.querySelectorAll('.compare-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.compare-dot'));
  var label = document.querySelector('.compare-subject');
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
    if (label) {
      var lang = document.documentElement.getAttribute('data-lang') === 'ru' ? 'ru' : 'kk';
      label.innerHTML = '<span lang="kk">' + subjects.kk[index] + '</span><span lang="ru">' + subjects.ru[index] + '</span>';
    }
    updatePlaceholders();
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function () { show((current + 1) % subjects.kk.length); }, 4000);
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
