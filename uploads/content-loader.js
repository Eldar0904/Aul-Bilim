(function () {
  'use strict';

  var COPY_REPAIRS = {
    'programs-054-ru': 'Для раскрытия профессионального потенциала учителей и руководителей школ, а также для внедрения современных образовательных технологий реализуются комплексные программы обучения.',
    'programs-060-ru': 'Углубление предметных знаний учителей и развитие навыков использования современных инструментов обучения.',
    'programs-078-ru': 'Совершенствование профессионального мастерства специалистов, отвечающих за систематизацию воспитательного процесса в школе и формирование человеческих ценностей.',
    'programs-082-ru': 'В рамках программы «Адал азамат» администрации школ предоставляются регулярные консультации по планированию воспитательной работы.',
    'programs-086-ru': 'Выстраивание эффективного взаимодействия с учениками и родителями, а также повышение качества проведения классных часов.',
    'programs-110-ru': 'Благодаря выездам менторов непосредственно в школы отслеживается ход проведения лабораторных работ и предоставляется персональная обратная связь учителям.',
    'programs-114-ru': 'Оказывается прямая помощь по интеграции цифровых датчиков, специализированного программного обеспечения и интерактивных платформ в учебный процесс.',
    'programs-118-ru': 'Для углубления практических навыков учителей организуются мастер-классы (в офлайн- и онлайн-форматах).',
    'programs-122-ru': 'В рамках программы «Адал азамат» администрации школ предоставляются регулярные консультации по планированию воспитательной работы.'
  };

  function isCorruptCopy(value) {
    if (typeof value !== 'string') return false;
    var compact = value.replace(/\s/g, '');
    return compact.length > 3 && (compact.match(/\?/g) || []).length / compact.length > 0.35;
  }

  function applyStaticRepairs() {
    Object.keys(COPY_REPAIRS).forEach(function (key) {
      document.querySelectorAll('[data-copy="' + key + '"]').forEach(function (el) {
        el.textContent = COPY_REPAIRS[key];
      });
    });
  }

  function applyRegistryCopy(pageId, content) {
    var registry = window.COPY_REGISTRY || [];
    if (!content || !content.pages) return;
    var sharedData = content.pages.site_shared || content.pages['__global__'] || {};
    var pageData = content.pages[pageId] || {};
    var bindings = (window.COPY_BINDINGS || {})[pageId] || {};

    registry.forEach(function (field) {
      var isShared = field.page === 'site_shared' || field.page === '__global__';
      var data = isShared ? sharedData : pageData;
      if (!isShared && field.page !== pageId) return;
      var val = data[field.key];
      if (COPY_REPAIRS[field.key]) {
        document.querySelectorAll(field.selector).forEach(function (el) {
          el.textContent = COPY_REPAIRS[field.key];
        });
      }
      if (isCorruptCopy(val)) return;
      if (val == null || val === '') return;
      document.querySelectorAll(field.selector).forEach(function (el) {
        if (field.type === 'html') {
          el.innerHTML = val;
        } else if (el.querySelector('svg') && el.classList.contains('mark')) {
          var svg = el.querySelector('svg');
          el.textContent = val;
          if (svg) el.appendChild(svg);
        } else if (el.children.length && !el.classList.contains('n') && !el.classList.contains('big')) {
          return;
        } else {
          el.textContent = val;
        }
      });
    });

    // Legacy semantic bindings (hero line, etc.) override registry when set
    Object.keys(pageData).forEach(function (key) {
      if (/^cp\d+$/.test(key)) return;
      var selector = bindings[key];
      if (!selector) return;
      var el = document.querySelector(selector);
      if (el && pageData[key] != null && pageData[key] !== '' && !isCorruptCopy(pageData[key])) {
        el.textContent = pageData[key];
      }
    });
  }

  function applyLegacyCopy(pageData) {
    if (!pageData) return;
    var idx = 0;
    document.querySelectorAll('[lang],.n,.big').forEach(function (el) {
      if (el.hasAttribute('data-copy')) return;
      var langAttr = el.getAttribute('lang');
      var isLang = !!langAttr;
      var isStat = !isLang && (el.classList.contains('n') || el.classList.contains('big'));
      if (!isLang && !isStat) return;
      if (isLang && langAttr !== 'kk' && langAttr !== 'ru') { idx++; return; }
      var key = 'cp' + (idx++);
      if (Object.prototype.hasOwnProperty.call(pageData, key)) {
        el.textContent = pageData[key];
      }
    });
  }

  function applyMediaSlots(media) {
    if (!media) return;
    document.querySelectorAll('[data-media-slot]').forEach(function (el) {
      var slotId = el.getAttribute('data-media-slot');
      var slot = media[slotId];
      if (!slot || !slot.u) return;
      if (el.tagName === 'IMG') {
        el.src = slot.u;
      }
    });
  }

  function parseGallery(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value !== 'string' || !value.trim()) return [];
    try {
      var parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (e) {
      return value.split(/\r?\n/).map(function (url) { return url.trim(); }).filter(Boolean);
    }
  }

  function initDynamicCarousel(root, urls) {
    var track = root.querySelector('.feat-carousel-track');
    var dotsWrap = root.querySelector('.feat-carousel-dots');
    var prev = root.querySelector('.feat-carousel-prev');
    var next = root.querySelector('.feat-carousel-next');
    if (!track || !dotsWrap) return;

    if (urls.length) {
      track.innerHTML = '';
      urls.forEach(function (url) {
        var figure = document.createElement('figure');
        figure.className = 'feat-carousel-slide';
        var img = document.createElement('img');
        img.src = url;
        img.alt = '';
        figure.appendChild(img);
        track.appendChild(figure);
      });
    }

    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) return;
    var index = 0;
    var count = slides.length;
    var autoplay = null;
    dotsWrap.innerHTML = '';

    function go(i) {
      index = (i + count) % count;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      Array.prototype.forEach.call(dotsWrap.children, function (dot, n) {
        var active = n === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'feat-carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Image ' + (i + 1) + ' of ' + count);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(dot);
    });

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });
    root.classList.toggle('is-single-slide', count < 2);

    function stopAutoplay() {
      if (autoplay) window.clearInterval(autoplay);
      autoplay = null;
    }

    function startAutoplay() {
      stopAutoplay();
      if (count < 2 || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
      autoplay = window.setInterval(function () { go(index + 1); }, 4000);
    }

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) startAutoplay();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });
    startAutoplay();
  }

  function applyDynamicGalleries(media) {
    document.querySelectorAll('[data-dynamic-gallery]').forEach(function (root) {
      var id = root.getAttribute('data-dynamic-gallery');
      var slot = media && media[id];
      initDynamicCarousel(root, parseGallery(slot && slot.u));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyStaticRepairs();
    if (!window.db || !window.db.getSiteContent) return;
    window.db.getSiteContent().then(function (content) {
      if (!content) {
        applyDynamicGalleries(null);
        return;
      }
      var page = location.pathname.split('/').pop() || 'index.html';
      if (content.pages) {
        applyRegistryCopy(page, content);
        applyLegacyCopy(content.pages[page]);
      }
      applyMediaSlots(content.media);
      applyDynamicGalleries(content.media);
    }).catch(function () {});
  });
})();
