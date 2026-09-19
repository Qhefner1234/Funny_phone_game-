/*
 * ────────────────────────────────────────────────────────────────
 *  PASTE YOUR FIREBASE SETTINGS HERE  (one-time setup, ~5 minutes)
 * ────────────────────────────────────────────────────────────────
 *
 *  1. Go to  https://console.firebase.google.com  and create a free
 *     project (no credit card needed).
 *  2. In the project, click the </> "Web" icon to "Add an app".
 *     Give it a nickname like "Potluck". Firebase shows you a
 *     "firebaseConfig" object that looks EXACTLY like the one below.
 *  3. Copy the values from THAT screen over the placeholder values
 *     below (keep the quotes).
 *  4. In the left menu open  Build → Firestore Database → Create
 *     database → Start in *production mode* (the security rules in
 *     firestore.rules handle access).
 *
 *  Full walkthrough with screenshots-worth-of-detail is in README.md.
 *
 *  NOTE: These values are NOT secret — every web app ships them to the
 *  browser. Access is controlled by the Firestore security rules, not
 *  by hiding this config.
 */

window.FIREBASE_CONFIG = {
  apiKey: "PASTE_API_KEY_HERE",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID",
};

/*
 * Optional: change this to run more than one separate potluck from the
 * same Firebase project (e.g. "thanksgiving-2026", "christmas-2026").
 * Everyone who opens the same event id shares the same live list.
 */
window.POTLUCK_EVENT_ID = "family-holiday";
