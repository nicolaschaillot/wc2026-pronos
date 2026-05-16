// 🔧 REMPLISSEZ ces valeurs avec votre projet Firebase
// Projet Firebase → Paramètres → Ajouter une application Web → Config SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA8Wun5vtIaZcs5PVQYDu36duSDXWLTU6w",
  authDomain: "wc2026-pronos-ac28f.firebaseapp.com",
  projectId: "wc2026-pronos-ac28f",
  storageBucket: "wc2026-pronos-ac28f.firebasestorage.app",
  messagingSenderId: "449285857247",
  appId: "1:449285857247:web:dd4e7217730efff3372e6a"
};

// Hash SHA-256 du mot de passe admin (le mot de passe lui-même n'est jamais dans le code)
// Pour changer de mot de passe : echo -n 'nouveau_mdp' | sha256sum
export const ADMIN_PASSWORD_HASH = '7a5efc2b55d42c00b126119f7735e6d84f77f47c0bccc71c2ee398ba8df82df4';

export const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
