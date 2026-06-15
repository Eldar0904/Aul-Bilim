/* ============================================================
   AUL BILIM — inline copy editor
   Toggle: floating "Edit copy" button (bottom-right).
   Edits persist in localStorage per page.
   Export: download all edits as a labelled JSON file.
   ============================================================ */
(function () {
  var PAGE  = location.pathname.split('/').pop() || 'index.html';
  var STORE = 'aulbilim_copy_v1_' + PAGE;

  /* ── 1. Collect every editable text node ──────────────────── */
  // We mark [lang] spans (all bilingual copy) + stat numbers.
  // Nav links and button labels are skipped (structural).
  function getTargets() {
    var all = [];
    document.querySelectorAll('[lang], .n, .big').forEach(function (el) {
      if (el.closest('nav') || el.closest('.lang-switch') ||
          el.closest('.menu-btn') || el.closest('.pill') ||
          el.closest('.text-link') || el.closest('.more') ||
          el.closest('.crumbs') || el.closest('.foot-bottom') ||
          el.tagName === 'BUTTON' || el.tagName === 'A') return;
      all.push(el);
    });
    return all;
  }

  /* ── 2. Assign stable IDs ─────────────────────────────────── */
  function assignIds() {
    getTargets().forEach(function (el, i) {
      if (!el.dataset.copyId) el.dataset.copyId = 'cp' + i;
    });
  }

  /* ── 3. Persist & restore ─────────────────────────────────── */
  function save() {
    try {
      var d = {};
      getTargets().forEach(function (el) {
        if (el.dataset.copyId) d[el.dataset.copyId] = el.innerHTML;
      });
      localStorage.setItem(STORE, JSON.stringify(d));
    } catch (e) {}
  }

  function restore() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE) || '{}');
      getTargets().forEach(function (el) {
        var key = el.dataset.copyId;
        if (key && saved[key] !== undefined) el.innerHTML = saved[key];
      });
    } catch (e) {}
  }

  /* ── 4. Toggle edit mode ──────────────────────────────────── */
  var editing = false;

  function enterEdit() {
    editing = true;
    document.body.classList.add('copy-edit-mode');
    getTargets().forEach(function (el) { el.contentEditable = 'true'; });
    editBtn.innerHTML = '<span>✓</span> Done';
    editBtn.classList.add('active');
  }

  function exitEdit() {
    editing = false;
    document.body.classList.remove('copy-edit-mode');
    getTargets().forEach(function (el) { el.contentEditable = 'false'; });
    editBtn.innerHTML = '<span>✏</span> Edit copy';
    editBtn.classList.remove('active');
    save();
  }

  function toggleEdit() { editing ? exitEdit() : enterEdit(); }

  /* ── 5. Export JSON ───────────────────────────────────────── */
  function exportCopy() {
    save();
    var rows = [];
    getTargets().forEach(function (el) {
      var lang = el.getAttribute('lang') || 'stat';
      var parent = el.closest('[class]');
      var ctx = parent ? (parent.className.split(' ')[0] || '') : '';
      rows.push({
        id:   el.dataset.copyId,
        lang: lang,
        ctx:  ctx,
        text: el.textContent.trim()
      });
    });
    var blob = new Blob([JSON.stringify(rows, null, 2)],
                        { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = PAGE.replace('.html', '') + '-copy.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ── 6. Reset to original (clears saved edits) ───────────── */
  function resetCopy() {
    if (!confirm('Reset all edits on this page to the original text?')) return;
    try { localStorage.removeItem(STORE); } catch (e) {}
    location.reload();
  }

  /* ── 7. Build the floating toolbar ───────────────────────── */
  var bar = document.createElement('div');
  bar.className = 'copy-edit-bar';

  var editBtn = document.createElement('button');
  editBtn.className = 'ce-btn';
  editBtn.innerHTML = '<span>✏</span> Edit copy';
  editBtn.addEventListener('click', toggleEdit);

  var expBtn = document.createElement('button');
  expBtn.className = 'ce-btn ce-secondary';
  expBtn.innerHTML = '<span>↓</span> Export';
  expBtn.title = 'Download edits as JSON';
  expBtn.addEventListener('click', exportCopy);

  var rstBtn = document.createElement('button');
  rstBtn.className = 'ce-btn ce-ghost';
  rstBtn.innerHTML = '↺';
  rstBtn.title = 'Reset to original';
  rstBtn.addEventListener('click', resetCopy);

  bar.appendChild(editBtn);
  bar.appendChild(expBtn);
  bar.appendChild(rstBtn);

  /* ── 8. Inject styles ────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '.copy-edit-bar{',
      'position:fixed;bottom:24px;right:24px;z-index:9999;',
      'display:flex;gap:8px;align-items:center;',
      'background:#fff;border-radius:100px;',
      'padding:6px 8px;',
      'box-shadow:0 8px 32px -8px rgba(27,79,138,0.36),0 2px 8px rgba(0,0,0,0.08);',
    '}',
    '.ce-btn{',
      'font-family:\'Raleway\',sans-serif;font-weight:700;font-size:13px;',
      'border:none;cursor:pointer;padding:9px 16px;border-radius:100px;',
      'display:inline-flex;align-items:center;gap:7px;transition:background .18s,transform .18s;',
      'background:#1B4F8A;color:#fff;',
    '}',
    '.ce-btn span{font-size:14px;line-height:1;}',
    '.ce-btn:hover{background:#143A6E;transform:translateY(-1px);}',
    '.ce-btn.active{background:#1a7a45;color:#fff;}',
    '.ce-btn.active:hover{background:#145e35;}',
    '.ce-secondary{background:#F2A413;color:#21232E;}',
    '.ce-secondary:hover{background:#E8820A;color:#fff;}',
    '.ce-ghost{background:transparent;color:#4A4A5E;',
      'box-shadow:inset 0 0 0 1.5px rgba(74,74,94,0.2);padding:9px 13px;}',
    '.ce-ghost:hover{background:rgba(27,79,138,0.06);color:#1B4F8A;}',

    /* edit-mode highlight */
    '.copy-edit-mode [data-copy-id][contenteditable="true"]{',
      'cursor:text;border-radius:4px;',
      'outline:1.5px dashed rgba(242,164,19,0.5);outline-offset:2px;',
      'transition:outline-color .15s;',
    '}',
    '.copy-edit-mode [data-copy-id][contenteditable="true"]:hover{',
      'outline-color:#F2A413;background:rgba(255,255,255,0.7);',
    '}',
    '.copy-edit-mode [data-copy-id][contenteditable="true"]:focus{',
      'outline:2px solid #F2A413;outline-offset:3px;',
      'background:#fffdf5;',
    '}',
    /* subtle page tint in edit mode */
    '.copy-edit-mode::after{',
      'content:"✏ Editing";position:fixed;top:80px;left:50%;transform:translateX(-50%);',
      'font-family:\'Raleway\',sans-serif;font-weight:800;font-size:12px;letter-spacing:0.12em;',
      'text-transform:uppercase;color:#F2A413;',
      'background:#fff;padding:5px 14px;border-radius:100px;',
      'box-shadow:0 4px 12px -4px rgba(242,164,19,0.4);z-index:9998;',
      'pointer-events:none;',
    '}',
  ].join('');

  /* ── 9. Load admin copy (online) then localStorage ─────────── */
  var COPY_FILE = '.copy.state.json';

  function applyOnlineCopy(data) {
    var pageSaved = data[PAGE] || {};
    getTargets().forEach(function (el) {
      var key = el.dataset.copyId;
      if (key && pageSaved[key] !== undefined) el.innerHTML = pageSaved[key];
    });
  }

  async function loadOnlineCopy() {
    try {
      var r = await fetch(COPY_FILE + '?t=' + Date.now());
      if (r.ok) {
        var data = await r.json();
        applyOnlineCopy(data);
        return true;
      }
    } catch (e) {}
    return false;
  }

  /* ── 10. Init on DOM ready ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    assignIds();
    // Try online copy first, fall back to localStorage
    loadOnlineCopy().catch(function () {}).finally(function () {
      restore(); // localStorage (editor in-page edits layer on top)
    });
    document.body.appendChild(bar);

    /* auto-save while typing */
    document.addEventListener('input', function (e) {
      if (e.target.dataset && e.target.dataset.copyId) save();
    });

    /* prevent Enter adding <div> blocks */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && editing) {
        e.preventDefault();
        document.execCommand('insertLineBreak');
      }
    });
  });
})();
