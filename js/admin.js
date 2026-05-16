import { db, ADMIN_PASSWORD_HASH } from './firebase-config.js';
import { MATCHES, GROUPS, ROUND_MULTIPLIERS } from './data.js';
import {
  doc, getDoc, setDoc, getDocs, addDoc,
  collection, deleteDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── Auth ─────────────────────────────────────────────────────────────────────

function isAdminSession() { return sessionStorage.getItem('wc26_admin') === '1'; }

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
  if (await sha256(pwd) === ADMIN_PASSWORD_HASH) {
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
  initAdminTabs();
  buildTeamSelects();
  renderMatchResults();
  loadCodes();
  renderKnockoutMatches();
}

function initAdminTabs() {
  document.querySelectorAll('#admin-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#admin-nav button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab').forEach(t => { t.hidden = true; });
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).hidden = false;
    });
  });
}

function buildTeamSelects() {
  // Collecte toutes les équipes triées par nom
  const teams = Object.values(GROUPS)
    .flatMap(g => g.teams)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  ['ko-team1', 'ko-team2'].forEach(id => {
    const sel = document.getElementById(id);
    sel.innerHTML = '<option value="">— Sélectionner —</option>';
    teams.forEach(t => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ flag: t.flag, name: t.name });
      opt.textContent = `${t.flag} ${t.name}`;
      sel.appendChild(opt);
    });
  });
}

// ─── Formatage date (UTC+2 été = France & Albanie) ───────────────────────────

const FMT = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: '2-digit', month: 'short',
  hour: '2-digit', minute: '2-digit',
});

// ─── Résultats phase de groupes ───────────────────────────────────────────────

async function renderMatchResults() {
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
      <td class="${r ? 'has-result' : 'no-result'}">${r ? `${r.score1} - ${r.score2}` : '–'}</td>
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

function openResultModal(matchId, existing, matchLabel) {
  const match = MATCHES.find(m => m.id === matchId);
  const label = match
    ? `${match.team1.flag} ${match.team1.name} vs ${match.team2.flag} ${match.team2.name}`
    : matchLabel || matchId;
  document.getElementById('modal-title').textContent = label;
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
  await setDoc(doc(db, 'results', matchId), { score1: s1, score2: s2, updatedAt: serverTimestamp() });
  document.getElementById('result-modal').hidden = true;
  renderMatchResults();
  renderKnockoutMatches();
}

// ─── Matchs éliminatoires ────────────────────────────────────────────────────

const ROUND_LABELS = {
  '1/32': '1/32 de finale',
  '1/16': '1/16 de finale',
  '1/4':  'Quart de finale',
  '1/2':  'Demi-finale',
  'Petite finale': 'Petite finale',
  'Finale': 'Finale',
};

async function renderKnockoutMatches() {
  const [koSnap, resultSnap] = await Promise.all([
    getDocs(collection(db, 'matches_extra')),
    getDocs(collection(db, 'results')),
  ]);
  const results = {};
  resultSnap.forEach(d => { results[d.id] = d.data(); });

  const tbody = document.getElementById('ko-body');
  tbody.innerHTML = '';

  const matches = [];
  koSnap.forEach(d => matches.push({ id: d.id, ...d.data() }));
  matches.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (matches.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="muted" style="text-align:center;padding:16px">Aucun match saisi pour l\'instant.</td></tr>';
    return;
  }

  for (const m of matches) {
    const r = results[m.id];
    const mult = ROUND_MULTIPLIERS[m.round] || 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="round-badge">${ROUND_LABELS[m.round] || m.round}</span>
          ${mult > 1 ? `<span class="multiplier-badge">×${mult}</span>` : ''}</td>
      <td>${m.team1.flag} ${m.team1.name}</td>
      <td>${m.team2.flag} ${m.team2.name}</td>
      <td style="font-size:.8rem;color:var(--muted)">${FMT.format(new Date(m.date))}<br>${m.venue}</td>
      <td class="${r ? 'has-result' : 'no-result'}">${r ? `${r.score1} - ${r.score2}` : '–'}</td>
      <td>
        <button class="btn-sm btn-ko-result" data-match="${m.id}"
          data-label="${escapeHtml(m.team1.flag + ' ' + m.team1.name + ' vs ' + m.team2.flag + ' ' + m.team2.name)}">
          ${r ? 'Modifier' : 'Saisir'} score
        </button>
        <button class="btn-sm danger btn-ko-del" data-match="${m.id}">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('.btn-ko-result').forEach(btn => {
    btn.addEventListener('click', () =>
      openResultModal(btn.dataset.match, results[btn.dataset.match], btn.dataset.label));
  });
  tbody.querySelectorAll('.btn-ko-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Supprimer ce match éliminatoire ?')) return;
      await deleteDoc(doc(db, 'matches_extra', btn.dataset.match));
      renderKnockoutMatches();
    });
  });
}

async function handleAddKnockoutMatch(e) {
  e.preventDefault();
  const round   = document.getElementById('ko-round').value;
  const raw1    = document.getElementById('ko-team1').value;
  const raw2    = document.getElementById('ko-team2').value;
  const dtValue = document.getElementById('ko-datetime').value;
  const venue   = document.getElementById('ko-venue').value.trim();
  const errEl   = document.getElementById('ko-error');

  if (!raw1 || !raw2 || !dtValue || !venue) {
    errEl.textContent = 'Tous les champs sont obligatoires.'; return;
  }
  if (raw1 === raw2) {
    errEl.textContent = 'Les deux équipes doivent être différentes.'; return;
  }

  errEl.textContent = '';
  const team1 = JSON.parse(raw1);
  const team2 = JSON.parse(raw2);

  // L'admin saisit l'heure en heure locale France/Albanie (UTC+2 en été)
  const isoDate = `${dtValue}:00+02:00`;

  await addDoc(collection(db, 'matches_extra'), {
    round, team1, team2, date: isoDate, venue,
    createdAt: serverTimestamp(),
  });

  e.target.reset();
  renderKnockoutMatches();
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
  document.getElementById('ko-form').addEventListener('submit', handleAddKnockoutMatch);

  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    sessionStorage.removeItem('wc26_admin');
    location.reload();
  });
});
