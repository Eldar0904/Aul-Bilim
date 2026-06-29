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

  function applySemanticCopy(pageId, pageData) {
    var bindings = (window.COPY_BINDINGS || {})[pageId];
    if (!bindings || !pageData) return new Set();
    var touched = new Set();
    Object.keys(pageData).forEach(function (key) {
      if (/^cp\d+$/.test(key)) return;
      var selector = bindings[key];
      if (!selector) return;
      var el = document.querySelector(selector);
      if (el && pageData[key] != null && pageData[key] !== '') {
        el.textContent = pageData[key];
        touched.add(el);
      }
    });
    return touched;
  }

  function applyLegacyCopy(pageData, skip) {
    if (!pageData) return;
    var idx = 0;
    document.querySelectorAll('[lang],.n,.big').forEach(function (el) {
      if (skip && skip.size) {
        if (skip.has(el)) return;
        var blocked = false;
        skip.forEach(function (node) {
          if (el.contains(node)) blocked = true;
        });
        if (blocked) return;
      }
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
      var pageData = content.pages[page];
      var touched = applySemanticCopy(page, pageData);
      applyLegacyCopy(pageData, touched);
    }).catch(function () {});
  });
})();
