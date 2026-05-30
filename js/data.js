// Données officielles FIFA Coupe du Monde 2026 — USA / Canada / Mexique
// Source : FIFA / OneFootball / cdm2026.fr (mai 2026)

export const GROUPS = {
  A: { teams: [
    { id: 'mex', name: 'Mexique',            namesq: 'Meksikë',                    flag: '🇲🇽' },
    { id: 'rsa', name: 'Afrique du Sud',     namesq: 'Afrika e Jugut',             flag: '🇿🇦' },
    { id: 'kor', name: 'Corée du Sud',       namesq: 'Koreja e Jugut',             flag: '🇰🇷' },
    { id: 'cze', name: 'Tchéquie',           namesq: 'Çeki',                      flag: '🇨🇿' },
  ]},
  B: { teams: [
    { id: 'can', name: 'Canada',             namesq: 'Kanada',                     flag: '🇨🇦' },
    { id: 'bih', name: 'Bosnie-Herzégovine', namesq: 'Bosnja dhe Hercegovina',     flag: '🇧🇦' },
    { id: 'qat', name: 'Qatar',              namesq: 'Katar',                     flag: '🇶🇦' },
    { id: 'sui', name: 'Suisse',             namesq: 'Zvicër',                     flag: '🇨🇭' },
  ]},
  C: { teams: [
    { id: 'bra', name: 'Brésil',             namesq: 'Brazil',                    flag: '🇧🇷' },
    { id: 'mar', name: 'Maroc',              namesq: 'Marok',                     flag: '🇲🇦' },
    { id: 'hai', name: 'Haïti',              namesq: 'Haiti',                      flag: '🇭🇹' },
    { id: 'sco', name: 'Écosse',             namesq: 'Skoci',                     flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ]},
  D: { teams: [
    { id: 'usa', name: 'États-Unis',         namesq: 'Shtetet e Bashkuara',        flag: '🇺🇸' },
    { id: 'par', name: 'Paraguay',           namesq: 'Paraguaji',                  flag: '🇵🇾' },
    { id: 'aus', name: 'Australie',          namesq: 'Australi',                  flag: '🇦🇺' },
    { id: 'tur', name: 'Turquie',            namesq: 'Turqi',                     flag: '🇹🇷' },
  ]},
  E: { teams: [
    { id: 'ger', name: 'Allemagne',          namesq: 'Gjermani',                  flag: '🇩🇪' },
    { id: 'cur', name: 'Curaçao',            namesq: 'Kuraçao',                    flag: '🇨🇼' },
    { id: 'civ', name: "Côte d'Ivoire",      namesq: 'Bregu i Fildishtë',          flag: '🇨🇮' },
    { id: 'ecu', name: 'Équateur',           namesq: 'Ekuador',                   flag: '🇪🇨' },
  ]},
  F: { teams: [
    { id: 'ned', name: 'Pays-Bas',           namesq: 'Hollandë',                    flag: '🇳🇱' },
    { id: 'jpn', name: 'Japon',              namesq: 'Japoni',                    flag: '🇯🇵' },
    { id: 'swe', name: 'Suède',              namesq: 'Suedi',                     flag: '🇸🇪' },
    { id: 'tun', name: 'Tunisie',            namesq: 'Tunizi',                    flag: '🇹🇳' },
  ]},
  G: { teams: [
    { id: 'bel', name: 'Belgique',           namesq: 'Belgjikë',                   flag: '🇧🇪' },
    { id: 'egy', name: 'Égypte',             namesq: 'Egjipt',                    flag: '🇪🇬' },
    { id: 'irn', name: 'Iran',               namesq: 'Iran',                      flag: '🇮🇷' },
    { id: 'nzl', name: 'Nouvelle-Zélande',  namesq: 'Zelanda e Re',               flag: '🇳🇿' },
  ]},
  H: { teams: [
    { id: 'esp', name: 'Espagne',            namesq: 'Spanjë',                     flag: '🇪🇸' },
    { id: 'cpv', name: 'Cap-Vert',           namesq: 'Cape Verde',             flag: '🇨🇻' },
    { id: 'ksa', name: 'Arabie Saoudite',    namesq: 'Arabia Saudite',             flag: '🇸🇦' },
    { id: 'uru', name: 'Uruguay',            namesq: 'Uruguaji',                   flag: '🇺🇾' },
  ]},
  I: { teams: [
    { id: 'fra', name: 'France',             namesq: 'Francë',                     flag: '🇫🇷' },
    { id: 'sen', name: 'Sénégal',            namesq: 'Senegal',                   flag: '🇸🇳' },
    { id: 'irq', name: 'Irak',               namesq: 'Irak',                      flag: '🇮🇶' },
    { id: 'nor', name: 'Norvège',            namesq: 'Norvegji',                  flag: '🇳🇴' },
  ]},
  J: { teams: [
    { id: 'arg', name: 'Argentine',          namesq: 'Argjentinë',                 flag: '🇦🇷' },
    { id: 'alg', name: 'Algérie',            namesq: 'Algjeri',                   flag: '🇩🇿' },
    { id: 'aut', name: 'Autriche',           namesq: 'Austri',                    flag: '🇦🇹' },
    { id: 'jor', name: 'Jordanie',           namesq: 'Jordani',                   flag: '🇯🇴' },
  ]},
  K: { teams: [
    { id: 'por', name: 'Portugal',           namesq: 'Portugali',                 flag: '🇵🇹' },
    { id: 'cod', name: 'RD Congo',           namesq: 'RD Kongo',                   flag: '🇨🇩' },
    { id: 'uzb', name: 'Ouzbékistan',        namesq: 'Uzbekistan',                flag: '🇺🇿' },
    { id: 'col', name: 'Colombie',           namesq: 'Kolumbi',                   flag: '🇨🇴' },
  ]},
  L: { teams: [
    { id: 'eng', name: 'Angleterre',         namesq: 'Angli',                     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'cro', name: 'Croatie',            namesq: 'Kroaci',                    flag: '🇭🇷' },
    { id: 'gha', name: 'Ghana',              namesq: 'Gana',                       flag: '🇬🇭' },
    { id: 'pan', name: 'Panama',             namesq: 'Panama',                   flag: '🇵🇦' },
  ]},
};

// Lookup name (FR) → namesq for KO matches loaded from Firestore (only name/flag stored there)
export const TEAM_NAMES_SQ = Object.fromEntries(
  Object.values(GROUPS).flatMap(g => g.teams.map(t => [t.name, t.namesq]))
);

// [idx_team1, idx_team2, date_UTC, stade, journée]
// Heures en UTC — la source originale était en CET (UTC+1) au lieu de CEST (UTC+2).
// Toutes les heures ont été corrigées de -1h pour correspondre aux vrais coups d'envoi.
const GROUP_SCHEDULE = {
  A: [
    [0, 1, '2026-06-11T19:00:00Z', 'Mexico (Estadio Azteca)', 1],           // 21h CEST
    [2, 3, '2026-06-12T02:00:00Z', 'Guadalajara (Estadio Akron)', 1],       // 04h CEST
    [3, 1, '2026-06-18T16:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 2],   // 18h CEST
    [0, 2, '2026-06-19T01:00:00Z', 'Guadalajara (Estadio Akron)', 2],       // 03h CEST
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
    [0, 1, '2026-06-13T22:00:00Z', 'New Jersey (MetLife Stadium)', 1],      // 00h CEST (14 juin)
    [2, 3, '2026-06-14T01:00:00Z', 'Boston (Gillette Stadium)', 1],         // 03h CEST
    [3, 1, '2026-06-19T22:00:00Z', 'Boston (Gillette Stadium)', 2],         // 00h CEST
    [0, 2, '2026-06-20T01:00:00Z', 'Philadelphie (Lincoln Financial Field)', 2], // 03h CEST
    [1, 2, '2026-06-24T22:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 3],   // 03h CEST
    [3, 0, '2026-06-24T22:00:00Z', 'Miami (Hard Rock Stadium)', 3],         // 00h CEST
  ],
  D: [
    [0, 1, '2026-06-13T01:00:00Z', 'Los Angeles (SoFi Stadium)', 1],        // 03h CEST
    [2, 3, '2026-06-14T04:00:00Z', 'Vancouver (BC Place)', 1],              // 06h CEST
    [0, 2, '2026-06-19T19:00:00Z', 'Seattle (Lumen Field)', 2],             // 21h CEST
    [3, 1, '2026-06-20T04:00:00Z', 'San Francisco (Levi\'s Stadium)', 2],   // 06h CEST
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
    [3, 1, '2026-06-21T04:00:00Z', 'Monterrey (Estadio BBVA)', 2],          // 06h CEST
    [1, 2, '2026-06-25T23:00:00Z', 'Dallas (AT&T Stadium)', 3],             // 02h CEST
    [3, 0, '2026-06-25T23:00:00Z', 'Kansas City (Arrowhead Stadium)', 3],   // 02h CEST
  ],
  G: [
    [0, 1, '2026-06-15T19:00:00Z', 'Seattle (Lumen Field)', 1],             // 20h CEST
    [2, 3, '2026-06-16T01:00:00Z', 'Los Angeles (SoFi Stadium)', 1],        // 03h CEST
    [0, 2, '2026-06-21T18:00:00Z', 'Los Angeles (SoFi Stadium)', 2],        // 20h CEST
    [3, 1, '2026-06-22T01:00:00Z', 'Vancouver (BC Place)', 2],              // 02h CEST
    [1, 2, '2026-06-27T03:00:00Z', 'Seattle (Lumen Field)', 3],             // 05h CEST
    [3, 0, '2026-06-27T03:00:00Z', 'Vancouver (BC Place)', 3],              // 05h CEST
  ],
  H: [
    [0, 1, '2026-06-15T16:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 1],   // 18h CEST
    [2, 3, '2026-06-15T22:00:00Z', 'Miami (Hard Rock Stadium)', 1],         // 23h CEST
    [0, 2, '2026-06-21T16:00:00Z', 'Atlanta (Mercedes-Benz Stadium)', 2],   // 18h CEST
    [3, 1, '2026-06-21T22:00:00Z', 'Miami (Hard Rock Stadium)', 2],         // 23h CEST
    [1, 2, '2026-06-27T00:00:00Z', 'Houston (NRG Stadium)', 3],             // 02h CEST
    [3, 0, '2026-06-27T00:00:00Z', 'Guadalajara (Estadio Akron)', 3],       // 02h CEST
  ],
  I: [
    [0, 1, '2026-06-16T19:00:00Z', 'New Jersey (MetLife Stadium)', 1],      // 20h CEST
    [2, 3, '2026-06-16T22:00:00Z', 'Boston (Gillette Stadium)', 1],         // 23h CEST
    [0, 2, '2026-06-22T21:00:00Z', 'Philadelphie (Lincoln Financial Field)', 2], // 22h CEST
    [3, 1, '2026-06-23T00:00:00Z', 'New Jersey (MetLife Stadium)', 2],      // 01h CEST
    [3, 0, '2026-06-26T19:00:00Z', 'Boston (Gillette Stadium)', 3],         // 20h CEST
    [1, 2, '2026-06-26T19:00:00Z', 'Toronto (BMO Field)', 3],               // 20h CEST
  ],
  J: [
    [0, 1, '2026-06-17T01:00:00Z', 'Kansas City (Arrowhead Stadium)', 1],   // 02h CEST
    [2, 3, '2026-06-17T04:00:00Z', 'San Francisco (Levi\'s Stadium)', 1],   // 05h CEST
    [0, 2, '2026-06-22T17:00:00Z', 'Dallas (AT&T Stadium)', 2],             // 19h CEST
    [3, 1, '2026-06-23T03:00:00Z', 'San Francisco (Levi\'s Stadium)', 2],   // 05h CEST
    [1, 2, '2026-06-28T02:00:00Z', 'Kansas City (Arrowhead Stadium)', 3],   // 04h CEST
    [3, 0, '2026-06-28T02:00:00Z', 'Dallas (AT&T Stadium)', 3],             // 04h CEST
  ],
  K: [
    [0, 1, '2026-06-17T17:00:00Z', 'Houston (NRG Stadium)', 1],             // 19h CEST
    [2, 3, '2026-06-18T02:00:00Z', 'Mexico (Estadio Azteca)', 1],           // 04h CEST
    [0, 2, '2026-06-23T17:00:00Z', 'Houston (NRG Stadium)', 2],             // 19h CEST
    [3, 1, '2026-06-24T02:00:00Z', 'Guadalajara (Estadio Akron)', 2],       // 04h CEST
    [3, 0, '2026-06-27T23:30:00Z', 'Miami (Hard Rock Stadium)', 3],         // 01h30 CEST
    [1, 2, '2026-06-27T23:30:00Z', 'Atlanta (Mercedes-Benz Stadium)', 3],   // 01h30 CEST
  ],
  L: [
    [0, 1, '2026-06-17T20:00:00Z', 'Dallas (AT&T Stadium)', 1],             // 22h CEST
    [2, 3, '2026-06-17T23:00:00Z', 'Toronto (BMO Field)', 1],               // 00h CEST
    [0, 2, '2026-06-23T20:00:00Z', 'Boston (Gillette Stadium)', 2],         // 22h CEST
    [3, 1, '2026-06-23T23:00:00Z', 'Toronto (BMO Field)', 2],               // 00h CEST
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

export const TOP_SCORERS = [
  { id: 'mbappe',      name: 'Kylian Mbappé',       country: 'France',     countrysq: 'Francë',     flag: '🇫🇷' },
  { id: 'haaland',     name: 'Erling Haaland',       country: 'Norvège',    countrysq: 'Norvegji',   flag: '🇳🇴' },
  { id: 'kane',        name: 'Harry Kane',            country: 'Angleterre', countrysq: 'Angli',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'messi',       name: 'Lionel Messi',          country: 'Argentine',  countrysq: 'Argjentinë', flag: '🇦🇷' },
  { id: 'ronaldo',     name: 'Cristiano Ronaldo',     country: 'Portugal',   countrysq: 'Portugali',  flag: '🇵🇹' },
  { id: 'vinicius',    name: 'Vinicius Jr',           country: 'Brésil',     countrysq: 'Brazil',     flag: '🇧🇷' },
  { id: 'lautaro',     name: 'Lautaro Martínez',      country: 'Argentine',  countrysq: 'Argjentinë', flag: '🇦🇷' },
  { id: 'lukaku',      name: 'Romelu Lukaku',         country: 'Belgique',   countrysq: 'Belgjikë',   flag: '🇧🇪' },
  { id: 'musiala',     name: 'Jamal Musiala',         country: 'Allemagne',  countrysq: 'Gjermani',   flag: '🇩🇪' },
  { id: 'wirtz',       name: 'Florian Wirtz',         country: 'Allemagne',  countrysq: 'Gjermani',   flag: '🇩🇪' },
  { id: 'gakpo',       name: 'Cody Gakpo',            country: 'Pays-Bas',   countrysq: 'Hollandë',   flag: '🇳🇱' },
  { id: 'saka',        name: 'Bukayo Saka',           country: 'Angleterre', countrysq: 'Angli',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'bellingham',  name: 'Jude Bellingham',       country: 'Angleterre', countrysq: 'Angli',      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'yamale',      name: 'Lamine Yamal',          country: 'Espagne',    countrysq: 'Spanjë',     flag: '🇪🇸' },
  { id: 'diaz',        name: 'Luis Díaz',             country: 'Colombie',   countrysq: 'Kolumbi',    flag: '🇨🇴' },
  { id: 'leao',        name: 'Rafael Leão',           country: 'Portugal',   countrysq: 'Portugali',  flag: '🇵🇹' },
  { id: 'endrick',     name: 'Endrick',               country: 'Brésil',     countrysq: 'Brazil',     flag: '🇧🇷' },
  { id: 'ennesyri',    name: 'Youssef En-Nesyri',     country: 'Maroc',      countrysq: 'Marok',      flag: '🇲🇦' },
  { id: 'dembele',     name: 'Ousmane Dembele',       country: 'France',     countrysq: 'Francë',     flag: '🇫🇷' },
  { id: 'oyarzabal',   name: 'Mikel Oyarzabal',       country: 'Espagne',    countrysq: 'Spanjë',     flag: '🇪🇸' },
  { id: 'havertz',     name: 'Kai Havertz',           country: 'Allemagne',  countrysq: 'Gjermani',   flag: '🇩🇪' },
  { id: 'raphinha',    name: 'Raphinha',              country: 'Brésil',     countrysq: 'Brazil',     flag: '🇧🇷' },
  { id: 'other',       name: 'Autre joueur',          country: '',           countrysq: '',            flag: '🌍' },
];

export const TOP_SCORER_POINTS = 10;
export const TOP_SCORER_LOCK_DATE = '2026-06-11T19:00:00Z';

export const WINNER_POINTS = 10;
export const WINNER_LOCK_DATE = '2026-06-11T19:00:00Z';

export const TOTAL_GOALS_LOCK_DATE = '2026-06-11T19:00:00Z';
export function calcTotalGoalsPoints(prediction, actual) {
  const diff = Math.abs(prediction - actual);
  if (diff === 0)  return 10;
  if (diff <= 5)   return 5;
  if (diff <= 15)  return 2;
  return 0;
}

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
