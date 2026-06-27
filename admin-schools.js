/**
 * Admin school browser — browse all schools, edit media/copy overrides in Firestore.
 */
window.adminSchools = (function () {
  'use strict';

  var REGIONS = window.AUL_BILIM_SCHOOL_REGIONS || [];
  var allSchools = [];
  var selectedId = null;
  var selectedRegionId = null;
  var dirty = false;
  var overrideCache = {};

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function buildIndex() {
    allSchools = [];
    REGIONS.forEach(function (region) {
      var data = window[region.global];
      if (!data || !data.schools) return;
      data.schools.forEach(function (school) {
        allSchools.push({
          id: school.id,
          regionId: region.id,
          regionKk: region.kk,
          regionEn: region.en,
          kk: school.kk,
          en: school.en,
          districtKey: school.districtKey || '',
          base: school
        });
      });
    });
    allSchools.sort(function (a, b) {
      return a.kk.localeCompare(b.kk, 'kk');
    });
  }

  function schoolPageUrl(entry) {
    return 'school.html?region=' + encodeURIComponent(entry.regionId) + '&id=' + encodeURIComponent(entry.id);
  }

  function hasMedia(school) {
    return !!(school.image || (school.gallery && school.gallery.length) || school.youtube);
  }

  function formValues() {
    var galleryRaw = (document.getElementById('school-field-gallery') || {}).value || '';
    var gallery = galleryRaw.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    var teachersRaw = (document.getElementById('school-field-teachers') || {}).value || '';
    var teachers = teachersRaw.trim() === '' ? null : Number(teachersRaw);
    return {
      regionId: selectedRegionId,
      image: (document.getElementById('school-field-image') || {}).value.trim(),
      gallery: gallery,
      youtube: (document.getElementById('school-field-youtube') || {}).value.trim(),
      desc: {
        kk: (document.getElementById('school-field-desc-kk') || {}).value.trim(),
        en: (document.getElementById('school-field-desc-en') || {}).value.trim()
      },
      teachers: Number.isFinite(teachers) ? teachers : null
    };
  }

  function mergedPreview(entry, override) {
    var base = entry.base;
    var o = override || {};
    return {
      image: o.image || base.image || '',
      gallery: (o.gallery && o.gallery.length) ? o.gallery : (base.gallery || []),
      youtube: o.youtube || base.youtube || '',
      desc: {
        kk: (o.desc && o.desc.kk) || (base.desc && base.desc.kk) || '',
        en: (o.desc && o.desc.en) || (base.desc && base.desc.en) || ''
      },
      teachers: o.teachers != null ? o.teachers : base.teachers
    };
  }

  function updatePreview(entry) {
    var preview = document.getElementById('school-editor-preview');
    if (!preview || !entry) return;
    var m = mergedPreview(entry, formValues());
    var hero = m.image || (m.gallery[0] || '');
    var yt = m.youtube;
    preview.innerHTML =
      (hero ? '<img class="school-preview-hero" src="' + esc(hero) + '" alt="" />' : '<div class="school-preview-empty">Hero image</div>') +
      (m.gallery.length ? '<p class="school-preview-meta">' + m.gallery.length + ' carousel image(s)</p>' : '') +
      (yt ? '<p class="school-preview-meta">YouTube: ' + esc(yt) + '</p>' : '<p class="school-preview-meta">No video</p>');
  }

  async function selectSchool(id) {
    selectedId = id;
    var entry = allSchools.find(function (s) { return s.id === id; });
    if (!entry) return;

    selectedRegionId = entry.regionId;
    document.querySelectorAll('.school-list-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.id === id);
    });

    var editor = document.getElementById('school-editor');
    var empty = document.getElementById('school-editor-empty');
    if (empty) empty.style.display = 'none';
    if (editor) editor.style.display = '';

    document.getElementById('school-editor-title').textContent = entry.kk;
    document.getElementById('school-editor-sub').textContent = entry.en + ' · ' + entry.regionKk;

    var previewLink = document.getElementById('preview-link');
    if (previewLink) previewLink.href = schoolPageUrl(entry);

    var override = overrideCache[id];
    if (override === undefined) {
      override = await window.db.getSchoolContent(id);
      overrideCache[id] = override || null;
    }

    var m = mergedPreview(entry, override);
    document.getElementById('school-field-image').value = m.image || '';
    document.getElementById('school-field-gallery').value = (m.gallery || []).join('\n');
    document.getElementById('school-field-youtube').value = m.youtube || '';
    document.getElementById('school-field-desc-kk').value = m.desc.kk || '';
    document.getElementById('school-field-desc-en').value = m.desc.en || '';
    document.getElementById('school-field-teachers').value = m.teachers != null ? String(m.teachers) : '';

    var status = document.getElementById('school-editor-status');
    if (status) {
      status.textContent = override ? 'Firestore override loaded' : (hasMedia(entry.base) ? 'Using built-in defaults' : 'No media yet');
    }

    updatePreview(entry);
    dirty = false;
  }

  function renderList() {
    var list = document.getElementById('school-list');
    if (!list) return;

    var regionFilter = (document.getElementById('school-filter-region') || {}).value || '';
    var query = ((document.getElementById('school-search') || {}).value || '').trim().toLowerCase();

    var filtered = allSchools.filter(function (s) {
      if (regionFilter && s.regionId !== regionFilter) return false;
      if (!query) return true;
      var hay = (s.kk + ' ' + s.en + ' ' + s.id + ' ' + s.districtKey).toLowerCase();
      return hay.indexOf(query) !== -1;
    });

    var count = document.getElementById('school-list-count');
    if (count) count.textContent = filtered.length + ' / ' + allSchools.length;

    list.innerHTML = filtered.map(function (s) {
      var has = hasMedia(s.base) || overrideCache[s.id];
      return '<button type="button" class="school-list-item' + (s.id === selectedId ? ' active' : '') + '" data-id="' + esc(s.id) + '">' +
        '<span class="school-list-name">' + esc(s.kk) + '</span>' +
        '<span class="school-list-meta">' + esc(s.regionKk) + (has ? ' · ●' : '') + '</span>' +
      '</button>';
    }).join('');

    list.querySelectorAll('.school-list-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectSchool(btn.dataset.id);
      });
    });
  }

  function renderRegionFilter() {
    var sel = document.getElementById('school-filter-region');
    if (!sel || sel.options.length > 1) return;
    sel.innerHTML = '<option value="">Барлық облыстар</option>' +
      REGIONS.map(function (r) {
        return '<option value="' + esc(r.id) + '">' + esc(r.kk) + '</option>';
      }).join('');
  }

  function bindEditorInputs() {
    ['school-field-image', 'school-field-gallery', 'school-field-youtube',
      'school-field-desc-kk', 'school-field-desc-en', 'school-field-teachers'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.dataset.bound) return;
      el.dataset.bound = '1';
      el.addEventListener('input', function () {
        dirty = true;
        window.dirty = true;
        var entry = allSchools.find(function (s) { return s.id === selectedId; });
        if (entry) updatePreview(entry);
      });
    });
  }

  function render() {
    buildIndex();
    renderRegionFilter();
    renderList();
    bindEditorInputs();

    var panel = document.getElementById('schools-panel');
    if (panel && !panel.dataset.ready) {
      panel.dataset.ready = '1';
      document.getElementById('school-filter-region').addEventListener('change', renderList);
      document.getElementById('school-search').addEventListener('input', renderList);
    }
  }

  function isActive() {
    return window.currentPage === 'schools';
  }

  async function save() {
    if (!selectedId) {
      return { success: false, error: 'Select a school first' };
    }
    var data = formValues();
    var result = await window.db.saveSchoolContent(selectedId, data);
    if (result && result.success) {
      overrideCache[selectedId] = Object.assign({ schoolId: selectedId }, data, { updatedAt: new Date().toISOString() });
      dirty = false;
      renderList();
      var status = document.getElementById('school-editor-status');
      if (status) status.textContent = 'Saved to Firestore';
    }
    return result;
  }

  function isDirty() {
    return dirty;
  }

  return {
    render: render,
    save: save,
    isActive: isActive,
    isDirty: isDirty
  };
})();
