// ─── Dictionnaires ────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  fr: {
    'header.title':        'Pronos Coupe du Monde 2026',
    'login.title':         'Pronos Coupe du Monde 2026',
    'login.subtitle':      'Entre ton pseudo et le code reçu pour participer.',
    'login.pseudo':        'Ton pseudo',
    'login.code':          'Code de participation',
    'login.submit':        'Rejoindre →',
    'login.checking':      'Vérification…',
    'login.err.empty':     'Remplis tous les champs.',
    'login.err.invalid':   'Code invalide.',
    'login.err.taken':     "Ce code est déjà utilisé par quelqu'un d'autre.",
    'login.err.pseudo_taken': 'Ce pseudo est déjà utilisé. Choisis-en un autre.',
    'login.err.network':   'Erreur réseau. Réessaie.',
    'nav.pronos':          '⚽ Mes pronos',
    'nav.leaderboard':     '🏅 Classement',
    'nav.logout':          'Déconnexion',
    'tz.note':             '🕐 Heures affichées en heure locale France / Albanie (UTC+2 en été)',
    'group.label':         'Groupe',
    'ko.title':            '🏆 Phase éliminatoire',
    'ko.elim':             '🏆 Élim.',
    'save':                'Enregistrer',
    'saved':               '✓ Sauvegardé',
    'save.error':          '✗ Erreur',
    'score.invalid':       '⚠ Score invalide',
    'round.1/32':          '1/32 de finale',
    'round.1/16':          '1/16 de finale',
    'round.1/4':           'Quarts de finale',
    'round.1/2':           'Demi-finales',
    'round.Petite finale': 'Petite finale',
    'round.Finale':        'Finale',
    'sidebar.missing':     n => `${n} pronostic${n > 1 ? 's' : ''} manquant${n > 1 ? 's' : ''}`,
    'sidebar.complete':    'Tous les pronostics sont saisis',
    'lb.title':            '🏅 Classement',
    'lb.subtitle':         'Mis à jour en temps réel après chaque résultat saisi.',
    'lb.legend.exact':     '🎯 Score exact',
    'lb.legend.correct':   '✅ Bon résultat',
    'lb.legend.wrong':     '❌ Mauvais',
    'lb.legend.phases':    '🏆 Phases finales',
    'lb.col.rank':         'Rang',
    'lb.col.pseudo':       'Pseudo',
    'lb.col.points':       'Points',
    'lb.col.detail':       'Détail',
    'lb.loading':          'Chargement…',
    'lb.empty':            "Aucun participant pour l'instant.",
    'lb.error':            'Erreur de chargement.',
    'lb.pts':              'pts',
    'lb.exacts':           'exacts',
    'lb.pronos':           'pronos',
    'result.label':        'Résultat',
    'nav.results':         '📊 Mes résultats',
    'results.title':       '📊 Mes résultats',
    'results.subtitle':    'Récapitulatif de tes pronostics sur les matchs terminés.',
    'results.col.prono':   'Mon prono',
    'results.col.result':  'Résultat',
    'results.col.pts':     'Pts',
    'results.empty':       'Aucun résultat disponible pour l\'instant.',
    'results.total':       'Total',
    'footer.left':         '🇫🇷 🇦🇱 Pronos entre collègues · Keendoo',
    'footer.right':        '⚽ Coupe du Monde 2026',
    'lang.switch':         '🇦🇱 Shqip',
    'lang.switch.title':   'Kaloni në shqip',
  },
  sq: {
    'header.title':        'Pronostikime · Kupa e Botës 2026',
    'login.title':         'Pronostikime · Kupa e Botës 2026',
    'login.subtitle':      'Shkruaj pseudonimin dhe kodin që ke marrë për të marrë pjesë.',
    'login.pseudo':        'Pseudonimi yt',
    'login.code':          'Kodi i pjesëmarrjes',
    'login.submit':        'Hyr →',
    'login.checking':      'Duke kontrolluar…',
    'login.err.empty':     'Plotëso të gjitha fushat.',
    'login.err.invalid':   'Kod i pavlefshëm.',
    'login.err.taken':     'Ky kod është përdorur nga dikush tjetër.',
    'login.err.pseudo_taken': 'Ky pseudonim është tashmë i përdorur. Zgjidh një tjetër.',
    'login.err.network':   'Gabim rrjeti. Provo përsëri.',
    'nav.pronos':          '⚽ Pronostikimet e mia',
    'nav.leaderboard':     '🏅 Renditja',
    'nav.logout':          'Dil',
    'tz.note':             '🕐 Oraret shfaqen sipas orës lokale të Francës / Shqipërisë (UTC+2 në verë)',
    'group.label':         'Grupi',
    'ko.title':            '🏆 Faza eliminuese',
    'ko.elim':             '🏆 Elim.',
    'save':                'Ruaj',
    'saved':               '✓ Ruajtur',
    'save.error':          '✗ Gabim',
    'score.invalid':       '⚠ Rezultat i pavlefshëm',
    'round.1/32':          '1/32 e finales',
    'round.1/16':          '1/16 e finales',
    'round.1/4':           'Çerekfinale',
    'round.1/2':           'Gjysmëfinale',
    'round.Petite finale': 'Finalja e vogël',
    'round.Finale':        'Finalja',
    'sidebar.missing':     n => `${n} pronostik${n > 1 ? 'e' : ''} mung${n > 1 ? 'ojnë' : 'on'}`,
    'sidebar.complete':    'Të gjitha pronostikimet janë plotësuar',
    'lb.title':            '🏅 Renditja',
    'lb.subtitle':         'Përditësohet në kohë reale pas çdo rezultati të futur.',
    'lb.legend.exact':     '🎯 Rezultat i saktë',
    'lb.legend.correct':   '✅ Rezultat i duhur',
    'lb.legend.wrong':     '❌ Gabim',
    'lb.legend.phases':    '🏆 Fazat finale',
    'lb.col.rank':         'Vendi',
    'lb.col.pseudo':       'Pseudonimi',
    'lb.col.points':       'Pikët',
    'lb.col.detail':       'Detaje',
    'lb.loading':          'Po ngarkohet…',
    'lb.empty':            'Asnjë pjesëmarrës për momentin.',
    'lb.error':            'Gabim gjatë ngarkimit.',
    'lb.pts':              'pikë',
    'lb.exacts':           'saktë',
    'lb.pronos':           'pronostikime',
    'result.label':        'Rezultati',
    'nav.results':         '📊 Rezultatet e mia',
    'results.title':       '📊 Rezultatet e mia',
    'results.subtitle':    'Përmbledhje e pronostikimeve të tua për ndeshjet e përfunduara.',
    'results.col.prono':   'Pronostikimi im',
    'results.col.result':  'Rezultati',
    'results.col.pts':     'Pikë',
    'results.empty':       'Asnjë rezultat i disponueshëm për momentin.',
    'results.total':       'Gjithsej',
    'footer.left':         '🇫🇷 🇦🇱 Pronostikime mes kolegëve · Keendoo',
    'footer.right':        '⚽ Kupa e Botës 2026',
    'lang.switch':         '🇫🇷 Français',
    'lang.switch.title':   'Passer en français',
  },
};

// ─── API publique ─────────────────────────────────────────────────────────────

let _lang = localStorage.getItem('wc26_lang') || 'fr';

export function t(key, ...args) {
  const val = TRANSLATIONS[_lang]?.[key] ?? TRANSLATIONS.fr[key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

export function getLang() { return _lang; }

export function setLang(lang) {
  _lang = lang;
  localStorage.setItem('wc26_lang', lang);
  document.documentElement.lang = lang;
  _applyStatic();
  window.dispatchEvent(new CustomEvent('wc26:langchange'));
}

function _applyStatic() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-lang]').forEach(btn => {
    btn.textContent = t('lang.switch');
    btn.title       = t('lang.switch.title');
  });
}

export function initI18n() {
  _lang = localStorage.getItem('wc26_lang') || 'fr';
  document.documentElement.lang = _lang;
  _applyStatic();
  document.querySelectorAll('[data-i18n-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLang(_lang === 'fr' ? 'sq' : 'fr'));
  });
}
