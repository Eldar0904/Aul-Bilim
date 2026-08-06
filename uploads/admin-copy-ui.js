(function () {
  'use strict';

  var ADMIN_PAGE_MAP = {
    home: 'index.html',
    programs: 'programs.html',
    results: 'results.html',
    about: 'about.html',
    global: 'site_shared',
    school: 'school.html'
  };

  var HERO_MOUNTS = {
    'home-hero': { page: 'index.html', section: 'Hero' },
    'about-hero': { page: 'about.html', section: 'Hero' },
    'programs-fitout-hero': { page: 'programs.html', section: 'Hero', heroGroup: 'fitout' },
    'programs-ustaz-hero': { page: 'programs.html', section: 'Hero', heroGroup: 'ustaz' },
    'programs-samruk-hero': { page: 'programs.html', section: 'Hero', heroGroup: 'samruk' }
  };

  var PAGE_LABELS = {
    home: 'Басты бет',
    programs: 'Бағдарламалар',
    about: 'Біз туралы',
    global: 'Жалпы (нав / footer)'
  };

  var valueStore = {};
  var onDirty = null;
  var REMOVED_USTAZ_HERO_KEYS = ['programs-047-kk', 'programs-048-ru', 'programs-049-kk', 'programs-050-ru'];
  var MOVED_USTAZ_HERO_KEYS = ['programs-051-kk', 'programs-052-ru', 'programs-053-kk', 'programs-054-ru'];
  var REMOVED_FITOUT_KEYS = ['programs-027-kk', 'programs-028-ru', 'programs-033-kk', 'programs-034-ru'];
  var MOVED_FITOUT_HERO_KEYS = ['programs-025-kk', 'programs-026-ru'];
  var REMOVED_SAMRUK_KEYS = ['programs-091-kk', 'programs-092-ru', 'programs-093-kk', 'programs-094-ru', 'programs-099-kk', 'programs-100-ru', 'programs-103-kk', 'programs-104-ru', 'programs-105-kk', 'programs-106-ru'];
  var MOVED_SAMRUK_HERO_KEYS = ['programs-095-kk', 'programs-096-ru', 'programs-097-kk', 'programs-098-ru'];

  function currentLang() {
    return window.adminLang ? window.adminLang.getLang() : 'kk';
  }

  function fieldMatchesLang(field, lang) {
    if (!window.adminLang) return true;
    return window.adminLang.fieldLang(field.key) === lang;
  }

  function fieldMatchesFilter(field, pageFile, opts) {
    if (field.page !== pageFile) return false;
    if (!fieldMatchesLang(field, currentLang())) return false;
    opts = opts || {};
    if (REMOVED_USTAZ_HERO_KEYS.indexOf(field.key) >= 0) return false;
    if (REMOVED_FITOUT_KEYS.indexOf(field.key) >= 0) return false;
    if (MOVED_FITOUT_HERO_KEYS.indexOf(field.key) >= 0) {
      return opts.heroGroup === 'fitout';
    }
    if (REMOVED_SAMRUK_KEYS.indexOf(field.key) >= 0) return false;
    if (MOVED_USTAZ_HERO_KEYS.indexOf(field.key) >= 0) {
      return opts.heroGroup === 'ustaz';
    }
    if (MOVED_SAMRUK_HERO_KEYS.indexOf(field.key) >= 0) {
      return opts.heroGroup === 'samruk';
    }
    if (opts.section && (field.section || 'Content') !== opts.section) return false;
    if (opts.heroGroup && field.heroGroup !== opts.heroGroup) return false;
    if (opts.excludeSection && (field.section || 'Content') === opts.excludeSection) return false;
    if (opts.section === 'Hero' && opts.heroGroup && field.heroGroup !== opts.heroGroup) return false;
    if (opts.section === 'Hero' && !opts.heroGroup && field.heroGroup) return false;
    return true;
  }

  function groupFields(registry, pageFile, opts) {
    var groups = {};
    (registry || []).forEach(function (field) {
      if (!fieldMatchesFilter(field, pageFile, opts)) return;
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

  function sortHeroFields(fields) {
    var typeOrder = { html: 0, text: 1, textarea: 2 };
    return fields.slice().sort(function (a, b) {
      var ta = typeOrder[a.type] != null ? typeOrder[a.type] : 9;
      var tb = typeOrder[b.type] != null ? typeOrder[b.type] : 9;
      if (ta !== tb) return ta - tb;
      return a.key.localeCompare(b.key);
    });
  }

  function splitProgramsContent(groups) {
    if (!groups || !groups.Content) return groups;
    var buckets = {
      'Programs overview': [],
      'Innovation cabinets': [],
      'Teaching courses': [],
      'Mentorship': []
    };
    groups.Content.forEach(function (field) {
      var match = field.key.match(/^programs-(\d+)-/);
      var n = match ? Number(match[1]) : 0;
      var bucket = n >= 7 && n <= 24 ? 'Programs overview'
        : n >= 25 && n <= 46 ? 'Innovation cabinets'
        : n >= 51 && n <= 90 ? 'Teaching courses'
        : n >= 95 && n <= 122 ? 'Mentorship'
        : 'Programs overview';
      buckets[bucket].push(field);
    });
    var out = {};
    Object.keys(buckets).forEach(function (name) {
      if (buckets[name].length) out[name] = buckets[name];
    });
    Object.keys(groups).forEach(function (name) {
      if (name !== 'Content') out[name] = groups[name];
    });
    return out;
  }

  function buildField(field) {
    var wrap = document.createElement('div');
    wrap.className = 'tf tf-copy';
    var label = document.createElement('label');
    label.textContent = field.label;
    var input;
    if (field.type === 'textarea' || field.type === 'html') {
      input = document.createElement('textarea');
      input.rows = field.type === 'html' ? 3 : (field.label.length > 100 ? 4 : 2);
    } else {
      input = document.createElement('input');
      input.type = 'text';
    }
    input.dataset.page = field.page;
    input.dataset.key = field.key;
    input.dataset.copyField = '1';
    input.placeholder = field.label;
    var stored = valueStore[field.page] && valueStore[field.page][field.key];
    var initial = (stored !== undefined && stored !== null && stored !== '') ? stored : (field.default || '');
    if (initial) input.value = initial;
    wrap.appendChild(label);
    wrap.appendChild(input);
    return wrap;
  }

  function renderPagePanel(viewId, pageFile, opts) {
    var mount = document.querySelector('[data-copy-mount="' + viewId + '"]');
    if (!mount || !window.COPY_REGISTRY) return;
    mount.innerHTML = '';
    opts = opts || {};
    var isHeroMount = !!HERO_MOUNTS[viewId];
    var groups = groupFields(window.COPY_REGISTRY, pageFile, opts);
    if (pageFile === 'programs.html' && !isHeroMount) groups = splitProgramsContent(groups);
    var sectionOrder = ['Navigation', 'Footer', 'Accessibility', 'Statistics', 'Hero', 'Programs overview', 'Innovation cabinets', 'Teaching courses', 'Mentorship', 'Content'];
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

    if (!isHeroMount) {
      var searchWrap = document.createElement('div');
      searchWrap.className = 'copy-search-wrap';
      var search = document.createElement('input');
      search.type = 'search';
      search.className = 'copy-search';
      search.placeholder = 'Мәтінді іздеу…';
      searchWrap.appendChild(search);
      mount.appendChild(searchWrap);
    }

    keys.forEach(function (section) {
      var block = document.createElement('div');
      block.className = isHeroMount ? 'copy-fields copy-fields-hero' : 'as copy-section';
      if (!isHeroMount) {
        var head = document.createElement('div');
        head.className = 'as-head';
        head.innerHTML = '<h3>' + section + '</h3>';
        block.appendChild(head);
      }
      var body = document.createElement('div');
      body.className = isHeroMount ? 'copy-fields-inner' : 'as-body copy-fields';
      var fields = isHeroMount ? sortHeroFields(groups[section]) : groups[section];
      fields.forEach(function (field) {
        body.appendChild(buildField(field));
      });
      block.appendChild(body);
      mount.appendChild(block);
    });

    if (!isHeroMount) {
      var searchInput = mount.querySelector('.copy-search');
      if (searchInput) {
        searchInput.addEventListener('input', function () {
          var q = searchInput.value.trim().toLowerCase();
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
    }
  }

  function renderAll() {
    Object.keys(ADMIN_PAGE_MAP).forEach(function (viewId) {
      renderPagePanel(viewId, ADMIN_PAGE_MAP[viewId], { excludeSection: 'Hero' });
    });
    Object.keys(HERO_MOUNTS).forEach(function (mountId) {
      var cfg = HERO_MOUNTS[mountId];
      renderPagePanel(mountId, cfg.page, {
        section: cfg.section,
        heroGroup: cfg.heroGroup
      });
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
    ADMIN_PAGE_MAP: ADMIN_PAGE_MAP,
    HERO_MOUNTS: HERO_MOUNTS
  };
})();
