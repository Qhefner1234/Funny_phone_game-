# 🍽️ Holiday Potluck Tracker

A real-time web app for coordinating a family potluck. Share **one link**;
everyone opens it on their phone (no app store, no install), adds their name
and the dish they're bringing, and **sees everyone else's dishes update
live** — so nobody doubles up on the mashed potatoes.

- ✅ Works on any iPhone or Android (and computers) — it's a web page
- ✅ Real-time: changes appear instantly for everyone
- ✅ "Add to Home Screen" gives it an app icon like a real app
- ✅ Warns you if someone's already bringing the same dish
- ✅ Free to run (Firebase free tier — no credit card needed)

---

## How it works (the short version)

The app is plain web files in the [`public/`](public) folder. Live syncing is
handled by **Firebase Firestore**, a free Google database that pushes changes
to every open phone in real time. You'll create a free Firebase project, paste
6 lines of settings into one file, and publish. Total time: **about 15 minutes.**

You only do this setup **once**. After that, you just share the link.

---

## Step 1 — Create a free Firebase project

1. Go to **<https://console.firebase.google.com>** and sign in with a Google
   account.
2. Click **Add project**. Name it anything (e.g. `family-potluck`). You can
   turn off Google Analytics — it's not needed. Click through to create it.

## Step 2 — Add a "Web app" and copy the settings

1. On the project's home screen, click the **`</>`** (web) icon — *"Add an
   app to get started"*.
2. Give it a nickname like `Potluck`. You do **not** need "Firebase Hosting"
   checked here (we'll do hosting separately). Click **Register app**.
3. Firebase shows a code block containing a `firebaseConfig = { ... }` object.
   **Keep this tab open** — you'll copy these values next.

## Step 3 — Paste the settings into the app

1. Open [`public/firebase-config.js`](public/firebase-config.js).
2. Replace each `PASTE_...` placeholder with the matching value from the
   Firebase screen (keep the quotes). It should end up looking like:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     authDomain: "family-potluck.firebaseapp.com",
     projectId: "family-potluck",
     storageBucket: "family-potluck.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456",
   };
   ```

   > These values are **not secret** — every web app sends them to the browser.
   > Your data is protected by the security rules in `firestore.rules`, not by
   > hiding this config.

## Step 4 — Turn on the database

1. In the Firebase menu: **Build → Firestore Database → Create database**.
2. Choose a location near your family, then pick **Start in production mode**
   (the included `firestore.rules` grants the right access). Click **Enable**.

## Step 5 — Publish it and get your link

You'll use Firebase's free tool to put the app online. In a terminal on your
computer, from inside the `potluck-web` folder:

```bash
# 1. Install the Firebase tools (one time). Needs Node.js from nodejs.org.
npm install -g firebase-tools

# 2. Sign in with the same Google account.
firebase login

# 3. Connect this folder to your project (pick the project you created).
firebase use --add

# 4. Publish the security rules AND the web app.
firebase deploy
```

When it finishes, it prints a **Hosting URL** like:

```
https://family-potluck.web.app
```

**That's your link!** 🎉 Open it on your phone to test, then send it to the family.

> Prefer not to use the terminal? You can also drag-and-drop the `public`
> folder using another free host (Netlify Drop at <https://app.netlify.com/drop>).
> Firestore still handles the live data. Just make sure Step 4's database is on.

---

## Step 6 — Tell your family how to "install" it

Send them the link with a note like:

> *Open this on your phone, add your name, and pick what you're bringing:
> https://family-potluck.web.app — tip: tap Share → "Add to Home Screen" to
> get an app icon!*

- **iPhone (Safari):** tap the **Share** button → **Add to Home Screen**.
- **Android (Chrome):** tap the **⋮** menu → **Add to Home screen** / **Install app**.

It then opens full-screen with its own icon, just like an app from the store.

---

## Running more than one event

Everyone who opens the app shares the same list. To run separate lists (e.g.
Thanksgiving and Christmas), change this line in `firebase-config.js` and
re-deploy, or keep two copies:

```js
window.POTLUCK_EVENT_ID = "thanksgiving-2026";
```

People on the same event id see the same live list.

---

## Optional: lock it down

The default rules let anyone **with the link** read and write — perfect for a
trusted family, and the link is effectively unguessable. If you want more:

- **Shared passcode / real accounts:** add Firebase Authentication and require
  `request.auth != null` in `firestore.rules`.
- **Abuse protection:** enable **Firebase App Check** in the console.

See <https://firebase.google.com/docs/rules> for details.

---

## What will this cost?

Nothing, realistically. Firebase's free **"Spark"** plan includes 50,000
reads and 20,000 writes per day — a family potluck uses a tiny fraction of
that. No credit card is required for the free plan.

---

## "But I wanted it in the App Store"

You can still get there later. This same app can be wrapped as a native
iOS/Android app (e.g. with **Capacitor**, which loads these web files inside a
real app shell) and submitted to the stores. That requires:

- An **Apple Developer** account ($99/year) and **Google Play** account ($25 once)
- A **Mac with Xcode** (or a cloud build service) for the iOS build
- Store **review**, which takes days

For a holiday deadline, the shareable link above is the fast, free path — and
"Add to Home Screen" already gives your family an app-like icon today. If you
decide you want the store version afterward, that's a natural next step from
this exact codebase.

---

## Local preview (optional, for testing before you deploy)

Because the app uses modern web features, open it through a tiny local server
rather than double-clicking the file:

```bash
cd public
python3 -m http.server 8000
# then visit http://localhost:8000 in your browser
```

(Live sync only works once you've completed the Firebase steps above.)
