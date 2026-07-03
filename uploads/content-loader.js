(function () {
  'use strict';

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
      if (el && pageData[key] != null && pageData[key] !== '') {
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
      applyRegistryCopy(page, content);
      applyLegacyCopy(content.pages[page]);
    }).catch(function () {});
  });
})();
