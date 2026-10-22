(function () {
  'use strict';

  function play(frame) {
    if (!frame || frame.classList.contains('is-live')) return;
    var id = frame.getAttribute('data-video');
    if (!/^[\w-]{11}$/.test(id || '')) return;
    // Stop a previous film when another one starts.
    document.querySelectorAll('.fl-frame.is-live').forEach(function (other) {
      var player = other.querySelector('iframe');
      if (player) player.remove();
      other.classList.remove('is-live');
      other.setAttribute('role', 'button');
      other.setAttribute('tabindex', '0');
    });
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    var title = frame.closest('article').querySelector('h2 [lang="' + document.documentElement.lang + '"]');
    iframe.title = title ? title.textContent : 'Auyl Bilim';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.appendChild(iframe);
    frame.classList.add('is-live');
    frame.removeAttribute('role');
    frame.removeAttribute('tabindex');
    iframe.focus();
  }

  document.querySelectorAll('.fl-frame[data-video]').forEach(function (frame) {
    frame.addEventListener('click', function () { play(frame); });
    frame.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        play(frame);
      }
    });
  });
  document.querySelectorAll('.fl-watch').forEach(function (button) {
    button.addEventListener('click', function () {
      var frame = document.querySelector('.fl-frame[data-video="' + button.getAttribute('data-target') + '"]');
      play(frame);
      if (frame) frame.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    });
  });
})();
