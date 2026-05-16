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
// Heures en UTC — la source originale était en CET (UTC+1) au lieu de CEST (UTC+2).
// Toutes les heures ont été corrigées de -1h pour correspondre aux vrais coups d'envoi.
const GROUP_SCHEDULE = {
  A: [
    [0, 1, '2026-06-11T19:00:00Z', 'Mexico (Estadio Azteca)', 1],           // 21h CEST
    [2, 3, '2026-06-12T02:00:00Z', 'Guadalajara (Estadio Akron)', 1],       // 04h CEST
    [0, 2, '2026-06-19T01:00:00Z', 'Guadalajara (Estadio Akron)', 2],       // 03h CEST
    [3, 1, '2026-06-18T16:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 2],   // 18h CEST
    [3, 0, '2026-06-25T01:00:00Z', 'Mexico (Estadio Azteca)', 3],           // 03h CEST
    [1, 2, '2026-06-25T01:00:00Z', 'Monterrey (Estadio BBVA)', 3],          // 03h CEST
  ],
  B: [
    [0, 1, '2026-06-12T19:00:00Z', 'Toronto (BMO Field)', 1],               // 21h CEST
    [2, 3, '2026-06-13T19:00:00Z', 'San Francisco (Levi\'s Stadium)', 1],   // 21h CEST
    [3, 1, '2026-06-18T19:00:00Z', 'Los Angeles (SoFi Stadium)', 2],        // 21h CEST
    [0, 2, '2026-06-18T22:00:00Z', 'Vancouver (BC Place)', 2],              // 00h CEST (19 juin)
    [3, 0, '2026-06-24T19:00:00Z', 'Vancouver (BC Place)', 3],              // 21h CEST
    [1, 2, '2026-06-24T19:00:00Z', 'Seattle (Lumen Field)', 3],             // 21h CEST
  ],
  C: [
    [2, 3, '2026-06-14T01:00:00Z', 'Boston (Gillette Stadium)', 1],         // 03h CEST
    [0, 1, '2026-06-14T22:00:00Z', 'New Jersey (MetLife Stadium)', 1],      // 00h CEST
    [0, 2, '2026-06-20T01:00:00Z', 'Philadelphie (Lincoln Financial Field)', 2], // 03h CEST
    [3, 1, '2026-06-20T22:00:00Z', 'Boston (Gillette Stadium)', 2],         // 00h CEST
    [1, 2, '2026-06-25T01:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 3],   // 03h CEST
    [3, 0, '2026-06-25T22:00:00Z', 'Miami (Hard Rock Stadium)', 3],         // 00h CEST
  ],
  D: [
    [0, 1, '2026-06-13T01:00:00Z', 'Los Angeles (SoFi Stadium)', 1],        // 03h CEST
    [2, 3, '2026-06-13T04:00:00Z', 'Vancouver (BC Place)', 1],              // 06h CEST
    [3, 1, '2026-06-19T04:00:00Z', 'San Francisco (Levi\'s Stadium)', 2],   // 06h CEST
    [0, 2, '2026-06-19T19:00:00Z', 'Seattle (Lumen Field)', 2],             // 21h CEST
    [3, 0, '2026-06-26T02:00:00Z', 'Los Angeles (SoFi Stadium)', 3],        // 04h CEST
    [1, 2, '2026-06-26T02:00:00Z', 'San Francisco (Levi\'s Stadium)', 3],   // 04h CEST
  ],
  E: [
    [0, 1, '2026-06-14T17:00:00Z', 'Houston (NRG Stadium)', 1],             // 19h CEST
    [2, 3, '2026-06-14T23:00:00Z', 'Philadelphie (Lincoln Financial Field)', 1], // 01h CEST
    [0, 2, '2026-06-20T20:00:00Z', 'Toronto (BMO Field)', 2],               // 22h CEST
    [3, 1, '2026-06-21T00:00:00Z', 'Kansas City (Arrowhead Stadium)', 2],   // 02h CEST
    [3, 0, '2026-06-25T20:00:00Z', 'New Jersey (MetLife Stadium)', 3],      // 22h CEST
    [1, 2, '2026-06-25T20:00:00Z', 'Philadelphie (Lincoln Financial Field)', 3], // 22h CEST
  ],
  F: [
    [0, 1, '2026-06-14T20:00:00Z', 'Dallas (AT&T Stadium)', 1],             // 22h CEST
    [2, 3, '2026-06-15T02:00:00Z', 'Monterrey (Estadio BBVA)', 1],          // 04h CEST
    [0, 2, '2026-06-20T17:00:00Z', 'Houston (NRG Stadium)', 2],             // 19h CEST
    [3, 1, '2026-06-20T04:00:00Z', 'Monterrey (Estadio BBVA)', 2],          // 06h CEST
    [1, 2, '2026-06-26T00:00:00Z', 'Dallas (AT&T Stadium)', 3],             // 02h CEST
    [3, 0, '2026-06-26T00:00:00Z', 'Kansas City (Arrowhead Stadium)', 3],   // 02h CEST
  ],
  G: [
    [2, 3, '2026-06-15T01:00:00Z', 'Los Angeles (SoFi Stadium)', 1],        // 03h CEST
    [0, 1, '2026-06-15T18:00:00Z', 'Seattle (Lumen Field)', 1],             // 20h CEST
    [0, 2, '2026-06-21T18:00:00Z', 'Los Angeles (SoFi Stadium)', 2],        // 20h CEST
    [3, 1, '2026-06-21T00:00:00Z', 'Vancouver (BC Place)', 2],              // 02h CEST
    [1, 2, '2026-06-26T03:00:00Z', 'Seattle (Lumen Field)', 3],             // 05h CEST
    [3, 0, '2026-06-26T03:00:00Z', 'Vancouver (BC Place)', 3],              // 05h CEST
  ],
  H: [
    [0, 1, '2026-06-15T16:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 1],   // 18h CEST
    [2, 3, '2026-06-15T21:00:00Z', 'Miami (Hard Rock Stadium)', 1],         // 23h CEST
    [0, 2, '2026-06-21T16:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 2],   // 18h CEST
    [3, 1, '2026-06-21T21:00:00Z', 'Miami (Hard Rock Stadium)', 2],         // 23h CEST
    [1, 2, '2026-06-26T00:00:00Z', 'Houston (NRG Stadium)', 3],             // 02h CEST
    [3, 0, '2026-06-26T00:00:00Z', 'Guadalajara (Estadio Akron)', 3],       // 02h CEST
  ],
  I: [
    [0, 1, '2026-06-16T18:00:00Z', 'New Jersey (MetLife Stadium)', 1],      // 20h CEST
    [2, 3, '2026-06-16T21:00:00Z', 'Boston (Gillette Stadium)', 1],         // 23h CEST
    [0, 2, '2026-06-22T20:00:00Z', 'Philadelphie (Lincoln Financial Field)', 2], // 22h CEST
    [3, 1, '2026-06-21T23:00:00Z', 'New Jersey (MetLife Stadium)', 2],      // 01h CEST
    [3, 0, '2026-06-26T18:00:00Z', 'Boston (Gillette Stadium)', 3],         // 20h CEST
    [1, 2, '2026-06-26T18:00:00Z', 'Toronto (BMO Field)', 3],               // 20h CEST
  ],
  J: [
    [0, 1, '2026-06-16T00:00:00Z', 'Kansas City (Arrowhead Stadium)', 1],   // 02h CEST
    [2, 3, '2026-06-16T03:00:00Z', 'San Francisco (Levi\'s Stadium)', 1],   // 05h CEST
    [0, 2, '2026-06-22T17:00:00Z', 'Dallas (AT&T Stadium)', 2],             // 19h CEST
    [3, 1, '2026-06-22T03:00:00Z', 'San Francisco (Levi\'s Stadium)', 2],   // 05h CEST
    [1, 2, '2026-06-27T02:00:00Z', 'Kansas City (Arrowhead Stadium)', 3],   // 04h CEST
    [3, 0, '2026-06-27T02:00:00Z', 'Dallas (AT&T Stadium)', 3],             // 04h CEST
  ],
  K: [
    [0, 1, '2026-06-17T17:00:00Z', 'Houston (NRG Stadium)', 1],             // 19h CEST
    [2, 3, '2026-06-17T02:00:00Z', 'Mexico (Estadio Azteca)', 1],           // 04h CEST
    [0, 2, '2026-06-23T17:00:00Z', 'Houston (NRG Stadium)', 2],             // 19h CEST
    [3, 1, '2026-06-23T02:00:00Z', 'Guadalajara (Estadio Akron)', 2],       // 04h CEST
    [3, 0, '2026-06-26T23:30:00Z', 'Miami (Hard Rock Stadium)', 3],         // 01h30 CEST
    [1, 2, '2026-06-26T23:30:00Z', 'Atlanta (Mercedes-Benz Stadium)', 3],   // 01h30 CEST
  ],
  L: [
    [0, 1, '2026-06-17T20:00:00Z', 'Dallas (AT&T Stadium)', 1],             // 22h CEST
    [2, 3, '2026-06-17T22:00:00Z', 'Toronto (BMO Field)', 1],               // 00h CEST
    [0, 2, '2026-06-23T20:00:00Z', 'Boston (Gillette Stadium)', 2],         // 22h CEST
    [3, 1, '2026-06-23T22:00:00Z', 'Toronto (BMO Field)', 2],               // 00h CEST
    [3, 0, '2026-06-27T21:00:00Z', 'New Jersey (MetLife Stadium)', 3],      // 23h CEST
    [1, 2, '2026-06-27T21:00:00Z', 'Philadelphie (Lincoln Financial Field)', 3], // 23h CEST
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

export const ROUND_MULTIPLIERS = {
  '1/32': 1,
  '1/16': 1,
  '1/4':  2,
  '1/2':  3,
  'Petite finale': 2,
  'Finale': 4,
};

export function calcPoints(pred, result) {
  if (!result || result.score1 == null || result.score2 == null) return null;
  if (pred.score1 === result.score1 && pred.score2 === result.score2) return 3;
  const predSign = Math.sign(pred.score1 - pred.score2);
  const realSign = Math.sign(result.score1 - result.score2);
  return predSign === realSign ? 1 : 0;
}
