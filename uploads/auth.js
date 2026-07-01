/**
 * auth.js — Firebase Auth REST facade for the static admin.
 *
 * Requires window.AUL_BILIM_FIREBASE_CONFIG from uploads/firebase-config.js.
 * Uses Firebase Identity Toolkit REST endpoints so the site does not need a
 * bundler. Admin writes must still be protected by Firestore/Storage rules.
 */
(function () {
  'use strict';

  var STORE = 'aulbilim_admin_auth';
  var listeners = [];

  function config() {
    return window.AUL_BILIM_FIREBASE_CONFIG || null;
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { return null; }
  }

  function setSession(session) {
    if (session) localStorage.setItem(STORE, JSON.stringify(session));
    else localStorage.removeItem(STORE);
    document.body.classList.toggle('logged-in', !!session);
    listeners.forEach(function (fn) { fn(session); });
  }

  async function login(email, password) {
    var cfg = config();
    if (!cfg || !cfg.apiKey) {
      return { success: false, error: 'Firebase config missing. Copy uploads/firebase-config.example.js to uploads/firebase-config.js.' };
    }
    var res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + encodeURIComponent(cfg.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, returnSecureToken: true })
    });
    var data = await res.json();
    if (!res.ok) return { success: false, error: data.error && data.error.message ? data.error.message : 'Login failed' };
    var session = {
      email: data.email,
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + (Number(data.expiresIn || 3600) * 1000)
    };
    setSession(session);
    return { success: true, user: session };
  }

  function logout() {
    setSession(null);
    return Promise.resolve();
  }

  async function refreshSession(session) {
    var cfg = config();
    if (!cfg || !cfg.apiKey || !session || !session.refreshToken) return null;
    var res = await fetch('https://securetoken.googleapis.com/v1/token?key=' + encodeURIComponent(cfg.apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(session.refreshToken)
    });
    var data = await res.json();
    if (!res.ok) return null;
    var next = {
      email: session.email,
      idToken: data.id_token,
      refreshToken: data.refresh_token || session.refreshToken,
      expiresAt: Date.now() + (Number(data.expires_in || 3600) * 1000)
    };
    setSession(next);
    return next;
  }

  async function ensureIdToken() {
    var session = getSession();
    if (!session || !session.idToken) return null;
    if (session.expiresAt > Date.now() + 5 * 60 * 1000) return session.idToken;
    session = await refreshSession(session);
    return session ? session.idToken : null;
  }

  function requireAuth() {
    var session = getSession();
    if (!session || !session.idToken) return null;
    document.body.classList.add('logged-in');
    return session;
  }

  function getIdToken() {
    var session = getSession();
    return session && session.idToken ? session.idToken : null;
  }

  function onAuthStateChanged(fn) {
    listeners.push(fn);
    fn(requireAuth());
  }

  window.cmsAuth = { login: login, logout: logout, requireAuth: requireAuth, getIdToken: getIdToken, ensureIdToken: ensureIdToken, onAuthStateChanged: onAuthStateChanged };
})();
