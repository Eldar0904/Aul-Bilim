(function () {
  'use strict';

  var root = document.querySelector('[data-results-gallery]');
  if (!root) return;

  var beforeSide = root.querySelector('.compare-side:first-child');
  var afterSide = root.querySelector('.compare-side:last-child');
  var controls = root.querySelector('.compare-controls');
  var current = 0;
  var timer = null;
  var slides = [];
  var dots = [];

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

  function refreshElements() {
    slides = Array.prototype.slice.call(root.querySelectorAll('.compare-slide'));
    dots = Array.prototype.slice.call(root.querySelectorAll('.compare-dot'));
  }

  function show(index) {
    if (!dots.length) return;
    current = (index + dots.length) % dots.length;
    slides.forEach(function (slide) {
      slide.classList.toggle('is-active', Number(slide.dataset.index) === current);
    });
    dots.forEach(function (dot) {
      var active = Number(dot.dataset.index) === current;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = null;
    if (dots.length < 2 || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    timer = window.setInterval(function () { show(current + 1); }, 4000);
  }

  function wireDots() {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.index));
        restart();
      });
    });
  }

  function makeSlide(url, index) {
    var slide = document.createElement('div');
    slide.className = 'compare-slide' + (index === 0 ? ' is-active' : '');
    slide.dataset.index = String(index);
    var img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.loading = index === 0 ? 'eager' : 'lazy';
    slide.appendChild(img);
    return slide;
  }

  function renderPairs(beforeUrls, afterUrls) {
    var count = Math.min(beforeUrls.length, afterUrls.length);
    if (!count) return false;

    beforeSide.querySelectorAll('.compare-slide').forEach(function (slide) { slide.remove(); });
    afterSide.querySelectorAll('.compare-slide').forEach(function (slide) { slide.remove(); });
    controls.innerHTML = '';

    for (var index = 0; index < count; index += 1) {
      beforeSide.appendChild(makeSlide(beforeUrls[index], index));
      afterSide.appendChild(makeSlide(afterUrls[index], index));
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'compare-dot' + (index === 0 ? ' is-active' : '');
      dot.dataset.index = String(index);
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Image pair ' + (index + 1) + ' of ' + count);
      dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      controls.appendChild(dot);
    }

    current = 0;
    refreshElements();
    wireDots();
    show(0);
    restart();
    return true;
  }

  refreshElements();
  wireDots();
  show(0);
  restart();

  if (window.db && window.db.getSiteContent) {
    window.db.getSiteContent().then(function (content) {
      var media = content && content.media;
      var before = parseGallery(media && media['results-before-gallery'] && media['results-before-gallery'].u);
      var after = parseGallery(media && media['results-after-gallery'] && media['results-after-gallery'].u);
      if (before.length && after.length) renderPairs(before, after);
    }).catch(function () {});
  }
}());
