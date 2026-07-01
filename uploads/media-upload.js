/**

 * Client-side image resize + upload to Cloudflare R2 via media-api Worker.

 */

(function () {

  'use strict';



  var ACCEPT = ['image/png', 'image/jpeg', 'image/jpg', 'image/pjpeg', 'image/webp', 'image/avif'];

  var ACCEPT_EXT = /\.(jpe?g|png|webp|avif)$/i;

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



  function canvasToWebpBlob(canvas) {

    return new Promise(function (resolve, reject) {

      canvas.toBlob(function (blob) {

        if (blob) resolve(blob);

        else reject(new Error('Суретті WebP форматына түрлендіру сәтсіз аяқталды'));

      }, 'image/webp', QUALITY);

    });

  }



  function resizeBitmapToBlob(bitmap, maxDim) {

    try {

      var cap = Math.max(1, maxDim || DEFAULT_MAX);

      var scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));

      var w = Math.max(1, Math.round(bitmap.width * scale));

      var h = Math.max(1, Math.round(bitmap.height * scale));

      var canvas = document.createElement('canvas');

      canvas.width = w;

      canvas.height = h;

      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);

      return canvasToWebpBlob(canvas);

    } finally {

      if (bitmap.close) bitmap.close();

    }

  }



  function resizeViaImageElement(file, maxDim) {

    return new Promise(function (resolve, reject) {

      var url = URL.createObjectURL(file);

      var img = new Image();

      img.onload = function () {

        URL.revokeObjectURL(url);

        try {

          var cap = Math.max(1, maxDim || DEFAULT_MAX);

          var scale = Math.min(1, cap / Math.max(img.naturalWidth, img.naturalHeight));

          var w = Math.max(1, Math.round(img.naturalWidth * scale));

          var h = Math.max(1, Math.round(img.naturalHeight * scale));

          var canvas = document.createElement('canvas');

          canvas.width = w;

          canvas.height = h;

          canvas.getContext('2d').drawImage(img, 0, 0, w, h);

          canvasToWebpBlob(canvas).then(resolve, reject);

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



  function resizeToBlob(file, maxDim) {

    if (window.createImageBitmap) {

      return createImageBitmap(file)

        .then(function (bitmap) { return resizeBitmapToBlob(bitmap, maxDim); })

        .catch(function () { return resizeViaImageElement(file, maxDim); });

    }

    return resizeViaImageElement(file, maxDim);

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

    isImageFile: isImageFile,

    maxDimForSlot: maxDimForSlot,

    upload: upload,

    resizeToBlob: resizeToBlob

  };

})();


