# ⚽ Pronos Coupe du Monde 2026

Site de pronostics pour la Coupe du Monde 2026 (USA / Canada / Mexique).  
Hébergement : **GitHub Pages** · Backend : **Firebase Firestore**

---

## Mise en place (10 min)

### 1. Créer le projet Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
2. **Créer un projet** → donne-lui un nom (ex. `wc2026-pronos`)
3. Dans **Firestore Database** → Créer une base de données → **mode Production**
4. Dans **Paramètres du projet** → **Mes applications** → ajouter une **application Web**
5. Copie la config SDK qui s'affiche

### 2. Configurer le site

Ouvre `js/firebase-config.js` et remplace les valeurs placeholder par ta config Firebase :

```js
const firebaseConfig = {
  apiKey:            'AIzaSy...',
  authDomain:        'mon-projet.firebaseapp.com',
  projectId:         'mon-projet',
  storageBucket:     'mon-projet.appspot.com',
  messagingSenderId: '123456789',
  appId:             '1:123...',
};

export const ADMIN_PASSWORD = 'ton-mot-de-passe-admin';
```

### 3. Déployer les règles Firestore

Dans la console Firebase → **Firestore** → onglet **Règles** → colle le contenu de `firestore.rules` → Publier.

### 4. Pousser sur GitHub Pages

```bash
git init
git add .
git commit -m "init pronos wc2026"
git branch -M main
git remote add origin https://github.com/TON_USER/wc2026-pronos.git
git push -u origin main
```

Puis dans GitHub → **Settings** → **Pages** → Source : **main / root** → Save.

Ton site sera accessible à `https://TON_USER.github.io/wc2026-pronos/`

### 5. Vérifier les groupes

> ⚠️ Les groupes dans `js/data.js` sont **approximatifs**.  
> Vérifie-les sur [fifa.com](https://www.fifa.com) et mets à jour le fichier si nécessaire.

---

## Utilisation quotidienne

### Ajouter des participants

1. Va sur `https://…/admin.html`
2. Entre ton mot de passe admin
3. Section **Codes de participation** → génère N codes → transmets un code à chaque joueur

### Saisir les résultats

1. Ouvre `admin.html` → section **Résultats des matchs**
2. Clique **Saisir** en face du match terminé → entre le score → **Enregistrer**
3. Le classement se met à jour automatiquement pour tous les joueurs

---

## Système de points

| Prono | Points |
|-------|--------|
| Score exact (ex: 2-1 trouvé) | **3 pts** |
| Bon résultat (victoire / nul / défaite correct) | **1 pt** |
| Mauvais résultat | **0 pt** |

Les matchs sont **verrouillés** automatiquement à l'heure de coup d'envoi (client-side).

---

## Structure des fichiers

```
├── index.html          # Application principale (login, pronos, classement)
├── admin.html          # Interface admin
├── css/style.css       # Styles
├── js/
│   ├── firebase-config.js  # ← À configurer
│   ├── data.js             # Groupes et matchs (72 matchs générés)
│   ├── app.js              # Logique principale
│   └── admin.js            # Logique admin
└── firestore.rules     # Règles de sécurité Firestore
```
