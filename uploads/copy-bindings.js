/**
 * Maps semantic CMS keys (admin data-key) to public-page selectors.
 * Used by uploads/content-loader.js after Firestore copy is loaded.
 */
(function () {
  'use strict';

  function stat(n, part, lang) {
    var sel = '.stat-strip .ss:nth-child(' + n + ') .' + part;
    return lang ? sel + ' [lang="' + lang + '"]' : sel;
  }

  function dirCard(n, tag, lang) {
    return '.dir-cards .dir-card:nth-child(' + n + ') ' + tag + ' [lang="' + lang + '"]';
  }

  window.COPY_BINDINGS = {
    'index.html': {
      'hero-h1-kk': '.hero-fb-content h1 [lang=kk] .hero-h1-line',
      'hero-h1-ru': '.hero-fb-content h1 [lang=ru] .hero-h1-line',
      'hero-lead-kk': '.hero-fb-content .lead:first-of-type [lang=kk]',
      'hero-lead-ru': '.hero-fb-content .lead:first-of-type [lang=ru]',
      'stat-1-n': stat(1, 'n'),
      'stat-2-n': stat(2, 'n'),
      'stat-3-n': stat(3, 'n'),
      'stat-4-n': stat(4, 'n'),
      'stat-1-l-kk': stat(1, 'l', 'kk'),
      'stat-1-l-ru': stat(1, 'l', 'ru'),
      'stat-2-l-kk': stat(2, 'l', 'kk'),
      'stat-2-l-ru': stat(2, 'l', 'ru'),
      'stat-3-l-kk': stat(3, 'l', 'kk'),
      'stat-3-l-ru': stat(3, 'l', 'ru'),
      'stat-4-l-kk': stat(4, 'l', 'kk'),
      'stat-4-l-ru': stat(4, 'l', 'ru')
      /* Stage card titles use copy-registry keys (index-027-kk … index-036-ru).
         Legacy prog-1/2/3-kk bindings removed — they targeted old card order
         and overwrote correct stage titles from Firestore. */
    },
    'about.html': {
      'mission-g1-kk': '.about-mission-goals li:nth-child(1) .about-mission-goal-text [lang=kk]',
      'mission-g1-ru': '.about-mission-goals li:nth-child(1) .about-mission-goal-text [lang=ru]',
      'mission-g2-kk': '.about-mission-goals li:nth-child(2) .about-mission-goal-text [lang=kk]',
      'mission-g2-ru': '.about-mission-goals li:nth-child(2) .about-mission-goal-text [lang=ru]'
    }
  };
})();
