/**
 * app.js — UI logic only.
 *
 * Responsibilities:
 *   • Language switcher (delegates text swaps to content.js)
 *   • Mobile nav open / close
 *   • Active nav link based on current page
 *
 * Does NOT touch content data, auth state, or Firestore.
 * Those live in content.js, auth.js, db.js respectively.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     LANGUAGE SWITCHER
     Reads translations from window.TRANSLATIONS (content.js).
     Swaps text of every [data-i18n] element on the page.
     Persists choice to localStorage.
  ───────────────────────────────────────── */

  const DEFAULT_LANG = 'kk';
  const STORAGE_KEY  = 'aulbilim_lang';

  function applyLang(lang) {
    const translations = window.TRANSLATIONS;
    if (!translations || !translations[lang]) {
      console.warn('[app.js] No translations found for lang:', lang);
      return;
    }

    // Swap <html lang> attribute for accessibility / SEO
    document.documentElement.lang = lang;
    document.documentElement.dataset.currentLang = lang;

    // Swap every element that carries a data-i18n key
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key  = el.dataset.i18n;
      const text = translations[lang][key];
      if (text !== undefined) {
        // Use textContent for plain strings; innerHTML for strings containing <em> etc.
        if (text.includes('<')) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });

    // Update <title>
    const titleKey = translations[lang]['meta.title'];
    if (titleKey) document.title = titleKey;

    // Update <meta name="description">
    const descKey = translations[lang]['meta.description'];
    if (descKey) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', descKey);
    }

    // Update lang switcher button states
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      const isActive = btn.dataset.langBtn === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Persist choice
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private browsing */ }
  }

  function initLangSwitcher() {
    // Restore saved preference, fall back to default
    let savedLang = DEFAULT_LANG;
    try { savedLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch (e) { /* ignore */ }
    applyLang(savedLang);

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.dataset.langBtn);
      });
    });
  }


  /* ─────────────────────────────────────────
     MOBILE NAV
  ───────────────────────────────────────── */

  function initMobileNav() {
    const toggle   = document.querySelector('.nav__toggle');
    const navLinks = document.getElementById('nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen); // drives hamburger → X CSS animation
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label',
        isOpen
          ? document.documentElement.lang === 'en' ? 'Close menu' : 'Менюді жабу'
          : document.documentElement.lang === 'en' ? 'Open menu'  : 'Менюді ашу'
      );
      // Prevent body scroll when drawer is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    function closeNav() {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    // Close drawer when any nav link is clicked (mobile UX)
    navLinks.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Close drawer on outside click
    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeNav();
      }
    });
  }


  /* ─────────────────────────────────────────
     ACTIVE NAV LINK
     Marks the link whose href matches the current page.
  ───────────────────────────────────────── */

  function initActiveLink() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link').forEach(function (link) {
      const linkFile = link.getAttribute('href').split('/').pop();
      link.classList.toggle('active', linkFile === currentFile);
    });
  }


  /* ─────────────────────────────────────────
     BOOT
  ───────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initActiveLink();
    initLangSwitcher(); // must come last — rewrites text nodes
  });

})();
