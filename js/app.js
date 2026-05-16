import { db } from './firebase-config.js';
import { GROUPS, MATCHES, ROUND_MULTIPLIERS, calcPoints } from './data.js';
import {
  doc, getDoc, setDoc, getDocs, collection, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── Session ─────────────────────────────────────────────────────────────────

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('wc26_user')); } catch { return null; }
}
function saveSession(u) { sessionStorage.setItem('wc26_user', JSON.stringify(u)); }
function clearSession() { sessionStorage.removeItem('wc26_user'); }

// ─── Navigation ──────────────────────────────────────────────────────────────

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.hidden = true);
  document.getElementById(id).hidden = false;
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === id);
  });
}

// ─── Login ───────────────────────────────────────────────────────────────────

async function handleLogin(e) {
  e.preventDefault();
  const pseudo = document.getElementById('input-pseudo').value.trim().toLowerCase();
  const code   = document.getElementById('input-code').value.trim().toUpperCase();
  const errEl  = document.getElementById('login-error');
  const btn    = e.target.querySelector('button');

  if (!pseudo || !code) { errEl.textContent = 'Remplis tous les champs.'; return; }

  btn.disabled = true;
  btn.textContent = 'Vérification…';
  errEl.textContent = '';

  try {
    const codeRef  = doc(db, 'codes', code);
    const codeSnap = await getDoc(codeRef);

    if (!codeSnap.exists()) { errEl.textContent = 'Code invalide.'; return; }

    const codeData = codeSnap.data();
    if (codeData.pseudo && codeData.pseudo !== pseudo) {
      errEl.textContent = 'Ce code est déjà utilisé par quelqu\'un d\'autre.';
      return;
    }

    if (!codeData.pseudo) {
      await setDoc(codeRef, { pseudo, usedAt: serverTimestamp() }, { merge: true });
      await setDoc(doc(db, 'users', pseudo), { pseudo, code, joinedAt: serverTimestamp() });
    }

    saveSession({ pseudo, code });
    initApp();
  } catch (err) {
    console.error(err);
    errEl.textContent = 'Erreur réseau. Réessaie.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Rejoindre';
  }
}

// ─── Predictions ─────────────────────────────────────────────────────────────

let userPronostics  = {};
let knockoutMatches = [];

async function loadPronostics(pseudo) {
  const snap = await getDocs(collection(db, 'pronostics'));
  userPronostics = {};
  snap.forEach(d => {
    const data = d.data();
    if (data.userId === pseudo) userPronostics[data.matchId] = data;
  });
}

async function loadKnockoutMatches() {
  const snap = await getDocs(collection(db, 'matches_extra'));
  knockoutMatches = [];
  snap.forEach(d => knockoutMatches.push({ ...d.data(), id: d.id }));
  knockoutMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function isLocked(match) {
  // new Date() et new Date(match.date) sont tous deux en UTC interne —
  // le verrou est exact quelle que soit la timezone du navigateur.
  return new Date() >= new Date(match.date);
}

// France et Albanie partagent UTC+2 en été (CEST / CEST).
// On fixe Europe/Paris pour que l'heure affichée soit identique pour tous.
const FMT_DATE = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: '2-digit', month: 'short',
  hour: '2-digit', minute: '2-digit',
});

function formatDate(isoStr) {
  return FMT_DATE.format(new Date(isoStr));
}

