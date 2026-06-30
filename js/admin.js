import { db, ADMIN_PASSWORD_HASH } from './firebase-config.js';
import { MATCHES, GROUPS, ROUND_MULTIPLIERS, TOP_SCORERS, calcTotalGoalsPoints, TOTAL_GOALS_HISTORY, TOTAL_GOALS_2026_MATCHES } from './data.js';
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
  buildWinnerSelect();
  buildTopScorerSelect();
  renderMatchResults();
  loadCodes();
  renderKnockoutMatches();
  renderWinnerAdmin();
  renderTotalGoalsAdmin();
  renderTopScorerAdmin();
  renderLatePronostics();
  renderMissingPronostics();
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
  '1/16': '1/16 de finale',
  '1/8':  '1/8 de finale',
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

// ─── Vainqueur ────────────────────────────────────────────────────────────────

function buildWinnerSelect() {
  const teams = Object.values(GROUPS)
    .flatMap(g => g.teams)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  const sel = document.getElementById('winner-admin-select');
  teams.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.dataset.flag = t.flag;
    opt.dataset.name = t.name;
    opt.dataset.namesq = t.namesq || '';
    opt.textContent = `${t.flag} ${t.name}`;
    sel.appendChild(opt);
  });
}

async function renderWinnerAdmin() {
  const [resultSnap, pronoSnap] = await Promise.all([
    getDoc(doc(db, 'special_results', 'winner')),
    getDocs(collection(db, 'special_pronostics')),
  ]);

  const currentResultEl = document.getElementById('winner-current-result');
  if (resultSnap.exists()) {
    const r = resultSnap.data();
    currentResultEl.innerHTML = `
      <div class="admin-info-box">
        ✅ Vainqueur enregistré : <strong>${r.flag || ''} ${escapeHtml(r.teamName)}</strong>
        <button class="btn-sm danger" id="winner-del-result" style="margin-left:12px">✕ Supprimer</button>
      </div>`;
    document.getElementById('winner-del-result').addEventListener('click', async () => {
      if (!confirm('Supprimer le résultat vainqueur ?')) return;
      await deleteDoc(doc(db, 'special_results', 'winner'));
      renderWinnerAdmin();
    });
    document.getElementById('winner-admin-select').value = r.teamId;
  } else {
    currentResultEl.innerHTML = '<p class="muted" style="font-size:.85rem">Aucun vainqueur enregistré pour l\'instant.</p>';
  }

  const tbody = document.getElementById('winner-pronos-body');
  tbody.innerHTML = '';
  const pronos = [];
  pronoSnap.forEach(d => { const p = d.data(); if (p.teamId) pronos.push(p); });
  pronos.sort((a, b) => a.userId.localeCompare(b.userId));

  if (pronos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="muted" style="text-align:center;padding:12px">Aucun pronostic saisi.</td></tr>';
    return;
  }
  for (const p of pronos) {
    const tr = document.createElement('tr');
    const isCorrect = resultSnap.exists() && p.teamId === resultSnap.data().teamId;
    tr.innerHTML = `
      <td><strong>${escapeHtml(p.userId)}</strong></td>
      <td>${p.flag || ''} ${escapeHtml(p.teamName)} ${isCorrect ? '<span class="gsb-ok">🏆</span>' : ''}</td>`;
    tbody.appendChild(tr);
  }
}

async function handleSaveWinner(e) {
  e.preventDefault();
  const sel   = document.getElementById('winner-admin-select');
  const errEl = document.getElementById('winner-admin-error');
  if (!sel.value) { errEl.textContent = 'Sélectionne une équipe.'; return; }

  const teamId = sel.value;
  const team   = Object.values(GROUPS).flatMap(g => g.teams).find(t => t.id === teamId);
  if (!team) { errEl.textContent = 'Équipe introuvable.'; return; }

  errEl.textContent = '';
  try {
    await setDoc(doc(db, 'special_results', 'winner'), {
      teamId:    team.id,
      teamName:  team.name,
      teamNamesq: team.namesq || '',
      flag:      team.flag,
      updatedAt: serverTimestamp(),
    });
    renderWinnerAdmin();
  } catch (err) {
    console.error(err);
    errEl.textContent = `Erreur : ${err.message}`;
  }
}

