/**
 * Image upload presets — aspect ratio, max width, and WebP quality per slot type.
 */
(function () {
  'use strict';

  var PRESETS = {
    schoolMap: { aspect: 4 / 3, maxWidth: 1600, quality: 0.85 },
    schoolGallery: { aspect: 16 / 9, maxWidth: 1600, quality: 0.85 },
    schoolCard: { aspect: 16 / 11, maxWidth: 1200, quality: 0.82 },
    heroWide: { aspect: 21 / 8, maxWidth: 1920, quality: 0.88 },
    card3x2: { aspect: 3 / 2, maxWidth: 1200, quality: 0.85 },
    heroProg: { aspect: 21 / 7, maxWidth: 1920, quality: 0.88 },
    heroGallery16x9: { aspect: 16 / 9, maxWidth: 1920, quality: 0.88 },
    carousel4x3: { aspect: 4 / 3, maxWidth: 1200, quality: 0.85 }
  };

  function getPreset(id) {
    return PRESETS[id] ? Object.assign({}, PRESETS[id]) : null;
  }

  function presetForSlot(slotId) {
    var id = String(slotId || '').toLowerCase();
    if (id === 'home-hero') return 'heroWide';
    if (id.indexOf('home-prog-') === 0) return 'card3x2';
    if (/^prog-[123]$/.test(id)) return 'heroProg';
    if (id.indexOf('fitout-car-') === 0) return 'carousel4x3';
    if (id.indexOf('hero') !== -1) return 'heroWide';
    return null;
  }

  function parseAspectFromStyle(el) {
    if (!el || !el.style) return null;
    var raw = el.style.aspectRatio || '';
    if (!raw) return null;
    var parts = String(raw).split('/').map(function (s) { return parseFloat(s.trim()); });
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) return parts[0] / parts[1];
    var single = parseFloat(raw);
    return single > 0 ? single : null;
  }

  function resolveUploadOpts(slotId, slotEl, explicit) {
    if (explicit && explicit.preset) {
      var p = getPreset(explicit.preset);
      if (p) return Object.assign({ preset: explicit.preset }, p, explicit);
    }
    if (explicit && explicit.aspect) return explicit;

    var presetId = presetForSlot(slotId);
    if (presetId) {
      var preset = getPreset(presetId);
      if (preset) return Object.assign({ preset: presetId }, preset);
    }

    if (slotEl) {
      var aspect = parseAspectFromStyle(slotEl);
      if (aspect) {
        return {
          aspect: aspect,
          maxWidth: explicit && explicit.maxWidth ? explicit.maxWidth : 1200,
          quality: explicit && explicit.quality ? explicit.quality : 0.85
        };
      }
    }

    return explicit || null;
  }

  window.mediaPresets = {
    PRESETS: PRESETS,
    getPreset: getPreset,
    presetForSlot: presetForSlot,
    parseAspectFromStyle: parseAspectFromStyle,
    resolveUploadOpts: resolveUploadOpts
  };
})();
