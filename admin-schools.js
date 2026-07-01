/**
 * Admin school browser — WYSIWYG preview matching school.html layout.
 */
window.adminSchools = (function () {
  'use strict';

  var REGIONS = window.AUL_BILIM_SCHOOL_REGIONS || [];
  var allSchools = [];
  var selectedId = null;
  var selectedRegionId = null;
  var selectedEntry = null;
  var dirty = false;
  var overrideCache = {};
  var previewLang = 'kk';
  var carouselTimer = null;
  var carouselIndex = 0;
  var carouselImagesList = [];

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function buildIndex() {
    allSchools = [];
    REGIONS.forEach(function (region) {
      var data = window[region.global];
      if (!data || !data.schools) return;
      data.schools.forEach(function (school) {
        allSchools.push({
          id: school.id,
          regionId: region.id,
          regionKk: region.kk,
          regionEn: region.en,
          kk: school.kk,
          en: school.en,
          districtKey: school.districtKey || '',
          base: school
        });
      });
    });
    allSchools.sort(function (a, b) {
      return a.kk.localeCompare(b.kk, 'kk');
    });
  }

  function schoolPageUrl(entry) {
    return 'school.html?region=' + encodeURIComponent(entry.regionId) + '&id=' + encodeURIComponent(entry.id);
  }

  function schoolMapImage(school) {
    if (!school) return '';
    return String(school.mapImage || school.image || '').trim();
  }

  function hasMedia(school) {
    return !!(schoolMapImage(school) || (school.gallery && school.gallery.length) || school.youtube);
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

  function formValues() {
    var galleryRaw = (document.getElementById('school-field-gallery') || {}).value || '';
    var gallery = galleryRaw.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    var teachersRaw = (document.getElementById('school-field-teachers') || {}).value || '';
    var teachers = teachersRaw.trim() === '' ? null : Number(teachersRaw);
    return {
      regionId: selectedRegionId,
      mapImage: (document.getElementById('school-field-map-image') || {}).value.trim(),
      gallery: gallery,
      youtube: (document.getElementById('school-field-youtube') || {}).value.trim(),
      desc: {
        kk: (document.getElementById('school-field-desc-kk') || {}).value.trim(),
        en: (document.getElementById('school-field-desc-en') || {}).value.trim()
      },
      teachers: Number.isFinite(teachers) ? teachers : null
    };
  }

  function mergedSchool(entry, override) {
    var base = entry.base;
    var o = override || {};
    var merged = Object.assign({}, base);
    if (typeof o.mapImage === 'string' && o.mapImage) merged.mapImage = o.mapImage;
    else if (typeof o.image === 'string' && o.image) merged.mapImage = o.image;
    if (Array.isArray(o.gallery)) merged.gallery = o.gallery.slice();
    if (o.youtube) merged.youtube = o.youtube;
    if (o.desc) {
      merged.desc = Object.assign({}, base.desc || {});
      if (o.desc.kk) merged.desc.kk = o.desc.kk;
      if (o.desc.en) merged.desc.en = o.desc.en;
    }
    if (o.teachers != null) merged.teachers = o.teachers;
    return merged;
  }

  function mergedFromForm(entry) {
    var base = entry.base;
    var f = formValues();
    return {
      mapImage: f.mapImage,
      gallery: f.gallery,
      youtube: f.youtube || base.youtube || '',
      desc: {
        kk: f.desc.kk || (base.desc && base.desc.kk) || '',
        en: f.desc.en || (base.desc && base.desc.en) || ''
      },
      teachers: f.teachers != null ? f.teachers : base.teachers,
      location: base.location,
      kk: entry.kk,
      en: entry.en
    };
  }

  function stopCarousel() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  function setCarouselSlide(index) {
    var track = document.getElementById('admin-school-carousel-track');
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
    }, 2500);
  }

  var CAROUSEL_PLACEHOLDER = 'assets/school-hero-placeholder.svg';

  function setupCarousel(images) {
    stopCarousel();
    var col = document.getElementById('admin-school-carousel-col');
    var track = document.getElementById('admin-school-carousel-track');
    var prevBtn = document.getElementById('admin-school-carousel-prev');
    var nextBtn = document.getElementById('admin-school-carousel-next');
    var carousel = document.getElementById('admin-school-carousel');

    carouselImagesList = images.slice();
    if (!col || !track) return;

    if (!images.length) {
      col.hidden = false;
      carouselIndex = 0;
      track.innerHTML =
        '<div class="school-carousel-slide is-active school-carousel-slide--placeholder">' +
          '<img src="' + CAROUSEL_PLACEHOLDER + '" alt="" />' +
          '<p class="school-drop-hint school-drop-hint--gallery">Суретті осы жерге тастаңыз<span>немесе «Галереяға қосу» басыңыз</span></p>' +
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
        '<img src="' + esc(src) + '" alt="" loading="' + (i === 0 ? 'eager' : 'lazy') + '" />' +
      '</div>';
    }).join('');

    var multi = images.length > 1;
    if (prevBtn) prevBtn.hidden = !multi;
    if (nextBtn) nextBtn.hidden = !multi;
    if (prevBtn) {
      prevBtn.onclick = function () { setCarouselSlide(carouselIndex - 1); startCarousel(); };
    }
    if (nextBtn) {
      nextBtn.onclick = function () { setCarouselSlide(carouselIndex + 1); startCarousel(); };
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
    if (id) {
      frame.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="YouTube video" loading="lazy" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
      frame.classList.remove('is-placeholder');
      return;
    }
    frame.innerHTML =
      '<div class="school-video-placeholder" aria-hidden="true">' +
        '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>' +
        '<p>Бейне жақында қосылады</p>' +
      '</div>';
    frame.classList.add('is-placeholder');
  }

  function applyMapImageUrl(url) {
    var mapInput = document.getElementById('school-field-map-image');
    if (!mapInput) return;
    mapInput.value = url || '';
    dirty = true;
    window.dirty = true;
    if (selectedEntry) {
      renderMapCard({ mapImage: url }, selectedEntry);
    }
    mapInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function renderMapCard(school, entry) {
    var mapUrl = schoolMapImage(school);
    var card = document.getElementById('admin-school-map-card');
    var imgEl = document.getElementById('admin-school-map-img');
    var phEl = document.getElementById('admin-school-map-placeholder');
    var name = entry && (entry.kk || entry.en) ? entry.kk : '';

    if (card) {
      card.classList.toggle('school-map-card--photo', !!mapUrl);
      card.classList.toggle('school-map-card--placeholder', !mapUrl);
    }
    if (imgEl) {
      if (mapUrl) {
        imgEl.onload = function () {
          if (phEl) phEl.setAttribute('hidden', '');
        };
        imgEl.onerror = function () {
          setEditorStatus('Сурет сілтемесі ашылмады — қайта жүктеңіз', 'err');
        };
        imgEl.src = mapUrl;
        imgEl.alt = name;
        imgEl.removeAttribute('hidden');
      } else {
        imgEl.onload = null;
        imgEl.onerror = null;
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

  function renderLivePage(entry, school) {
    var region = REGIONS.find(function (r) { return r.id === entry.regionId; });
    var images = carouselImages(school);
    var lang = previewLang;

    var heroLoc = document.getElementById('admin-school-hero-loc');
    var heroTitle = document.getElementById('admin-school-hero-title');
    var regionEl = document.getElementById('admin-school-region');
    var descEl = document.getElementById('admin-school-desc');
    var teachersEl = document.getElementById('admin-school-teachers');
    var videoFrame = document.getElementById('admin-school-video-frame');

    renderMapCard(school, entry);

    if (heroTitle) heroTitle.textContent = lang === 'en' ? (entry.en || entry.kk) : entry.kk;
    if (heroLoc && school.location) {
      heroLoc.textContent = lang === 'en' ? school.location.en : school.location.kk;
    }
    if (regionEl && region) {
      regionEl.textContent = lang === 'en' ? region.en : region.kk;
    }
    if (descEl && school.desc) {
      descEl.textContent = lang === 'en' ? school.desc.en : school.desc.kk;
    }
    if (teachersEl) {
      if (school.teachers != null) {
        teachersEl.hidden = false;
        teachersEl.textContent = school.teachers + ' ' + (lang === 'en' ? 'teachers' : 'мұғалім');
      } else {
        teachersEl.hidden = true;
        teachersEl.textContent = '';
      }
    }

    setupCarousel(images);
    renderVideo(videoFrame, school);
  }

  function refreshPreview() {
    if (!selectedEntry) return;
    renderLivePage(selectedEntry, mergedFromForm(selectedEntry));
  }

  async function selectSchool(id) {
    selectedId = id;
    var entry = allSchools.find(function (s) { return s.id === id; });
    if (!entry) return;

    selectedEntry = entry;
    selectedRegionId = entry.regionId;

    document.querySelectorAll('.school-list-item').forEach(function (el) {
      el.classList.toggle('active', el.dataset.id === id);
    });

    var editor = document.getElementById('school-editor');
    var empty = document.getElementById('school-editor-empty');
    if (empty) empty.classList.add('is-hidden');
    if (editor) editor.classList.add('is-open');

    var previewLink = document.getElementById('preview-link');
    if (previewLink) previewLink.href = schoolPageUrl(entry);

    var override = overrideCache[id];
    if (override === undefined) {
      try {
        override = await window.db.getSchoolContent(id);
      } catch (e) {
        override = null;
      }
      overrideCache[id] = override || null;
    }

    var merged = mergedSchool(entry, override);
    document.getElementById('school-field-map-image').value = schoolMapImage(merged);
    document.getElementById('school-field-gallery').value = (merged.gallery || []).join('\n');
    document.getElementById('school-field-youtube').value = merged.youtube || '';
    document.getElementById('school-field-desc-kk').value = (merged.desc && merged.desc.kk) || '';
    document.getElementById('school-field-desc-en').value = (merged.desc && merged.desc.en) || '';
    document.getElementById('school-field-teachers').value = merged.teachers != null ? String(merged.teachers) : '';

    var status = document.getElementById('school-editor-status');
    if (status) {
      status.classList.remove('is-ok', 'is-err');
      status.textContent = override
        ? 'Сақталған өзгерістер'
        : (hasMedia(entry.base) ? 'Әдепкі деректер' : 'Медиа әлі толтырылмаған');
    }

    renderLivePage(entry, merged);
    dirty = false;
    bindSchoolUploads();
  }

  function schoolUploadFolder() {
    if (!selectedId || !selectedRegionId) return 'schools/general';
    return 'schools/' + selectedRegionId + '/' + selectedId;
  }

  function uploadConfigError() {
    if (window.mediaUpload && window.mediaUpload.isConfigured && window.mediaUpload.isConfigured()) return null;
    return 'Сурет жүктеу бапталмаған. uploads/media-config.js файлын тексеріңіз.';
  }

  function setSchoolSaveBusy(btn, on) {
    if (!btn) return;
    btn.disabled = !!on;
    if (on) {
      btn.dataset.prevLabel = btn.textContent;
      btn.textContent = 'Сақталуда…';
    } else if (btn.dataset.prevLabel) {
      btn.textContent = btn.dataset.prevLabel;
    }
  }

  function markSchoolSaveButtonsSaved() {
    ['school-map-save-btn', 'school-gallery-save-btn'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      btn.classList.add('is-saved');
      btn.textContent = '✓ Сақталды';
      setTimeout(function () {
        btn.classList.remove('is-saved');
        btn.textContent = 'Сақтау';
      }, 2500);
    });
  }

  async function saveSchoolNow(triggerBtn) {
    if (!selectedId) {
      setEditorStatus('Алдымен мектеп таңдаңыз', 'err');
      return { success: false, error: 'Алдымен мектеп таңдаңыз' };
    }
    setSchoolSaveBusy(triggerBtn, true);
    var result = await save();
    setSchoolSaveBusy(triggerBtn, false);
    if (result && result.success) {
      markSchoolSaveButtonsSaved();
      if (window.adminMarkSaved) window.adminMarkSaved();
      if (window.adminToast) window.adminToast('Мектеп сақталды', 'ok');
    } else if (window.adminToast) {
      window.adminToast(result && result.error ? result.error : 'Сақтау сәтсіз аяқталды', 'err');
    }
    return result;
  }

  function setSchoolUploadBusy(btn, on) {
    if (!btn) return;
    btn.disabled = !!on;
    if (btn.id === 'school-map-upload-btn') {
      btn.textContent = on ? 'Жүктелуде…' : 'Сурет жүктеу';
    } else if (btn.id === 'school-gallery-upload-btn') {
      btn.textContent = on ? 'Жүктелуде…' : 'Галереяға қосу';
    }
  }

  function setEditorStatus(msg, type) {
    var status = document.getElementById('school-editor-status');
    if (!status) return;
    status.textContent = msg || '';
    status.classList.remove('is-ok', 'is-err');
    if (type === 'ok') status.classList.add('is-ok');
    if (type === 'err') status.classList.add('is-err');
  }

  function galleryLines() {
    var galleryInput = document.getElementById('school-field-gallery');
    if (!galleryInput) return [];
    return galleryInput.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function setGalleryLines(lines) {
    var galleryInput = document.getElementById('school-field-gallery');
    if (!galleryInput) return;
    galleryInput.value = lines.join('\n');
    dirty = true;
    window.dirty = true;
    galleryInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function removeCurrentGalleryImage() {
    var lines = galleryLines();
    if (!lines.length) {
      setEditorStatus('Галерея бос', 'err');
      return;
    }
    lines.splice(carouselIndex, 1);
    setGalleryLines(lines);
    setEditorStatus('Сурет өшірілді — сақтауды ұмытпаңыз', 'ok');
  }

  function clearGalleryImages() {
    if (!galleryLines().length) return;
    setGalleryLines([]);
    setEditorStatus('Галерея тазартылды — сақтауды ұмытпаңыз', 'ok');
  }

  function uploadSchoolMap(file) {
    var err = uploadConfigError();
    if (err) {
      setEditorStatus(err, 'err');
      return;
    }
    if (!selectedId || !selectedEntry) {
      setEditorStatus('Алдымен мектеп таңдаңыз', 'err');
      return;
    }
    if (!file) {
      setEditorStatus('Файл таңдалмады', 'err');
      return;
    }
    if (window.mediaUpload.isImageFile && !window.mediaUpload.isImageFile(file)) {
      setEditorStatus('PNG, JPEG, WebP немесе AVIF суретін таңдаңыз', 'err');
      return;
    }
    var btn = document.getElementById('school-map-upload-btn');
    var mapInput = document.getElementById('school-field-map-image');
    if (!mapInput) {
      setEditorStatus('Сурет өрісі табылмады', 'err');
      return;
    }
    setSchoolUploadBusy(btn, true);
    setEditorStatus('Сурет жүктелуде…', 'ok');
    window.mediaUpload.upload(file, {
      folder: schoolUploadFolder(),
      maxDim: 1600
    }).then(function (result) {
      if (!result || !result.url) throw new Error('Жүктеу жауабында сілтеме жоқ');
      var url = result.url;
      if (window.db && window.db.normalizeMediaUrl) url = window.db.normalizeMediaUrl(url);
      applyMapImageUrl(url);
      refreshPreview();
      setEditorStatus('Сурет жүктелді — «Сақтау» басыңыз', 'ok');
      if (window.adminToast) window.adminToast('Сурет жүктелді', 'ok');
    }).catch(function (e) {
      var msg = (e && e.message) ? e.message : 'Жүктеу сәтсіз аяқталды';
      setEditorStatus(msg, 'err');
      if (window.adminToast) window.adminToast(msg, 'err');
    }).then(function () {
      setSchoolUploadBusy(btn, false);
    });
  }

  function uploadSchoolGalleryFiles(fileList) {
    var err = uploadConfigError();
    if (err) {
      setEditorStatus(err, 'err');
      return;
    }
    if (!selectedId) {
      setEditorStatus('Алдымен мектеп таңдаңыз', 'err');
      return;
    }
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;

    var btn = document.getElementById('school-gallery-upload-btn');
    var galleryInput = document.getElementById('school-field-gallery');
    var folder = schoolUploadFolder();
    var urls = [];
    var index = 0;

    setSchoolUploadBusy(btn, true);

    function next() {
      if (index >= files.length) {
        var existing = galleryInput.value.trim();
        var prior = existing
          ? existing.split('\n').map(function (s) { return s.trim(); }).filter(Boolean)
          : [];
        galleryInput.value = prior.concat(urls).join('\n');
        dirty = true;
        window.dirty = true;
        galleryInput.dispatchEvent(new Event('input', { bubbles: true }));
        setEditorStatus(urls.length + ' сурет қосылды — «Сақтау» басыңыз', 'ok');
        if (window.adminToast) window.adminToast(urls.length + ' сурет қосылды', 'ok');
        setSchoolUploadBusy(btn, false);
        return;
      }
      window.mediaUpload.upload(files[index], { folder: folder, maxDim: 1600 })
        .then(function (result) {
          var url = result.url;
          if (window.db && window.db.normalizeMediaUrl) url = window.db.normalizeMediaUrl(url);
          urls.push(url);
          index += 1;
          next();
        })
        .catch(function (e) {
          setEditorStatus(e.message || 'Жүктеу сәтсіз аяқталды', 'err');
          if (window.adminToast) window.adminToast(e.message || 'Жүктеу сәтсіз аяқталды', 'err');
          setSchoolUploadBusy(btn, false);
        });
    }

    next();
  }

  function imageFilesFromDataTransfer(dt) {
    if (!dt || !dt.files || !dt.files.length) return [];
    return Array.prototype.slice.call(dt.files).filter(function (f) {
      if (f.type && f.type.indexOf('image/') === 0) return true;
      return /\.(jpe?g|png|webp|avif)$/i.test(f.name || '');
    });
  }

  function bindImageDropZone(el, onFiles) {
    if (!el || el.dataset.dropBound) return;
    el.dataset.dropBound = '1';

    function allowDrop(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    el.addEventListener('dragenter', function (e) {
      allowDrop(e);
      el.classList.add('drag-over');
    }, true);
    el.addEventListener('dragover', function (e) {
      allowDrop(e);
      el.classList.add('drag-over');
    }, true);
    el.addEventListener('dragleave', function (e) {
      if (!el.contains(e.relatedTarget)) el.classList.remove('drag-over');
    }, true);
    el.addEventListener('drop', function (e) {
      allowDrop(e);
      el.classList.remove('drag-over');
      if (!selectedId) {
        setEditorStatus('Алдымен мектеп таңдаңыз', 'err');
        return;
      }
      var files = imageFilesFromDataTransfer(e.dataTransfer);
      if (files.length) onFiles(files);
    }, true);
  }

  function bindSchoolUploads() {
    var mapBtn = document.getElementById('school-map-upload-btn');
    var mapFile = document.getElementById('school-map-upload-file');
    var galBtn = document.getElementById('school-gallery-upload-btn');
    var galFile = document.getElementById('school-gallery-upload-file');
    var galRemove = document.getElementById('school-gallery-remove-btn');
    var galClear = document.getElementById('school-gallery-clear-btn');

    if (mapFile && !mapFile.dataset.changeBound) {
      mapFile.dataset.changeBound = '1';
      mapFile.addEventListener('change', function () {
        var file = mapFile.files && mapFile.files[0];
        mapFile.value = '';
        if (file) uploadSchoolMap(file);
      });
    }

    if (mapBtn && mapFile && !mapBtn.dataset.bound) {
      mapBtn.dataset.bound = '1';
      mapBtn.addEventListener('click', function () {
        if (!selectedId) {
          setEditorStatus('Алдымен мектеп таңдаңыз', 'err');
          return;
        }
        mapFile.click();
      });
    }

    if (galBtn && galFile && !galBtn.dataset.bound) {
      galBtn.dataset.bound = '1';
      galBtn.addEventListener('click', function () { galFile.click(); });
      galFile.addEventListener('change', function () {
        var files = galFile.files;
        galFile.value = '';
        if (files && files.length) uploadSchoolGalleryFiles(files);
      });
    }

    if (galRemove && !galRemove.dataset.bound) {
      galRemove.dataset.bound = '1';
      galRemove.addEventListener('click', removeCurrentGalleryImage);
    }

    if (galClear && !galClear.dataset.bound) {
      galClear.dataset.bound = '1';
      galClear.addEventListener('click', clearGalleryImages);
    }

    var mapDrop = document.getElementById('school-map-drop-zone');
    bindImageDropZone(mapDrop, function (files) {
      uploadSchoolMap(files[0]);
    });
    bindImageDropZone(document.getElementById('school-gallery-drop-zone'), function (files) {
      uploadSchoolGalleryFiles(files);
    });

    ['school-map-save-btn', 'school-gallery-save-btn'].forEach(function (id) {
      var saveBtn = document.getElementById(id);
      if (!saveBtn || saveBtn.dataset.bound) return;
      saveBtn.dataset.bound = '1';
      saveBtn.addEventListener('click', function () {
        saveSchoolNow(saveBtn);
      });
    });
  }

  function renderList() {
    var list = document.getElementById('school-list');
    if (!list) return;

    var regionFilter = (document.getElementById('school-filter-region') || {}).value || '';
    var query = ((document.getElementById('school-search') || {}).value || '').trim().toLowerCase();

    var filtered = allSchools.filter(function (s) {
      if (regionFilter && s.regionId !== regionFilter) return false;
      if (!query) return true;
      var hay = (s.kk + ' ' + s.en + ' ' + s.id + ' ' + s.districtKey).toLowerCase();
      return hay.indexOf(query) !== -1;
    });

    var count = document.getElementById('school-list-count');
    if (count) count.textContent = filtered.length + ' / ' + allSchools.length;

    list.innerHTML = filtered.map(function (s) {
      var has = hasMedia(s.base) || overrideCache[s.id];
      return '<button type="button" class="school-list-item' + (s.id === selectedId ? ' active' : '') + '" data-id="' + esc(s.id) + '">' +
        '<span class="school-list-name">' + esc(s.kk) + '</span>' +
        '<span class="school-list-meta">' + esc(s.regionKk) + (has ? ' · ●' : '') + '</span>' +
      '</button>';
    }).join('');

    list.querySelectorAll('.school-list-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectSchool(btn.dataset.id);
      });
    });
  }

  function renderRegionFilter() {
    var sel = document.getElementById('school-filter-region');
    if (!sel || sel.options.length > 1) return;
    sel.innerHTML = '<option value="">Барлық облыстар</option>' +
      REGIONS.map(function (r) {
        return '<option value="' + esc(r.id) + '">' + esc(r.kk) + '</option>';
      }).join('');
  }

  function bindEditorInputs() {
    ['school-field-map-image', 'school-field-gallery', 'school-field-youtube',
      'school-field-desc-kk', 'school-field-desc-en', 'school-field-teachers'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.dataset.bound) return;
      el.dataset.bound = '1';
      el.addEventListener('input', function () {
        dirty = true;
        window.dirty = true;
        refreshPreview();
      });
    });

    bindSchoolUploads();

    var langBar = document.getElementById('admin-preview-lang');
    if (langBar && !langBar.dataset.bound) {
      langBar.dataset.bound = '1';
      langBar.querySelectorAll('[data-admin-lang]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          previewLang = btn.dataset.adminLang;
          langBar.querySelectorAll('[data-admin-lang]').forEach(function (b) {
            b.classList.toggle('is-on', b === btn);
          });
          refreshPreview();
        });
      });
    }
  }

  function render() {
    buildIndex();
    renderRegionFilter();
    renderList();
    bindEditorInputs();

    var panel = document.getElementById('schools-panel');
    if (panel && !panel.dataset.ready) {
      panel.dataset.ready = '1';
      document.getElementById('school-filter-region').addEventListener('change', renderList);
      document.getElementById('school-search').addEventListener('input', renderList);
    }
  }

  function isActive() {
    return window.currentPage === 'schools';
  }

  async function save() {
    if (!selectedId) {
      return { success: false, error: 'Алдымен мектеп таңдаңыз' };
    }
    var data = formValues();
    var result = await window.db.saveSchoolContent(selectedId, data);
    if (result && result.success) {
      overrideCache[selectedId] = Object.assign({ schoolId: selectedId }, data, { updatedAt: new Date().toISOString() });
      dirty = false;
      window.dirty = false;
      renderList();
      setEditorStatus('Сақталды — school.html бетінде көрінеді', 'ok');
      if (selectedEntry) {
        renderLivePage(selectedEntry, mergedSchool(selectedEntry, overrideCache[selectedId]));
      }
    } else {
      setEditorStatus(result && result.error ? result.error : 'Сақтау сәтсіз аяқталды', 'err');
    }
    return result;
  }

  function isDirty() {
    return dirty;
  }

  return {
    render: render,
    save: save,
    isActive: isActive,
    isDirty: isDirty
  };
})();
