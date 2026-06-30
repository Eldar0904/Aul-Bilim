/**
 * Client-side image resize + upload to Cloudflare R2 via media-api Worker.
 */
(function () {
  'use strict';

  var ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
  var DEFAULT_MAX = 1200;
  var QUALITY = 0.85;

  function config() {
    return window.AUL_BILIM_MEDIA_CONFIG || null;
  }

  function isConfigured() {
    var cfg = config();
    return !!(cfg && cfg.uploadUrl && cfg.uploadUrl.indexOf('example.com') === -1);
  }

  function maxDimForSlot(slotId, explicit) {
    if (explicit) return explicit;
    var id = String(slotId || '').toLowerCase();
    if (id.indexOf('hero') !== -1 || id.indexOf('prog-') === 0) return 1920;
    if (id.indexOf('school') !== -1) return 1600;
    return DEFAULT_MAX;
  }

  function resizeToBlob(file, maxDim) {
    return createImageBitmap(file).then(function (bitmap) {
      try {
        var cap = Math.max(1, maxDim || DEFAULT_MAX);
        var scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
        var w = Math.max(1, Math.round(bitmap.width * scale));
        var h = Math.max(1, Math.round(bitmap.height * scale));
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
        return new Promise(function (resolve, reject) {
          canvas.toBlob(function (blob) {
            if (blob) resolve(blob);
            else reject(new Error('Could not encode image'));
          }, 'image/webp', QUALITY);
        });
      } finally {
        if (bitmap.close) bitmap.close();
      }
    });
  }

  function uploadBlob(blob, opts) {
    var cfg = config();
    if (!cfg || !cfg.uploadUrl) {
      return Promise.reject(new Error('Media upload not configured. Copy uploads/media-config.example.js to uploads/media-config.js.'));
    }
    var token = window.cmsAuth && window.cmsAuth.getIdToken && window.cmsAuth.getIdToken();
    if (!token) {
      return Promise.reject(new Error('Admin login required'));
    }

    var form = new FormData();
    form.append('file', blob, (opts && opts.filename) || 'upload.webp');
    form.append('folder', (opts && opts.folder) || 'general');

    return fetch(cfg.uploadUrl, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: form
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          throw new Error((data && data.error) || 'Upload failed');
        }
        return data;
      });
    });
  }

  function upload(file, opts) {
    opts = opts || {};
    if (!file || ACCEPT.indexOf(file.type) < 0) {
      return Promise.reject(new Error('Drop a PNG, JPEG, WebP, or AVIF image.'));
    }
    var maxDim = opts.maxDim || DEFAULT_MAX;
    return resizeToBlob(file, maxDim).then(function (blob) {
      return uploadBlob(blob, {
        folder: opts.folder,
        filename: opts.filename || 'upload.webp'
      });
    });
  }

  window.mediaUpload = {
    isConfigured: isConfigured,
    maxDimForSlot: maxDimForSlot,
    upload: upload,
    resizeToBlob: resizeToBlob
  };
})();
