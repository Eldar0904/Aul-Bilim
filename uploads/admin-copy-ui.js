(function () {
  'use strict';

  var ADMIN_PAGE_MAP = {
    home: 'index.html',
    programs: 'programs.html',
    about: 'about.html',
    global: '__global__',
    school: 'school.html'
  };

  var PAGE_LABELS = {
    home: 'Басты бет',
    programs: 'Бағдарламалар',
    about: 'Біз туралы',
    global: 'Жалпы (нав / footer)'
  };

  var valueStore = {};
  var onDirty = null;

  function currentLang() {
    return window.adminLang ? window.adminLang.getLang() : 'kk';
  }

  function fieldMatchesLang(field, lang) {
    if (!window.adminLang) return true;
    return window.adminLang.fieldLang(field.key) === lang;
  }

  function groupFields(registry, pageFile, lang) {
    var groups = {};
    (registry || []).forEach(function (field) {
      if (field.page !== pageFile) return;
      if (!fieldMatchesLang(field, lang)) return;
      var sec = field.section || 'Content';
      if (!groups[sec]) groups[sec] = [];
      groups[sec].push(field);
    });
    return groups;
  }

  function storeKey(page, key) {
    if (!valueStore[page]) valueStore[page] = {};
    return valueStore[page];
  }

  function syncStoreFromDom() {
    document.querySelectorAll('[data-copy-field]').forEach(function (el) {
      storeKey(el.dataset.page, el.dataset.key)[el.dataset.key] = el.value;
    });
  }

  function applyStoreToDom() {
    document.querySelectorAll('[data-copy-field]').forEach(function (el) {
      var pageData = valueStore[el.dataset.page];
      var v = pageData && pageData[el.dataset.key];
      if (v !== undefined && v !== null) el.value = v;
    });
  }

  function mergePagesIntoStore(pages) {
    Object.keys(pages || {}).forEach(function (page) {
      var bucket = storeKey(page);
      Object.assign(bucket, pages[page]);
    });
  }

  function buildField(field) {
    var wrap = document.createElement('div');
    wrap.className = 'tf tf-copy';
    var label = document.createElement('label');
    label.textContent = field.label;
    var input;
    if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = field.label.length > 100 ? 4 : 2;
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }
    input.dataset.page = field.page;
    input.dataset.key = field.key;
    input.dataset.copyField = '1';
    input.placeholder = field.label;
    var stored = valueStore[field.page] && valueStore[field.page][field.key];
    if (stored !== undefined && stored !== null) input.value = stored;
    wrap.appendChild(label);
    wrap.appendChild(input);
    return wrap;
  }

  function renderPagePanel(viewId, pageFile) {
    var mount = document.querySelector('[data-copy-mount="' + viewId + '"]');
    if (!mount || !window.COPY_REGISTRY) return;
    mount.innerHTML = '';
    var searchWrap = document.createElement('div');
    searchWrap.className = 'copy-search-wrap';
    var search = document.createElement('input');
    search.type = 'search';
    search.className = 'copy-search';
    search.placeholder = 'Мәтінді іздеу…';
    searchWrap.appendChild(search);
    mount.appendChild(searchWrap);
    var groups = groupFields(window.COPY_REGISTRY, pageFile, currentLang());
    var sectionOrder = ['Navigation', 'Footer', 'Accessibility', 'Statistics', 'Hero', 'Content'];
    var keys = Object.keys(groups).sort(function (a, b) {
      var ai = sectionOrder.indexOf(a);
      var bi = sectionOrder.indexOf(b);
      if (ai < 0) ai = 99;
      if (bi < 0) bi = 99;
      return ai - bi || a.localeCompare(b);
    });
    if (!keys.length) {
      mount.innerHTML = '<p class="copy-empty">Мәтін өрістері табылмады.</p>';
      return;
    }
    keys.forEach(function (section) {
      var block = document.createElement('div');
      block.className = 'as copy-section';
      var head = document.createElement('div');
      head.className = 'as-head';
      head.innerHTML = '<h3>' + section + '</h3>';
      var body = document.createElement('div');
      body.className = 'as-body copy-fields';
      groups[section].forEach(function (field) {
        body.appendChild(buildField(field));
      });
      block.appendChild(head);
      block.appendChild(body);
      mount.appendChild(block);
    });
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      mount.querySelectorAll('.tf-copy').forEach(function (row) {
        var label = (row.querySelector('label') || {}).textContent || '';
        var val = (row.querySelector('input,textarea') || {}).value || '';
        var hit = !q || label.toLowerCase().indexOf(q) >= 0 || val.toLowerCase().indexOf(q) >= 0;
        row.style.display = hit ? '' : 'none';
      });
      mount.querySelectorAll('.copy-section').forEach(function (sec) {
        var visible = sec.querySelector('.tf-copy:not([style*=\"display: none\"])');
        sec.style.display = visible ? '' : 'none';
      });
    });
  }

  function renderAll() {
    Object.keys(ADMIN_PAGE_MAP).forEach(function (viewId) {
      renderPagePanel(viewId, ADMIN_PAGE_MAP[viewId]);
    });
    wireInputListeners(onDirty);
  }

  function populateCopyFields(pages) {
    mergePagesIntoStore(pages);
    applyStoreToDom();
  }

  function wireInputListeners(dirtyCb) {
    if (dirtyCb) onDirty = dirtyCb;
    document.querySelectorAll('[data-copy-field]').forEach(function (el) {
      if (el.dataset.copyBound) return;
      el.dataset.copyBound = '1';
      el.addEventListener('input', function () {
        storeKey(el.dataset.page, el.dataset.key)[el.dataset.key] = el.value;
        el.classList.add('changed');
        if (onDirty) onDirty();
      });
    });
  }

  function collectCopyFields(pages) {
    syncStoreFromDom();
    var out = Object.assign({}, pages || {});
    Object.keys(valueStore).forEach(function (page) {
      if (!out[page]) out[page] = {};
      Object.assign(out[page], valueStore[page]);
    });
    return out;
  }

  window.adminCopyUi = {
    renderAll: renderAll,
    populateCopyFields: populateCopyFields,
    wireInputListeners: wireInputListeners,
    collectCopyFields: collectCopyFields,
    syncStoreFromDom: syncStoreFromDom,
    PAGE_LABELS: PAGE_LABELS,
    ADMIN_PAGE_MAP: ADMIN_PAGE_MAP
  };
})();
