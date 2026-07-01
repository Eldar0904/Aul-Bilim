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
    about:    { label: 'Біз туралы',    file: 'about.html',    preview: 'about.html' },
    schools:  { label: 'Мектептер',     file: 'school.html',   preview: 'school.html' }
  };

  var currentPage = 'home';
  window.currentPage = 'home';

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
    populateFields();
    initImageUploads();
    switchPage('home');
  }

  function populateFields() {
    var pages = (savedContent && savedContent.pages) || {};
    var media = (savedContent && savedContent.media) || {};

    document.querySelectorAll('[data-page][data-key]').forEach(function (el) {
      var pageData = pages[el.dataset.page];
      var v = pageData && pageData[el.dataset.key];
      if (v !== undefined) el.value = v;
      el.addEventListener('input', function () {
        el.classList.add('changed');
        dirty = true;
      });
    });

    document.querySelectorAll('.sn, .sl').forEach(function (el) {
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
    var maxDim = window.mediaUpload.maxDimForSlot(slotId);
    var folder = 'pages/' + slotId.replace(/[^a-z0-9/_-]+/gi, '-').toLowerCase();
    setSlotUploading(slotEl, true);
    return window.mediaUpload.upload(file, { folder: folder, maxDim: maxDim })
      .then(function (result) {
        applyUploadedUrl(input, result.url);
        toast('Сурет жүктелді', 'ok');
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
        hint.textContent = 'немесе суретті осы жерге апарыңыз';
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
    if (pageId === 'schools') {
      sp.classList.add('show');
      if (window.adminSchools) window.adminSchools.render();
    } else {
      sp.classList.remove('show');
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
        btn.textContent = '✓ Сақталды';
        btn.classList.add('saved');
        dirty = false;
        toast('Мектеп сақталды — school.html бетінде көрінеді.', 'ok');
        setTimeout(resetSaveBtn, 3000);
      } else {
        resetSaveBtn();
        toast(r && r.error ? r.error : 'Сақтау сәтсіз аяқталды', 'err');
      }
      return;
    }

    btn.textContent = 'Сақталуда…';
    btn.classList.add('saving');

    var pages = Object.assign({}, (savedContent && savedContent.pages) || {});
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

    var result = await window.db.saveSiteContent(savedContent);
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

  window.addEventListener('beforeunload', function (e) {
    if (dirty || (window.adminSchools && window.adminSchools.isDirty())) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
})();