// ─── Nombre de buts total ─────────────────────────────────────────────────────

function renderTotalGoalsHistory() {
  const el = document.getElementById('tg-history-admin');
  if (!el) return;
  const avgPerMatch = TOTAL_GOALS_HISTORY.reduce((s, e) => s + e.goals / e.matches, 0) / TOTAL_GOALS_HISTORY.length;
  const projected   = Math.round(avgPerMatch * TOTAL_GOALS_2026_MATCHES);
  const rows = TOTAL_GOALS_HISTORY.map(e =>
    `<tr>
      <td>${e.year} · ${e.host}</td>
      <td class="tgh-center">${e.matches}</td>
      <td class="tgh-center"><strong>${e.goals}</strong></td>
      <td class="tgh-center">${(e.goals / e.matches).toFixed(2)}</td>
     </tr>`).join('');
  el.innerHTML = `
    <div class="tg-history">
      <div class="tgh-title">📊 Éditions précédentes</div>
      <table class="tgh-table">
        <thead><tr><th>Édition</th><th>Matchs</th><th>Buts</th><th>Moy.</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="tgh-note">
        ⚽ <strong>2026 : ${TOTAL_GOALS_2026_MATCHES} matchs</strong> (48 équipes, contre 64 en 2022)
        — projection : <strong>~${projected} buts</strong> (${avgPerMatch.toFixed(2)} buts/match en moy.)
      </div>
    </div>`;
}

