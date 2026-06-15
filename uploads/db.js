/**
 * db.js — Firestore stub.
 *
 * Currently returns null / logs to console.
 * Replace the TODO blocks when you wire Firebase Firestore.
 *
 * Intended usage:
 *   • db.submitContactForm(data)  — contact page form submission
 *   • db.getImpactData()          — fetch live impact stats for the stats strip
 *   • db.getStories()             — fetch story content dynamically (optional)
 *
 * How to wire:
 *   1. Add Firebase SDK to index.html (CDN) or via npm.
 *   2. Initialise app in auth.js (shared instance).
 *   3. Replace stub methods below with real Firestore calls.
 */

// TODO: Uncomment once Firebase is initialised in auth.js
// import { getFirestore, collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';
// const firestore = getFirestore(app); // 'app' from auth.js

window.db = (function () {
  'use strict';

  /**
   * Submit a contact / partnership enquiry.
   * @param {Object} data - { name, email, organisation, message }
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function submitContactForm(data) {
    console.log('[db stub] submitContactForm called with:', data);
    // TODO: Replace with:
    // await addDoc(collection(firestore, 'enquiries'), {
    //   ...data,
    //   submittedAt: serverTimestamp(),
    //   lang: document.documentElement.lang || 'kk',
    // });
    return { success: true };
  }

  /**
   * Fetch live impact statistics.
   * Falls back to the static numbers already in the HTML.
   * @returns {Promise<{ classrooms, teachers, regions, schools } | null>}
   */
  async function getImpactData() {
    console.log('[db stub] getImpactData called');
    // TODO: Replace with:
    // const snap = await getDocs(collection(firestore, 'impact'));
    // return snap.docs[0]?.data() ?? null;
    return null; // null → HTML keeps its static numbers
  }

  /**
   * Fetch story cards for the Stories section.
   * Returns null → HTML keeps its static stories.
   * @returns {Promise<Array | null>}
   */
  async function getStories() {
    console.log('[db stub] getStories called');
    // TODO: Replace with:
    // const q   = query(collection(firestore, 'stories'), orderBy('date', 'desc'));
    // const snap = await getDocs(q);
    // return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return null;
  }

  return { submitContactForm, getImpactData, getStories };

})();
