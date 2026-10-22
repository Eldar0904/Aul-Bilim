(function () {
  'use strict';
  var links = Array.from(document.querySelectorAll('.media-subnav a'));
  var sections = Array.from(document.querySelectorAll('.media-section'));
  var scheduled = false;
  function markSection(id) {
    links.forEach(function (link) {
      if (link.hash === '#' + id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  function updateSection() {
    scheduled = false;
    var nav = document.querySelector('.media-subnav');
    var threshold = nav.getBoundingClientRect().bottom + 105;
    var current = sections[0];
    sections.forEach(function (section) { if(section.getBoundingClientRect().top <= threshold) current = section; });
    if(current) markSection(current.id);
  }
  window.addEventListener('scroll',function () {
    if(!scheduled) {scheduled = true;requestAnimationFrame(updateSection);}
  },{passive:true});
  window.addEventListener('resize',updateSection);
  window.addEventListener('hashchange',updateSection);
  links.forEach(function (link) { link.addEventListener('click',function () { markSection(link.hash.slice(1)); }); });
  updateSection();

  var dialog = document.querySelector('.media-lightbox');
  var photos = Array.from(document.querySelectorAll('[data-gallery-index]'));
  var image = dialog.querySelector('.media-lightbox-image');
  var caption = dialog.querySelector('figcaption');
  var counter = dialog.querySelector('.media-lightbox-count');
  var selected = 0;
  var returnFocus = null;
  function showPhoto(index) {
    selected = (index + photos.length) % photos.length;
    var photo = photos[selected];
    var lang = document.documentElement.getAttribute('data-lang') || 'kk';
    var label = photo.querySelector('[lang="'+lang+'"]');
    image.src = photo.querySelector('img').src;
    image.alt = label.textContent;
    caption.textContent = label.textContent;
    counter.textContent = (selected + 1) + ' / ' + photos.length;
  }
  photos.forEach(function (photo,index) {
    photo.addEventListener('click',function () {
      returnFocus = photo;
      showPhoto(index);
      dialog.showModal();
    });
  });
  dialog.querySelector('.media-lightbox-close').addEventListener('click',function () { dialog.close(); });
  dialog.querySelectorAll('[data-gallery-step]').forEach(function (button) {
    button.addEventListener('click',function () { showPhoto(selected + Number(button.dataset.galleryStep)); });
  });
  dialog.addEventListener('keydown',function (event) {
    if(event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(selected + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click',function (event) {
    if(event.target !== dialog) return;
    var bounds = dialog.getBoundingClientRect();
    if(event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close',function () {
    image.removeAttribute('src');
    if(returnFocus) returnFocus.focus({preventScroll:true});
  });
  new MutationObserver(function () {if(dialog.open) showPhoto(selected);}).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});
})();
