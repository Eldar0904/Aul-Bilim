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
        var programsHub = document.getElementById('programs-hub');
        if (programsHub) programsHub.hidden = !!slug;
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

    // about.html — cooperation model flip cards
    var coopRoot = document.getElementById('coop-interactive');
    if (coopRoot) {
      var coopZones = Array.prototype.slice.call(coopRoot.querySelectorAll('.coop-zone'));
      var activeZone = null;
      var coopStage = coopRoot.querySelector('.coop-diagram-stage');
      var coopLinksSvg = coopRoot.querySelector('.coop-links');
      var coopDotsGroup = coopLinksSvg && coopLinksSvg.querySelector('.coop-link-dots');
      var coopLinkDefs = [
        { id: 'coop-link-kh', hub: 'top', partner: 'kh', target: 'bottom', bend: 0.12 },
        { id: 'coop-link-bi', hub: 'left', partner: 'bi', target: 'right', bend: 0.14 },
        { id: 'coop-link-local', hub: 'right', partner: 'local', target: 'left', bend: 0.14 }
      ];
      var coopLinkTimer = null;
      var coopReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function coopCardRect(zoneClass, containerRect) {
        var zone = coopRoot.querySelector(zoneClass);
        var flip = zone && zone.querySelector('.coop-card-flip');
        if (!flip) return null;
        var rect = flip.getBoundingClientRect();
        return {
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
          right: rect.right - containerRect.left,
          bottom: rect.bottom - containerRect.top,
          cx: rect.left - containerRect.left + rect.width / 2,
          cy: rect.top - containerRect.top + rect.height / 2
        };
      }

      function coopAnchor(rect, side) {
        if (!rect) return null;
        if (side === 'top') return { x: rect.cx, y: rect.top };
        if (side === 'bottom') return { x: rect.cx, y: rect.bottom };
        if (side === 'left') return { x: rect.left, y: rect.cy };
        if (side === 'right') return { x: rect.right, y: rect.cy };
        return { x: rect.cx, y: rect.cy };
      }

      function coopQuadPath(start, end, bend) {
        var mx = (start.x + end.x) / 2;
        var my = (start.y + end.y) / 2;
        var dx = end.x - start.x;
        var dy = end.y - start.y;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var px = -dy / len;
        var py = dx / len;
        var cx = mx + px * len * bend;
        var cy = my + py * len * bend;
        return 'M' + start.x.toFixed(1) + ' ' + start.y.toFixed(1) +
          ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) +
          ' ' + end.x.toFixed(1) + ' ' + end.y.toFixed(1);
      }

      function coopBuildDots(pathId, duration) {
        if (!coopDotsGroup || coopReducedMotion) return '';
        var dots = '';
        var offsets = ['0s', (duration * 0.33).toFixed(2) + 's', (duration * 0.66).toFixed(2) + 's'];
        for (var i = 0; i < offsets.length; i++) {
          dots += '<circle class="coop-link-dot" r="3.5">' +
            '<animateMotion dur="' + duration + 's" repeatCount="indefinite" begin="' + offsets[i] + '" rotate="auto">' +
            '<mpath href="#' + pathId + '"></mpath>' +
            '</animateMotion></circle>';
        }
        return dots;
      }

      function updateCoopLinks() {
        if (!coopStage || !coopLinksSvg) return;
        if (window.innerWidth <= 900) return;

        var stageRect = coopStage.getBoundingClientRect();
        var width = Math.max(1, Math.round(stageRect.width));
        var height = Math.max(1, Math.round(stageRect.height));
        var jf = coopCardRect('.coop-zone--jf', stageRect);
        if (!jf) return;

        coopLinksSvg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        coopLinksSvg.setAttribute('width', width);
        coopLinksSvg.setAttribute('height', height);

        var dotsHtml = '';
        coopLinkDefs.forEach(function (link) {
          var pathEl = coopLinksSvg.querySelector('#' + link.id);
          var partner = coopCardRect('.coop-zone--' + link.partner, stageRect);
          if (!pathEl || !partner) return;

          var start = coopAnchor(jf, link.hub);
          var end = coopAnchor(partner, link.target);
          if (!start || !end) return;

          pathEl.setAttribute('d', coopQuadPath(start, end, link.bend));
          pathEl.classList.toggle('is-active', !!(activeZone && activeZone.classList.contains('coop-zone--' + link.partner)));
          dotsHtml += coopBuildDots(link.id, 3.6);
        });

        if (coopDotsGroup) coopDotsGroup.innerHTML = dotsHtml;
      }

      function scheduleCoopLinks() {
        window.clearTimeout(coopLinkTimer);
        coopLinkTimer = window.setTimeout(function () {
          syncCoopCardSizes();
          updateCoopLinks();
        }, 80);
      }

      function syncCoopCardSizes() {
        if (window.innerWidth <= 900) {
          coopRoot.style.removeProperty('--coop-card-width');
          coopRoot.style.removeProperty('--coop-card-height');
          return;
        }

        coopRoot.style.removeProperty('--coop-card-width');
        coopRoot.style.removeProperty('--coop-card-height');

        window.requestAnimationFrame(function () {
          var jfFlip = coopRoot.querySelector('.coop-zone--jf .coop-card-flip');
          if (!jfFlip) return;
          var rect = jfFlip.getBoundingClientRect();
          if (rect.width > 0) coopRoot.style.setProperty('--coop-card-width', Math.round(rect.width) + 'px');
          if (rect.height > 0) coopRoot.style.setProperty('--coop-card-height', Math.round(rect.height) + 'px');
        });
      }

      function setCoopFlipped(zone, flipped) {
        if (!zone) return;
        var hit = zone.querySelector('.coop-zone-hit');
        var front = zone.querySelector('.coop-card--front');
        var back = zone.querySelector('.coop-card--back');
        zone.classList.toggle('is-flipped', flipped);
        if (hit) {
          hit.classList.toggle('is-active', flipped);
          hit.setAttribute('aria-selected', flipped ? 'true' : 'false');
          hit.setAttribute('aria-expanded', flipped ? 'true' : 'false');
        }
        if (front) front.setAttribute('aria-hidden', flipped ? 'true' : 'false');
        if (back) back.setAttribute('aria-hidden', flipped ? 'false' : 'true');
      }

      function closeCoopZone(zone) {
        if (!zone) return;
        setCoopFlipped(zone, false);
        if (activeZone === zone) activeZone = null;
        scheduleCoopLinks();
      }

      function closeAllCoopZones() {
        coopZones.forEach(function (zone) {
          setCoopFlipped(zone, false);
        });
        activeZone = null;
        scheduleCoopLinks();
      }

      function openCoopZone(zone) {
        if (activeZone && activeZone !== zone) closeCoopZone(activeZone);
        setCoopFlipped(zone, true);
        activeZone = zone;
        scheduleCoopLinks();
      }

      coopZones.forEach(function (zone) {
        var hit = zone.querySelector('.coop-zone-hit');
        if (!hit) return;
        hit.addEventListener('click', function (e) {
          e.stopPropagation();
          if (zone.classList.contains('is-flipped')) {
            closeCoopZone(zone);
            return;
          }
          openCoopZone(zone);
        });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && activeZone) closeAllCoopZones();
      });

      document.addEventListener('click', function (e) {
        if (!activeZone) return;
        if (e.target.closest('.coop-zone')) return;
        closeAllCoopZones();
      });

      window.addEventListener('resize', scheduleCoopLinks);

      if (coopStage && window.ResizeObserver) {
        var coopResizeObserver = new ResizeObserver(scheduleCoopLinks);
        coopResizeObserver.observe(coopStage);
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleCoopLinks);
      }

      window.addEventListener('load', scheduleCoopLinks);
      scheduleCoopLinks();
    }

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