function buildMatchCard(match, pseudo, multiplier = 1) {
  const prono  = userPronostics[match.id];
  const locked = isLocked(match);
  const s1 = prono?.score1 ?? '';
  const s2 = prono?.score2 ?? '';

  const card = document.createElement('div');
  card.className = `match-card${locked ? ' locked' : ''}`;

  const multBadge = multiplier > 1
    ? `<span class="multiplier-badge">×${multiplier}</span>` : '';

  card.innerHTML = `
    <div class="match-meta">
      <span class="match-date">${formatDate(match.date)}${locked ? ' 🔒' : ''}</span>
      <span class="match-venue">📍 ${match.venue}</span>
      ${multBadge}
    </div>
    <div class="match-teams">
      <span class="team">
        <span class="flag">${match.team1.flag}</span>
        <span class="name">${match.team1.name}</span>
      </span>
      <div class="score-inputs">
        ${locked
          ? `<span class="score-static">${s1 !== '' ? s1 : '–'}</span>
             <span class="vs">-</span>
             <span class="score-static">${s2 !== '' ? s2 : '–'}</span>`
          : `<input type="number" min="0" max="20" class="score-input"
               data-match="${match.id}" data-side="1" value="${s1}" placeholder="?">
             <span class="vs">-</span>
             <input type="number" min="0" max="20" class="score-input"
               data-match="${match.id}" data-side="2" value="${s2}" placeholder="?">`
        }
      </div>
      <span class="team right">
        <span class="name">${match.team2.name}</span>
        <span class="flag">${match.team2.flag}</span>
      </span>
    </div>
    ${!locked ? `<div class="save-row">
      <button class="btn-save" data-match="${match.id}">Enregistrer</button>
      <span class="save-status" id="status-${match.id}"></span>
    </div>` : ''}
  `;
  return card;
}

function attachCardHandlers(container, pseudo) {
  container.querySelectorAll('.btn-save').forEach(btn => {
    btn.addEventListener('click', () => savePronostic(pseudo, btn.dataset.match));
  });
  container.querySelectorAll('.score-input').forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') savePronostic(pseudo, input.dataset.match);
    });
  });
}

function renderPredictions(pseudo) {
  const container = document.getElementById('predictions-list');
  container.innerHTML = '';

  // ── Phase de groupes ──────────────────────────────────────────────────────
  for (const [groupId] of Object.entries(GROUPS)) {
    const section = document.createElement('section');
    section.className = 'group-section';
    section.innerHTML = `<h2 class="group-title">Groupe ${groupId}</h2>`;

    for (const match of MATCHES.filter(m => m.group === groupId)) {
      section.appendChild(buildMatchCard(match, pseudo));
    }
    container.appendChild(section);
  }

  // ── Phase éliminatoire ────────────────────────────────────────────────────
  if (knockoutMatches.length > 0) {
    const koHeader = document.createElement('div');
    koHeader.className = 'ko-header';
    koHeader.innerHTML = '<h2>🏆 Phase éliminatoire</h2>';
    container.appendChild(koHeader);

    const ROUND_ORDER = ['1/32', '1/16', '1/4', '1/2', 'Petite finale', 'Finale'];
    const byRound = {};
    knockoutMatches.forEach(m => {
      (byRound[m.round] = byRound[m.round] || []).push(m);
    });

    for (const round of ROUND_ORDER) {
      if (!byRound[round]) continue;
      const mult = ROUND_MULTIPLIERS[round] || 1;
      const section = document.createElement('section');
      section.className = 'group-section';
      const label = round === '1/4' ? 'Quarts de finale'
        : round === '1/2' ? 'Demi-finales'
        : round === '1/32' ? '1/32 de finale'
        : round === '1/16' ? '1/16 de finale'
        : round;
      section.innerHTML = `<h2 class="group-title">
        ${label}
        ${mult > 1 ? `<span class="round-mult-badge">×${mult} pts</span>` : ''}
      </h2>`;
      byRound[round].forEach(m => section.appendChild(buildMatchCard(m, pseudo, mult)));
      container.appendChild(section);
    }
  }

  attachCardHandlers(container, pseudo);
}

