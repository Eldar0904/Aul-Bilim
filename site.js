/* ============================================================
   AUL BILIM — shared site behaviour
   - KK/EN language toggle (persisted)
   - mobile nav
   - active nav link
   ============================================================ */
(function () {
  var STORE = 'aulbilim_lang';
  var root = document.documentElement;

  function getLang() {
    try { return localStorage.getItem(STORE) || 'kk'; } catch (e) { return 'kk'; }
  }
  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    try { localStorage.setItem(STORE, lang); } catch (e) {}
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-set') === lang);
    });
    // swap <html lang> + per-page <title>
    root.setAttribute('lang', lang === 'kk' ? 'kk' : 'en');
    var t = document.querySelector('title');
    if (t) {
      var alt = t.getAttribute('data-' + lang);
      if (alt) t.textContent = alt;
    }
  }

  // apply ASAP
  setLang(getLang());

  document.addEventListener('DOMContentLoaded', function () {
    setLang(getLang());

    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-set')); });
    });

    // mobile menu
    var btn = document.querySelector('.menu-btn');
    var links = document.querySelector('.nav-links');
    if (btn && links) {
      btn.addEventListener('click', function () { links.classList.toggle('open'); });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { links.classList.remove('open'); });
      });
    }

    // active nav link by filename
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === here || (here === 'index.html' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  });
})();
