// Données officielles FIFA Coupe du Monde 2026 — USA / Canada / Mexique
// Source : FIFA / OneFootball / cdm2026.fr (mai 2026)

export const GROUPS = {
  A: { teams: [
    { id: 'mex', name: 'Mexique',            flag: '🇲🇽' },
    { id: 'rsa', name: 'Afrique du Sud',     flag: '🇿🇦' },
    { id: 'kor', name: 'Corée du Sud',        flag: '🇰🇷' },
    { id: 'cze', name: 'Tchéquie',            flag: '🇨🇿' },
  ]},
  B: { teams: [
    { id: 'can', name: 'Canada',              flag: '🇨🇦' },
    { id: 'bih', name: 'Bosnie-Herzégovine', flag: '🇧🇦' },
    { id: 'qat', name: 'Qatar',               flag: '🇶🇦' },
    { id: 'sui', name: 'Suisse',              flag: '🇨🇭' },
  ]},
  C: { teams: [
    { id: 'bra', name: 'Brésil',              flag: '🇧🇷' },
    { id: 'mar', name: 'Maroc',               flag: '🇲🇦' },
    { id: 'hai', name: 'Haïti',               flag: '🇭🇹' },
    { id: 'sco', name: 'Écosse',              flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ]},
  D: { teams: [
    { id: 'usa', name: 'États-Unis',          flag: '🇺🇸' },
    { id: 'par', name: 'Paraguay',            flag: '🇵🇾' },
    { id: 'aus', name: 'Australie',           flag: '🇦🇺' },
    { id: 'tur', name: 'Turquie',             flag: '🇹🇷' },
  ]},
  E: { teams: [
    { id: 'ger', name: 'Allemagne',           flag: '🇩🇪' },
    { id: 'cur', name: 'Curaçao',             flag: '🇨🇼' },
    { id: 'civ', name: "Côte d'Ivoire",       flag: '🇨🇮' },
    { id: 'ecu', name: 'Équateur',            flag: '🇪🇨' },
  ]},
  F: { teams: [
    { id: 'ned', name: 'Pays-Bas',            flag: '🇳🇱' },
    { id: 'jpn', name: 'Japon',               flag: '🇯🇵' },
    { id: 'swe', name: 'Suède',               flag: '🇸🇪' },
    { id: 'tun', name: 'Tunisie',             flag: '🇹🇳' },
  ]},
  G: { teams: [
    { id: 'bel', name: 'Belgique',            flag: '🇧🇪' },
    { id: 'egy', name: 'Égypte',              flag: '🇪🇬' },
    { id: 'irn', name: 'Iran',                flag: '🇮🇷' },
    { id: 'nzl', name: 'Nouvelle-Zélande',   flag: '🇳🇿' },
  ]},
  H: { teams: [
    { id: 'esp', name: 'Espagne',             flag: '🇪🇸' },
    { id: 'cpv', name: 'Cap-Vert',            flag: '🇨🇻' },
    { id: 'ksa', name: 'Arabie Saoudite',     flag: '🇸🇦' },
    { id: 'uru', name: 'Uruguay',             flag: '🇺🇾' },
  ]},
  I: { teams: [
    { id: 'fra', name: 'France',              flag: '🇫🇷' },
    { id: 'sen', name: 'Sénégal',             flag: '🇸🇳' },
    { id: 'irq', name: 'Irak',                flag: '🇮🇶' },
    { id: 'nor', name: 'Norvège',             flag: '🇳🇴' },
  ]},
  J: { teams: [
    { id: 'arg', name: 'Argentine',           flag: '🇦🇷' },
    { id: 'alg', name: 'Algérie',             flag: '🇩🇿' },
    { id: 'aut', name: 'Autriche',            flag: '🇦🇹' },
    { id: 'jor', name: 'Jordanie',            flag: '🇯🇴' },
  ]},
  K: { teams: [
    { id: 'por', name: 'Portugal',            flag: '🇵🇹' },
    { id: 'cod', name: 'RD Congo',            flag: '🇨🇩' },
    { id: 'uzb', name: 'Ouzbékistan',         flag: '🇺🇿' },
    { id: 'col', name: 'Colombie',            flag: '🇨🇴' },
  ]},
  L: { teams: [
    { id: 'eng', name: 'Angleterre',          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'cro', name: 'Croatie',             flag: '🇭🇷' },
    { id: 'gha', name: 'Ghana',               flag: '🇬🇭' },
    { id: 'pan', name: 'Panama',              flag: '🇵🇦' },
  ]},
};

// [idx_team1, idx_team2, date_UTC, stade, journée]
const GROUP_SCHEDULE = {
  A: [
    [0, 1, '2026-06-11T20:00:00Z', 'Mexico (Estadio Azteca)', 1],
    [2, 3, '2026-06-12T03:00:00Z', 'Guadalajara (Estadio Akron)', 1],
    [0, 2, '2026-06-18T02:00:00Z', 'Guadalajara (Estadio Akron)', 2],
    [3, 1, '2026-06-18T17:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 2],
    [3, 0, '2026-06-24T02:00:00Z', 'Mexico (Estadio Azteca)', 3],
    [1, 2, '2026-06-24T02:00:00Z', 'Monterrey (Estadio BBVA)', 3],
  ],
  B: [
    [0, 1, '2026-06-12T20:00:00Z', 'Toronto (BMO Field)', 1],
    [2, 3, '2026-06-13T20:00:00Z', 'San Francisco (Levi\'s Stadium)', 1],
    [3, 1, '2026-06-18T20:00:00Z', 'Los Angeles (SoFi Stadium)', 2],
    [0, 2, '2026-06-19T23:00:00Z', 'Vancouver (BC Place)', 2],
    [3, 0, '2026-06-24T20:00:00Z', 'Vancouver (BC Place)', 3],
    [1, 2, '2026-06-24T23:00:00Z', 'Seattle (Lumen Field)', 3],
  ],
  C: [
    [2, 3, '2026-06-14T02:00:00Z', 'Boston (Gillette Stadium)', 1],
    [0, 1, '2026-06-14T23:00:00Z', 'New Jersey (MetLife Stadium)', 1],
    [0, 2, '2026-06-20T02:00:00Z', 'Philadelphie (Lincoln Financial Field)', 2],
    [3, 1, '2026-06-20T23:00:00Z', 'Boston (Gillette Stadium)', 2],
    [1, 2, '2026-06-25T02:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 3],
    [3, 0, '2026-06-25T23:00:00Z', 'Miami (Hard Rock Stadium)', 3],
  ],
  D: [
    [0, 1, '2026-06-13T02:00:00Z', 'Los Angeles (SoFi Stadium)', 1],
    [2, 3, '2026-06-13T05:00:00Z', 'Vancouver (BC Place)', 1],
    [3, 1, '2026-06-19T05:00:00Z', 'San Francisco (Levi\'s Stadium)', 2],
    [0, 2, '2026-06-19T20:00:00Z', 'Seattle (Lumen Field)', 2],
    [3, 0, '2026-06-26T03:00:00Z', 'Los Angeles (SoFi Stadium)', 3],
    [1, 2, '2026-06-26T03:00:00Z', 'San Francisco (Levi\'s Stadium)', 3],
  ],
  E: [
    [0, 1, '2026-06-14T18:00:00Z', 'Houston (NRG Stadium)', 1],
    [2, 3, '2026-06-15T00:00:00Z', 'Philadelphie (Lincoln Financial Field)', 1],
    [0, 2, '2026-06-20T21:00:00Z', 'Toronto (BMO Field)', 2],
    [3, 1, '2026-06-21T01:00:00Z', 'Kansas City (Arrowhead Stadium)', 2],
    [3, 0, '2026-06-25T21:00:00Z', 'New Jersey (MetLife Stadium)', 3],
    [1, 2, '2026-06-25T21:00:00Z', 'Philadelphie (Lincoln Financial Field)', 3],
  ],
  F: [
    [0, 1, '2026-06-14T21:00:00Z', 'Dallas (AT&T Stadium)', 1],
    [2, 3, '2026-06-15T03:00:00Z', 'Monterrey (Estadio BBVA)', 1],
    [0, 2, '2026-06-20T18:00:00Z', 'Houston (NRG Stadium)', 2],
    [3, 1, '2026-06-20T05:00:00Z', 'Monterrey (Estadio BBVA)', 2],
    [1, 2, '2026-06-26T01:00:00Z', 'Dallas (AT&T Stadium)', 3],
    [3, 0, '2026-06-26T01:00:00Z', 'Kansas City (Arrowhead Stadium)', 3],
  ],
  G: [
    [2, 3, '2026-06-15T02:00:00Z', 'Los Angeles (SoFi Stadium)', 1],
    [0, 1, '2026-06-15T19:00:00Z', 'Seattle (Lumen Field)', 1],
    [0, 2, '2026-06-21T19:00:00Z', 'Los Angeles (SoFi Stadium)', 2],
    [3, 1, '2026-06-21T01:00:00Z', 'Vancouver (BC Place)', 2],
    [1, 2, '2026-06-26T04:00:00Z', 'Seattle (Lumen Field)', 3],
    [3, 0, '2026-06-26T04:00:00Z', 'Vancouver (BC Place)', 3],
  ],
  H: [
    [0, 1, '2026-06-15T17:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 1],
    [2, 3, '2026-06-15T22:00:00Z', 'Miami (Hard Rock Stadium)', 1],
    [0, 2, '2026-06-21T17:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 2],
    [3, 1, '2026-06-21T22:00:00Z', 'Miami (Hard Rock Stadium)', 2],
    [1, 2, '2026-06-26T01:00:00Z', 'Houston (NRG Stadium)', 3],
    [3, 0, '2026-06-26T01:00:00Z', 'Guadalajara (Estadio Akron)', 3],
  ],
  I: [
    [0, 1, '2026-06-16T19:00:00Z', 'New Jersey (MetLife Stadium)', 1],
    [2, 3, '2026-06-16T22:00:00Z', 'Boston (Gillette Stadium)', 1],
    [0, 2, '2026-06-22T21:00:00Z', 'Philadelphie (Lincoln Financial Field)', 2],
    [3, 1, '2026-06-22T00:00:00Z', 'New Jersey (MetLife Stadium)', 2],
    [3, 0, '2026-06-26T19:00:00Z', 'Boston (Gillette Stadium)', 3],
    [1, 2, '2026-06-26T19:00:00Z', 'Toronto (BMO Field)', 3],
  ],
  J: [
    [0, 1, '2026-06-16T01:00:00Z', 'Kansas City (Arrowhead Stadium)', 1],
    [2, 3, '2026-06-16T04:00:00Z', 'San Francisco (Levi\'s Stadium)', 1],
    [0, 2, '2026-06-22T18:00:00Z', 'Dallas (AT&T Stadium)', 2],
    [3, 1, '2026-06-22T04:00:00Z', 'San Francisco (Levi\'s Stadium)', 2],
    [1, 2, '2026-06-27T03:00:00Z', 'Kansas City (Arrowhead Stadium)', 3],
    [3, 0, '2026-06-27T03:00:00Z', 'Dallas (AT&T Stadium)', 3],
  ],
  K: [
    [0, 1, '2026-06-17T18:00:00Z', 'Houston (NRG Stadium)', 1],
    [2, 3, '2026-06-17T03:00:00Z', 'Mexico (Estadio Azteca)', 1],
    [0, 2, '2026-06-23T18:00:00Z', 'Houston (NRG Stadium)', 2],
    [3, 1, '2026-06-23T03:00:00Z', 'Guadalajara (Estadio Akron)', 2],
    [3, 0, '2026-06-27T00:30:00Z', 'Miami (Hard Rock Stadium)', 3],
    [1, 2, '2026-06-27T00:30:00Z', 'Atlanta (Mercedes-Benz Stadium)', 3],
  ],
  L: [
    [0, 1, '2026-06-17T21:00:00Z', 'Dallas (AT&T Stadium)', 1],
    [2, 3, '2026-06-17T23:00:00Z', 'Toronto (BMO Field)', 1],
    [0, 2, '2026-06-23T21:00:00Z', 'Boston (Gillette Stadium)', 2],
    [3, 1, '2026-06-23T23:00:00Z', 'Toronto (BMO Field)', 2],
    [3, 0, '2026-06-27T22:00:00Z', 'New Jersey (MetLife Stadium)', 3],
    [1, 2, '2026-06-27T22:00:00Z', 'Philadelphie (Lincoln Financial Field)', 3],
  ],
};

export const MATCHES = (() => {
  const matches = [];
  for (const [gId, schedule] of Object.entries(GROUP_SCHEDULE)) {
    schedule.forEach(([i, j, date, venue, matchday], idx) => {
      matches.push({
        id: `${gId}${idx + 1}`,
        group: gId,
        matchday,
        team1: GROUPS[gId].teams[i],
        team2: GROUPS[gId].teams[j],
        date,
        venue,
      });
    });
  }
  return matches.sort((a, b) => new Date(a.date) - new Date(b.date));
})();

export function calcPoints(pred, result) {
  if (!result || result.score1 == null || result.score2 == null) return null;
  if (pred.score1 === result.score1 && pred.score2 === result.score2) return 3;
  const predSign = Math.sign(pred.score1 - pred.score2);
  const realSign = Math.sign(result.score1 - result.score2);
  return predSign === realSign ? 1 : 0;
}
