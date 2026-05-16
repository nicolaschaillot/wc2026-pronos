import { db } from './firebase-config.js';
import { GROUPS, MATCHES, ROUND_MULTIPLIERS, calcPoints } from './data.js';
import { t, getLang, initI18n } from './i18n.js';
import { RULES_HTML } from './rules-content.js';
import {
  doc, getDoc, setDoc, getDocs, deleteDoc, collection, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── Session ─────────────────────────────────────────────────────────────────

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('wc26_user')); } catch { return null; }
}
function saveSession(u) { sessionStorage.setItem('wc26_user', JSON.stringify(u)); }
function clearSession() { sessionStorage.removeItem('wc26_user'); }

// ─── Navigation ──────────────────────────────────────────────────────────────

function renderRules() {
  document.getElementById('rules-content').innerHTML = RULES_HTML[getLang()] || RULES_HTML.fr;
  document.getElementById('btn-rules-back').hidden = !!getSession();
}

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

  if (!pseudo || !code) { errEl.textContent = t('login.err.empty'); return; }

  btn.disabled = true;
  btn.textContent = t('login.checking');
  errEl.textContent = '';

  try {
    const codeRef  = doc(db, 'codes', code);
    const codeSnap = await getDoc(codeRef);

    if (!codeSnap.exists()) { errEl.textContent = t('login.err.invalid'); return; }

    const codeData = codeSnap.data();
    if (codeData.pseudo && codeData.pseudo !== pseudo) {
      errEl.textContent = t('login.err.taken');
      return;
    }

    if (!codeData.pseudo) {
      const userSnap = await getDoc(doc(db, 'users', pseudo));
      if (userSnap.exists() && userSnap.data().code !== code) {
        errEl.textContent = t('login.err.pseudo_taken');
        return;
      }
      await setDoc(codeRef, { pseudo, usedAt: serverTimestamp() }, { merge: true });
      await setDoc(doc(db, 'users', pseudo), { pseudo, code, joinedAt: serverTimestamp() });
    }

    saveSession({ pseudo, code });
    initApp();
  } catch (err) {
    console.error(err);
    errEl.textContent = t('login.err.network');
  } finally {
    btn.disabled = false;
    btn.textContent = t('login.submit');
  }
}

// ─── Predictions ─────────────────────────────────────────────────────────────

let userPronostics   = {};
let knockoutMatches  = [];
let matchResults     = {};
let currentGroupId   = null;
let lastResultUpdate = null;

async function loadResults() {
  const snap = await getDocs(collection(db, 'results'));
  matchResults = {};
  lastResultUpdate = null;
  snap.forEach(d => {
    const data = d.data();
    matchResults[d.id] = data;
    const ts = data.updatedAt;
    if (ts) {
      const ms = ts.toMillis ? ts.toMillis() : ts.seconds * 1000;
      if (!lastResultUpdate || ms > lastResultUpdate) lastResultUpdate = ms;
    }
  });
}

function renderLastUpdate() {
  const text = lastResultUpdate
    ? `${t('last.update')} : ${(FMT[getLang()] || FMT.fr).format(new Date(lastResultUpdate))}`
    : t('last.update.none');
  document.querySelectorAll('.last-update-info').forEach(el => { el.textContent = text; });
}

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

