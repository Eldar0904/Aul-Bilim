(function () {
  'use strict';

  function shouldSkip(el) {
    if (!el || !el.tagName) return true;
    var tag = el.tagName.toUpperCase();
    if (['HTML', 'HEAD', 'BODY', 'SCRIPT', 'STYLE', 'SVG', 'PATH', 'BUTTON', 'A'].includes(tag)) return true;
    if (el.closest) {
      if (el.closest('nav') || el.closest('.lang-switch') || el.closest('.menu-btn') ||
          el.closest('.pill') || el.closest('.text-link') || el.closest('.more') ||
          el.closest('.crumbs') || el.closest('.foot-bottom') || el.closest('footer')) return true;
    }
    return false;
  }

  function applyPageCopy(pageData) {
    if (!pageData) return;
    var idx = 0;
    document.querySelectorAll('[lang],.n,.big').forEach(function (el) {
      if (shouldSkip(el)) return;
      var langAttr = el.getAttribute('lang');
      var isLang = !!langAttr;
      var isStat = !isLang && (el.classList.contains('n') || el.classList.contains('big'));
      if (!isLang && !isStat) return;
      if (isLang && langAttr !== 'kk' && langAttr !== 'en') { idx++; return; }
      var key = 'cp' + (idx++);
      if (Object.prototype.hasOwnProperty.call(pageData, key)) {
        el.textContent = pageData[key];
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.db || !window.db.getSiteContent) return;
    window.db.getSiteContent().then(function (content) {
      if (!content || !content.pages) return;
      var page = location.pathname.split('/').pop() || 'index.html';
      applyPageCopy(content.pages[page]);
    }).catch(function () {});
  });
})();
