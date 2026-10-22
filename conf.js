/* Страницы конференций: лайтбокс фотобанка и запуск видео. */
(function () {
  /* ---------- видео ---------- */
  document.querySelectorAll('.cf-video').forEach(function (v) {
    function play() {
      if (v.classList.contains('is-on')) return;
      var id = v.getAttribute('data-video');
      v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0" title="video" frameborder="0" ' +
        'allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
      v.classList.add('is-on');
    }
    v.addEventListener('click', play);
    v.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });
  });

  /* ---------- лайтбокс фотобанка ---------- */
  var grid = document.getElementById('cf-shots');
  var lb = document.getElementById('cf-lb');
  if (!grid || !lb) return;

  var shots = [].slice.call(grid.querySelectorAll('.cf-shot'));
  var srcs = shots.map(function (b) { return b.getAttribute('data-src'); });
  var img = document.getElementById('cf-lb-img');
  var cur = 0;

  function show(i) {
    cur = (i + srcs.length) % srcs.length;
    img.src = srcs[cur];
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() { lb.hidden = true; img.src = ''; document.body.style.overflow = ''; }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.cf-shot');
    if (b) show(parseInt(b.getAttribute('data-i'), 10));
  });
  document.getElementById('cf-lb-close').addEventListener('click', close);
  document.getElementById('cf-lb-prev').addEventListener('click', function () { show(cur - 1); });
  document.getElementById('cf-lb-next').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });

  /* свайп на телефоне */
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 45) show(cur + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();

