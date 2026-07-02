/**
 * Admin — oblast stats (schools, classrooms, teachers trained).
 */
window.adminRegions = (function () {
  'use strict';

  var REGIONS = window.AUL_BILIM_MAP_REGIONS || [];
  var savedStats = {};
  var dirty = false;

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function defaultSchoolCount(region) {
    if (region.schoolGlobal) {
      var data = window[region.schoolGlobal];
      if (data && data.schools && data.schools.length) {
        return String(data.schools.length);
      }
    }
    if (region.total != null) return String(region.total);
    return '';
  }

  function defaultStats(region) {
    var pack = region.packStats || {};
    return {
      schools: defaultSchoolCount(region),
      cabinets: pack.cabinets || '',
      teachers: pack.teachers || '500+'
    };
  }

  function mergedStats(region) {
    var base = defaultStats(region);
    var saved = savedStats[region.id];
    if (!saved) return base;
    return {
      schools: saved.schools != null ? saved.schools : base.schools,
      cabinets: saved.cabinets != null ? saved.cabinets : base.cabinets,
      teachers: saved.teachers != null ? saved.teachers : base.teachers
    };
  }

  function formValues() {
    var out = {};
    REGIONS.forEach(function (region) {
      var schools = document.getElementById('region-stat-schools-' + region.id);
      var cabinets = document.getElementById('region-stat-cabinets-' + region.id);
      var teachers = document.getElementById('region-stat-teachers-' + region.id);
      out[region.id] = {
        schools: schools ? schools.value.trim() : '',
        cabinets: cabinets ? cabinets.value.trim() : '',
        teachers: teachers ? teachers.value.trim() : ''
      };
    });
    return out;
  }

  function bindInputs() {
    REGIONS.forEach(function (region) {
      ['schools', 'cabinets', 'teachers'].forEach(function (field) {
        var el = document.getElementById('region-stat-' + field + '-' + region.id);
        if (!el || el.dataset.bound) return;
        el.dataset.bound = '1';
        el.addEventListener('input', function () {
          dirty = true;
          window.dirty = true;
          el.classList.add('changed');
        });
      });
    });
  }

  function renderList() {
    var list = document.getElementById('region-stats-list');
    if (!list) return;

    list.innerHTML = REGIONS.map(function (region) {
      var stats = mergedStats(region);
      var isLive = !!region.schoolGlobal;
      return '<article class="region-stat-card" data-region-id="' + esc(region.id) + '">' +
        '<div class="region-stat-card-head">' +
          '<div>' +
            '<h3 class="region-stat-name">' + esc(region.kk) + '</h3>' +
            '<p class="region-stat-name-en">' + esc(region.en) + '</p>' +
          '</div>' +
          '<span class="region-stat-badge' + (isLive ? ' is-live' : '') + '">' +
            (isLive ? 'Мектептер тізімі бар' : 'Статистика ғана') +
          '</span>' +
        '</div>' +
        '<div class="region-stat-fields">' +
          '<div class="region-stat-field">' +
            '<label for="region-stat-schools-' + esc(region.id) + '">Мектеп</label>' +
            '<input class="se-input" type="text" id="region-stat-schools-' + esc(region.id) + '" value="' + esc(stats.schools) + '" placeholder="мыс. 63">' +
          '</div>' +
          '<div class="region-stat-field">' +
            '<label for="region-stat-cabinets-' + esc(region.id) + '">Кабинет</label>' +
            '<input class="se-input" type="text" id="region-stat-cabinets-' + esc(region.id) + '" value="' + esc(stats.cabinets) + '" placeholder="мыс. 107">' +
          '</div>' +
          '<div class="region-stat-field">' +
            '<label for="region-stat-teachers-' + esc(region.id) + '">Оқытылған ұстаз</label>' +
            '<input class="se-input" type="text" id="region-stat-teachers-' + esc(region.id) + '" value="' + esc(stats.teachers) + '" placeholder="мыс. 1200+">' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    bindInputs();
  }

  async function loadStats() {
    if (!window.db || !window.db.getRegionStatsMap) {
      savedStats = {};
      return;
    }
    try {
      savedStats = await window.db.getRegionStatsMap() || {};
    } catch (e) {
      savedStats = {};
    }
  }

  async function render() {
    await loadStats();
    renderList();
    dirty = false;
  }

  function isActive() {
    return window.currentPage === 'regions';
  }

  function isDirty() {
    return dirty;
  }

  async function save() {
    if (!window.db || !window.db.saveRegionStatsMap) {
      return { success: false, error: 'Сақтау қолжетімсіз' };
    }
    var data = formValues();
    var result = await window.db.saveRegionStatsMap(data);
    if (result && result.success) {
      savedStats = data;
      dirty = false;
      window.dirty = false;
      document.querySelectorAll('#region-stats-list .changed').forEach(function (el) {
        el.classList.remove('changed');
      });
    }
    return result;
  }

  return {
    render: render,
    save: save,
    isActive: isActive,
    isDirty: isDirty
  };
})();
