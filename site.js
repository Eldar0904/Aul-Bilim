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
      var isCurrent = b.getAttribute('data-set') === lang;
      b.classList.toggle('on', isCurrent);
      b.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
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
      if (!links.id) links.id = 'site-nav-links';
      btn.setAttribute('aria-controls', links.id);
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          links.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          links.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
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