// France et Albanie partagent UTC+2 en été — on fixe Europe/Paris.
// Deux formateurs pour que les noms de mois s'affichent dans la bonne langue.
const FMT = {
  fr: new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
  sq: new Intl.DateTimeFormat('sq',    { timeZone: 'Europe/Paris', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
};

function formatDate(isoStr) {
  return (FMT[getLang()] || FMT.fr).format(new Date(isoStr));
}

function buildMatchCard(match, pseudo, multiplier = 1) {
  const prono  = userPronostics[match.id];
  const result = matchResults[match.id];
  const locked = isLocked(match);
  const s1 = prono?.score1 ?? '';
  const s2 = prono?.score2 ?? '';

  const card = document.createElement('div');
  card.className = `match-card${locked ? ' locked' : ''}`;

  const multBadge = multiplier > 1
    ? `<span class="multiplier-badge">×${multiplier}</span>` : '';

  // ── Ligne résultat officiel + points ──────────────────────────────────────
  let resultHtml = '';
  if (locked && result) {
    const basePts = prono ? calcPoints(prono, result) : null;
    const pts     = basePts !== null ? basePts * multiplier : null;
    const icon    = basePts === 3 ? '🎯' : basePts === 1 ? '✅' : basePts === 0 ? '❌' : '';
    const cls     = basePts === 3 ? 'pts-exact' : basePts === 1 ? 'pts-correct' : basePts === 0 ? 'pts-wrong' : '';
    const ptsText = pts !== null
      ? `<span class="result-pts ${cls}">${icon} ${pts} ${t('lb.pts')}</span>`
      : '';
    resultHtml = `
      <div class="result-row">
        <span class="result-label">${t('result.label')} :</span>
        <span class="result-score">${result.score1} – ${result.score2}</span>
        ${ptsText}
      </div>`;
  }

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
    ${resultHtml}
    ${!locked ? `<div class="save-row">
      <button class="btn-save" data-match="${match.id}">${t('save')}</button>
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
    input.addEventListener('blur', () => {
      const matchId = input.dataset.match;
      const i1 = container.querySelector(`.score-input[data-match="${matchId}"][data-side="1"]`);
      const i2 = container.querySelector(`.score-input[data-match="${matchId}"][data-side="2"]`);
      const v1 = i1?.value ?? '', v2 = i2?.value ?? '';
      // Sauvegarder si les deux sont remplis, supprimer si les deux sont vides
      if ((v1 !== '' && v2 !== '') || (v1 === '' && v2 === '')) savePronostic(pseudo, matchId);
    });
  });
}

function showGroup(groupId) {
  currentGroupId = groupId;
  document.querySelectorAll('#predictions-content > *').forEach(el => { el.hidden = true; });
  const target = document.getElementById(`group-section-${groupId}`);
  if (target) target.hidden = false;
  document.querySelectorAll('.group-sidebar-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.group === groupId);
  });
}

function renderPredictions(pseudo) {
  const sidebar = document.getElementById('group-sidebar');
  const content = document.getElementById('predictions-content');
  sidebar.innerHTML = '';
  content.innerHTML = '';

  // ── Phase de groupes ──────────────────────────────────────────────────────
  for (const [groupId] of Object.entries(GROUPS)) {
    const groupMatches = MATCHES.filter(m => m.group === groupId);
    const total   = groupMatches.length;
    const saved   = groupMatches.filter(m => userPronostics[m.id]).length;
    const missing = groupMatches.filter(m => !isLocked(m) && !userPronostics[m.id]).length;

    const section = document.createElement('section');
    section.className = 'group-section';
    section.id = `group-section-${groupId}`;
    section.hidden = true;
    section.innerHTML = `<h2 class="group-title">${t('group.label')} ${groupId}</h2>`;
    for (const match of groupMatches) section.appendChild(buildMatchCard(match, pseudo));
    content.appendChild(section);

    const progressBadge = missing > 0
      ? `<span class="gsb-badge" title="${t('sidebar.missing', missing)}">${saved}/${total}</span>`
      : `<span class="gsb-ok" title="${t('sidebar.complete')}">✓</span>`;

    const btn = document.createElement('button');
    btn.className = 'group-sidebar-btn';
    btn.dataset.group = groupId;
    btn.innerHTML = `
      <div class="gsb-header">
        <span class="gsb-letter">${t('group.label')} ${groupId}</span>
        ${progressBadge}
      </div>
      <div class="gsb-teams">
        ${GROUPS[groupId].teams.map(team => `<span class="gsb-team">${team.flag} ${team.name}</span>`).join('')}
      </div>`;
    btn.addEventListener('click', () => showGroup(groupId));
    sidebar.appendChild(btn);
  }

  // ── Phase éliminatoire ────────────────────────────────────────────────────
  if (knockoutMatches.length > 0) {
    const koTotal   = knockoutMatches.length;
    const koSaved   = knockoutMatches.filter(m => userPronostics[m.id]).length;
    const koMissing = knockoutMatches.filter(m => !isLocked(m) && !userPronostics[m.id]).length;

    const koContainer = document.createElement('div');
    koContainer.id = 'group-section-KO';
    koContainer.hidden = true;
    koContainer.innerHTML = `<div class="ko-header"><h2>${t('ko.title')}</h2></div>`;

    const ROUND_ORDER = ['1/32', '1/16', '1/4', '1/2', 'Petite finale', 'Finale'];
    const byRound = {};
    knockoutMatches.forEach(m => { (byRound[m.round] = byRound[m.round] || []).push(m); });

    for (const round of ROUND_ORDER) {
      if (!byRound[round]) continue;
      const mult = ROUND_MULTIPLIERS[round] || 1;
      const section = document.createElement('section');
      section.className = 'group-section';
      const label = t(`round.${round}`) || round;
      section.innerHTML = `<h2 class="group-title">
        ${label}
        ${mult > 1 ? `<span class="round-mult-badge">×${mult} pts</span>` : ''}
      </h2>`;
      byRound[round].forEach(m => section.appendChild(buildMatchCard(m, pseudo, mult)));
      koContainer.appendChild(section);
    }
    content.appendChild(koContainer);

    const koBtn = document.createElement('button');
    koBtn.className = 'group-sidebar-btn gsb-ko';
    koBtn.dataset.group = 'KO';
    koBtn.innerHTML = `
      <div class="gsb-header">
        <span class="gsb-letter">${t('ko.elim')}</span>
        ${koMissing > 0 ? `<span class="gsb-badge" title="${t('sidebar.missing', koMissing)}">${koSaved}/${koTotal}</span>` : `<span class="gsb-ok" title="${t('sidebar.complete')}">✓</span>`}
      </div>`;
    koBtn.addEventListener('click', () => showGroup('KO'));
    sidebar.appendChild(koBtn);
  }

  const defaultGroup = (currentGroupId && document.getElementById(`group-section-${currentGroupId}`))
    ? currentGroupId : Object.keys(GROUPS)[0];
  showGroup(defaultGroup);
  attachCardHandlers(content, pseudo);
}

async function savePronostic(pseudo, matchId) {
  const i1 = document.querySelector(`.score-input[data-match="${matchId}"][data-side="1"]`);
  const i2 = document.querySelector(`.score-input[data-match="${matchId}"][data-side="2"]`);
  const status = document.getElementById(`status-${matchId}`);
  if (!i1 || !i2) return;

  // Les deux champs vides → suppression du prono
  if (i1.value === '' && i2.value === '') {
    if (userPronostics[matchId]) {
      try {
        await deleteDoc(doc(db, 'pronostics', `${pseudo}_${matchId}`));
        delete userPronostics[matchId];
        updateSidebarBadge(matchId);
      } catch (err) { console.error(err); }
    }
    return;
  }

  // Un seul champ vide → on attend que l'utilisateur finisse
  if (i1.value === '' || i2.value === '') return;

  const s1 = parseInt(i1.value, 10);
  const s2 = parseInt(i2.value, 10);
  if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
    if (status) status.textContent = t('score.invalid'); return;
  }

  status.textContent = '…';
  try {
    await setDoc(doc(db, 'pronostics', `${pseudo}_${matchId}`), {
      userId: pseudo, matchId, score1: s1, score2: s2, submittedAt: serverTimestamp(),
    });
    userPronostics[matchId] = { userId: pseudo, matchId, score1: s1, score2: s2 };
    updateSidebarBadge(matchId);
    status.textContent = t('saved');
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch (err) {
    console.error(err);
    status.textContent = t('save.error');
  }
}

function updateSidebarBadge(matchId) {
  const groupId = MATCHES.find(m => m.id === matchId)?.group ?? 'KO';
  const btn = document.querySelector(`.group-sidebar-btn[data-group="${groupId}"]`);
  if (!btn) return;

  const matches = groupId === 'KO'
    ? knockoutMatches
    : MATCHES.filter(m => m.group === groupId);

  const total   = matches.length;
  const saved   = matches.filter(m => userPronostics[m.id]).length;
  const missing = matches.filter(m => !isLocked(m) && !userPronostics[m.id]).length;

  const badge = btn.querySelector('.gsb-badge, .gsb-ok');
  if (!badge) return;

  if (missing > 0) {
    badge.className   = 'gsb-badge';
    badge.title       = t('sidebar.missing', missing);
    badge.textContent = `${saved}/${total}`;
  } else {
    badge.className   = 'gsb-ok';
    badge.title       = t('sidebar.complete');
    badge.textContent = '✓';
  }
}

// ─── My Results ──────────────────────────────────────────────────────────────

function renderMyResults() {
  const content = document.getElementById('results-content');
  content.innerHTML = '';

  let grandTotal = 0;
  let hasAny = false;

  function buildSection(title, matches, getMultiplier) {
    const finished = matches.filter(m => matchResults[m.id]);
    if (finished.length === 0) return null;
    hasAny = true;

    let sectionPts = 0;
    const rows = finished.map(m => {
      const result   = matchResults[m.id];
      const prono    = userPronostics[m.id];
      const mult     = getMultiplier(m);
      const basePts  = prono ? calcPoints(prono, result) : null;
      const pts      = basePts !== null ? basePts * mult : null;
      if (pts !== null) sectionPts += pts;

      const pronoStr = prono ? `${prono.score1} – ${prono.score2}` : `<span class="muted">–</span>`;
      const icon     = basePts === 3 ? '🎯' : basePts === 1 ? '✅' : basePts === 0 ? '❌' : '';
      const cls      = basePts === 3 ? 'pts-exact' : basePts === 1 ? 'pts-correct' : basePts === 0 ? 'pts-wrong' : '';
      const ptsStr   = pts !== null
        ? `<span class="result-pts ${cls}">${icon} ${pts}</span>`
        : `<span class="muted">–</span>`;

      return `<tr>
        <td class="res-match">${m.team1.flag} ${m.team1.name} – ${m.team2.flag} ${m.team2.name}</td>
        <td class="res-prono">${pronoStr}</td>
        <td class="res-result"><strong>${result.score1} – ${result.score2}</strong></td>
        <td class="res-pts">${ptsStr}</td>
      </tr>`;
    }).join('');

    grandTotal += sectionPts;

    const section = document.createElement('div');
    section.className = 'results-section';
    section.innerHTML = `
      <h3 class="results-group-title">${title}</h3>
      <div class="table-wrap">
        <table class="results-table">
          <thead><tr>
            <th>Match</th>
            <th>${t('results.col.prono')}</th>
            <th>${t('results.col.result')}</th>
            <th>${t('results.col.pts')}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    return section;
  }

  // Phase de groupes
  for (const [groupId] of Object.entries(GROUPS)) {
    const groupMatches = MATCHES.filter(m => m.group === groupId);
    const section = buildSection(`${t('group.label')} ${groupId}`, groupMatches, () => 1);
    if (section) content.appendChild(section);
  }

  // Phase éliminatoire par tour
  if (knockoutMatches.length > 0) {
    const ROUND_ORDER = ['1/32', '1/16', '1/4', '1/2', 'Petite finale', 'Finale'];
    const byRound = {};
    knockoutMatches.forEach(m => { (byRound[m.round] = byRound[m.round] || []).push(m); });

    for (const round of ROUND_ORDER) {
      if (!byRound[round]) continue;
      const mult = ROUND_MULTIPLIERS[round] || 1;
      const label = t(`round.${round}`) + (mult > 1 ? ` ×${mult}` : '');
      const section = buildSection(label, byRound[round], () => mult);
      if (section) content.appendChild(section);
    }
  }

  if (!hasAny) {
    content.innerHTML = `<p class="muted" style="text-align:center;padding:32px">${t('results.empty')}</p>`;
    return;
  }

  const totalEl = document.createElement('div');
  totalEl.className = 'results-total';
  totalEl.innerHTML = `<span>${t('results.total')} :</span> <strong>${grandTotal} ${t('lb.pts')}</strong>`;
  content.appendChild(totalEl);
  renderLastUpdate();
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

async function loadLeaderboard() {
  const container = document.getElementById('leaderboard-body');
  container.innerHTML = `<tr><td colspan="4">${t('lb.loading')}</td></tr>`;

  try {
    const [pronoSnap, resultSnap, usersSnap, koSnap] = await Promise.all([
      getDocs(collection(db, 'pronostics')),
      getDocs(collection(db, 'results')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'matches_extra')),
    ]);

    const results = {};
    resultSnap.forEach(d => {
      const data = d.data();
      results[d.id] = data;
      const ts = data.updatedAt;
      if (ts) {
        const ms = ts.toMillis ? ts.toMillis() : ts.seconds * 1000;
        if (!lastResultUpdate || ms > lastResultUpdate) lastResultUpdate = ms;
      }
    });

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
      container.innerHTML = `<tr><td colspan="4">${t('lb.empty')}</td></tr>`;
      return;
    }

    container.innerHTML = ranked.map(r => `
      <tr class="${r.rank <= 3 ? 'top-' + r.rank : ''}">
        <td class="rank">${r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}</td>
        <td class="pseudo">${escapeHtml(r.pseudo)}</td>
        <td class="pts"><strong>${r.pts}</strong> ${t('lb.pts')}</td>
        <td class="detail">${r.exact} ${t('lb.exacts')} / ${r.pred} ${t('lb.pronos')}</td>
      </tr>
    `).join('');
    renderLastUpdate();
  } catch (err) {
    console.error(err);
    container.innerHTML = `<tr><td colspan="4">${t('lb.error')}</td></tr>`;
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
  document.getElementById('btn-logout').hidden = false;
  showView('view-predictions');

  await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults()]);
  renderPredictions(user.pseudo);
}

