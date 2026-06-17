window.db = (function () {
  'use strict';

  var LOCAL_CONTENT = 'aulbilim_content_draft';
  var LOCAL_ENQUIRIES = 'aulbilim_enquiries';

  function config() {
    return window.AUL_BILIM_FIREBASE_CONFIG || null;
  }

  function projectId() {
    var cfg = config();
    return cfg && cfg.projectId;
  }

  function documentUrl(path) {
    return 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(projectId()) + '/databases/(default)/documents/' + path;
  }

  function collectionUrl(path) {
    return documentUrl(path);
  }

  function authHeaders() {
    var headers = { 'Content-Type': 'application/json' };
    var token = window.cmsAuth && window.cmsAuth.getIdToken && window.cmsAuth.getIdToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return headers;
  }

  function hasBackend() {
    return !!(projectId() && config().apiKey);
  }

  function toValue(value) {
    if (value === null || value === undefined) return { nullValue: null };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
    if (typeof value === 'object') {
      var fields = {};
      Object.keys(value).forEach(function (key) { fields[key] = toValue(value[key]); });
      return { mapValue: { fields: fields } };
    }
    return { stringValue: String(value) };
  }

  function fromValue(value) {
    if (!value) return undefined;
    if ('stringValue' in value) return value.stringValue;
    if ('integerValue' in value) return Number(value.integerValue);
    if ('doubleValue' in value) return Number(value.doubleValue);
    if ('booleanValue' in value) return value.booleanValue;
    if ('timestampValue' in value) return value.timestampValue;
    if ('nullValue' in value) return null;
    if ('arrayValue' in value) return (value.arrayValue.values || []).map(fromValue);
    if ('mapValue' in value) {
      var out = {};
      var fields = value.mapValue.fields || {};
      Object.keys(fields).forEach(function (key) { out[key] = fromValue(fields[key]); });
      return out;
    }
  }

  function toDocument(data) {
    var fields = {};
    Object.keys(data || {}).forEach(function (key) { fields[key] = toValue(data[key]); });
    return { fields: fields };
  }

  function fromDocument(doc) {
    var out = {};
    var fields = (doc && doc.fields) || {};
    Object.keys(fields).forEach(function (key) { out[key] = fromValue(fields[key]); });
    return out;
  }

  async function submitContactForm(data) {
    var payload = Object.assign({}, data, {
      lang: document.documentElement.getAttribute('data-lang') || 'kk',
      status: 'new',
      submittedAt: new Date().toISOString()
    });
    if (!hasBackend()) {
      var existing = [];
      try { existing = JSON.parse(localStorage.getItem(LOCAL_ENQUIRIES) || '[]'); } catch (e) {}
      existing.push(payload);
      localStorage.setItem(LOCAL_ENQUIRIES, JSON.stringify(existing));
      return { success: true, mode: 'local' };
    }
    var res = await fetch(collectionUrl('enquiries/items'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(toDocument(payload))
    });
    if (!res.ok) return { success: false, error: await res.text() };
    return { success: true };
  }

  async function getSiteContent() {
    if (!hasBackend()) {
      try { return JSON.parse(localStorage.getItem(LOCAL_CONTENT) || 'null'); } catch (e) { return null; }
    }
    var res = await fetch(documentUrl('site/content'), { headers: authHeaders() });
    if (!res.ok) return null;
    return fromDocument(await res.json());
  }

  async function saveSiteContent(content) {
    var payload = Object.assign({}, content, { updatedAt: new Date().toISOString() });
    if (!hasBackend()) {
      localStorage.setItem(LOCAL_CONTENT, JSON.stringify(payload));
      return { success: true, mode: 'local' };
    }
    var res = await fetch(documentUrl('site/content'), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(toDocument(payload))
    });
    if (!res.ok) return { success: false, error: await res.text() };
    return { success: true };
  }

  async function saveMediaAsset(asset) {
    var content = await getSiteContent() || {};
    content.media = content.media || {};
    content.media[asset.id] = Object.assign({}, asset, { updatedAt: new Date().toISOString() });
    return saveSiteContent(content);
  }

  async function getImpactData() {
    var content = await getSiteContent();
    return content && content.stats ? content.stats : null;
  }

  async function getStories() {
    var content = await getSiteContent();
    return content && content.stories ? content.stories : null;
  }

  return {
    submitContactForm: submitContactForm,
    getSiteContent: getSiteContent,
    saveSiteContent: saveSiteContent,
    saveMediaAsset: saveMediaAsset,
    getImpactData: getImpactData,
    getStories: getStories
  };

})();
