/**
 * Client-side image resize + upload to Cloudflare R2 via media-api Worker.
 */
(function () {
  'use strict';

  var ACCEPT = ['image/png', 'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/webp', 'image/avif'];
  var ACCEPT_EXT = /\.(jpe?g|png|webp|avif)$/i;
  var DEFAULT_MAX = 1200;
  var QUALITY = 0.85;
  var LOW_RES_RATIO = 0.8;

  function config() {
    return window.AUL_BILIM_MEDIA_CONFIG || null;
  }

  function isConfigured() {
    var cfg = config();
    return !!(cfg && cfg.uploadUrl && cfg.uploadUrl.indexOf('example.com') === -1);
  }

  function maxDimForSlot(slotId, explicit) {
    if (explicit) return explicit;
    var presets = window.mediaPresets;
    if (presets && presets.presetForSlot) {
      var presetId = presets.presetForSlot(slotId);
      if (presetId) {
        var preset = presets.getPreset(presetId);
        if (preset) return preset.maxWidth;
      }
    }
    var id = String(slotId || '').toLowerCase();
    if (id.indexOf('hero') !== -1 || id.indexOf('prog-') === 0) return 1920;
    if (id.indexOf('school') !== -1) return 1600;
    return DEFAULT_MAX;
  }

  function presetForSlot(slotId) {
    if (window.mediaPresets && window.mediaPresets.presetForSlot) {
      return window.mediaPresets.presetForSlot(slotId);
    }
    return null;
  }

  function resolveProcessOpts(opts) {
    opts = opts || {};
    if (opts.preset && window.mediaPresets && window.mediaPresets.getPreset) {
      var preset = window.mediaPresets.getPreset(opts.preset);
      if (preset) {
        return {
          aspect: preset.aspect,
          maxWidth: opts.maxWidth || preset.maxWidth,
          quality: opts.quality != null ? opts.quality : preset.quality,
          maxDim: opts.maxDim
        };
      }
    }
    if (opts.aspect) {
      return {
        aspect: opts.aspect,
        maxWidth: opts.maxWidth || DEFAULT_MAX,
        quality: opts.quality != null ? opts.quality : QUALITY,
        maxDim: opts.maxDim
      };
    }
    return {
      maxDim: opts.maxDim || DEFAULT_MAX,
      quality: opts.quality != null ? opts.quality : QUALITY
    };
  }

  function canvasToWebpBlob(canvas, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error('Суретті WebP форматына түрлендіру сәтсіз аяқталды'));
      }, 'image/webp', quality != null ? quality : QUALITY);
    });
  }

  function resizeBitmapToBlob(bitmap, processOpts) {
    var warning = null;
    try {
      var quality = processOpts.quality != null ? processOpts.quality : QUALITY;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      if (processOpts.aspect) {
        var aspect = processOpts.aspect;
        var maxWidth = Math.max(1, processOpts.maxWidth || DEFAULT_MAX);
        var srcW = bitmap.width;
        var srcH = bitmap.height;
        var srcAspect = srcW / srcH;
        var cropW;
        var cropH;
        var sx;
        var sy;

        if (srcAspect > aspect) {
          cropH = srcH;
          cropW = Math.round(cropH * aspect);
          sx = Math.round((srcW - cropW) / 2);
          sy = 0;
        } else {
          cropW = srcW;
          cropH = Math.round(cropW / aspect);
          sx = 0;
          sy = Math.round((srcH - cropH) / 2);
        }

        var outW = Math.min(maxWidth, cropW);
        var outH = Math.max(1, Math.round(outW / aspect));
        if (cropW < outW * LOW_RES_RATIO || cropH < outH * LOW_RES_RATIO) {
          warning = 'lowResolution';
        }

        canvas.width = outW;
        canvas.height = outH;
        ctx.drawImage(bitmap, sx, sy, cropW, cropH, 0, 0, outW, outH);
      } else {
        var cap = Math.max(1, processOpts.maxDim || DEFAULT_MAX);
        var scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
        var w = Math.max(1, Math.round(bitmap.width * scale));
        var h = Math.max(1, Math.round(bitmap.height * scale));
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(bitmap, 0, 0, w, h);
      }

      return canvasToWebpBlob(canvas, quality).then(function (blob) {
        return { blob: blob, warning: warning };
      });
    } finally {
      if (bitmap.close) bitmap.close();
    }
  }

  function resizeViaImageElement(file, processOpts) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        try {
          var quality = processOpts.quality != null ? processOpts.quality : QUALITY;
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          var warning = null;

          if (processOpts.aspect) {
            var aspect = processOpts.aspect;
            var maxWidth = Math.max(1, processOpts.maxWidth || DEFAULT_MAX);
            var srcW = img.naturalWidth;
            var srcH = img.naturalHeight;
            var srcAspect = srcW / srcH;
            var cropW;
            var cropH;
            var sx;
            var sy;

            if (srcAspect > aspect) {
              cropH = srcH;
              cropW = Math.round(cropH * aspect);
              sx = Math.round((srcW - cropW) / 2);
              sy = 0;
            } else {
              cropW = srcW;
              cropH = Math.round(cropW / aspect);
              sx = 0;
              sy = Math.round((srcH - cropH) / 2);
            }

            var outW = Math.min(maxWidth, cropW);
            var outH = Math.max(1, Math.round(outW / aspect));
            if (cropW < outW * LOW_RES_RATIO || cropH < outH * LOW_RES_RATIO) {
              warning = 'lowResolution';
            }

            canvas.width = outW;
            canvas.height = outH;
            ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, outW, outH);
          } else {
            var cap = Math.max(1, processOpts.maxDim || DEFAULT_MAX);
            var scale = Math.min(1, cap / Math.max(img.naturalWidth, img.naturalHeight));
            var w = Math.max(1, Math.round(img.naturalWidth * scale));
            var h = Math.max(1, Math.round(img.naturalHeight * scale));
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
          }

          canvasToWebpBlob(canvas, quality).then(function (blob) {
            resolve({ blob: blob, warning: warning });
          }, reject);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Суретті оқу мүмкін болмады. Басқа файлды қолданып көріңіз.'));
      };
      img.src = url;
    });
  }

  function loadBitmap(file) {
    if (!window.createImageBitmap) return null;
    return createImageBitmap(file, { imageOrientation: 'from-image' })
      .catch(function () {
        return createImageBitmap(file);
      });
  }

  function resizeToBlob(file, opts) {
    var processOpts = resolveProcessOpts(typeof opts === 'number' ? { maxDim: opts } : opts);
    var bitmapP = loadBitmap(file);
    if (bitmapP) {
      return bitmapP
        .then(function (bitmap) { return resizeBitmapToBlob(bitmap, processOpts); })
        .catch(function () { return resizeViaImageElement(file, processOpts); });
    }
    return resizeViaImageElement(file, processOpts);
  }

  function parseUploadResponse(res, text) {
    var data = null;
    if (text) {
      try { data = JSON.parse(text); } catch (e) { /* non-JSON body */ }
    }
    if (!res.ok) {
      var msg = (data && data.error) ? data.error : 'Жүктеу сәтсіз аяқталды';
      if (data && data.detail) msg += ' (' + data.detail + ')';
      else if (!data && text) msg += ' (' + text.slice(0, 160) + ')';
      throw new Error(msg);
    }
    if (!data) throw new Error('Жүктеу жауабы дұрыс емес');
    return data;
  }

  function uploadBlob(blob, opts) {
    var cfg = config();
    if (!cfg || !cfg.uploadUrl) {
      return Promise.reject(new Error('Сурет жүктеу бапталмаған. uploads/media-config.js файлын тексеріңіз.'));
    }

    function authTokenPromise() {
      if (window.cmsAuth && window.cmsAuth.ensureIdToken) {
        return window.cmsAuth.ensureIdToken();
      }
      if (window.cmsAuth && window.cmsAuth.getIdToken) {
        return Promise.resolve(window.cmsAuth.getIdToken());
      }
      return Promise.resolve(null);
    }

    return authTokenPromise().then(function (token) {
      if (!token) {
        throw new Error('Әкімші кіруі қажет. Шығып, қайта кіріңіз.');
      }

      var form = new FormData();
      form.append('file', blob, (opts && opts.filename) || 'upload.webp');
      form.append('folder', (opts && opts.folder) || 'general');

      return fetch(cfg.uploadUrl, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: form
      }).then(function (res) {
        return res.text().then(function (text) {
          return parseUploadResponse(res, text);
        });
      }).catch(function (err) {
        if (err && err.message) throw err;
        throw new Error('Желі қатесі — интернетті тексеріңіз немесе қайта кіріңіз.');
      });
    });
  }

  function isImageFile(file) {
    if (!file) return false;
    if (file.type && ACCEPT.indexOf(file.type) >= 0) return true;
    return ACCEPT_EXT.test(file.name || '');
  }

  function upload(file, opts) {
    opts = opts || {};
    if (!isImageFile(file)) {
      return Promise.reject(new Error('PNG, JPEG, WebP немесе AVIF суретін таңдаңыз.'));
    }

    return resizeToBlob(file, opts).then(function (result) {
      return uploadBlob(result.blob, {
        folder: opts.folder,
        filename: opts.filename || 'upload.webp'
      }).then(function (data) {
        if (result.warning) data.warning = result.warning;
        return data;
      });
    });
  }

  window.mediaUpload = {
    isConfigured: isConfigured,
    isImageFile: isImageFile,
    maxDimForSlot: maxDimForSlot,
    presetForSlot: presetForSlot,
    upload: upload,
    resizeToBlob: resizeToBlob
  };
})();
