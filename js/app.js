import { db } from './firebase-config.js';
import { GROUPS, MATCHES, ROUND_MULTIPLIERS, TEAM_NAMES_SQ, calcPoints, TOP_SCORERS, TOP_SCORER_POINTS, TOP_SCORER_LOCK_DATE, WINNER_POINTS, WINNER_LOCK_DATE, TOTAL_GOALS_LOCK_DATE, calcTotalGoalsPoints, TOTAL_GOALS_HISTORY, TOTAL_GOALS_2026_MATCHES } from './data.js';
import { t, getLang, initI18n } from './i18n.js';
import { RULES_HTML } from './rules-content.js';
import {
  doc, getDoc, setDoc, getDocs, deleteDoc, collection, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ─── Session ─────────────────────────────────────────────────────────────────

function getSession() {
  try { return JSON.parse(localStorage.getItem('wc26_user')); } catch { return null; }
}
function saveSession(u) { localStorage.setItem('wc26_user', JSON.stringify(u)); }
function clearSession() { localStorage.removeItem('wc26_user'); }

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

let userPronostics        = {};
let knockoutMatches       = [];
let matchResults          = {};
let matchPronostics       = {};
let currentGroupId        = null;
let lastResultUpdate      = null;
let topScorerPronostic    = null;
let topScorerResult       = null;
let winnerPronostic       = null;
let winnerResult          = null;
let totalGoalsPronostic   = null;
let totalGoalsResult      = null;

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

async function loadAllPronostics() {
  const snap = await getDocs(collection(db, 'pronostics'));
  matchPronostics = {};
  snap.forEach(d => {
    const p = d.data();
    if (!matchPronostics[p.matchId]) matchPronostics[p.matchId] = [];
    matchPronostics[p.matchId].push(p);
  });
}

let _nextMatchInterval = null;
let _nextMatchId       = null;

function formatCountdown(diff) {
  const d  = Math.floor(diff / 86400000);
  const h  = Math.floor((diff % 86400000) / 3600000);
  const m  = Math.floor((diff % 3600000) / 60000);
  const s  = Math.floor((diff % 60000) / 1000);
  if (d >= 1) return `${d}${t('countdown.day')} ${String(h).padStart(2, '0')}${t('countdown.hour')} ${String(m).padStart(2, '0')}min`;
  if (h >= 1) return `${h}${t('countdown.hour')} ${String(m).padStart(2, '0')}min`;
  if (m >= 1) return `${m}min ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

function _pronoHtml(prono) {
  return prono
    ? `<span class="nm-prono-ok">✓ ${prono.score1} – ${prono.score2}</span>`
    : `<span class="nm-prono-warn">${t('next.match.noprono')}</span>`;
}

function refreshNextMatchProno(matchId) {
  if (matchId !== _nextMatchId) return;
  const pronoEl  = document.getElementById('nm-prono');
  const bannerEl = document.getElementById('next-match-banner');
  if (!pronoEl) return;
  const prono = userPronostics[matchId];
  pronoEl.innerHTML = _pronoHtml(prono);
  if (bannerEl) bannerEl.className = `next-match-banner ${prono ? '' : 'nm-warn'}`;
}

function renderTopScorerBanner() {
  const el = document.getElementById('top-scorer-banner');
  if (!el) return;

  const locked  = new Date() >= new Date(TOP_SCORER_LOCK_DATE);
  const prono   = topScorerPronostic;
  const result  = topScorerResult;

  let playerHtml, rightHtml, warnClass = '';

  if (result) {
    const correct = prono && (
      prono.playerId === result.playerId ||
      (prono.playerId === 'other' && prono.playerName && prono.playerName.toLowerCase() === (result.playerName || '').toLowerCase())
    );
    playerHtml = prono
      ? `${prono.flag || ''} <strong>${escapeHtml(prono.playerName || prono.playerId)}</strong>`
      : `<span class="muted">${t('topscorer.noprono')}</span>`;
    rightHtml = correct
      ? `<span class="tsb-pts tsb-correct">🥇 +${TOP_SCORER_POINTS} ${t('lb.pts')}</span>`
      : `<span class="tsb-pts tsb-wrong">❌ ${t('topscorer.wrong')}</span>`;
  } else if (locked) {
    playerHtml = prono
      ? `${prono.flag || ''} <strong>${escapeHtml(prono.playerName || prono.playerId)}</strong>`
      : `<span class="muted">${t('topscorer.noprono')}</span>`;
    rightHtml = `<span class="tsb-lock">🔒</span>`;
  } else {
    if (!prono) {
      warnClass = ' tsb-warn';
      playerHtml = `<span class="nm-prono-warn">⚠ ${t('topscorer.noprono')}</span>`;
    } else {
      playerHtml = `${prono.flag || ''} <strong>${escapeHtml(prono.playerName || prono.playerId)}</strong> <span class="nm-prono-ok">✓</span>`;
    }
    rightHtml = `<span class="tsb-bonus">+${TOP_SCORER_POINTS} pts</span>`;
  }

  el.className = `tsb-banner${warnClass}`;
  el.innerHTML = `
    <div class="nm-label">${t('topscorer.title')}</div>
    <div class="tsb-main">
      <div class="tsb-player">${playerHtml}</div>
      <div class="tsb-right">
        ${rightHtml}
        ${!locked ? `<button class="tsb-btn">${prono ? '✏ Modifier' : '→ Choisir'}</button>` : ''}
      </div>
    </div>`;

  el.onclick = () => showGroup('TS');
}

function renderNextMatchBanner(pseudo) {
  const el = document.getElementById('next-match-banner');
  if (!el) return;

  if (_nextMatchInterval) { clearInterval(_nextMatchInterval); _nextMatchInterval = null; }

  const next = [...MATCHES, ...knockoutMatches]
    .filter(m => new Date(m.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (!next) { el.hidden = true; _nextMatchId = null; return; }

  _nextMatchId = next.id;
  const prono = userPronostics[next.id];

  el.hidden = false;
  el.className = `next-match-banner ${prono ? '' : 'nm-warn'}`;
  el.innerHTML = `
    <div class="nm-label">${t('next.match')}</div>
    <div class="nm-main">
      <div class="nm-left">
        <div class="nm-teams">
          <span>${next.team1.flag} ${tTeam(next.team1)}</span>
          <span class="nm-vs">vs</span>
          <span>${next.team2.flag} ${tTeam(next.team2)}</span>
        </div>
        <div id="nm-prono">${_pronoHtml(prono)}</div>
      </div>
      <div class="nm-countdown-box">
        <div class="nm-date">${formatDate(next.date)}</div>
        <div class="nm-countdown" id="nm-countdown"></div>
      </div>
    </div>`;

  const countdownEl = document.getElementById('nm-countdown');
  const tick = () => {
    const diff = new Date(next.date) - Date.now();
    if (diff <= 0) {
      countdownEl.textContent = '🔒';
      clearInterval(_nextMatchInterval);
      _nextMatchInterval = null;
    } else {
      countdownEl.textContent = `${t('next.match.in')} ${formatCountdown(diff)}`;
    }
  };
  tick();
  _nextMatchInterval = setInterval(tick, 1000);
}

function renderUrgentBanner(pseudo) {
  const banner = document.getElementById('urgent-banner');
  if (!banner) return;
  const now = Date.now();
  const in24h = now + 24 * 3600 * 1000;
  const urgent = [...MATCHES, ...knockoutMatches].filter(m => {
    const ms = new Date(m.date).getTime();
    return ms > now && ms <= in24h;
  });
  if (urgent.length === 0) { banner.hidden = true; return; }
  banner.hidden = false;
  banner.innerHTML = `
    <div class="urgent-title">${t('urgent.title')}</div>
    <div class="urgent-list">
      ${urgent.map(m => {
        const hasProno = !!userPronostics[m.id];
        return `<div class="urgent-item ${hasProno ? 'urgent-ok' : 'urgent-missing'}">
          <span class="urgent-teams">${m.team1.flag} ${tTeam(m.team1)} <span class="urgent-vs">vs</span> ${m.team2.flag} ${tTeam(m.team2)}</span>
          <span class="urgent-time">${formatDate(m.date)}</span>
          <span class="urgent-badge">${hasProno ? '✓' : '!'}</span>
        </div>`;
      }).join('')}
    </div>`;
}

function updateCountdowns() {
  document.querySelectorAll('.countdown[data-date]').forEach(el => {
    const diff = new Date(el.dataset.date) - Date.now();
    if (diff <= 0) { el.textContent = ''; return; }
    el.textContent = ` · ⏱ ${formatCountdown(diff)}`;
  });
}

function renderEvolutionChart() {
  const container = document.getElementById('chart-container');
  const canvas    = document.getElementById('evolution-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const allMatchesById = {};
  [...MATCHES, ...knockoutMatches].forEach(m => { allMatchesById[m.id] = m; });

  const matchesWithResults = Object.entries(matchResults)
    .map(([id, result]) => ({ id, result, match: allMatchesById[id] }))
    .filter(x => x.match)
    .sort((a, b) => new Date(a.match.date) - new Date(b.match.date));

  if (matchesWithResults.length < 2) { container.hidden = true; return; }
  container.hidden = false;

  const userSet = new Set();
  Object.values(matchPronostics).forEach(list => list.forEach(p => userSet.add(p.userId)));
  const users = [...userSet].sort();
  if (users.length === 0) { container.hidden = true; return; }

  const totals  = Object.fromEntries(users.map(u => [u, 0]));
  const series  = Object.fromEntries(users.map(u => [u, []]));
  const labels  = [];

  for (const { id, result, match } of matchesWithResults) {
    const mult = ROUND_MULTIPLIERS[match.round] || 1;
    (matchPronostics[id] || []).forEach(p => {
      const pts = calcPoints(p, result);
      if (pts !== null) totals[p.userId] = (totals[p.userId] || 0) + pts * mult;
    });
    users.forEach(u => series[u].push(totals[u] || 0));
    labels.push(`${match.team1.flag}${match.team2.flag}`);
  }

  const me = getSession()?.pseudo;
  const palette = ['#00c853','#ffd700','#3b82f6','#ef4444','#a855f7','#f97316','#06b6d4','#ec4899','#84cc16','#f59e0b','#14b8a6','#8b5cf6'];

  if (window._wc26Chart) { window._wc26Chart.destroy(); window._wc26Chart = null; }

  window._wc26Chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: users.map((u, i) => ({
        label: u,
        data: series[u],
        borderColor: palette[i % palette.length],
        backgroundColor: 'transparent',
        tension: 0.2,
        pointRadius: 2,
        borderWidth: u === me ? 3 : 1.5,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#e2e8f0', font: { size: 11 }, boxWidth: 20 } },
      },
      scales: {
        x: { ticks: { color: '#6b7e9a', font: { size: 10 } }, grid: { color: '#1e3050' } },
        y: { ticks: { color: '#6b7e9a', font: { size: 10 } }, grid: { color: '#1e3050' }, beginAtZero: true },
      },
    },
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

async function loadTopScorerData(pseudo) {
  const [pronoSnap, resultSnap, winnerPronoSnap, winnerResultSnap, tgPronoSnap, tgResultSnap] = await Promise.all([
    getDoc(doc(db, 'special_pronostics', `${pseudo}_topscorer`)),
    getDoc(doc(db, 'special_results', 'topscorer')),
    getDoc(doc(db, 'special_pronostics', `${pseudo}_winner`)),
    getDoc(doc(db, 'special_results', 'winner')),
    getDoc(doc(db, 'special_pronostics', `${pseudo}_totalgoals`)),
    getDoc(doc(db, 'special_results', 'totalgoals')),
  ]);
  topScorerPronostic  = pronoSnap.exists() ? pronoSnap.data() : null;
  topScorerResult     = resultSnap.exists() ? resultSnap.data() : null;
  winnerPronostic     = winnerPronoSnap.exists() ? winnerPronoSnap.data() : null;
  winnerResult        = winnerResultSnap.exists() ? winnerResultSnap.data() : null;
  totalGoalsPronostic = tgPronoSnap.exists() ? tgPronoSnap.data() : null;
  totalGoalsResult    = tgResultSnap.exists() ? tgResultSnap.data() : null;
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

  // ── Stats pronos des autres joueurs (matchs verrouillés) ─────────────────
  let statsHtml = '';
  if (locked) {
    const pronoList = matchPronostics[match.id] || [];
    if (pronoList.length > 0) {
      const homeWins = pronoList.filter(p => p.score1 > p.score2).length;
      const draws    = pronoList.filter(p => p.score1 === p.score2).length;
      const awayWins = pronoList.filter(p => p.score1 < p.score2).length;
      const total    = pronoList.length;
      const scoreCount = {};
      pronoList.forEach(p => { const k = `${p.score1}-${p.score2}`; scoreCount[k] = (scoreCount[k] || 0) + 1; });
      const [topScore, topCount] = Object.entries(scoreCount).sort((a, b) => b[1] - a[1])[0];
      statsHtml = `<div class="match-stats">
        <div class="stats-bar">
          ${homeWins ? `<span class="sb-home" style="flex:${homeWins}" title="${tTeam(match.team1)} (${homeWins})">${Math.round(homeWins/total*100)}%</span>` : ''}
          ${draws    ? `<span class="sb-draw" style="flex:${draws}"    title="= (${draws})">${Math.round(draws/total*100)}%</span>` : ''}
          ${awayWins ? `<span class="sb-away" style="flex:${awayWins}" title="${tTeam(match.team2)} (${awayWins})">${Math.round(awayWins/total*100)}%</span>` : ''}
        </div>
        <div class="stats-detail">${total} ${t('lb.pronos')} · ${t('stats.top')} : ${topScore} (${topCount}×)</div>
      </div>`;
    }
  }

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

  // ── Liste des pronos de tous les joueurs (matchs avec résultat) ────────────
  let allPronosHtml = '';
  if (locked && result) {
    const pronoList = matchPronostics[match.id] || [];
    if (pronoList.length > 0) {
      const sorted = [...pronoList].sort((a, b) => {
        const pa = calcPoints(a, result) ?? -1;
        const pb = calcPoints(b, result) ?? -1;
        if (pb !== pa) return pb - pa;
        return a.userId.localeCompare(b.userId);
      });
      const rows = sorted.map(p => {
        const pts  = calcPoints(p, result);
        const icon = pts === 3 ? '🎯' : pts === 1 ? '✅' : '❌';
        const cls  = pts === 3 ? 'ap-exact' : pts === 1 ? 'ap-correct' : 'ap-wrong';
        const isMe = p.userId === pseudo;
        return `<div class="ap-row${isMe ? ' ap-me' : ''}">
          <span class="ap-pseudo">${escapeHtml(p.userId)}</span>
          <span class="ap-score">${p.score1} – ${p.score2}</span>
          <span class="ap-icon ${cls}">${icon}</span>
        </div>`;
      }).join('');
      allPronosHtml = `
        <div class="all-pronos-wrap" hidden>
          <div class="all-pronos-list">${rows}</div>
        </div>`;
    }
  }

  card.innerHTML = `
    <div class="match-meta">
      <span class="match-date">${formatDate(match.date)}${locked ? ' 🔒' : `<span class="countdown" data-date="${match.date}"></span>`}</span>
      <span class="match-venue">📍 ${match.venue}</span>
      ${multBadge}
    </div>
    <div class="match-teams">
      <span class="team">
        <span class="flag">${match.team1.flag}</span>
        <span class="name">${tTeam(match.team1)}</span>
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
        <span class="name">${tTeam(match.team2)}</span>
        <span class="flag">${match.team2.flag}</span>
      </span>
    </div>
    ${statsHtml}
    ${resultHtml}
    ${allPronosHtml}
    ${!locked ? `<div class="save-row">
      <button class="btn-save" data-match="${match.id}">${t('save')}</button>
      <button class="btn-random" data-match="${match.id}" title="${t('random.title')}">🎲</button>
      <span class="save-status" id="status-${match.id}"></span>
    </div>` : (allPronosHtml ? `<div class="save-row">
      <button class="btn-toggle-pronos">${t('pronos.show', (matchPronostics[match.id] || []).length)}</button>
    </div>` : '')}
  `;

  if (locked && result && allPronosHtml) {
    const toggleBtn = card.querySelector('.btn-toggle-pronos');
    const wrap      = card.querySelector('.all-pronos-wrap');
    const count     = (matchPronostics[match.id] || []).length;
    toggleBtn.addEventListener('click', () => {
      const open = !wrap.hidden;
      wrap.hidden = open;
      toggleBtn.textContent = open ? t('pronos.show', count) : t('pronos.hide');
    });
  }

  return card;
}

function buildTopScorerCard(pseudo) {
  const locked = new Date() >= new Date(TOP_SCORER_LOCK_DATE);
  const prono  = topScorerPronostic;
  const result = topScorerResult;

  const card = document.createElement('div');
  card.className = `match-card top-scorer-card${locked ? ' locked' : ''}`;

  let resultHtml = '';
  if (result) {
    const correct = prono && (
      prono.playerId === result.playerId ||
      (prono.playerId === 'other' && prono.playerName && prono.playerName.toLowerCase() === (result.playerName || '').toLowerCase())
    );
    const icon = correct ? '🥇' : '❌';
    const cls  = correct ? 'pts-exact' : 'pts-wrong';
    resultHtml = `
      <div class="result-row">
        <span class="result-label">${t('topscorer.result')} :</span>
        <span class="result-score">${result.flag || ''} ${escapeHtml(result.playerName || result.playerId)}</span>
        <span class="result-pts ${cls}">${icon} ${correct ? `+${TOP_SCORER_POINTS} ${t('lb.pts')}` : t('topscorer.wrong')}</span>
      </div>`;
  }

  let inputHtml = '';
  if (locked) {
    const playerDisplay = prono
      ? `${prono.flag || ''} ${escapeHtml(prono.playerName || prono.playerId)}`
      : `<span class="muted">${t('topscorer.noprono')}</span>`;
    inputHtml = `<div class="ts-locked-prono">${playerDisplay}</div>`;
  } else {
    const selectedId   = prono?.playerId || '';
    const selectedName = prono?.playerName || '';
    const options = TOP_SCORERS.map(p =>
      `<option value="${p.id}" data-flag="${p.flag}" data-name="${escapeHtml(p.name)}" ${selectedId === p.id ? 'selected' : ''}>
        ${p.flag} ${p.name}${p.country ? ` (${tPlayerCountry(p)})` : ''}
       </option>`
    ).join('');
    const otherHidden = selectedId !== 'other' ? 'hidden' : '';
    inputHtml = `
      <select id="ts-select" class="ts-select">
        <option value="">${t('topscorer.placeholder')}</option>
        ${options}
      </select>
      <div id="ts-other-wrap" class="ts-other-wrap" ${otherHidden}>
        <input type="text" id="ts-other-input" class="ts-other-input"
               placeholder="${t('topscorer.other.label')}"
               value="${selectedId === 'other' ? escapeHtml(selectedName) : ''}">
      </div>
      <div class="save-row">
        <button class="btn-save" id="ts-save-btn">${t('topscorer.title').replace('🥇 ', '')} — ${t('save')}</button>
        <span class="save-status" id="ts-status"></span>
      </div>`;
  }

  card.innerHTML = `
    <div class="match-meta">
      <span class="match-date">${locked ? t('topscorer.locked') : `<span class="ts-bonus">${t('topscorer.bonus')}</span>`}</span>
    </div>
    <div class="ts-body">
      <div class="ts-label">${t('topscorer.label')} :</div>
      ${inputHtml}
    </div>
    ${resultHtml}
  `;

  if (!locked) {
    const sel = card.querySelector('#ts-select');
    const otherWrap = card.querySelector('#ts-other-wrap');
    sel.addEventListener('change', () => {
      otherWrap.hidden = sel.value !== 'other';
    });
    card.querySelector('#ts-save-btn').addEventListener('click', () => saveTopScorer(pseudo, card));
  }

  return card;
}

async function saveTopScorer(pseudo, card) {
  const sel    = card.querySelector('#ts-select');
  const status = card.querySelector('#ts-status');
  if (!sel || !sel.value) return;

  const playerId = sel.value;
  let playerName, flag;

  if (playerId === 'other') {
    const input = card.querySelector('#ts-other-input');
    playerName = input?.value.trim();
    if (!playerName) { status.textContent = '⚠ Précise le joueur'; return; }
    flag = '🌍';
  } else {
    const opt = sel.options[sel.selectedIndex];
    playerName = opt.dataset.name;
    flag = opt.dataset.flag;
  }

  status.textContent = '…';
  try {
    await setDoc(doc(db, 'special_pronostics', `${pseudo}_topscorer`), {
      userId: pseudo, playerId, playerName, flag, submittedAt: serverTimestamp(),
    });
    topScorerPronostic = { userId: pseudo, playerId, playerName, flag };
    renderTopScorerBanner();
    status.textContent = t('saved');
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch (err) {
    console.error(err);
    status.textContent = t('save.error');
  }
}

function buildWinnerCard(pseudo) {
  const locked = new Date() >= new Date(WINNER_LOCK_DATE);
  const prono  = winnerPronostic;
  const result = winnerResult;

  const allTeams = Object.values(GROUPS)
    .flatMap(g => g.teams)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  const card = document.createElement('div');
  card.className = `match-card top-scorer-card${locked ? ' locked' : ''}`;

  let resultHtml = '';
  if (result) {
    const correct = prono && prono.teamId === result.teamId;
    const icon = correct ? '🏆' : '❌';
    const cls  = correct ? 'pts-exact' : 'pts-wrong';
    resultHtml = `
      <div class="result-row">
        <span class="result-label">${t('winner.result')} :</span>
        <span class="result-score">${result.flag || ''} ${escapeHtml(getLang() === 'sq' ? (result.teamNamesq || result.teamName) : result.teamName)}</span>
        <span class="result-pts ${cls}">${icon} ${correct ? `+${WINNER_POINTS} ${t('lb.pts')}` : t('winner.wrong')}</span>
      </div>`;
  }

  let inputHtml = '';
  if (locked) {
    const teamDisplay = prono
      ? `${prono.flag || ''} ${escapeHtml(getLang() === 'sq' ? (prono.teamNamesq || prono.teamName) : prono.teamName)}`
      : `<span class="muted">${t('winner.noprono')}</span>`;
    inputHtml = `<div class="ts-locked-prono">${teamDisplay}</div>`;
  } else {
    const selectedId = prono?.teamId || '';
    const options = allTeams.map(team =>
      `<option value="${team.id}" data-flag="${team.flag}" data-name="${escapeHtml(team.name)}" data-namesq="${escapeHtml(team.namesq || '')}" ${selectedId === team.id ? 'selected' : ''}>
        ${team.flag} ${getLang() === 'sq' ? (team.namesq || team.name) : team.name}
       </option>`
    ).join('');
    inputHtml = `
      <select id="winner-select" class="ts-select">
        <option value="">${t('winner.placeholder')}</option>
        ${options}
      </select>
      <div class="save-row">
        <button class="btn-save" id="winner-save-btn">${t('winner.title').replace('🏆 ', '')} — ${t('save')}</button>
        <span class="save-status" id="winner-status"></span>
      </div>`;
  }

  card.innerHTML = `
    <div class="match-meta">
      <span class="match-date">${locked ? t('winner.locked') : `<span class="ts-bonus">${t('winner.bonus')}</span>`}</span>
    </div>
    <div class="ts-body">
      <div class="ts-label">${t('winner.label')} :</div>
      ${inputHtml}
    </div>
    ${resultHtml}
  `;

  if (!locked) {
    card.querySelector('#winner-save-btn').addEventListener('click', () => saveWinner(pseudo, card));
  }

  return card;
}

async function saveWinner(pseudo, card) {
  const sel    = card.querySelector('#winner-select');
  const status = card.querySelector('#winner-status');
  if (!sel || !sel.value) return;

  const opt      = sel.options[sel.selectedIndex];
  const teamId   = sel.value;
  const teamName = opt.dataset.name;
  const teamNamesq = opt.dataset.namesq;
  const flag     = opt.dataset.flag;

  status.textContent = '…';
  try {
    await setDoc(doc(db, 'special_pronostics', `${pseudo}_winner`), {
      userId: pseudo, teamId, teamName, teamNamesq, flag, submittedAt: serverTimestamp(),
    });
    winnerPronostic = { userId: pseudo, teamId, teamName, teamNamesq, flag };
    renderWinnerBanner();
    status.textContent = t('saved');
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch (err) {
    console.error(err);
    status.textContent = t('save.error');
  }
}

function renderWinnerBanner() {
  const el = document.getElementById('winner-banner');
  if (!el) return;

  const locked = new Date() >= new Date(WINNER_LOCK_DATE);
  const prono  = winnerPronostic;
  const result = winnerResult;

  let playerHtml, rightHtml, warnClass = '';
  const teamName = p => p ? (getLang() === 'sq' ? (p.teamNamesq || p.teamName) : p.teamName) : null;

  if (result) {
    const correct = prono && prono.teamId === result.teamId;
    playerHtml = prono
      ? `${prono.flag || ''} <strong>${escapeHtml(teamName(prono))}</strong>`
      : `<span class="muted">${t('winner.noprono')}</span>`;
    rightHtml = correct
      ? `<span class="tsb-pts tsb-correct">🏆 +${WINNER_POINTS} ${t('lb.pts')}</span>`
      : `<span class="tsb-pts tsb-wrong">❌ ${t('winner.wrong')}</span>`;
  } else if (locked) {
    playerHtml = prono
      ? `${prono.flag || ''} <strong>${escapeHtml(teamName(prono))}</strong>`
      : `<span class="muted">${t('winner.noprono')}</span>`;
    rightHtml = `<span class="tsb-lock">🔒</span>`;
  } else {
    if (!prono) {
      warnClass = ' tsb-warn';
      playerHtml = `<span class="nm-prono-warn">⚠ ${t('winner.noprono')}</span>`;
    } else {
      playerHtml = `${prono.flag || ''} <strong>${escapeHtml(teamName(prono))}</strong> <span class="nm-prono-ok">✓</span>`;
    }
    rightHtml = `<span class="tsb-bonus">+${WINNER_POINTS} pts</span>`;
  }

  el.className = `tsb-banner${warnClass}`;
  el.innerHTML = `
    <div class="nm-label">${t('winner.title')}</div>
    <div class="tsb-main">
      <div class="tsb-player">${playerHtml}</div>
      <div class="tsb-right">
        ${rightHtml}
        ${!locked ? `<button class="tsb-btn">${prono ? '✏ Modifier' : '→ Choisir'}</button>` : ''}
      </div>
    </div>`;

  el.onclick = () => showGroup('WIN');
}

function buildTotalGoalsHistoryHtml() {
  const avgPerMatch = TOTAL_GOALS_HISTORY.reduce((s, e) => s + e.goals / e.matches, 0) / TOTAL_GOALS_HISTORY.length;
  const projected   = Math.round(avgPerMatch * TOTAL_GOALS_2026_MATCHES);
  const isSq = getLang() === 'sq';
  const rows = TOTAL_GOALS_HISTORY.map(e => `
    <tr>
      <td>${e.year} · ${isSq ? e.hostsq : e.host}</td>
      <td class="tgh-center">${e.matches}</td>
      <td class="tgh-center"><strong>${e.goals}</strong></td>
      <td class="tgh-center">${(e.goals / e.matches).toFixed(2)}</td>
    </tr>`).join('');
  return `
    <div class="tg-history">
      <div class="tgh-title">${t('totalgoals.history.title')}</div>
      <table class="tgh-table">
        <thead><tr>
          <th>${t('totalgoals.history.col.edition')}</th>
          <th>${t('totalgoals.history.col.matches')}</th>
          <th>${t('totalgoals.history.col.goals')}</th>
          <th>${t('totalgoals.history.col.avg')}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="tgh-note">${t('totalgoals.history.note', TOTAL_GOALS_2026_MATCHES, projected, avgPerMatch.toFixed(2))}</div>
    </div>`;
}

function buildTotalGoalsCard(pseudo) {
  const locked = new Date() >= new Date(TOTAL_GOALS_LOCK_DATE);
  const prono  = totalGoalsPronostic;
  const result = totalGoalsResult;

  const card = document.createElement('div');
  card.className = `match-card top-scorer-card${locked ? ' locked' : ''}`;

  let resultHtml = '';
  if (result) {
    const pts  = prono != null ? calcTotalGoalsPoints(prono.totalGoals, result.totalGoals) : null;
    const diff = prono != null ? Math.abs(prono.totalGoals - result.totalGoals) : null;
    const icon = pts === 10 ? '🎯' : pts === 5 ? '✅' : pts === 2 ? '🟡' : pts === 0 ? '❌' : '';
    const cls  = pts === 10 ? 'pts-exact' : pts >= 2 ? 'pts-correct' : 'pts-wrong';
    const diffStr = diff !== null ? ` (${t('totalgoals.gap')} : ${diff})` : '';
    resultHtml = `
      <div class="result-row">
        <span class="result-label">${t('totalgoals.result')} :</span>
        <span class="result-score"><strong>${result.totalGoals}</strong> ${t('totalgoals.unit')}</span>
        ${pts !== null ? `<span class="result-pts ${cls}">${icon} +${pts} ${t('lb.pts')}${diffStr}</span>` : ''}
      </div>`;
  }

  let inputHtml = '';
  if (locked) {
    inputHtml = prono != null
      ? `<div class="ts-locked-prono"><strong>${prono.totalGoals}</strong> ${t('totalgoals.unit')}</div>`
      : `<div class="ts-locked-prono"><span class="muted">${t('totalgoals.noprono')}</span></div>`;
  } else {
    inputHtml = `
      <div class="tg-input-row">
        <input type="number" id="tg-input" class="tg-input" min="0" max="600"
               placeholder="${t('totalgoals.placeholder')}" value="${prono != null ? prono.totalGoals : ''}">
        <span class="tg-unit">${t('totalgoals.unit')}</span>
      </div>
      <div class="tg-scale">${t('totalgoals.scale')}</div>
      ${buildTotalGoalsHistoryHtml()}
      <div class="save-row">
        <button class="btn-save" id="tg-save-btn">${t('save')}</button>
        <span class="save-status" id="tg-status"></span>
      </div>`;
  }

  card.innerHTML = `
    <div class="match-meta">
      <span class="match-date">${locked ? t('totalgoals.locked') : `<span class="ts-bonus">${t('totalgoals.bonus')}</span>`}</span>
    </div>
    <div class="ts-body">
      <div class="ts-label">${t('totalgoals.label')} :</div>
      ${inputHtml}
    </div>
    ${resultHtml}
  `;

  if (!locked) {
    card.querySelector('#tg-save-btn').addEventListener('click', () => saveTotalGoals(pseudo, card));
    card.querySelector('#tg-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') saveTotalGoals(pseudo, card);
    });
  }

  return card;
}

async function saveTotalGoals(pseudo, card) {
  const input  = card.querySelector('#tg-input');
  const status = card.querySelector('#tg-status');
  const val    = parseInt(input.value, 10);
  if (isNaN(val) || val < 0) { status.textContent = '⚠ Nombre invalide'; return; }

  status.textContent = '…';
  try {
    await setDoc(doc(db, 'special_pronostics', `${pseudo}_totalgoals`), {
      userId: pseudo, totalGoals: val, submittedAt: serverTimestamp(),
    });
    totalGoalsPronostic = { userId: pseudo, totalGoals: val };
    renderTotalGoalsBanner();
    status.textContent = t('saved');
    setTimeout(() => { status.textContent = ''; }, 2000);
  } catch (err) {
    console.error(err);
    status.textContent = t('save.error');
  }
}

function renderTotalGoalsBanner() {
  const el = document.getElementById('totalgoals-banner');
  if (!el) return;

  const locked = new Date() >= new Date(TOTAL_GOALS_LOCK_DATE);
  const prono  = totalGoalsPronostic;
  const result = totalGoalsResult;

  let playerHtml, rightHtml, warnClass = '';

  if (result) {
    const pts = prono != null ? calcTotalGoalsPoints(prono.totalGoals, result.totalGoals) : null;
    playerHtml = prono != null
      ? `<strong>${prono.totalGoals}</strong> ${t('totalgoals.unit')}`
      : `<span class="muted">${t('totalgoals.noprono')}</span>`;
    const icon = pts === 10 ? '🎯' : pts === 5 ? '✅' : pts === 2 ? '🟡' : '❌';
    rightHtml = pts !== null
      ? `<span class="tsb-pts ${pts > 0 ? 'tsb-correct' : 'tsb-wrong'}">${icon} +${pts} ${t('lb.pts')}</span>`
      : '';
  } else if (locked) {
    playerHtml = prono != null
      ? `<strong>${prono.totalGoals}</strong> buts`
      : `<span class="muted">${t('totalgoals.noprono')}</span>`;
    rightHtml = `<span class="tsb-lock">🔒</span>`;
  } else {
    if (prono == null) {
      warnClass  = ' tsb-warn';
      playerHtml = `<span class="nm-prono-warn">⚠ ${t('totalgoals.noprono')}</span>`;
    } else {
      playerHtml = `<strong>${prono.totalGoals}</strong> ${t('totalgoals.unit')} <span class="nm-prono-ok">✓</span>`;
    }
    rightHtml = `<span class="tsb-bonus">2–10 pts</span>`;
  }

  el.className = `tsb-banner${warnClass}`;
  el.innerHTML = `
    <div class="nm-label">${t('totalgoals.title')}</div>
    <div class="tsb-main">
      <div class="tsb-player">${playerHtml}</div>
      <div class="tsb-right">
        ${rightHtml}
        ${!locked ? `<button class="tsb-btn">${prono != null ? '✏ Modifier' : '→ Saisir'}</button>` : ''}
      </div>
    </div>`;

  el.onclick = () => showGroup('TG');
}

function randomScore() {
  const r = Math.random();
  if (r < 0.25) return 0;
  if (r < 0.55) return 1;
  if (r < 0.80) return 2;
  if (r < 0.93) return 3;
  return 4;
}

function attachCardHandlers(container, pseudo) {
  container.querySelectorAll('.btn-save').forEach(btn => {
    btn.addEventListener('click', () => savePronostic(pseudo, btn.dataset.match));
  });
  container.querySelectorAll('.btn-random').forEach(btn => {
    btn.addEventListener('click', () => {
      const matchId = btn.dataset.match;
      const i1 = container.querySelector(`.score-input[data-match="${matchId}"][data-side="1"]`);
      const i2 = container.querySelector(`.score-input[data-match="${matchId}"][data-side="2"]`);
      if (!i1 || !i2) return;
      i1.value = randomScore();
      i2.value = randomScore();
      savePronostic(pseudo, matchId);
    });
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
        ${GROUPS[groupId].teams.map(team => `<span class="gsb-team">${team.flag} ${tTeam(team)}</span>`).join('')}
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

  // ── Bonus vainqueur ──────────────────────────────────────────────────────
  const winContainer = document.createElement('div');
  winContainer.id = 'group-section-WIN';
  winContainer.hidden = true;
  const winHeading = document.createElement('h2');
  winHeading.className = 'group-title';
  winHeading.textContent = t('winner.title');
  winContainer.appendChild(winHeading);
  const winSubtitle = document.createElement('p');
  winSubtitle.className = 'ts-subtitle';
  winSubtitle.textContent = t('winner.subtitle');
  winContainer.appendChild(winSubtitle);
  winContainer.appendChild(buildWinnerCard(pseudo));
  content.appendChild(winContainer);

  const winLocked = new Date() >= new Date(WINNER_LOCK_DATE);
  const winBtn = document.createElement('button');
  winBtn.className = 'group-sidebar-btn gsb-ts';
  winBtn.dataset.group = 'WIN';
  winBtn.innerHTML = `
    <div class="gsb-header">
      <span class="gsb-letter">${t('winner.title')}</span>
      ${winnerPronostic ? `<span class="gsb-ok">✓</span>` : `<span class="gsb-badge">${winLocked ? '?' : '!'}</span>`}
    </div>`;
  winBtn.addEventListener('click', () => showGroup('WIN'));
  sidebar.appendChild(winBtn);

  // ── Bonus nombre de buts total ───────────────────────────────────────────
  const tgContainer = document.createElement('div');
  tgContainer.id = 'group-section-TG';
  tgContainer.hidden = true;
  const tgHeading = document.createElement('h2');
  tgHeading.className = 'group-title';
  tgHeading.textContent = t('totalgoals.title');
  tgContainer.appendChild(tgHeading);
  const tgSubtitle = document.createElement('p');
  tgSubtitle.className = 'ts-subtitle';
  tgSubtitle.textContent = t('totalgoals.subtitle');
  tgContainer.appendChild(tgSubtitle);
  tgContainer.appendChild(buildTotalGoalsCard(pseudo));
  content.appendChild(tgContainer);

  const tgLocked = new Date() >= new Date(TOTAL_GOALS_LOCK_DATE);
  const tgBtn = document.createElement('button');
  tgBtn.className = 'group-sidebar-btn gsb-ts';
  tgBtn.dataset.group = 'TG';
  tgBtn.innerHTML = `
    <div class="gsb-header">
      <span class="gsb-letter">${t('totalgoals.title')}</span>
      ${totalGoalsPronostic != null ? `<span class="gsb-ok">✓</span>` : `<span class="gsb-badge">${tgLocked ? '?' : '!'}</span>`}
    </div>`;
  tgBtn.addEventListener('click', () => showGroup('TG'));
  sidebar.appendChild(tgBtn);

  // ── Bonus meilleur buteur ────────────────────────────────────────────────
  const tsContainer = document.createElement('div');
  tsContainer.id = 'group-section-TS';
  tsContainer.hidden = true;
  const tsHeading = document.createElement('h2');
  tsHeading.className = 'group-title';
  tsHeading.textContent = t('topscorer.title');
  tsContainer.appendChild(tsHeading);
  const tsSubtitle = document.createElement('p');
  tsSubtitle.className = 'ts-subtitle';
  tsSubtitle.textContent = t('topscorer.subtitle');
  tsContainer.appendChild(tsSubtitle);
  tsContainer.appendChild(buildTopScorerCard(pseudo));
  content.appendChild(tsContainer);

  const tsLocked = new Date() >= new Date(TOP_SCORER_LOCK_DATE);
  const tsProno  = topScorerPronostic;
  const tsBtn = document.createElement('button');
  tsBtn.className = 'group-sidebar-btn gsb-ts';
  tsBtn.dataset.group = 'TS';
  tsBtn.innerHTML = `
    <div class="gsb-header">
      <span class="gsb-letter">${t('topscorer.title')}</span>
      ${tsLocked
        ? (tsProno ? `<span class="gsb-ok" title="">✓</span>` : `<span class="gsb-badge">?</span>`)
        : (tsProno ? `<span class="gsb-ok">✓</span>` : `<span class="gsb-badge">!</span>`)
      }
    </div>`;
  tsBtn.addEventListener('click', () => showGroup('TS'));
  sidebar.appendChild(tsBtn);

  const defaultGroup = (() => {
    if (currentGroupId && document.getElementById(`group-section-${currentGroupId}`)) return currentGroupId;
    if (knockoutMatches.length > 0 && MATCHES.every(m => isLocked(m))) return 'KO';
    return Object.keys(GROUPS)[0];
  })();
  showGroup(defaultGroup);
  attachCardHandlers(content, pseudo);
  renderWinnerBanner();
  renderTopScorerBanner();
  renderTotalGoalsBanner();
  renderNextMatchBanner(pseudo);
  renderUrgentBanner(pseudo);
  updateCountdowns();
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
        refreshNextMatchProno(matchId);
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
    refreshNextMatchProno(matchId);
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
        <td class="res-match">${m.team1.flag} ${tTeam(m.team1)} – ${m.team2.flag} ${tTeam(m.team2)}</td>
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

  // ── Nombre de buts total ─────────────────────────────────────────────────
  if (totalGoalsResult) {
    hasAny = true;
    const prono = totalGoalsPronostic;
    const pts   = prono != null ? calcTotalGoalsPoints(prono.totalGoals, totalGoalsResult.totalGoals) : null;
    if (pts !== null) grandTotal += pts;
    const diff  = prono != null ? Math.abs(prono.totalGoals - totalGoalsResult.totalGoals) : null;
    const icon  = pts === 10 ? '🎯' : pts === 5 ? '✅' : pts === 2 ? '🟡' : pts === 0 ? '❌' : '';
    const cls   = pts === 10 ? 'pts-exact' : pts > 0 ? 'pts-correct' : 'pts-wrong';
    const tgSection = document.createElement('div');
    tgSection.className = 'results-section';
    tgSection.innerHTML = `
      <h3 class="results-group-title">${t('totalgoals.title')}</h3>
      <div class="table-wrap">
        <table class="results-table">
          <thead><tr>
            <th></th>
            <th>${t('results.col.prono')}</th>
            <th>${t('results.col.result')}</th>
            <th>${t('results.col.pts')}</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>${t('totalgoals.title')}</td>
              <td class="res-prono">${prono != null ? `<strong>${prono.totalGoals}</strong> ${t('totalgoals.unit')}` : '<span class="muted">–</span>'}</td>
              <td class="res-result"><strong>${totalGoalsResult.totalGoals} ${t('totalgoals.unit')}</strong>${diff !== null ? ` <span class="muted">(${t('totalgoals.gap')} : ${diff})</span>` : ''}</td>
              <td class="res-pts">${pts !== null ? `<span class="result-pts ${cls}">${icon} ${pts}</span>` : '<span class="muted">–</span>'}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
    content.appendChild(tgSection);
  }

  // ── Vainqueur ────────────────────────────────────────────────────────────
  if (winnerResult) {
    hasAny = true;
    const prono = winnerPronostic;
    const correct = prono && prono.teamId === winnerResult.teamId;
    const pts = prono && correct ? WINNER_POINTS : prono ? 0 : null;
    if (pts !== null) grandTotal += pts;

    const teamDisplay = p => p ? `${p.flag || ''} ${escapeHtml(getLang() === 'sq' ? (p.teamNamesq || p.teamName) : p.teamName)}` : `<span class="muted">–</span>`;
    const resultStr = teamDisplay(winnerResult);
    const pronoStr  = prono ? teamDisplay(prono) : `<span class="muted">–</span>`;
    const icon  = pts === WINNER_POINTS ? '🏆' : pts === 0 ? '❌' : '';
    const cls   = pts === WINNER_POINTS ? 'pts-exact' : pts === 0 ? 'pts-wrong' : '';
    const ptsStr = pts !== null
      ? `<span class="result-pts ${cls}">${icon} ${pts}</span>`
      : `<span class="muted">–</span>`;

    const winSection = document.createElement('div');
    winSection.className = 'results-section';
    winSection.innerHTML = `
      <h3 class="results-group-title">${t('winner.title')}</h3>
      <div class="table-wrap">
        <table class="results-table">
          <thead><tr>
            <th>Équipe</th>
            <th>${t('results.col.prono')}</th>
            <th>${t('results.col.result')}</th>
            <th>${t('results.col.pts')}</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>${t('winner.title')}</td>
              <td class="res-prono">${pronoStr}</td>
              <td class="res-result"><strong>${resultStr}</strong></td>
              <td class="res-pts">${ptsStr}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
    content.appendChild(winSection);
  }

  // ── Meilleur buteur ───────────────────────────────────────────────────────
  if (topScorerResult) {
    hasAny = true;
    const prono = topScorerPronostic;
    const correct = prono && (
      prono.playerId === topScorerResult.playerId ||
      (prono.playerId === 'other' && prono.playerName && prono.playerName.toLowerCase() === (topScorerResult.playerName || '').toLowerCase())
    );
    const pts = prono && correct ? TOP_SCORER_POINTS : prono ? 0 : null;
    if (pts !== null) grandTotal += pts;

    const pronoStr = prono
      ? `${escapeHtml(prono.flag || '')} ${escapeHtml(prono.playerName || prono.playerId)}`
      : `<span class="muted">–</span>`;
    const resultStr = `${topScorerResult.flag || ''} ${escapeHtml(topScorerResult.playerName || topScorerResult.playerId)}`;
    const icon  = pts === TOP_SCORER_POINTS ? '🥇' : pts === 0 ? '❌' : '';
    const cls   = pts === TOP_SCORER_POINTS ? 'pts-exact' : pts === 0 ? 'pts-wrong' : '';
    const ptsStr = pts !== null
      ? `<span class="result-pts ${cls}">${icon} ${pts}</span>`
      : `<span class="muted">–</span>`;

    const tsSection = document.createElement('div');
    tsSection.className = 'results-section';
    tsSection.innerHTML = `
      <h3 class="results-group-title">${t('topscorer.title')}</h3>
      <div class="table-wrap">
        <table class="results-table">
          <thead><tr>
            <th>Joueur</th>
            <th>${t('results.col.prono')}</th>
            <th>${t('results.col.result')}</th>
            <th>${t('results.col.pts')}</th>
          </tr></thead>
          <tbody>
            <tr>
              <td>${t('topscorer.title')}</td>
              <td class="res-prono">${pronoStr}</td>
              <td class="res-result"><strong>${resultStr}</strong></td>
              <td class="res-pts">${ptsStr}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
    content.appendChild(tsSection);
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
    const [pronoSnap, resultSnap, usersSnap, koSnap, tsPronoSnap, tsResultSnap] = await Promise.all([
      getDocs(collection(db, 'pronostics')),
      getDocs(collection(db, 'results')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'matches_extra')),
      getDocs(collection(db, 'special_pronostics')),
      getDoc(doc(db, 'special_results', 'topscorer')),
    ]);

    const results = {};
    resultSnap.forEach(d => {
      const data = d.data();
      results[d.id] = data;
      matchResults[d.id] = data;
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
    const userCorrect = {};

    matchPronostics = {};
    pronoSnap.forEach(d => {
      const p = d.data();
      if (!userPoints[p.userId]) {
        userPoints[p.userId] = 0; userPredCount[p.userId] = 0;
        userExact[p.userId] = 0; userCorrect[p.userId] = 0;
      }
      userPredCount[p.userId]++;
      if (!matchPronostics[p.matchId]) matchPronostics[p.matchId] = [];
      matchPronostics[p.matchId].push(p);
      const pts = calcPoints(p, results[p.matchId] || {});
      if (pts !== null) {
        const mult = multipliers[p.matchId] || 1;
        userPoints[p.userId] += pts * mult;
        if (pts === 3) userExact[p.userId]++;
        else if (pts === 1) userCorrect[p.userId]++;
      }
    });

    // ── Bonus spéciaux (vainqueur + meilleur buteur) ─────────────────────────
    const tsResult  = tsResultSnap.exists() ? tsResultSnap.data() : null;
    const [winResultSnap2, tgResultSnap2] = await Promise.all([
      getDoc(doc(db, 'special_results', 'winner')),
      getDoc(doc(db, 'special_results', 'totalgoals')),
    ]);
    const winResultData = winResultSnap2.exists() ? winResultSnap2.data() : null;
    const tgResultData  = tgResultSnap2.exists() ? tgResultSnap2.data() : null;

    tsPronoSnap.forEach(d => {
      const p = d.data();
      if (!userPoints[p.userId]) {
        userPoints[p.userId] = 0; userPredCount[p.userId] = 0;
        userExact[p.userId] = 0; userCorrect[p.userId] = 0;
      }
      if (p.teamId && winResultData && p.teamId === winResultData.teamId) {
        userPoints[p.userId] += WINNER_POINTS;
      }
      if (p.playerId && tsResult) {
        const correct = p.playerId === tsResult.playerId ||
          (p.playerId === 'other' && p.playerName && p.playerName.toLowerCase() === (tsResult.playerName || '').toLowerCase());
        if (correct) userPoints[p.userId] += TOP_SCORER_POINTS;
      }
      if (p.totalGoals != null && tgResultData) {
        userPoints[p.userId] += calcTotalGoalsPoints(p.totalGoals, tgResultData.totalGoals);
      }
    });

    usersSnap.forEach(d => {
      const u = d.data().pseudo;
      if (!userPoints[u]) {
        userPoints[u] = 0; userPredCount[u] = 0;
        userExact[u] = 0; userCorrect[u] = 0;
      }
    });

    const ranked = Object.entries(userPoints)
      .sort(([pA, ptsA], [pB, ptsB]) => {
        if (ptsB !== ptsA)               return ptsB - ptsA;
        if (userExact[pB] !== userExact[pA])     return userExact[pB] - userExact[pA];
        if (userCorrect[pB] !== userCorrect[pA]) return userCorrect[pB] - userCorrect[pA];
        return pA.localeCompare(pB);
      })
      .map(([pseudo, pts], i) => ({
        rank: i + 1, pseudo, pts,
        pred: userPredCount[pseudo], exact: userExact[pseudo], correct: userCorrect[pseudo],
      }));

    if (ranked.length === 0) {
      container.innerHTML = `<tr><td colspan="4">${t('lb.empty')}</td></tr>`;
      return;
    }

    const me = getSession()?.pseudo;
    container.innerHTML = ranked.map(r => `
      <tr class="${r.rank <= 3 ? 'top-' + r.rank : ''} ${r.pseudo === me ? 'own-row' : ''}">
        <td class="rank">${r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}</td>
        <td class="pseudo">${escapeHtml(r.pseudo)}</td>
        <td class="pts"><strong>${r.pts}</strong> ${t('lb.pts')}</td>
        <td class="detail">${r.exact + r.correct} ${t('lb.goods')} · ${r.exact} 🎯 / ${r.pred} ${t('lb.pronos')}</td>
      </tr>
    `).join('');
    renderLastUpdate();
    renderEvolutionChart();
  } catch (err) {
    console.error(err);
    container.innerHTML = `<tr><td colspan="4">${t('lb.error')}</td></tr>`;
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function tTeam(team) {
  if (getLang() !== 'sq') return team.name;
  return team.namesq || TEAM_NAMES_SQ[team.name] || team.name;
}

function tPlayerCountry(player) {
  if (!player.country) return '';
  if (getLang() === 'sq') return player.countrysq || player.country;
  return player.country;
}

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

  await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults(), loadAllPronostics(), loadTopScorerData(user.pseudo)]);
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
    if (_nextMatchInterval) { clearInterval(_nextMatchInterval); _nextMatchInterval = null; }
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
          await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults(), loadTopScorerData(user.pseudo)]);
          renderMyResults();
        }
      }
      if (view === 'view-predictions') {
        const user = getSession();
        if (user) {
          await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults(), loadAllPronostics(), loadTopScorerData(user.pseudo)]);
          renderPredictions(user.pseudo);
        }
      }
    });
  });

  setInterval(updateCountdowns, 60000);

  window.addEventListener('wc26:langchange', async () => {
    const user = getSession();
    if (!user) return;
    const activeView = document.querySelector('.view:not([hidden])');
    if (activeView?.id === 'view-predictions') {
      await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults(), loadAllPronostics(), loadTopScorerData(user.pseudo)]);
      renderPredictions(user.pseudo);
    } else if (activeView?.id === 'view-results') {
      await Promise.all([loadPronostics(user.pseudo), loadKnockoutMatches(), loadResults(), loadTopScorerData(user.pseudo)]);
      renderMyResults();
    } else if (activeView?.id === 'view-leaderboard') {
      await loadLeaderboard();
    } else if (activeView?.id === 'view-rules') {
      renderRules();
    }
  });

  initApp();
});