async function renderTotalGoalsAdmin() {
  renderTotalGoalsHistory();
  const [resultSnap, pronoSnap] = await Promise.all([
    getDoc(doc(db, 'special_results', 'totalgoals')),
    getDocs(collection(db, 'special_pronostics')),
  ]);

  const currentResultEl = document.getElementById('tg-current-result');
  const official = resultSnap.exists() ? resultSnap.data().totalGoals : null;

  if (official != null) {
    currentResultEl.innerHTML = `
      <div class="admin-info-box">
        ✅ Nombre de buts enregistré : <strong>${official} buts</strong>
        <button class="btn-sm danger" id="tg-del-result" style="margin-left:12px">✕ Supprimer</button>
      </div>`;
    document.getElementById('tg-del-result').addEventListener('click', async () => {
      if (!confirm('Supprimer le résultat nombre de buts ?')) return;
      await deleteDoc(doc(db, 'special_results', 'totalgoals'));
      renderTotalGoalsAdmin();
    });
    document.getElementById('tg-admin-input').value = official;
  } else {
    currentResultEl.innerHTML = '<p class="muted" style="font-size:.85rem">Aucun résultat enregistré pour l\'instant.</p>';
  }

  const tbody = document.getElementById('tg-pronos-body');
  tbody.innerHTML = '';
  const pronos = [];
  pronoSnap.forEach(d => { const p = d.data(); if (p.totalGoals != null) pronos.push(p); });
  pronos.sort((a, b) => a.userId.localeCompare(b.userId));

  if (pronos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="muted" style="text-align:center;padding:12px">Aucun pronostic saisi.</td></tr>';
    return;
  }
  for (const p of pronos) {
    const diff = official != null ? Math.abs(p.totalGoals - official) : null;
    const pts  = official != null ? calcTotalGoalsPoints(p.totalGoals, official) : null;
    const icon = pts === 10 ? '🎯' : pts === 5 ? '✅' : pts === 2 ? '🟡' : pts === 0 ? '❌' : '';
    const tr   = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(p.userId)}</strong></td>
      <td>${p.totalGoals} buts</td>
      <td>${diff != null ? `±${diff}` : '–'}</td>
      <td>${pts != null ? `${icon} ${pts} pts` : '–'}</td>`;
    tbody.appendChild(tr);
  }
}

async function handleSaveTotalGoals(e) {
  e.preventDefault();
  const input = document.getElementById('tg-admin-input');
  const errEl = document.getElementById('tg-admin-error');
  const val   = parseInt(input.value, 10);
  if (isNaN(val) || val < 0) { errEl.textContent = 'Nombre invalide.'; return; }

  errEl.textContent = '';
  try {
    await setDoc(doc(db, 'special_results', 'totalgoals'), {
      totalGoals: val, updatedAt: serverTimestamp(),
    });
    renderTotalGoalsAdmin();
  } catch (err) {
    console.error(err);
    errEl.textContent = `Erreur : ${err.message}`;
  }
}

// ─── Meilleur buteur ──────────────────────────────────────────────────────────

function buildTopScorerSelect() {
  const sel = document.getElementById('ts-admin-select');
  TOP_SCORERS.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.dataset.flag = p.flag;
    opt.dataset.name = p.name;
    opt.textContent = `${p.flag} ${p.name}${p.country ? ` (${p.country})` : ''}`;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    document.getElementById('ts-admin-other-wrap').hidden = sel.value !== 'other';
  });
}

async function renderTopScorerAdmin() {
  const [resultSnap, pronoSnap] = await Promise.all([
    getDoc(doc(db, 'special_results', 'topscorer')),
    getDocs(collection(db, 'special_pronostics')),
  ]);

  const currentResultEl = document.getElementById('ts-current-result');
  if (resultSnap.exists()) {
    const r = resultSnap.data();
    currentResultEl.innerHTML = `
      <div class="admin-info-box">
        ✅ Meilleur buteur enregistré : <strong>${r.flag || ''} ${escapeHtml(r.playerName || r.playerId)}</strong>
        <button class="btn-sm danger" id="ts-del-result" style="margin-left:12px">✕ Supprimer</button>
      </div>`;
    document.getElementById('ts-del-result').addEventListener('click', async () => {
      if (!confirm('Supprimer le résultat meilleur buteur ?')) return;
      await deleteDoc(doc(db, 'special_results', 'topscorer'));
      renderTopScorerAdmin();
    });
    const sel = document.getElementById('ts-admin-select');
    sel.value = r.playerId;
    if (r.playerId === 'other') {
      document.getElementById('ts-admin-other-wrap').hidden = false;
      document.getElementById('ts-admin-other-input').value = r.playerName || '';
    }
  } else {
    currentResultEl.innerHTML = '<p class="muted" style="font-size:.85rem">Aucun meilleur buteur enregistré pour l\'instant.</p>';
  }

  const tbody = document.getElementById('ts-pronos-body');
  tbody.innerHTML = '';
  const pronos = [];
  pronoSnap.forEach(d => { const p = d.data(); if (p.playerId) pronos.push(p); });
  pronos.sort((a, b) => a.userId.localeCompare(b.userId));

  if (pronos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="muted" style="text-align:center;padding:12px">Aucun pronostic saisi.</td></tr>';
    return;
  }
  for (const p of pronos) {
    const tr = document.createElement('tr');
    const playerDisplay = `${p.flag || ''} ${escapeHtml(p.playerName || p.playerId)}`;
    const isCorrect = resultSnap.exists() && (
      p.playerId === resultSnap.data().playerId ||
      (p.playerId === 'other' && p.playerName && p.playerName.toLowerCase() === (resultSnap.data().playerName || '').toLowerCase())
    );
    tr.innerHTML = `
      <td><strong>${escapeHtml(p.userId)}</strong></td>
      <td>${playerDisplay} ${isCorrect ? '<span class="gsb-ok">🥇</span>' : ''}</td>`;
    tbody.appendChild(tr);
  }
}

async function handleSaveTopScorer(e) {
  e.preventDefault();
  const sel   = document.getElementById('ts-admin-select');
  const errEl = document.getElementById('ts-admin-error');
  if (!sel.value) { errEl.textContent = 'Sélectionne un joueur.'; return; }

  const playerId = sel.value;
  let playerName, flag;

  if (playerId === 'other') {
    playerName = document.getElementById('ts-admin-other-input').value.trim();
    if (!playerName) { errEl.textContent = 'Saisis le nom du joueur.'; return; }
    flag = '🌍';
  } else {
    const opt = sel.options[sel.selectedIndex];
    playerName = opt.dataset.name;
    flag = opt.dataset.flag;
  }

  errEl.textContent = '';
  await setDoc(doc(db, 'special_results', 'topscorer'), {
    playerId, playerName, flag, updatedAt: serverTimestamp(),
  });
  renderTopScorerAdmin();
}

// ─── Pronos tardifs ───────────────────────────────────────────────────────────

const FMT_FULL = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: '2-digit', month: 'short',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});

function formatDelay(ms) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `+${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h < 24) return `+${h}h${String(m).padStart(2, '0')}`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return `+${d}j ${rh}h${String(m).padStart(2, '0')}`;
}

