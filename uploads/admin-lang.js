(function () {
  'use strict';

  var STORAGE_KEY = 'aulbilim-admin-lang';
  var lang = 'kk';
  var listeners = [];

  function fieldLang(key) {
    if (/-kk$/.test(key) || key.indexOf('-kk-') >= 0) return 'kk';
    if (/-ru$/.test(key) || key.indexOf('-ru-') >= 0) return 'ru';
    if (/-en$/.test(key) || key.indexOf('-en-') >= 0) return 'ru';
    return 'kk';
  }

  function getLang() {
    return lang;
  }

  function setLang(next) {
    if (next === 'en') next = 'ru';
    if (next !== 'kk' && next !== 'ru') return;
    if (next === lang) return;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.setAttribute('data-admin-lang', lang);
    syncToggleUi();
    listeners.forEach(function (fn) { fn(lang); });
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  function syncToggleUi() {
    document.querySelectorAll('[data-admin-lang]').forEach(function (btn) {
      btn.classList.toggle('is-on', btn.dataset.adminLang === lang);
    });
  }

  function bindToggle() {
    document.querySelectorAll('[data-admin-lang]').forEach(function (btn) {
      if (btn.dataset.adminLangBound) return;
      btn.dataset.adminLangBound = '1';
      btn.addEventListener('click', function () {
        setLang(btn.dataset.adminLang);
      });
    });
    syncToggleUi();
  }

  function init() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en') stored = 'ru';
      if (stored === 'ru' || stored === 'kk') lang = stored;
    } catch (e) {}
    document.documentElement.setAttribute('data-admin-lang', lang);
    bindToggle();
  }

  window.adminLang = {
    init: init,
    getLang: getLang,
    setLang: setLang,
    onChange: onChange,
    fieldLang: fieldLang
  };
})();