document.addEventListener('DOMContentLoaded', () => {
  initI18n();

  document.getElementById('login-form').addEventListener('submit', handleLogin);

  document.getElementById('btn-show-rules').addEventListener('click', e => {
    e.preventDefault();
    showView('view-rules');
    renderRules();
  });

  document.getElementById('btn-rules-back').addEventListener('click', () => {
    showView('view-login');
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    clearSession();
    document.getElementById('nav').hidden = true;
    document.getElementById('btn-logout').hidden = true;
    showView('view-login');
  });

  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const view = btn.dataset.view;
      showView(view);
      if (view === 'view-rules') { renderRules(); return; }
      if (view === 'view-leaderboard') await loadLeaderboard();
      if (view === 'view-results') {
        const user = getSession();
        if (user) {
          await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults()]);
          renderMyResults();
        }
      }
      if (view === 'view-predictions') {
        const user = getSession();
        if (user) {
          await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults()]);
          renderPredictions(user.pseudo);
        }
      }
    });
  });

  window.addEventListener('wc26:langchange', async () => {
    const user = getSession();
    if (!user) return;
    const activeView = document.querySelector('.view:not([hidden])');
    if (activeView?.id === 'view-predictions') {
      await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults()]);
      renderPredictions(user.pseudo);
    } else if (activeView?.id === 'view-results') {
      await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults()]);
      renderMyResults();
    } else if (activeView?.id === 'view-leaderboard') {
      await loadLeaderboard();
    } else if (activeView?.id === 'view-rules') {
      renderRules();
    }
  });

  initApp();
});
