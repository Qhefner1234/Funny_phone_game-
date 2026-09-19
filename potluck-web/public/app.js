// Holiday Potluck Tracker — real-time front-end.
// Uses the Firebase v10 modular SDK straight from the CDN (no build step).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, serverTimestamp, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CATEGORY_ORDER = ["Appetizers", "Main Course", "Dessert"];
const CATEGORY_ICON = {
  "Appetizers": "🥟", "Main Course": "🍖", "Dessert": "🥧",
};

// The classic Thanksgiving spread. An item is "covered" when someone's dish
// name contains one of its keywords. Tapping an uncovered item pre-fills the
// add form so a person can claim it in one tap.
const ESSENTIALS = [
  { label: "Turkey", keywords: ["turkey"], category: "Main Course" },
  { label: "Stuffing / Dressing", keywords: ["stuffing", "dressing"], category: "Main Course", claim: "Stuffing" },
  { label: "Mashed Potatoes", keywords: ["mashed"], category: "Main Course" },
  { label: "Gravy", keywords: ["gravy"], category: "Main Course" },
  { label: "Cranberry Sauce", keywords: ["cranberry"], category: "Main Course" },
  { label: "Sweet Potatoes / Yams", keywords: ["sweet potato", "yam", "candied"], category: "Main Course", claim: "Sweet potatoes" },
  { label: "Green Bean Casserole", keywords: ["green bean"], category: "Main Course" },
  { label: "Dinner Rolls", keywords: ["roll", "biscuit", "bread"], category: "Main Course", claim: "Dinner rolls" },
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

const LS_PARTY = "potluck.party";
function getParty() {
  const v = parseInt((() => { try { return localStorage.getItem(LS_PARTY); } catch (_) { return ""; } })() || "", 10);
  return Number.isFinite(v) && v > 0 ? v : 0;
}
function setParty(n) { try { localStorage.setItem(LS_PARTY, String(n)); } catch (_) {} }
function clampCount(n) {
  n = parseInt(n, 10);
  if (!Number.isFinite(n)) n = 1;
  return Math.min(50, Math.max(1, n));
}

const MAX_HEADCOUNT = Number(window.POTLUCK_MAX_HEADCOUNT) > 0 ? Number(window.POTLUCK_MAX_HEADCOUNT) : 12;

const ownerId = getOwnerId();
const norm = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
const esc = (s) => (s || "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ── DOM refs ────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
let dishes = [];        // live list from Firestore
let attendees = [];     // live attendee list (name + party count)
let dishColl = null;    // Firestore collection ref
let attColl = null;     // Firestore attendees collection ref
let attRef = null;      // this device's attendee doc
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
  attColl = collection(db, "events", eventId, "attendees");
  attRef = doc(attColl, ownerId);

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

  // Live attendee headcount
  onSnapshot(attColl, (snap) => {
    attendees = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderHeadcount();
  }, (err) => console.error(err));

  window.addEventListener("online", () => setConn(true));
  window.addEventListener("offline", () => setConn(false));

  // Make sure a returning person is counted (legacy users default to 1).
  if (getName()) saveAttendee(getName(), getParty() || 1);

  showNameGateOrApp();
}

// ── Attendees / headcount ───────────────────────────────────────────
async function saveAttendee(name, count) {
  if (!attRef) return;
  try {
    await setDoc(attRef, { name: name || "", count: clampCount(count), updatedAt: serverTimestamp() });
  } catch (err) { console.error(err); }
}
async function removeAttendee() {
  if (!attRef) return;
  try { await deleteDoc(attRef); } catch (err) { console.error(err); }
}
async function updateAttendeeCount(id, count) {
  if (!attColl) return;
  try {
    await updateDoc(doc(attColl, id), { count: clampCount(count), updatedAt: serverTimestamp() });
  } catch (err) { console.error(err); alert("Couldn't update that count."); }
}
function editAttendee(a) {
  const raw = prompt(`How many people is ${a.name || "this person"} bringing? (including themselves)`,
    String(Number(a.count) || 1));
  if (raw === null) return;
  const c = clampCount(raw);
  if (a.id === ownerId) setParty(c);
  updateAttendeeCount(a.id, c);
}
async function deleteAttendee(id) {
  if (!attColl) return;
  const self = id === ownerId;
  if (!confirm(self ? "Remove yourself from the headcount? Your name will be cleared on this device."
                    : "Remove this person from the headcount?")) return;
  try { await deleteDoc(doc(attColl, id)); } catch (err) { console.error(err); alert("Couldn't remove that person."); }
  if (self) {
    try { localStorage.removeItem(LS_NAME); localStorage.removeItem(LS_PARTY); } catch (_) {}
    showNameGateOrApp();
  }
}
function renderAttendees() {
  const listEl = $("attendees-list");
  if (!listEl) return;
  listEl.innerHTML = "";
  const sorted = [...attendees].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  for (const a of sorted) {
    const mine = a.id === ownerId;
    const row = document.createElement("div");
    row.className = "att-row";
    row.innerHTML = `
      <span class="att-name">${esc(a.name) || "Someone"}${mine ? '<span class="badge-you">YOU</span>' : ""}</span>
      <span class="att-count" title="people">${Number(a.count) || 0}</span>
      <div class="att-actions">
        <button class="att-edit" title="Change count">✎</button>
        <button class="att-del" title="Remove">🗑</button>
      </div>`;
    row.querySelector(".att-edit").addEventListener("click", () => editAttendee(a));
    row.querySelector(".att-del").addEventListener("click", () => deleteAttendee(a.id));
    listEl.appendChild(row);
  }
}
function renderHeadcount() {
  const total = attendees.reduce((sum, a) => sum + (Number(a.count) || 0), 0);
  const el = $("hc-total"); if (el) el.textContent = total;
  const sp = $("stat-people"); if (sp) sp.textContent = total;
  const mx = $("hc-max"); if (mx) mx.textContent = "/ " + MAX_HEADCOUNT;
  const left = MAX_HEADCOUNT - total;
  const sub = $("hc-sub");
  if (sub) {
    if (total === 0) sub.textContent = `up to ${MAX_HEADCOUNT} people can come`;
    else if (left > 0) sub.textContent = `${left} spot${left === 1 ? "" : "s"} left of ${MAX_HEADCOUNT} max`;
    else if (left === 0) sub.textContent = `full — ${MAX_HEADCOUNT} is the max`;
    else sub.textContent = `${-left} over the ${MAX_HEADCOUNT}-person max`;
  }
  const sec = $("headcount");
  if (sec) {
    sec.classList.toggle("full", total === MAX_HEADCOUNT);
    sec.classList.toggle("over", total > MAX_HEADCOUNT);
  }
  renderAttendees();
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
  $("headcount").hidden = !hasName;
  $("essentials").hidden = !hasName;
  $("attendees-card").hidden = !hasName;
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
  // Summary ("attending" is driven by renderHeadcount from the attendee list)
  $("stat-dishes").textContent = dishes.length;
  $("stat-yours").textContent = dishes.filter((d) => d.ownerId === ownerId).length;
  renderHeadcount();

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
        <div class="dish-actions">
          ${mine ? '<button class="dish-edit" title="Edit">✎</button>' : ""}
          <button class="dish-del" title="Remove">🗑</button>
        </div>`;
      if (mine) card.querySelector(".dish-edit").addEventListener("click", () => openEdit(d));
      card.querySelector(".dish-del").addEventListener("click", () => removeDish(d.id));
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
  segSet($("category-seg"), ess.category);
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
    category: segGet($("category-seg")),
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
  segSet($("edit-category-seg"), d.category);
  $("edit-notes-input").value = d.notes || "";
  $("dish-dialog").showModal();
}

async function saveEdit() {
  if (!editingId || !dishColl) return;
  try {
    await updateDoc(doc(dishColl, editingId), {
      dish: $("edit-dish-input").value.trim(),
      category: segGet($("edit-category-seg")),
      notes: $("edit-notes-input").value.trim(),
    });
  } catch (err) { console.error(err); alert("Couldn't save changes."); }
  editingId = null;
}

async function removeDish(id) {
  if (!id || !dishColl) return;
  if (!confirm("Remove this dish from the list?")) return;
  try {
    await deleteDoc(doc(dishColl, id));
  } catch (err) { console.error(err); alert("Couldn't remove that dish."); }
}

// Clear the person's name on this device (their dishes stay on the list).
function signOut() {
  if (!confirm("Sign out on this device? Your name and headcount will be cleared. Any dishes you added stay on the list — remove those first if you want them gone.")) return;
  removeAttendee();
  try { localStorage.removeItem(LS_NAME); localStorage.removeItem(LS_PARTY); } catch (_) {}
  showNameGateOrApp();
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

// ── Segmented (three-box) course selector ───────────────────────────
function segSet(container, val) {
  if (!container) return;
  const btns = [...container.querySelectorAll(".seg")];
  const known = btns.map((b) => b.dataset.value);
  const value = known.includes(val) ? val : (known[0] || "");
  container.dataset.value = value;
  btns.forEach((b) => b.classList.toggle("active", b.dataset.value === value));
}
function segGet(container) { return container ? (container.dataset.value || "") : ""; }
function initSeg(container) {
  if (!container) return;
  const btns = [...container.querySelectorAll(".seg")];
  btns.forEach((b) => b.addEventListener("click", () => segSet(container, b.dataset.value)));
  if (!container.dataset.value && btns[0]) segSet(container, btns[0].dataset.value);
}
initSeg($("category-seg"));
initSeg($("edit-category-seg"));

// ── Wire up UI ──────────────────────────────────────────────────────
$("name-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const n = $("name-input").value.trim();
  if (!n) return;
  const c = clampCount($("party-input").value);
  setName(n);
  setParty(c);
  showNameGateOrApp();
  saveAttendee(n, c);
});
$("change-name-btn").addEventListener("click", () => {
  const n = prompt("Your name:", getName());
  if (n && n.trim()) {
    setName(n.trim());
    $("your-name-label").textContent = n.trim();
    saveAttendee(n.trim(), getParty() || 1);
    render();
  }
});
$("hc-edit").addEventListener("click", () => {
  const raw = prompt("How many people are you bringing? (including yourself)", String(getParty() || 1));
  if (raw === null) return;
  const c = clampCount(raw);
  setParty(c);
  saveAttendee(getName(), c);
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
$("delete-dish-btn").addEventListener("click", () => {
  const id = editingId;
  editingId = null;
  $("dish-dialog").close();
  removeDish(id);
});
$("signout-btn").addEventListener("click", signOut);

// Register the service worker for "Add to Home Screen" / offline shell.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

boot();
