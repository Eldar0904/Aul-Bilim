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

    // active nav link by page + program hash
    function navPageName() {
      var part = location.pathname.split('/').pop() || '';
      if (!part || part === 'index.html') return 'index.html';
      return part;
    }

    function setActiveNav() {
      var here = navPageName();
      var hash = (location.hash || '').replace(/^#/, '').toLowerCase();
      document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
        var href = a.getAttribute('href') || '';
        var parts = href.split('#');
        var linkPage = parts[0] || 'index.html';
        var linkHash = (parts[1] || '').toLowerCase();
        if (linkPage === './') linkPage = 'index.html';

        var active = false;
        if (linkHash) {
          active = here === linkPage && hash === linkHash;
        } else if (linkPage === 'index.html') {
          active = here === 'index.html';
        } else {
          active = here === linkPage && !hash;
        }

        a.classList.toggle('active', active);
        if (active) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    }
    setActiveNav();
    window.addEventListener('hashchange', setActiveNav);
    window.addEventListener('pageshow', setActiveNav);

    // programs.html — hub vs detail views (#fitout, #ustaz, #samruk)
    var hubIntro = document.getElementById('programs-hub-intro');
    if (hubIntro) {
      var slugs = ['fitout', 'ustaz', 'samruk'];
      var defaultTitle = { kk: null, en: null };
      var titleEl = document.querySelector('title');
      if (titleEl) {
        defaultTitle.kk = titleEl.getAttribute('data-kk');
        defaultTitle.en = titleEl.getAttribute('data-en');
      }

      function applyProgramsView() {
        var hash = (location.hash || '').replace(/^#/, '').toLowerCase();
        var slug = slugs.indexOf(hash) >= 0 ? hash : null;

        hubIntro.hidden = !!slug;
        var cardsSection = document.getElementById('programs-cards');
        if (cardsSection) cardsSection.hidden = !!slug;
        document.querySelectorAll('#programs-cards .dir-card').forEach(function (card) {
          var href = (card.getAttribute('href') || '').replace(/^.*#/, '');
          card.classList.toggle('is-active', slug === href);
          card.setAttribute('aria-current', slug === href ? 'page' : 'false');
        });
        slugs.forEach(function (id) {
          var view = document.getElementById('program-' + id);
          if (view) view.hidden = slug !== id;
        });

        var main = document.getElementById('main-content');
        if (main) main.classList.toggle('prog-page', !!slug);

        if (titleEl) {
          if (slug) {
            var detail = document.getElementById('program-' + slug);
            var lang = getLang();
            var custom = detail && detail.getAttribute('data-title-' + lang);
            if (custom) titleEl.textContent = custom;
          } else {
            var fallback = defaultTitle[getLang()];
            if (fallback) titleEl.textContent = fallback;
          }
        }

        if (slug) window.scrollTo(0, 0);
        setActiveNav();
      }

      applyProgramsView();
      window.addEventListener('hashchange', applyProgramsView);
    }

    // feature card image carousels
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
      var track = root.querySelector('.feat-carousel-track');
      var slides = track ? Array.prototype.slice.call(track.children) : [];
      var dotsWrap = root.querySelector('.feat-carousel-dots');
      var prev = root.querySelector('.feat-carousel-prev');
      var next = root.querySelector('.feat-carousel-next');
      if (!track || !slides.length || !dotsWrap) return;

      var index = 0;
      var count = slides.length;

      slides.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'feat-carousel-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Image ' + (i + 1) + ' of ' + count);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', function () { go(i); });
        dotsWrap.appendChild(dot);
      });

      var dots = Array.prototype.slice.call(dotsWrap.children);

      function go(i) {
        index = (i + count) % count;
        track.style.transform = 'translateX(-' + (index * 100) + '%)';
        dots.forEach(function (dot, n) {
          var active = n === index;
          dot.classList.toggle('is-active', active);
          dot.setAttribute('aria-selected', active ? 'true' : 'false');
        });
      }

      if (prev) prev.addEventListener('click', function () { go(index - 1); });
      if (next) next.addEventListener('click', function () { go(index + 1); });

      root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
      });
    });

    // index.html — reset map/schools drill-down when navigating to #regions
    var here = location.pathname.split('/').pop() || 'index.html';
    if (here === 'index.html' || here === '') {
      function resetMapIfNeeded() {
        if (!window.AulBilimMap) return;
        var hash = (location.hash || '').replace(/^#/, '').toLowerCase();
        if (!hash || hash === 'regions') window.AulBilimMap.reset();
        else window.AulBilimMap.applyHash();
      }

      window.addEventListener('hashchange', resetMapIfNeeded);

      document.querySelectorAll('a[href="#regions"], a[href="index.html#regions"]').forEach(function (a) {
        a.addEventListener('click', function () {
          if (window.AulBilimMap) window.AulBilimMap.reset();
        });
      });

      document.querySelectorAll('a.logo[href="index.html"]').forEach(function (a) {
        a.addEventListener('click', function () {
          if (window.AulBilimMap) window.AulBilimMap.reset();
        });
      });
    }
  });
})();
