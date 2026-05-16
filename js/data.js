// ⚠️ Groupes APPROXIMATIFS — à vérifier sur fifa.com avant le tournoi
export const GROUPS = {
  A: { teams: [
    { id: 'usa', name: 'États-Unis',         flag: '🇺🇸' },
    { id: 'eng', name: 'Angleterre',          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'pan', name: 'Panama',              flag: '🇵🇦' },
    { id: 'sen', name: 'Sénégal',             flag: '🇸🇳' },
  ]},
  B: { teams: [
    { id: 'mex', name: 'Mexique',             flag: '🇲🇽' },
    { id: 'fra', name: 'France',              flag: '🇫🇷' },
    { id: 'ksa', name: 'Arabie Saoudite',     flag: '🇸🇦' },
    { id: 'rsa', name: 'Afrique du Sud',      flag: '🇿🇦' },
  ]},
  C: { teams: [
    { id: 'can', name: 'Canada',              flag: '🇨🇦' },
    { id: 'bel', name: 'Belgique',            flag: '🇧🇪' },
    { id: 'hon', name: 'Honduras',            flag: '🇭🇳' },
    { id: 'mar', name: 'Maroc',               flag: '🇲🇦' },
  ]},
  D: { teams: [
    { id: 'arg', name: 'Argentine',           flag: '🇦🇷' },
    { id: 'ger', name: 'Allemagne',           flag: '🇩🇪' },
    { id: 'aus', name: 'Australie',           flag: '🇦🇺' },
    { id: 'nga', name: 'Nigeria',             flag: '🇳🇬' },
  ]},
  E: { teams: [
    { id: 'bra', name: 'Brésil',              flag: '🇧🇷' },
    { id: 'por', name: 'Portugal',            flag: '🇵🇹' },
    { id: 'jpn', name: 'Japon',               flag: '🇯🇵' },
    { id: 'cmr', name: 'Cameroun',            flag: '🇨🇲' },
  ]},
  F: { teams: [
    { id: 'col', name: 'Colombie',            flag: '🇨🇴' },
    { id: 'esp', name: 'Espagne',             flag: '🇪🇸' },
    { id: 'kor', name: 'Corée du Sud',        flag: '🇰🇷' },
    { id: 'civ', name: "Côte d'Ivoire",       flag: '🇨🇮' },
  ]},
  G: { teams: [
    { id: 'uru', name: 'Uruguay',             flag: '🇺🇾' },
    { id: 'ita', name: 'Italie',              flag: '🇮🇹' },
    { id: 'irn', name: 'Iran',                flag: '🇮🇷' },
    { id: 'egy', name: 'Égypte',              flag: '🇪🇬' },
  ]},
  H: { teams: [
    { id: 'ecu', name: 'Équateur',            flag: '🇪🇨' },
    { id: 'ned', name: 'Pays-Bas',            flag: '🇳🇱' },
    { id: 'jor', name: 'Jordanie',            flag: '🇯🇴' },
    { id: 'mli', name: 'Mali',                flag: '🇲🇱' },
  ]},
  I: { teams: [
    { id: 'ven', name: 'Venezuela',           flag: '🇻🇪' },
    { id: 'cro', name: 'Croatie',             flag: '🇭🇷' },
    { id: 'qat', name: 'Qatar',               flag: '🇶🇦' },
    { id: 'cod', name: 'RD Congo',            flag: '🇨🇩' },
  ]},
  J: { teams: [
    { id: 'sui', name: 'Suisse',              flag: '🇨🇭' },
    { id: 'tur', name: 'Turquie',             flag: '🇹🇷' },
    { id: 'slv', name: 'El Salvador',         flag: '🇸🇻' },
    { id: 'uzb', name: 'Ouzbékistan',         flag: '🇺🇿' },
  ]},
  K: { teams: [
    { id: 'den', name: 'Danemark',            flag: '🇩🇰' },
    { id: 'srb', name: 'Serbie',              flag: '🇷🇸' },
    { id: 'nzl', name: 'Nouvelle-Zélande',   flag: '🇳🇿' },
    { id: 'b1',  name: 'Barrage intercont.1', flag: '⚽' },
  ]},
  L: { teams: [
    { id: 'pol', name: 'Pologne',             flag: '🇵🇱' },
    { id: 'cze', name: 'Tchéquie',            flag: '🇨🇿' },
    { id: 'aut', name: 'Autriche',            flag: '🇦🇹' },
    { id: 'b2',  name: 'Barrage intercont.2', flag: '⚽' },
  ]},
};

// Dates approximatives des journées par groupe (heure UTC)
const GROUP_DAYS = {
  A: ['2026-06-12', '2026-06-19', '2026-06-26'],
  B: ['2026-06-12', '2026-06-19', '2026-06-26'],
  C: ['2026-06-13', '2026-06-20', '2026-06-27'],
  D: ['2026-06-13', '2026-06-20', '2026-06-27'],
  E: ['2026-06-14', '2026-06-21', '2026-06-28'],
  F: ['2026-06-14', '2026-06-21', '2026-06-28'],
  G: ['2026-06-15', '2026-06-22', '2026-06-29'],
  H: ['2026-06-15', '2026-06-22', '2026-06-29'],
  I: ['2026-06-16', '2026-06-23', '2026-06-30'],
  J: ['2026-06-16', '2026-06-23', '2026-06-30'],
  K: ['2026-06-17', '2026-06-24', '2026-07-01'],
  L: ['2026-06-17', '2026-06-24', '2026-07-01'],
};

// [idx_team1, idx_team2, matchday_index]
const COMBINATIONS = [
  [0, 1, 0], [2, 3, 0],
  [0, 2, 1], [1, 3, 1],
  [0, 3, 2], [1, 2, 2],
];

function generateMatches() {
  const matches = [];
  for (const [gId, group] of Object.entries(GROUPS)) {
    COMBINATIONS.forEach(([i, j, day], idx) => {
      matches.push({
        id: `${gId}${idx + 1}`,
        group: gId,
        matchday: day + 1,
        team1: group.teams[i],
        team2: group.teams[j],
        date: `${GROUP_DAYS[gId][day]}T18:00:00Z`,
      });
    });
  }
  return matches;
}

export const MATCHES = generateMatches();

export function calcPoints(pred, result) {
  if (result.score1 == null || result.score2 == null) return null;
  if (pred.score1 === result.score1 && pred.score2 === result.score2) return 3;
  const predSign = Math.sign(pred.score1 - pred.score2);
  const realSign = Math.sign(result.score1 - result.score2);
  return predSign === realSign ? 1 : 0;
}