async function renderLatePronostics() {
  const tbody      = document.getElementById('late-pronos-body');
  const summaryEl  = document.getElementById('late-summary');
  const badgeEl    = document.getElementById('late-count-badge');
  tbody.innerHTML  = '<tr><td colspan="6" class="muted" style="text-align:center;padding:16px">Chargement…</td></tr>';

  const [pronoSnap, koSnap] = await Promise.all([
    getDocs(collection(db, 'pronostics')),
    getDocs(collection(db, 'matches_extra')),
  ]);

  const matchMap = {};
  MATCHES.forEach(m => { matchMap[m.id] = m; });
  koSnap.forEach(d => { matchMap[d.id] = { id: d.id, ...d.data() }; });

  const late = [];
  pronoSnap.forEach(d => {
    const p = d.data();
    const match = matchMap[p.matchId];
    if (!match || !p.submittedAt) return;
    const matchMs = new Date(match.date).getTime();
    const pronoMs = p.submittedAt.toMillis ? p.submittedAt.toMillis() : p.submittedAt.seconds * 1000;
    if (pronoMs > matchMs) late.push({ ...p, match, pronoMs, matchMs });
  });

  // Badge dans l'onglet
  if (late.length > 0) {
    badgeEl.textContent = late.length;
    badgeEl.hidden = false;
  } else {
    badgeEl.hidden = true;
  }

  tbody.innerHTML = '';

  if (late.length === 0) {
    summaryEl.innerHTML = '<div class="admin-info-box" style="border-color:#00c853;background:rgba(0,200,83,.08)">✅ Aucun pronostic tardif détecté.</div>';
    tbody.innerHTML = '<tr><td colspan="6" class="muted" style="text-align:center;padding:16px">–</td></tr>';
    return;
  }

  summaryEl.innerHTML = `<div class="admin-info-box" style="border-color:#ef4444;background:rgba(239,68,68,.08)">⚠️ <strong>${late.length} pronostic${late.length > 1 ? 's' : ''} tardif${late.length > 1 ? 's' : ''}</strong> détecté${late.length > 1 ? 's' : ''}.</div>`;

  late.sort((a, b) => (b.pronoMs - b.matchMs) - (a.pronoMs - a.matchMs));

  for (const p of late) {
    const delay = p.pronoMs - p.matchMs;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(p.userId)}</strong></td>
      <td style="font-size:.85rem">${p.match.team1.flag} ${escapeHtml(p.match.team1.name)} vs ${p.match.team2.flag} ${escapeHtml(p.match.team2.name)}</td>
      <td><strong>${p.score1} – ${p.score2}</strong></td>
      <td style="font-size:.78rem;color:var(--muted)">${FMT_FULL.format(new Date(p.matchMs))}</td>
      <td style="font-size:.78rem;color:var(--muted)">${FMT_FULL.format(new Date(p.pronoMs))}</td>
      <td><span class="admin-late-badge">${formatDelay(delay)}</span></td>
    `;
    tbody.appendChild(tr);
  }
}

// ─── Pronostics manquants ─────────────────────────────────────────────────────

async function renderMissingPronostics() {
  const summaryEl = document.getElementById('missing-summary');
  const listEl    = document.getElementById('missing-list');
  const badgeEl   = document.getElementById('missing-count-badge');
  summaryEl.innerHTML = '<div class="admin-info-box">Chargement…</div>';
  listEl.innerHTML = '';

  const [usersSnap, pronoSnap, koSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'pronostics')),
    getDocs(collection(db, 'matches_extra')),
  ]);

  const allMatches = {};
  MATCHES.forEach(m => { allMatches[m.id] = m; });
  koSnap.forEach(d => { allMatches[d.id] = { id: d.id, ...d.data() }; });
  const matchList = Object.values(allMatches).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pronosByUser = {};
  pronoSnap.forEach(d => {
    const p = d.data();
    if (!pronosByUser[p.userId]) pronosByUser[p.userId] = new Set();
    pronosByUser[p.userId].add(p.matchId);
  });

  const users = [];
  usersSnap.forEach(d => users.push(d.data().pseudo || d.id));
  users.sort((a, b) => a.localeCompare(b));

  const now = Date.now();
  const usersWithMissing = [];
  for (const pseudo of users) {
    const predicted = pronosByUser[pseudo] || new Set();
    const missing = matchList.filter(m => !predicted.has(m.id));
    if (missing.length > 0) usersWithMissing.push({ pseudo, missing });
  }

  badgeEl.hidden = usersWithMissing.length === 0;
  badgeEl.textContent = usersWithMissing.length;

  if (usersWithMissing.length === 0) {
    summaryEl.innerHTML = '<div class="admin-info-box" style="border-color:#00c853;background:rgba(0,200,83,.08)">✅ Tous les joueurs ont rempli tous leurs pronostics.</div>';
    return;
  }

  const totalMissing = usersWithMissing.reduce((acc, u) => acc + u.missing.length, 0);
  summaryEl.innerHTML = `<div class="admin-info-box" style="border-color:#ef4444;background:rgba(239,68,68,.08)">
    ⚠️ <strong>${usersWithMissing.length} joueur${usersWithMissing.length > 1 ? 's' : ''}</strong> ont des pronostics manquants
    (<strong>${totalMissing}</strong> au total).
  </div>`;

  listEl.innerHTML = '';
  for (const { pseudo, missing } of usersWithMissing) {
    const stillOpen = missing.filter(m => now < new Date(m.date).getTime());
    const locked    = missing.filter(m => now >= new Date(m.date).getTime());

    const rows = missing.map(m => {
      const isLocked = now >= new Date(m.date).getTime();
      const label = m.team1
        ? `${m.team1.flag} ${m.team1.name} vs ${m.team2.flag} ${m.team2.name}`
        : `Match ${m.id}`;
      const dateStr = FMT.format(new Date(m.date));
      return `<tr>
        <td style="font-size:.85rem">${label}</td>
        <td style="font-size:.78rem;color:var(--muted)">${dateStr}</td>
        <td>${isLocked
          ? '<span class="admin-late-badge">🔒 Verrouillé</span>'
          : '<span style="color:#00c853;font-size:.8rem;font-weight:600">⏳ Encore temps</span>'}</td>
      </tr>`;
    }).join('');

    const block = document.createElement('div');
    block.style.cssText = 'margin-bottom:18px;border:1px solid var(--border);border-radius:8px;overflow:hidden';
    block.innerHTML = `
      <div style="padding:10px 14px;background:var(--card-bg);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <strong>${escapeHtml(pseudo)}</strong>
        <span style="font-size:.8rem;color:var(--muted)">${missing.length} manquant${missing.length > 1 ? 's' : ''}</span>
        ${stillOpen.length > 0 ? `<span style="color:#00c853;font-size:.78rem;font-weight:600">· ${stillOpen.length} encore ouverts</span>` : ''}
        ${locked.length > 0 ? `<span style="color:#ef4444;font-size:.78rem;font-weight:600">· ${locked.length} verrouillé${locked.length > 1 ? 's' : ''}</span>` : ''}
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Match</th><th>Date</th><th>Statut</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`;
    listEl.appendChild(block);
  }
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
  document.getElementById('ts-form').addEventListener('submit', handleSaveTopScorer);
  document.getElementById('winner-form').addEventListener('submit', handleSaveWinner);
  document.getElementById('tg-form').addEventListener('submit', handleSaveTotalGoals);

  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    sessionStorage.removeItem('wc26_admin');
    location.reload();
  });
});
