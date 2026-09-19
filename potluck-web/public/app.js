// Holiday Potluck Tracker — real-time front-end.
// Uses the Firebase v10 modular SDK straight from the CDN (no build step).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, serverTimestamp, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CATEGORY_ORDER = [
  "Appetizer", "Main Dish", "Side", "Salad", "Bread & Rolls",
  "Dessert", "Drinks", "Supplies (plates, cups…)", "Other",
];
const CATEGORY_ICON = {
  "Appetizer": "🥟", "Main Dish": "🍖", "Side": "🥔", "Salad": "🥗",
  "Bread & Rolls": "🥐", "Dessert": "🥧", "Drinks": "🥤",
  "Supplies (plates, cups…)": "🧺", "Other": "🍽️",
};

// The classic Thanksgiving spread. An item is "covered" when someone's dish
// name contains one of its keywords. Tapping an uncovered item pre-fills the
// add form so a person can claim it in one tap.
const ESSENTIALS = [
  { label: "Turkey", keywords: ["turkey"], category: "Main Dish" },
  { label: "Ham", keywords: ["ham"], category: "Main Dish" },
  { label: "Stuffing / Dressing", keywords: ["stuffing", "dressing"], category: "Side", claim: "Stuffing" },
  { label: "Mashed Potatoes", keywords: ["mashed"], category: "Side" },
  { label: "Gravy", keywords: ["gravy"], category: "Side" },
  { label: "Cranberry Sauce", keywords: ["cranberry"], category: "Side" },
  { label: "Sweet Potatoes / Yams", keywords: ["sweet potato", "yam", "candied"], category: "Side", claim: "Sweet potatoes" },
  { label: "Green Bean Casserole", keywords: ["green bean"], category: "Side" },
  { label: "Dinner Rolls", keywords: ["roll", "biscuit", "bread"], category: "Bread & Rolls", claim: "Dinner rolls" },
  { label: "Pumpkin Pie", keywords: ["pumpkin"], category: "Dessert" },
];

// ── Local identity (per device/browser) ─────────────────────────────
const LS_NAME = "potluck.name";
const LS_OWNER = "potluck.ownerId";
function getOwnerId() {
  let id = localStorage.getItem(LS_OWNER);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
    try { localStorage.setItem(LS_OWNER, id); } catch (_) {}
  }
  return id;
}
function getName() { try { return localStorage.getItem(LS_NAME) || ""; } catch (_) { return ""; } }
function setName(n) { try { localStorage.setItem(LS_NAME, n); } catch (_) {} }

