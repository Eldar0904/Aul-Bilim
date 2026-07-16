/* ============================================================
   AUL BILIM — school detail page
   URL: school.html?region=akmola&id=akmola-astrakhan-1
   ============================================================ */
(function () {
  var REGIONS = window.AUL_BILIM_SCHOOL_REGIONS || [
    { id: 'west-kazakhstan', global: 'WEST_KAZAKHSTAN_SCHOOLS', kk: 'Батыс Қазақстан облысы', ru: 'Западно-Казахстанская область' },
    { id: 'kostanay', global: 'KOSTANAY_SCHOOLS', kk: 'Қостанай облысы', ru: 'Костанайская область' },
    { id: 'akmola', global: 'AKMOLA_SCHOOLS', kk: 'Ақмола облысы', ru: 'Акмолинская область' },
    { id: 'karaganda', global: 'KARAGANDA_SCHOOLS', kk: 'Қарағанды облысы', ru: 'Карагандинская область' },
    { id: 'abay', global: 'ABAY_SCHOOLS', kk: 'Абай облысы', ru: 'Абайская область' },
    { id: 'kyzylorda', global: 'KYZYLORDA_SCHOOLS', kk: 'Қызылорда облысы', ru: 'Кызылординская область' },
    { id: 'almaty', global: 'ALMATY_SCHOOLS', kk: 'Алматы облысы', ru: 'Алматинская область' }
  ];

  var CAROUSEL_PLACEHOLDER = 'assets/school-hero-placeholder.svg';
  var CAROUSEL_MS = 2500;
  var carouselTimer = null;
  var carouselIndex = 0;
  var carouselImagesList = [];

  function bi(kk, ru) {
    return document.documentElement.getAttribute('data-lang') === 'ru' ? ru : kk;
  }

  function parseParams() {
    var params = new URLSearchParams(location.search);
    return {
      region: (params.get('region') || '').trim(),
      id: (params.get('id') || '').trim()
    };
  }

  function schoolMapImage(school) {
    if (!school) return '';
    return String(school.mapImage || school.image || '').trim();
  }

  function mergeSchoolOverride(base, override) {
    if (!override) return base;
    var merged = Object.assign({}, base);
    if (typeof override.mapImage === 'string' && override.mapImage) merged.mapImage = override.mapImage;
    else if (typeof override.image === 'string' && override.image) merged.mapImage = override.image;
    if (Array.isArray(override.gallery)) merged.gallery = override.gallery.slice();
    if (override.youtube) merged.youtube = override.youtube;
    if (override.youtubeDesc) {
      merged.youtubeDesc = Object.assign({}, base.youtubeDesc || {});
      if (override.youtubeDesc.kk != null) merged.youtubeDesc.kk = override.youtubeDesc.kk;
      if (override.youtubeDesc.ru != null) merged.youtubeDesc.ru = override.youtubeDesc.ru;
      else if (override.youtubeDesc.en != null) merged.youtubeDesc.ru = override.youtubeDesc.en;
    }
    if (override.desc) {
      merged.desc = Object.assign({}, base.desc || {});
      if (override.desc.kk) merged.desc.kk = override.desc.kk;
      if (override.desc.ru) merged.desc.ru = override.desc.ru;
      else if (override.desc.en) merged.desc.ru = override.desc.en;
    }
    if (override.teachers != null) merged.teachers = override.teachers;
    return merged;
  }

  function findSchool(regionId, schoolId) {
    var region = null;
    for (var i = 0; i < REGIONS.length; i++) {
      if (REGIONS[i].id === regionId) {
        region = REGIONS[i];
        break;
      }
    }
    if (!region) return null;

    var data = window[region.global];
    if (!data || !data.schools) return null;

    var school = null;
    for (var j = 0; j < data.schools.length; j++) {
      if (data.schools[j].id === schoolId) {
        school = data.schools[j];
        break;
      }
    }
    if (!school) return null;

    return { region: region, school: school };
  }

  function carouselImages(s) {
    if (!s.gallery || !s.gallery.length) return [];
    return s.gallery.filter(function (src) { return !!src; });
  }

  function youtubeEmbedId(value) {
    if (!value) return null;
    var v = String(value).trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    var m = v.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function stopCarousel() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  function setCarouselSlide(index) {
    var track = document.getElementById('school-carousel-track');
    if (!track || !carouselImagesList.length) return;

    carouselIndex = (index + carouselImagesList.length) % carouselImagesList.length;
    track.querySelectorAll('.school-carousel-slide').forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === carouselIndex);
    });
  }

  function startCarousel() {
    stopCarousel();
    if (carouselImagesList.length <= 1) return;
    carouselTimer = setInterval(function () {
      setCarouselSlide(carouselIndex + 1);
    }, CAROUSEL_MS);
  }

  function setupCarousel(images) {
    stopCarousel();

    var col = document.getElementById('school-carousel-col');
    var track = document.getElementById('school-carousel-track');
    var prevBtn = document.getElementById('school-carousel-prev');
    var nextBtn = document.getElementById('school-carousel-next');
    var carousel = document.getElementById('school-carousel');

    carouselImagesList = images.slice();

    if (!col || !track) return;

    if (!images.length) {
      col.hidden = false;
      carouselIndex = 0;
      track.innerHTML =
        '<div class="school-carousel-slide is-active school-carousel-slide--placeholder">' +
          '<img src="' + CAROUSEL_PLACEHOLDER + '" alt="" />' +
        '</div>';
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
      if (carousel) {
        carousel.onmouseenter = null;
        carousel.onmouseleave = null;
      }
      return;
    }

    col.hidden = false;
    carouselIndex = 0;
    track.innerHTML = images.map(function (src, i) {
      return '<div class="school-carousel-slide' + (i === 0 ? ' is-active' : '') + '">' +
        '<img src="' + src.replace(/"/g, '&quot;') + '" alt="" loading="' + (i === 0 ? 'eager' : 'lazy') + '" />' +
      '</div>';
    }).join('');

    var multi = images.length > 1;
    if (prevBtn) prevBtn.hidden = !multi;
    if (nextBtn) nextBtn.hidden = !multi;

    if (prevBtn) {
      prevBtn.onclick = function () {
        setCarouselSlide(carouselIndex - 1);
        startCarousel();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = function () {
        setCarouselSlide(carouselIndex + 1);
        startCarousel();
      };
    }

    if (carousel) {
      carousel.onmouseenter = stopCarousel;
      carousel.onmouseleave = startCarousel;
    }

    startCarousel();
  }

  function renderVideo(frame, school) {
    if (!frame) return;
    var id = youtubeEmbedId(school.youtube);
    var captionBar = document.getElementById('school-video-caption');
    var descEl = document.getElementById('school-yt-desc');
    var desc = school.youtubeDesc
      ? bi(school.youtubeDesc.kk || '', school.youtubeDesc.ru || school.youtubeDesc.en || '')
      : '';
    if (id) {
      frame.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="YouTube video" loading="lazy" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
      frame.classList.remove('is-placeholder');
      if (captionBar) captionBar.hidden = false;
      if (descEl) descEl.textContent = desc;
      return;
    }

    frame.innerHTML =
      '<div class="school-video-placeholder" aria-hidden="true">' +
        '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>' +
        '<p><span lang="kk">Бейне жақында қосылады</span><span lang="ru">Видео скоро появится</span></p>' +
      '</div>';
    frame.classList.add('is-placeholder');
    if (captionBar) captionBar.hidden = true;
    if (descEl) descEl.textContent = '';
  }

  function renderMapCard(school, name) {
    var mapUrl = schoolMapImage(school);
    var isDistrictMap = !!(school.mapImage && String(school.mapImage).trim());
    var isFallbackPhoto = !!mapUrl && !isDistrictMap;
    var card = document.getElementById('school-map-card');
    var imgEl = document.getElementById('school-map-img');
    var phEl = document.getElementById('school-map-placeholder');

    if (card) {
      card.classList.toggle('school-map-card--photo', !!mapUrl);
      card.classList.toggle('school-map-card--placeholder', !mapUrl);
      card.classList.toggle('school-map-card--district-map', isDistrictMap);
      card.classList.toggle('school-map-card--fallback-photo', isFallbackPhoto);
    }
    if (imgEl) {
      if (mapUrl) {
        imgEl.src = mapUrl;
        imgEl.alt = name;
        imgEl.removeAttribute('hidden');
      } else {
        imgEl.removeAttribute('src');
        imgEl.alt = '';
        imgEl.setAttribute('hidden', '');
      }
    }
    if (phEl) {
      if (mapUrl) phEl.setAttribute('hidden', '');
      else phEl.removeAttribute('hidden');
    }
  }

  function renderPage(result) {
    var main = document.getElementById('main-content');
    var notFound = document.getElementById('school-not-found');
    if (!result) {
      stopCarousel();
      if (main) main.hidden = true;
      if (notFound) notFound.hidden = false;
      return;
    }

    var region = result.region;
    var school = result.school;
    var images = carouselImages(school);

    if (notFound) notFound.hidden = true;
    if (main) main.hidden = false;

    var titleEl = document.getElementById('school-hero-title');
    var backLink = document.getElementById('school-back-link');
    var descEl = document.getElementById('school-desc');
    var teachersEl = document.getElementById('school-teachers');
    var videoFrame = document.getElementById('school-video-frame');

    var name = bi(school.kk, school.ru);
    document.title = name + ' — Aul Bilim';
    var pageTitle = document.querySelector('title');
    if (pageTitle) {
      pageTitle.setAttribute('data-kk', name + ' — Aul Bilim');
      pageTitle.setAttribute('data-ru', (school.ru || school.kk) + ' — Aul Bilim');
    }

    renderMapCard(school, name);

    if (titleEl) titleEl.textContent = name;
    if (backLink) {
      backLink.href = 'index.html#region-' + region.id + '-schools';
    }
    if (descEl && school.desc) {
      descEl.textContent = bi(school.desc.kk, school.desc.ru);
    }

    if (teachersEl) {
      if (school.teachers != null) {
        teachersEl.hidden = false;
        teachersEl.textContent = school.teachers + ' ' + bi('мұғалім', 'педагогов');
      } else {
        teachersEl.hidden = true;
        teachersEl.textContent = '';
      }
    }

    setupCarousel(images);
    if (videoFrame) renderVideo(videoFrame, school);
  }

  async function init() {
    var params = parseParams();
    var result = findSchool(params.region, params.id);
    if (result && window.db && window.db.getSchoolContent) {
      try {
        var override = await window.db.getSchoolContent(params.id);
        if (override) {
          result.school = mergeSchoolOverride(result.school, override);
        }
      } catch (e) { /* use static defaults */ }
    }
    renderPage(result);
  }

  document.addEventListener('DOMContentLoaded', init);
  document.querySelectorAll('.lang-switch button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTimeout(init, 0);
    });
  });
})();
