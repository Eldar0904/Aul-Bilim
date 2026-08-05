/* ═══════════════════════════════════════════════
   AUL BILIM ADMIN — section-based CMS
═══════════════════════════════════════════════ */
(function () {
  'use strict';

  var savedContent = {};
  var dirty = false;

  var PAGE_META = {
    home:     { label: 'Басты бет',     file: 'index.html',    preview: 'index.html' },
    programs: { label: 'Бағдарламалар', file: 'programs.html', preview: 'programs.html' },
    results:  { label: 'Нәтижелер',     file: 'results.html',  preview: 'results.html' },
    about:    { label: 'Біз туралы',    file: 'about.html',    preview: 'about.html' },
    global:   { label: 'Жалпы',         file: 'index.html',    preview: 'index.html' },
    schools:  { label: 'Мектептер',     file: 'school.html',   preview: 'school.html' },
    regions:  { label: 'Өңірлер',       file: 'index.html#regions', preview: 'index.html#regions' }
  };

  var currentPage = 'home';
  window.currentPage = 'home';

  if (window.adminLang) window.adminLang.init();

  window.adminLang && window.adminLang.onChange(function () {
    if (window.adminCopyUi) {
      window.adminCopyUi.syncStoreFromDom();
      window.adminCopyUi.renderAll();
    }
    if (window.adminSchools && window.adminSchools.refreshPreview) {
      window.adminSchools.refreshPreview();
    }
  });

  document.getElementById('pw-btn').addEventListener('click', tryLogin);
  document.getElementById('email-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') tryLogin();
  });
  document.getElementById('pw-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') tryLogin();
  });

  async function tryLogin() {
    var email = document.getElementById('email-input').value.trim();
    var pw = document.getElementById('pw-input').value.trim();
    var err = document.getElementById('pw-err');
    var btn = document.getElementById('pw-btn');
    err.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Кіру…';
    var result = await window.cmsAuth.login(email, pw);
    btn.disabled = false;
    btn.textContent = 'Кіру';
    if (result.success) {
      launchApp();
    } else {
      err.textContent = result.error || 'Кіру мүмкін болмады.';
      err.style.display = 'block';
      document.getElementById('pw-input').value = '';
      document.getElementById('pw-input').focus();
    }
  }

  document.getElementById('logout-btn').addEventListener('click', async function () {
    await window.cmsAuth.logout();
    location.reload();
  });

  window.cmsAuth.onAuthStateChanged(function (session) {
    if (session && !document.getElementById('app').classList.contains('show')) launchApp();
  });

  async function launchApp() {
    document.getElementById('gate').style.display = 'none';
    document.getElementById('app').classList.add('show');
    var content = await window.db.getSiteContent();
    if (content) savedContent = content;
    if (window.adminCopyUi) window.adminCopyUi.renderAll();
    populateFields();
    initImageUploads();
    initProgramGallery();
    switchPage('home');
  }

  function populateFields() {
    var pages = (savedContent && savedContent.pages) || {};
    var media = (savedContent && savedContent.media) || {};

    if (window.adminCopyUi) {
      window.adminCopyUi.populateCopyFields(pages);
      window.adminCopyUi.wireInputListeners(function () { dirty = true; });
    }

    document.querySelectorAll('[data-page][data-key]').forEach(function (el) {
      var pageData = pages[el.dataset.page];
      var v = pageData && pageData[el.dataset.key];
      if (v !== undefined) el.value = v;
      el.addEventListener('input', function () {
        el.classList.add('changed');
        dirty = true;
      });
    });

    document.querySelectorAll('[data-slot-id][data-slot-field]').forEach(function (el) {
      var slot = media[el.dataset.slotId];
      if (slot && slot[el.dataset.slotField]) {
        el.value = slot[el.dataset.slotField];
        updateSlotPreview(el);
      }
      el.addEventListener('input', function () {
        el.classList.add('changed');
        dirty = true;
        updateSlotPreview(el);
      });
    });
  }

  function updateSlotPreview(input) {
    var slotEl = input.closest('[data-slot]');
    if (!slotEl) return;
    var preview = slotEl.querySelector('.img-slot-preview');
    if (!preview) return;
    var url = input.value.trim();
    if (url) {
      preview.src = url;
      preview.onload = function () { slotEl.classList.add('has-img'); };
      preview.onerror = function () { slotEl.classList.remove('has-img'); };
    } else {
      slotEl.classList.remove('has-img');
      preview.src = '';
    }
  }

  function uploadConfigError() {
    if (window.mediaUpload && window.mediaUpload.isConfigured && window.mediaUpload.isConfigured()) return null;
    return 'Сурет жүктеу бапталмаған. uploads/media-config.js файлын тексеріңіз.';
  }

  function setSlotUploading(slotEl, on) {
    if (!slotEl) return;
    slotEl.classList.toggle('is-uploading', !!on);
    var btn = slotEl.querySelector('.img-slot-upload-btn');
    if (btn) {
      btn.disabled = !!on;
      btn.textContent = on ? 'Жүктелуде…' : 'Жүктеу';
    }
  }

  function applyUploadedUrl(input, url) {
    if (!input || !url) return;
    input.value = url;
    input.classList.add('changed');
    dirty = true;
    updateSlotPreview(input);
  }

  function uploadFileForSlot(file, slotEl, input) {
    var err = uploadConfigError();
    if (err) {
      toast(err, 'err');
      return Promise.resolve();
    }
    var slotId = input.dataset.slotId || (slotEl && slotEl.dataset.slot) || 'general';
    var uploadOpts = { folder: 'pages/' + slotId.replace(/[^a-z0-9/_-]+/gi, '-').toLowerCase() };
    var presetId = window.mediaUpload.presetForSlot && window.mediaUpload.presetForSlot(slotId);
    if (presetId) {
      uploadOpts.preset = presetId;
    } else if (window.mediaPresets && window.mediaPresets.resolveUploadOpts) {
      var resolved = window.mediaPresets.resolveUploadOpts(slotId, slotEl);
      if (resolved) Object.assign(uploadOpts, resolved);
    } else {
      uploadOpts.maxDim = window.mediaUpload.maxDimForSlot(slotId);
    }
    setSlotUploading(slotEl, true);
    return window.mediaUpload.upload(file, uploadOpts)
      .then(function (result) {
        applyUploadedUrl(input, result.url);
        var msg = result.warning === 'lowResolution'
          ? 'Сурет жүктелді — тым кіші, жоғары ажыратымдылықты қайта жүктеңіз'
          : 'Сурет жүктелді';
        toast(msg, result.warning ? 'warn' : 'ok');
      })
      .catch(function (e) {
        toast(e.message || 'Жүктеу сәтсіз аяқталды', 'err');
      })
      .then(function () {
        setSlotUploading(slotEl, false);
      });
  }

  function initImageUploads() {
    document.querySelectorAll('.img-slot').forEach(function (slotEl) {
      if (slotEl.dataset.uploadReady) return;
      slotEl.dataset.uploadReady = '1';

      var bar = slotEl.querySelector('.img-slot-bar');
      var input = slotEl.querySelector('input[data-slot-field="u"]');
      if (!bar || !input) return;

      input.classList.add('admin-store-field');
      input.setAttribute('aria-hidden', 'true');
      input.tabIndex = -1;

      if (!bar.querySelector('.img-slot-upload-btn')) {
        var row = document.createElement('div');
        row.className = 'img-slot-upload-row';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'img-slot-upload-btn';
        btn.textContent = 'Жүктеу';
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/png,image/jpeg,image/webp,image/avif';
        fileInput.hidden = true;
        fileInput.className = 'img-slot-upload-file';
        row.appendChild(btn);
        row.appendChild(fileInput);
        var hint = document.createElement('p');
        hint.className = 'img-slot-drop-hint';
        hint.textContent = 'немесе суретті осы жерге тастаңыз';
        bar.insertBefore(row, input);
        bar.appendChild(hint);

        btn.addEventListener('click', function () { fileInput.click(); });
        fileInput.addEventListener('change', function () {
          var file = fileInput.files && fileInput.files[0];
          fileInput.value = '';
          if (file) uploadFileForSlot(file, slotEl, input);
        });
      }

      slotEl.addEventListener('dragover', function (e) {
        e.preventDefault();
        slotEl.classList.add('drag-over');
      });
      slotEl.addEventListener('dragleave', function () {
        slotEl.classList.remove('drag-over');
      });
      slotEl.addEventListener('drop', function (e) {
        e.preventDefault();
        slotEl.classList.remove('drag-over');
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) uploadFileForSlot(file, slotEl, input);
      });
    });
  }

  function initProgramGallery() {
    document.querySelectorAll('[data-program-gallery]').forEach(function (editor) {
    var list = editor.querySelector('[data-gallery-list]');
    var value = editor.querySelector('[data-gallery-value]');
    var picker = editor.querySelector('[data-gallery-files]');
    var add = editor.querySelector('[data-gallery-add]');
    var clear = editor.querySelector('[data-gallery-clear]');
    var drop = editor.querySelector('[data-gallery-drop]');
    var folder = editor.dataset.galleryFolder || editor.dataset.gallerySlot || 'program-gallery';
    var prefix = editor.dataset.galleryPrefix || 'program-image';
    if (!list || !value || !picker || !add || !clear || !drop) return;

    function urls() {
      if (!value.value.trim()) return [];
      try {
        var parsed = JSON.parse(value.value);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch (e) {
        return value.value.split(/\r?\n/).map(function (url) { return url.trim(); }).filter(Boolean);
      }
    }

    function setUrls(next) {
      value.value = JSON.stringify(next);
      value.dispatchEvent(new Event('input', { bubbles: true }));
      render();
    }

    function render() {
      var current = urls();
      list.innerHTML = '';
      current.forEach(function (url, index) {
        var item = document.createElement('div');
        item.className = 'program-gallery-item';
        var img = document.createElement('img');
        img.src = url;
        img.alt = '';
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'program-gallery-remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', 'Remove image ' + (index + 1));
        remove.addEventListener('click', function () {
          var next = urls();
          next.splice(index, 1);
          setUrls(next);
        });
        item.appendChild(img);
        item.appendChild(remove);
        list.appendChild(item);
      });
      editor.classList.toggle('is-empty', !current.length);
    }

    async function uploadFiles(files) {
      var queue = Array.prototype.filter.call(files || [], function (file) {
        return window.mediaUpload && window.mediaUpload.isImageFile(file);
      });
      if (!queue.length) return;
      if (!window.mediaUpload || !window.mediaUpload.isConfigured()) {
        toast(uploadConfigError(), 'err');
        return;
      }
      editor.classList.add('is-uploading');
      add.disabled = true;
      var added = 0;
      var failed = 0;
      var lastError = null;

      // Upload sequentially so each completed image is appended immediately.
      // This avoids one failed request discarding the rest of a multi-file batch.
      for (var index = 0; index < queue.length; index += 1) {
        try {
          var result = await window.mediaUpload.upload(queue[index], {
            folder: 'pages/' + folder,
            preset: 'heroGallery16x9',
            filename: prefix + '-' + Date.now() + '-' + index + '-' + Math.random().toString(36).slice(2, 8) + '.webp'
          });
          var current = urls();
          current.push(result.url);
          setUrls(current);
          added += 1;
        } catch (e) {
          failed += 1;
          lastError = e;
        }
      }

      editor.classList.remove('is-uploading');
      add.disabled = false;
      if (added) {
        toast(added + ' image(s) added' + (failed ? '; ' + failed + ' failed' : ''), failed ? 'warn' : 'ok');
      } else {
        toast((lastError && lastError.message) || 'Image upload failed', 'err');
      }
    }

    add.addEventListener('click', function () { picker.click(); });
    picker.addEventListener('change', function () {
      uploadFiles(picker.files);
      picker.value = '';
    });
    clear.addEventListener('click', function () { setUrls([]); });
    drop.addEventListener('dragover', function (e) { e.preventDefault(); editor.classList.add('drag-over'); });
    drop.addEventListener('dragleave', function () { editor.classList.remove('drag-over'); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      editor.classList.remove('drag-over');
      uploadFiles(e.dataTransfer && e.dataTransfer.files);
    });
    render();
    });
  }

  function switchPage(pageId) {
    currentPage = pageId;
    window.currentPage = pageId;
    var meta = PAGE_META[pageId] || PAGE_META.home;
    document.getElementById('page-title').textContent = meta.label;
    document.getElementById('page-file').textContent = meta.file;
    document.getElementById('preview-link').href = meta.preview;

    document.querySelectorAll('.sb-page').forEach(function (b) {
      b.classList.toggle('active', b.dataset.page === pageId);
    });
    document.querySelectorAll('.page-view').forEach(function (v) {
      v.classList.toggle('active', v.dataset.view === pageId);
    });

    var sp = document.getElementById('schools-panel');
    var rp = document.getElementById('regions-panel');
    if (pageId === 'schools') {
      sp.classList.add('show');
      if (window.adminSchools) window.adminSchools.render();
    } else {
      sp.classList.remove('show');
    }
    if (pageId === 'regions') {
      if (rp) rp.classList.add('show');
      if (window.adminRegions) window.adminRegions.render();
    } else if (rp) {
      rp.classList.remove('show');
    }
    if (pageId !== 'schools' && pageId !== 'regions') {
      document.getElementById('content').scrollTop = 0;
    }
  }

  document.querySelectorAll('.sb-page').forEach(function (btn) {
    btn.addEventListener('click', function () { switchPage(btn.dataset.page); });
  });

  document.querySelectorAll('.prog-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var prog = btn.dataset.prog;
      document.querySelectorAll('.prog-tab').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      document.querySelectorAll('.prog-panel').forEach(function (p) {
        p.classList.toggle('active', p.dataset.progPanel === prog);
      });
    });
  });

  document.getElementById('save-btn').addEventListener('click', saveAll);

  async function saveAll() {
    var btn = document.getElementById('save-btn');

    if (currentPage === 'schools') {
      btn.textContent = 'Сақталуда…';
      btn.classList.add('saving');
      var r = await window.adminSchools.save();
      btn.classList.remove('saving');
      if (r && r.success) {
        dirty = false;
        if (window.adminMarkSaved) window.adminMarkSaved();
        else {
          btn.textContent = '✓ Сақталды';
          btn.classList.add('saved');
          setTimeout(resetSaveBtn, 3000);
        }
        toast('Мектеп сақталды — school.html бетінде көрінеді.', 'ok');
      } else {
        resetSaveBtn();
        toast(r && r.error ? r.error : 'Сақтау сәтсіз аяқталды', 'err');
      }
      return;
    }

    if (currentPage === 'regions') {
      btn.textContent = 'Сақталуда…';
      btn.classList.add('saving');
      var regionResult = await window.adminRegions.save();
      btn.classList.remove('saving');
      if (regionResult && regionResult.success) {
        dirty = false;
        if (window.adminMarkSaved) window.adminMarkSaved();
        else {
          btn.textContent = '✓ Сақталды';
          btn.classList.add('saved');
          setTimeout(resetSaveBtn, 3000);
        }
        toast('Өңір статистикасы сақталды — картада көрінеді.', 'ok');
      } else {
        resetSaveBtn();
        toast(regionResult && regionResult.error ? regionResult.error : 'Сақтау сәтсіз аяқталды', 'err');
      }
      return;
    }

    btn.textContent = 'Сақталуда…';
    btn.classList.add('saving');

    var pages = Object.assign({}, (savedContent && savedContent.pages) || {});
    if (window.adminCopyUi) pages = window.adminCopyUi.collectCopyFields(pages);
    document.querySelectorAll('[data-page][data-key]').forEach(function (el) {
      if (!pages[el.dataset.page]) pages[el.dataset.page] = {};
      pages[el.dataset.page][el.dataset.key] = el.value;
    });

    var media = Object.assign({}, (savedContent && savedContent.media) || {});
    document.querySelectorAll('[data-slot-id][data-slot-field]').forEach(function (el) {
      if (!media[el.dataset.slotId]) media[el.dataset.slotId] = {};
      media[el.dataset.slotId][el.dataset.slotField] = el.value;
    });

    savedContent = Object.assign({}, savedContent, {
      pages: pages,
      media: media,
      updatedAt: new Date().toISOString()
    });

    var result;
    try {
      result = await window.db.saveSiteContent(savedContent);
    } catch (error) {
      resetSaveBtn();
      toast(error && error.message ? error.message : 'Сақтау кезінде қате пайда болды.', 'err');
      return;
    }
    btn.classList.remove('saving');
    if (result && result.success) {
      btn.textContent = '✓ Сақталды';
      btn.classList.add('saved');
      dirty = false;
      toast('Өзгерістер сақталды — беттер жаңартылғанда жаңарады.', 'ok');
      setTimeout(resetSaveBtn, 3000);
    } else {
      resetSaveBtn();
      toast(result && result.error ? result.error : 'Сақтау сәтсіз аяқталды — Firebase конфигурациясын тексеріңіз.', 'err');
    }
  }

  function resetSaveBtn() {
    var btn = document.getElementById('save-btn');
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Өзгерістерді сақтау';
    btn.classList.remove('saved', 'saving');
  }

  function toast(msg, type) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show ' + (type || '');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.className = ''; }, 3800);
  }

  window.adminToast = toast;

  window.adminMarkSaved = function () {
    dirty = false;
    var btn = document.getElementById('save-btn');
    if (!btn) return;
    btn.textContent = '✓ Сақталды';
    btn.classList.add('saved');
    btn.classList.remove('saving');
    setTimeout(resetSaveBtn, 3000);
  };

  window.addEventListener('beforeunload', function (e) {
    if (dirty ||
      (window.adminSchools && window.adminSchools.isDirty()) ||
      (window.adminRegions && window.adminRegions.isDirty())) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
})();