async function savePronostic(pseudo, matchId) {
  const i1 = document.querySelector(`.score-input[data-match="${matchId}"][data-side="1"]`);
  const i2 = document.querySelector(`.score-input[data-match="${matchId}"][data-side="2"]`);
  const status = document.getElementById(`status-${matchId}`);
  if (!i1 || !i2) return;

  const s1 = parseInt(i1.value, 10);
  const s2 = parseInt(i2.value, 10);
  if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
    status.textContent = '⚠ Score invalide'; return;
  }

  status.textContent = '…';
  try {
    await setDoc(doc(db, 'pronostics', `${pseudo}_${matchId}`), {
      userId: pseudo, matchId, score1: s1, score2: s2, submittedAt: serverTimestamp(),
    });
    userPronostics[matchId] = { userId: pseudo, matchId, score1: s1, score2: s2 };
    status.textContent = '✓ Sauvegardé';
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch (err) {
    console.error(err);
    status.textContent = '✗ Erreur';
  }
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

async function loadLeaderboard() {
  const container = document.getElementById('leaderboard-body');
  container.innerHTML = '<tr><td colspan="4">Chargement…</td></tr>';

  try {
    const [pronoSnap, resultSnap, usersSnap, koSnap] = await Promise.all([
      getDocs(collection(db, 'pronostics')),
      getDocs(collection(db, 'results')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'matches_extra')),
    ]);

    const results = {};
    resultSnap.forEach(d => { results[d.id] = d.data(); });

    // Multiplicateurs pour les matchs éliminatoires
    const multipliers = {};
    koSnap.forEach(d => {
      multipliers[d.id] = ROUND_MULTIPLIERS[d.data().round] || 1;
    });

    const userPoints = {};
    const userPredCount = {};
    const userExact = {};

    pronoSnap.forEach(d => {
      const p = d.data();
      if (!userPoints[p.userId]) {
        userPoints[p.userId] = 0; userPredCount[p.userId] = 0; userExact[p.userId] = 0;
      }
      userPredCount[p.userId]++;
      const pts = calcPoints(p, results[p.matchId] || {});
      if (pts !== null) {
        const mult = multipliers[p.matchId] || 1;
        userPoints[p.userId] += pts * mult;
        if (pts === 3) userExact[p.userId]++;
      }
    });

    usersSnap.forEach(d => {
      const u = d.data().pseudo;
      if (!userPoints[u]) { userPoints[u] = 0; userPredCount[u] = 0; userExact[u] = 0; }
    });

    const ranked = Object.entries(userPoints)
      .sort(([, a], [, b]) => b - a)
      .map(([pseudo, pts], i) => ({
        rank: i + 1, pseudo, pts,
        pred: userPredCount[pseudo], exact: userExact[pseudo],
      }));

    if (ranked.length === 0) {
      container.innerHTML = '<tr><td colspan="4">Aucun participant pour l\'instant.</td></tr>';
      return;
    }

    container.innerHTML = ranked.map(r => `
      <tr class="${r.rank <= 3 ? 'top-' + r.rank : ''}">
        <td class="rank">${r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}</td>
        <td class="pseudo">${escapeHtml(r.pseudo)}</td>
        <td class="pts"><strong>${r.pts}</strong> pts</td>
        <td class="detail">${r.exact} exacts / ${r.pred} pronos</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<tr><td colspan="4">Erreur de chargement.</td></tr>';
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

async function initApp() {
  const user = getSession();
  if (!user) { showView('view-login'); return; }

  document.getElementById('username-display').textContent = user.pseudo;
  document.getElementById('nav').hidden = false;
  showView('view-predictions');

  await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches()]);
  renderPredictions(user.pseudo);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  document.getElementById('btn-logout').addEventListener('click', () => {
    clearSession();
    document.getElementById('nav').hidden = true;
    showView('view-login');
  });

  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const view = btn.dataset.view;
      showView(view);
      if (view === 'view-leaderboard') await loadLeaderboard();
      if (view === 'view-predictions') {
        const user = getSession();
        if (user) {
          await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches()]);
          renderPredictions(user.pseudo);
        }
      }
    });
  });

  initApp();
});
