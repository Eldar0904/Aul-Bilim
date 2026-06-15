/**
 * auth.js — Firebase Auth stub.
 *
 * Currently does nothing. Replace the TODO blocks when you wire Firebase.
 *
 * How it works when live:
 *   • On login  → document.body.classList.add('logged-in')
 *   • On logout → document.body.classList.remove('logged-in')
 *
 * CSS in auth.css uses those body class hooks to show/hide elements:
 *   [data-requires-auth]  — visible only when logged in
 *   [data-hide-when-auth] — visible only when logged out
 *
 * Usage in HTML (example):
 *   <a href="dashboard.html" data-requires-auth>Менің кабинетім</a>
 *   <a href="contact.html"   data-hide-when-auth>Серіктес болу</a>
 */

// TODO: Replace with your real Firebase config object
// const firebaseConfig = {
//   apiKey: "...",
//   authDomain: "...",
//   projectId: "...",
// };

// TODO: Uncomment once Firebase SDK is loaded (via CDN or npm)
// import { initializeApp } from 'firebase/app';
// import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
//
// const app  = initializeApp(firebaseConfig);
// const auth = getAuth(app);
//
// onAuthStateChanged(auth, function (user) {
//   if (user) {
//     document.body.classList.add('logged-in');
//   } else {
//     document.body.classList.remove('logged-in');
//   }
// });

// ── Stub: always logged-out for now ──────────────────────────────────────────
(function () {
  'use strict';
  // No-op until Firebase is wired. Auth state remains 'logged out'.
  // document.body does NOT get .logged-in, so all [data-requires-auth]
  // elements stay hidden as defined in auth.css.
})();