const ownerId = getOwnerId();
const norm = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
const esc = (s) => (s || "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ── DOM refs ────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
let dishes = [];        // live list from Firestore
let dishColl = null;    // Firestore collection ref
let eventRef = null;    // Firestore event doc ref
let editingId = null;

// ── Config check ────────────────────────────────────────────────────
function configLooksReal(cfg) {
  return cfg && cfg.projectId && !String(cfg.projectId).includes("PASTE") &&
    cfg.apiKey && !String(cfg.apiKey).includes("PASTE");
}

function boot() {
  const cfg = window.FIREBASE_CONFIG;
  if (!configLooksReal(cfg)) {
    $("config-warning").hidden = false;
    // Still let people see the UI shell so nothing looks broken.
    showNameGateOrApp();
    return;
  }

  const app = initializeApp(cfg);
  const db = getFirestore(app);
  const eventId = window.POTLUCK_EVENT_ID || "family-holiday";
  eventRef = doc(db, "events", eventId);
  dishColl = collection(db, "events", eventId, "dishes");

  // Live event details (title / when)
  onSnapshot(eventRef, (snap) => {
    const d = snap.exists() ? snap.data() : {};
    $("event-title").textContent = d.title || "Holiday Potluck";
    $("event-subtitle").textContent = d.when || "Add your name and sign up below";
    $("edit-event-btn").hidden = false;
  }, () => { $("event-subtitle").textContent = "Add your name and sign up below"; });

  // Live dish list
  const q = query(dishColl, orderBy("createdAt", "asc"));
  onSnapshot(q, (snap) => {
    dishes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    render();
    setConn(true);
  }, (err) => {
    console.error(err);
    setConn(false);
  });

  window.addEventListener("online", () => setConn(true));
  window.addEventListener("offline", () => setConn(false));

  showNameGateOrApp();
}

function setConn(live) {
  const el = $("conn-status");
  el.classList.toggle("offline", !live);
  el.lastChild.textContent = live ? " Live" : " Reconnecting…";
}

// ── Name gate ───────────────────────────────────────────────────────
function showNameGateOrApp() {
  const name = getName();
  const hasName = !!name;
  $("name-gate").hidden = hasName;
  $("essentials").hidden = !hasName;
  $("summary").hidden = !hasName;
  $("add-section").hidden = !hasName;
  $("list-section").hidden = !hasName;
  $("you-row").hidden = !hasName;
  if (hasName) {
    $("your-name-label").textContent = name;
    render();
  }
}

// ── Rendering ───────────────────────────────────────────────────────
function render() {
  const name = getName();
  // Summary
  $("stat-dishes").textContent = dishes.length;
  const people = new Set(dishes.map((d) => norm(d.broughtBy)).filter(Boolean));
  $("stat-people").textContent = people.size;
  $("stat-yours").textContent = dishes.filter((d) => d.ownerId === ownerId).length;

  const listEl = $("dish-list");
  listEl.innerHTML = "";
  $("empty-state").hidden = dishes.length !== 0;

  const byCat = {};
  for (const d of dishes) (byCat[d.category] || (byCat[d.category] = [])).push(d);

  const cats = CATEGORY_ORDER.filter((c) => byCat[c]);
  // Any unknown categories go last
  for (const c of Object.keys(byCat)) if (!cats.includes(c)) cats.push(c);

  for (const cat of cats) {
    const group = document.createElement("div");
    group.className = "category-group";
    group.innerHTML = `<div class="category-head">${CATEGORY_ICON[cat] || "🍽️"} ${esc(cat)}
      <span class="count">· ${byCat[cat].length}</span></div>`;
    for (const d of byCat[cat]) {
      const mine = d.ownerId === ownerId;
      const card = document.createElement("div");
      card.className = "dish-card";
      card.innerHTML = `
        <div class="dish-main">
          <div class="dish-name">${esc(d.dish)}${mine ? '<span class="badge-you">YOU</span>' : ""}</div>
          <div class="dish-meta">by <span class="dish-by">${esc(d.broughtBy) || "someone"}</span>${
            d.notes ? " · " + esc(d.notes) : ""}</div>
        </div>
        ${mine ? '<button class="dish-edit" title="Edit or remove">✎</button>' : ""}`;
      if (mine) card.querySelector(".dish-edit").addEventListener("click", () => openEdit(d));
      group.appendChild(card);
    }
    listEl.appendChild(group);
  }

  renderEssentials();
}

// ── Thanksgiving essentials checklist ───────────────────────────────
// Longer keywords match anywhere (handles plurals like "potatoes");
// short ones (ham, yam) require a whole-word match so "graham" doesn't count.
function essMatch(n, k) {
  if (k.length >= 4) return n.includes(k);
  return new RegExp("\\b" + k + "s?\\b").test(n);
}
function renderEssentials() {
  const listEl = $("essentials-list");
  if (!listEl) return;
  listEl.innerHTML = "";
  let covered = 0;
  for (const ess of ESSENTIALS) {
    const match = dishes.find((d) => {
      const n = norm(d.dish);
      return ess.keywords.some((k) => essMatch(n, k));
    });
    const done = !!match;
    if (done) covered++;
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ess-item" + (done ? " done" : "");
    btn.innerHTML = `
      <span class="ess-check">${done ? "✓" : ""}</span>
      <span class="ess-text">
        <span class="ess-label">${esc(ess.label)}</span>
        ${done
          ? `<span class="ess-who">✓ ${esc(match.broughtBy) || "someone"}</span>`
          : `<span class="ess-need">Still needed — tap to claim</span>`}
      </span>`;
    if (!done) btn.addEventListener("click", () => claimEssential(ess));
    li.appendChild(btn);
    listEl.appendChild(li);
  }
  $("ess-covered").textContent = covered;
  $("ess-total").textContent = ESSENTIALS.length;
}

function claimEssential(ess) {
  const dishInput = $("dish-input");
  dishInput.value = ess.claim || ess.label;
  $("category-input").value = ess.category;
  $("add-section").scrollIntoView({ behavior: "smooth", block: "center" });
  dishInput.focus();
  checkDupe();
}

// ── Duplicate detection (live, as you type) ─────────────────────────
function checkDupe() {
  const val = norm($("dish-input").value);
  const warn = $("dupe-warning");
  if (!val) { warn.hidden = true; return; }
  const match = dishes.find((d) => norm(d.dish) === val);
  if (match) {
    warn.hidden = false;
    warn.innerHTML = `Heads up — <strong>${esc(match.broughtBy) || "someone"}</strong> is already bringing
      <strong>${esc(match.dish)}</strong>. You can still add it, or bring something else!`;
  } else {
    warn.hidden = true;
  }
}

// ── Actions ─────────────────────────────────────────────────────────
async function addDish(e) {
  e.preventDefault();
  if (!dishColl) { alert("Firebase isn't set up yet — see the README."); return; }
  const dish = $("dish-input").value.trim();
  if (!dish) return;
  const payload = {
    dish,
    category: $("category-input").value,
    notes: $("notes-input").value.trim(),
    broughtBy: getName(),
    ownerId,
    createdAt: serverTimestamp(),
  };
  $("dish-input").value = "";
  $("notes-input").value = "";
  $("dupe-warning").hidden = true;
  try {
    await addDoc(dishColl, payload);
  } catch (err) {
    console.error(err);
    alert("Couldn't save that dish. Check your connection and try again.");
  }
}

function openEdit(d) {
  editingId = d.id;
  $("edit-dish-input").value = d.dish;
  $("edit-category-input").value = d.category;
  $("edit-notes-input").value = d.notes || "";
  $("dish-dialog").showModal();
}

async function saveEdit() {
  if (!editingId || !dishColl) return;
  try {
    await updateDoc(doc(dishColl, editingId), {
      dish: $("edit-dish-input").value.trim(),
      category: $("edit-category-input").value,
      notes: $("edit-notes-input").value.trim(),
    });
  } catch (err) { console.error(err); alert("Couldn't save changes."); }
  editingId = null;
}

async function deleteDish() {
  if (!editingId || !dishColl) return;
  if (!confirm("Remove this dish from the list?")) return;
  try {
    await deleteDoc(doc(dishColl, editingId));
  } catch (err) { console.error(err); alert("Couldn't remove that dish."); }
  editingId = null;
  $("dish-dialog").close();
}

async function saveEvent() {
  if (!eventRef) return;
  try {
    await setDoc(eventRef, {
      title: $("event-title-input").value.trim() || "Holiday Potluck",
      when: $("event-when-input").value.trim(),
    }, { merge: true });
  } catch (err) { console.error(err); alert("Couldn't save event details."); }
}

// ── Wire up UI ──────────────────────────────────────────────────────
$("name-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const n = $("name-input").value.trim();
  if (!n) return;
  setName(n);
  showNameGateOrApp();
});
$("change-name-btn").addEventListener("click", () => {
  const n = prompt("Your name:", getName());
  if (n && n.trim()) { setName(n.trim()); $("your-name-label").textContent = n.trim(); render(); }
});
$("dish-form").addEventListener("submit", addDish);
$("dish-input").addEventListener("input", checkDupe);
$("edit-event-btn").addEventListener("click", () => {
  $("event-title-input").value = $("event-title").textContent === "Holiday Potluck" ? "" : $("event-title").textContent;
  $("event-when-input").value = $("event-subtitle").textContent.startsWith("Add your name") ? "" : $("event-subtitle").textContent;
  $("event-dialog").showModal();
});
$("event-save-btn").addEventListener("click", () => saveEvent());
$("edit-save-btn").addEventListener("click", () => saveEdit());
$("delete-dish-btn").addEventListener("click", () => deleteDish());

// Register the service worker for "Add to Home Screen" / offline shell.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

boot();
