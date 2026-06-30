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

  function storyCard(n, lang) {
    return '.stories .story:nth-child(' + n + ') .tx h3 [lang="' + lang + '"]';
  }

  window.COPY_BINDINGS = {
    'index.html': {
      'hero-h1-kk': '.hero-fb-content h1 [lang=kk] .hero-h1-line',
      'hero-h1-en': '.hero-fb-content h1 [lang=en] .hero-h1-line',
      'hero-lead-kk': '.hero-fb-content .lead:first-of-type [lang=kk]',
      'hero-lead-en': '.hero-fb-content .lead:first-of-type [lang=en]',
      'stat-1-n': stat(1, 'n'),
      'stat-2-n': stat(2, 'n'),
      'stat-3-n': stat(3, 'n'),
      'stat-4-n': stat(4, 'n'),
      'stat-1-l-kk': stat(1, 'l', 'kk'),
      'stat-1-l-en': stat(1, 'l', 'en'),
      'stat-2-l-kk': stat(2, 'l', 'kk'),
      'stat-2-l-en': stat(2, 'l', 'en'),
      'stat-3-l-kk': stat(3, 'l', 'kk'),
      'stat-3-l-en': stat(3, 'l', 'en'),
      'stat-4-l-kk': stat(4, 'l', 'kk'),
      'stat-4-l-en': stat(4, 'l', 'en'),
      'prog-1-kk': dirCard(1, 'h3', 'kk'),
      'prog-1-en': dirCard(1, 'h3', 'en'),
      'prog-2-kk': dirCard(2, 'h3', 'kk'),
      'prog-2-en': dirCard(2, 'h3', 'en'),
      'prog-3-kk': dirCard(3, 'h3', 'kk'),
      'prog-3-en': dirCard(3, 'h3', 'en')
    },
    'stories.html': {
      'feat-title-kk': '#featured-story .prose h3 [lang=kk]',
      'feat-title-en': '#featured-story .prose h3 [lang=en]',
      'story-1-kk': storyCard(1, 'kk'),
      'story-1-en': storyCard(1, 'en'),
      'story-2-kk': storyCard(2, 'kk'),
      'story-2-en': storyCard(2, 'en'),
      'story-3-kk': storyCard(3, 'kk'),
      'story-3-en': storyCard(3, 'en'),
      'story-4-kk': storyCard(4, 'kk'),
      'story-4-en': storyCard(4, 'en'),
      'story-5-kk': storyCard(5, 'kk'),
      'story-5-en': storyCard(5, 'en'),
      'story-6-kk': storyCard(6, 'kk'),
      'story-6-en': storyCard(6, 'en')
    },
    'about.html': {
      'mission-g1-kk': '.about-mission-goals li:nth-child(1) .about-mission-goal-text [lang=kk]',
      'mission-g1-en': '.about-mission-goals li:nth-child(1) .about-mission-goal-text [lang=en]',
      'mission-g2-kk': '.about-mission-goals li:nth-child(2) .about-mission-goal-text [lang=kk]',
      'mission-g2-en': '.about-mission-goals li:nth-child(2) .about-mission-goal-text [lang=en]'
    }
  };
})();
