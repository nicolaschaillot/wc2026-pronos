import { db, ADMIN_PASSWORD_HASH } from './firebase-config.js';
import { MATCHES } from './data.js';
import {
  doc, getDoc, setDoc, getDocs, addDoc,
  collection, deleteDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── Auth ─────────────────────────────────────────────────────────────────────

function isAdminSession() {
  return sessionStorage.getItem('wc26_admin') === '1';
}

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const pwd = document.getElementById('admin-pwd').value;
  const err = document.getElementById('admin-login-error');
  const btn = e.target.querySelector('button');

  btn.disabled = true;
  const hash = await sha256(pwd);

  if (hash === ADMIN_PASSWORD_HASH) {
    sessionStorage.setItem('wc26_admin', '1');
    showAdminPanel();
  } else {
    err.textContent = 'Mot de passe incorrect.';
    btn.disabled = false;
  }
}

function showAdminPanel() {
  document.getElementById('admin-login').hidden = true;
  document.getElementById('admin-panel').hidden = false;
  renderMatchResults();
  loadCodes();
}

// ─── Match Results ────────────────────────────────────────────────────────────

function buildMatchOptions() {
  const sel = document.getElementById('select-match');
  sel.innerHTML = '<option value="">— Choisir un match —</option>';
  for (const m of MATCHES) {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = `[${m.group}] ${m.team1.flag} ${m.team1.name} vs ${m.team2.flag} ${m.team2.name}`;
    sel.appendChild(opt);
  }
}

async function renderMatchResults() {
  buildMatchOptions();
  const snap = await getDocs(collection(db, 'results'));
  const results = {};
  snap.forEach(d => { results[d.id] = d.data(); });

  const tbody = document.getElementById('results-body');
  tbody.innerHTML = '';

  for (const m of MATCHES) {
    const r = results[m.id];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.group}</td>
      <td>${m.team1.flag} ${m.team1.name}</td>
      <td>${m.team2.flag} ${m.team2.name}</td>
      <td class="${r ? 'has-result' : 'no-result'}">
        ${r ? `${r.score1} - ${r.score2}` : '–'}
      </td>
      <td>
        <button class="btn-edit-result btn-sm" data-match="${m.id}">
          ${r ? 'Modifier' : 'Saisir'}
        </button>
        ${r ? `<button class="btn-del-result btn-sm danger" data-match="${m.id}">✕</button>` : ''}
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('.btn-edit-result').forEach(btn => {
    btn.addEventListener('click', () => openResultModal(btn.dataset.match, results[btn.dataset.match]));
  });
  tbody.querySelectorAll('.btn-del-result').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Supprimer ce résultat ?')) return;
      await deleteDoc(doc(db, 'results', btn.dataset.match));
      renderMatchResults();
    });
  });
}

function openResultModal(matchId, existing) {
  const match = MATCHES.find(m => m.id === matchId);
  document.getElementById('modal-title').textContent =
    `${match.team1.flag} ${match.team1.name} vs ${match.team2.flag} ${match.team2.name}`;
  document.getElementById('modal-match-id').value = matchId;
  document.getElementById('modal-score1').value = existing?.score1 ?? '';
  document.getElementById('modal-score2').value = existing?.score2 ?? '';
  document.getElementById('result-modal').hidden = false;
}

async function handleSaveResult(e) {
  e.preventDefault();
  const matchId = document.getElementById('modal-match-id').value;
  const s1 = parseInt(document.getElementById('modal-score1').value, 10);
  const s2 = parseInt(document.getElementById('modal-score2').value, 10);
  if (isNaN(s1) || isNaN(s2)) return;

  await setDoc(doc(db, 'results', matchId), {
    score1: s1, score2: s2, updatedAt: serverTimestamp(),
  });
  document.getElementById('result-modal').hidden = true;
  renderMatchResults();
}

// ─── Codes ───────────────────────────────────────────────────────────────────

async function loadCodes() {
  const snap = await getDocs(collection(db, 'codes'));
  const tbody = document.getElementById('codes-body');
  tbody.innerHTML = '';
  const codes = [];
  snap.forEach(d => codes.push({ id: d.id, ...d.data() }));
  codes.sort((a, b) => a.id.localeCompare(b.id));

  for (const c of codes) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${c.id}</code></td>
      <td>${c.pseudo ? `<strong>${escapeHtml(c.pseudo)}</strong>` : '<em class="muted">disponible</em>'}</td>
      <td>
        <button class="btn-sm danger btn-del-code" data-code="${c.id}"
          ${c.pseudo ? 'disabled title="Déjà utilisé"' : ''}>✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('.btn-del-code').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(`Supprimer le code ${btn.dataset.code} ?`)) return;
      await deleteDoc(doc(db, 'codes', btn.dataset.code));
      loadCodes();
    });
  });
}

function generateCode(len = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function handleAddCodes() {
  const count = parseInt(document.getElementById('code-count').value, 10) || 1;
  for (let i = 0; i < Math.min(count, 50); i++) {
    let code;
    do { code = generateCode(); } while ((await getDoc(doc(db, 'codes', code))).exists());
    await setDoc(doc(db, 'codes', code), { pseudo: null, usedAt: null });
  }
  loadCodes();
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (isAdminSession()) {
    showAdminPanel();
  } else {
    document.getElementById('admin-login').hidden = false;
    document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);
  }

  document.getElementById('result-form').addEventListener('submit', handleSaveResult);
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('result-modal').hidden = true;
  });
  document.getElementById('btn-add-codes').addEventListener('click', handleAddCodes);

  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    sessionStorage.removeItem('wc26_admin');
    location.reload();
  });
});
