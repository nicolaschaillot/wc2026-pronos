export const RULES_HTML = {
  fr: `
<h2>⚽ Pronos Coupe du Monde 2026</h2>
<p class="rules-welcome">Bienvenue dans le jeu de pronostics Coupe du Monde 2026 entre collègues ! 🇫🇷 🇦🇱</p>

<h3>📲 Comment s'inscrire ?</h3>
<ol>
  <li>Rends-toi sur le site : <strong>https://nicolaschaillot.github.io/wc2026-pronos/</strong></li>
  <li>Saisis le <strong>pseudo</strong> de ton choix et le <strong>code</strong> qui t'a été transmis personnellement.</li>
  <li>Clique sur <strong>Rejoindre</strong> — c'est tout !</li>
</ol>
<blockquote>
  ⚠️ Chaque code est unique et nominatif. Ne le partage pas.<br>
  Une fois ton pseudo associé à ton code, tu ne peux plus le changer.
</blockquote>

<h3>⚽ Comment ça marche ?</h3>
<p>Pour chaque match, tu saisis ton <strong>pronostic de score</strong> (ex. : France 2 – 1 Maroc).</p>
<p>Tu peux modifier ton pronostic autant de fois que tu veux <strong>jusqu'au coup d'envoi</strong>.<br>
Dès que le match commence, le pronostic est <strong>verrouillé</strong> — plus de modification possible.</p>
<blockquote>🕐 Les heures affichées sont en <strong>heure locale France / Albanie</strong> (UTC+2 en été).</blockquote>

<h3>🏆 Barème des points</h3>
<table>
  <thead><tr><th>Résultat de ton pronostic</th><th>Points</th></tr></thead>
  <tbody>
    <tr><td>🎯 Score exact (ex. : 2-1, tu as mis 2-1)</td><td><strong>3 pts</strong></td></tr>
    <tr><td>✅ Bon résultat, mauvais score (bon gagnant prédit)</td><td><strong>1 pt</strong></td></tr>
    <tr><td>❌ Mauvais résultat (ou match nul non prédit)</td><td><strong>0 pt</strong></td></tr>
  </tbody>
</table>

<h4>Multiplicateurs — Phase éliminatoire</h4>
<table>
  <thead><tr><th>Tour</th><th>Multiplicateur</th></tr></thead>
  <tbody>
    <tr><td>1/32 de finale</td><td>×1</td></tr>
    <tr><td>1/16 de finale</td><td>×1</td></tr>
    <tr><td>Quarts de finale</td><td>×2</td></tr>
    <tr><td>Demi-finales</td><td>×3</td></tr>
    <tr><td>Petite finale</td><td>×2</td></tr>
    <tr><td><strong>Finale</strong></td><td><strong>×4</strong></td></tr>
  </tbody>
</table>
<blockquote>Exemple : score exact en demi-finale → 3 pts × 3 = <strong>9 pts</strong></blockquote>

<h3>📋 Phase de groupes vs phase éliminatoire</h3>
<ul>
  <li><strong>Phase de groupes</strong> : les 72 matchs sont disponibles dès l'ouverture du site. Tu peux pronostiquer tous les matchs à l'avance.</li>
  <li><strong>Phase éliminatoire</strong> : les matchs sont ajoutés au fur et à mesure par l'admin, une fois les qualifiés connus. L'admin te préviendra quand de nouveaux matchs sont disponibles.</li>
</ul>

<h4>⏱️ Score de référence en phase éliminatoire</h4>
<p>En cas de match nul à la fin du temps réglementaire (90 min), le match se poursuit en prolongations, puis éventuellement aux tirs au but.</p>
<blockquote><strong>Le score retenu est celui à la fin des prolongations (120 min), hors tirs au but.</strong></blockquote>
<ul>
  <li>Match nul 1-1 à 90 min → prolongations → France gagne 2-1 à 120 min : score de référence <strong>2-1</strong></li>
  <li>Match nul 1-1 à 90 min → prolongations → 1-1 à 120 min → France gagne aux tirs : score de référence <strong>1-1</strong></li>
</ul>

<h3>🎯 Pronostics bonus</h3>
<p>En plus des pronostics de score, deux <strong>pronostics bonus</strong> valant chacun <strong>10 points</strong> sont disponibles :</p>

<table>
  <thead><tr><th>Pronostic</th><th>Récompense</th></tr></thead>
  <tbody>
    <tr><td>🏆 Vainqueur du tournoi</td><td><strong>10 pts</strong></td></tr>
    <tr><td>🥇 Meilleur buteur du tournoi</td><td><strong>10 pts</strong></td></tr>
  </tbody>
</table>
<ul>
  <li>Le vainqueur se choisit parmi les <strong>48 équipes qualifiées</strong>.</li>
  <li>Le meilleur buteur se choisit dans une <strong>liste prédéfinie</strong> (ou « Autre joueur »).</li>
  <li>Ces deux pronostics sont verrouillés au <strong>coup d'envoi du premier match</strong> du tournoi.</li>
</ul>
<blockquote>🎯 20 pts en jeu — deux occasions de prendre de l'avance sur tes concurrents !</blockquote>

<h3>🏅 Classement</h3>
<p>Le classement est mis à jour <strong>en temps réel</strong> dès qu'un résultat est saisi.<br>
Tu peux le consulter à tout moment via l'onglet <strong>Classement</strong>.</p>
<p>En cas d'égalité de points, le départage s'effectue dans l'ordre suivant :
  <strong>nombre de scores exacts</strong>, puis <strong>nombre de bons résultats</strong>, puis <strong>ordre alphabétique</strong> du pseudo.</p>
`,

  sq: `
<h2>⚽ Parashikime · Kupa e Botës 2026</h2>
<p class="rules-welcome">Mirë se vini në lojën e parashikimeve të Kupës së Botës 2026 mes kolegëve! 🇫🇷 🇦🇱</p>

<h3>📲 Si të regjistrohesh?</h3>
<ol>
  <li>Shko në faqen e parashikimeve: <strong>https://nicolaschaillot.github.io/wc2026-pronos/</strong></li>
  <li>Shkruaj <strong>pseudonimin</strong> që dëshiron dhe <strong>kodin</strong> që të është dërguar personalisht.</li>
  <li>Kliko <strong>Hyr</strong> — kaq!</li>
</ol>
<blockquote>
  ⚠️ Çdo kod është unik dhe personal. Mos e ndaj me të tjerë.<br>
  Pasi pseudonimi të jetë lidhur me kodin tënd, nuk mund ta ndryshosh më.
</blockquote>

<h3>⚽ Si funksionon?</h3>
<p>Për çdo ndeshje, shëno <strong>parashikimin tënd për rezultatin</strong> (p.sh.: Franca 2 – 1 Maroku).</p>
<p>Mund të ndryshosh parashikimin sa herë të duash <strong>deri në fillimin e ndeshjes</strong>.<br>
Sapo ndeshja fillon, parashikimi <strong>bllokohet</strong> — nuk mund të bësh më ndryshime.</p>
<blockquote>🕐 Oraret shfaqen sipas <strong>orës lokale të Francës / Shqipërisë</strong> (UTC+2 në verë).</blockquote>

<h3>🏆 Sistemi i pikëve</h3>
<table>
  <thead><tr><th>Rezultati i parashikimit tënd</th><th>Pikë</th></tr></thead>
  <tbody>
    <tr><td>🎯 Rezultat i saktë (p.sh.: 2-1, ke vendosur 2-1)</td><td><strong>3 pikë</strong></td></tr>
    <tr><td>✅ Rezultat i duhur, por jo rezultati i saktë (p.sh.: fitues i parashikuar saktë)</td><td><strong>1 pikë</strong></td></tr>
    <tr><td>❌ Rezultat i gabuar (ose barazim i paparashikuar)</td><td><strong>0 pikë</strong></td></tr>
  </tbody>
</table>

<h4>Shumëzuesit — Faza eliminuese</h4>
<table>
  <thead><tr><th>Turi</th><th>Shumëzuesi</th></tr></thead>
  <tbody>
    <tr><td>1/32 e finales</td><td>×1</td></tr>
    <tr><td>1/16 e finales</td><td>×1</td></tr>
    <tr><td>Çerekfinale</td><td>×2</td></tr>
    <tr><td>Gjysmëfinale</td><td>×3</td></tr>
    <tr><td>Finalja e vogël</td><td>×2</td></tr>
    <tr><td><strong>Finalja</strong></td><td><strong>×4</strong></td></tr>
  </tbody>
</table>
<blockquote>Shembull: rezultat i saktë në gjysmëfinale → 3 pikë × 3 = <strong>9 pikë</strong></blockquote>

<h3>📋 Faza e grupeve vs faza eliminuese</h3>
<ul>
  <li><strong>Faza e grupeve</strong>: të 72 ndeshjet janë të disponueshme që nga hapja e faqes. Mund të parashikosh të gjitha ndeshjet paraprakisht.</li>
  <li><strong>Faza eliminuese</strong>: ndeshjet shtohen gradualisht nga admini, pasi të dihen skuadrat e kualifikuara. Admini do të të njoftojë kur të jenë në dispozicion ndeshje të reja.</li>
</ul>

<h4>⏱️ Rezultati i referencës në fazën eliminuese</h4>
<p>Në rast barazimi në fund të kohës rregullamentare (90 min), ndeshja vazhdon me kohë shtesë dhe eventualisht me penallti.</p>
<blockquote><strong>Rezultati që merret parasysh për parashikimet është ai në fund të kohës shtesë (120 min), pa përfshirë penalltitë.</strong></blockquote>
<ul>
  <li>Barazim 1-1 në 90 min → kohë shtesë → Franca fiton 2-1 në 120 min: rezultati i referencës është <strong>2-1</strong></li>
  <li>Barazim 1-1 në 90 min → kohë shtesë → 1-1 në 120 min → Franca fiton me penallti: rezultati i referencës është <strong>1-1</strong></li>
</ul>

<h3>🎯 Parashikimet bonus</h3>
<p>Përveç parashikimeve të rezultateve, dy <strong>parashikime bonus</strong> me vlerë <strong>10 pikë</strong> secili janë në dispozicion:</p>

<table>
  <thead><tr><th>Parashikimi</th><th>Shpërblimi</th></tr></thead>
  <tbody>
    <tr><td>🏆 Fituesi i turneut</td><td><strong>10 pikë</strong></td></tr>
    <tr><td>🥇 Golëshënuesi më i mirë i turneut</td><td><strong>10 pikë</strong></td></tr>
  </tbody>
</table>
<ul>
  <li>Fituesi zgjidhet nga <strong>48 ekipet e kualifikuara</strong>.</li>
  <li>Golëshënuesi më i mirë zgjidhet nga një <strong>listë e paracaktuar</strong> (ose « Lojtar tjetër »).</li>
  <li>Të dy parashikimet bllokohen në <strong>fillimin e ndeshjes së parë</strong> të turneut.</li>
</ul>
<blockquote>🎯 20 pikë në lojë — dy mundësi për të fituar avantazh ndaj kundërshtarëve!</blockquote>

<h3>🏅 Renditja</h3>
<p>Renditja përditësohet <strong>në kohë reale</strong> sapo të futet një rezultat.<br>
Mund ta shikosh në çdo moment nëpërmjet skedës <strong>Renditja</strong>.</p>
<p>Në rast barazie pikësh, renditja vendoset sipas këtij rregulli :
  <strong>numri i rezultateve të sakta</strong>, pastaj <strong>numri i rezultateve të duhura</strong>, pastaj <strong>rendi alfabetik</strong> i pseudonimit.</p>
`,
};
