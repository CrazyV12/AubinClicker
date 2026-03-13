# 🍔 AubinClicker

**Aubin a faim. Il a _toujours_ faim.** AubinClicker est un jeu incrémental (Clicker) développé en Vanilla JS, HTML et CSS. Nourrissez Aubin pour récolter des Calories d'Or, achetez des bâtiments toujours plus gras, collectionnez des familiers et transcendez l'univers connu !

🌍 **[Jouer à AubinClicker maintenant !](https://romaindancette.github.io/aubinclicker)** _(Remplace par ton vrai lien)_

---

## ✨ Fonctionnalités Principales

- 📈 **Progression Infinie :** Achetez des bâtiments (Puffs, Burgers, Labos de Calories) et des améliorations pour booster votre production (CPS).
- 🐾 **Système de Gacha (Pets) :** Dépensez vos calories pour ouvrir des œufs. Collectionnez, équipez et fusionnez vos familiers pour multiplier vos gains.
- 🔄 **Prestige à double niveau :** \* **Rebirth :** Recommencez pour obtenir des multiplicateurs puissants.
  - **Ascension :** Changez de dimension (univers visuels uniques) et gagnez des points d'arbre de compétences permanents.
- ☁️ **Sauvegarde Cloud & Synchronisation :** Jouez en tant qu'invité (sauvegarde locale) ou connectez-vous (Google/Email) pour synchroniser votre partie en temps réel entre vos appareils via Firebase.
- 🏆 **Classement Mondial en Direct :** Affrontez les autres joueurs et hissez votre pseudo en haut du Top 50 !

---

## 🛠️ Créer sa propre version (Modding / Fork)

Le code source d'AubinClicker est ouvert ! Vous souhaitez créer votre propre Clicker (avec vos propres images, pets et mécaniques) en utilisant ma base ? C'est possible !

⚠️ **TRÈS IMPORTANT :** Vous ne pouvez pas utiliser le jeu tel quel sur votre propre hébergement. Pour des raisons de sécurité, ma base de données bloque les connexions provenant d'autres sites. **Vous devez lier le jeu à votre propre base de données Firebase.**

### Guide d'installation pas-à-pas :

1. **Forker le projet :** Cliquez sur le bouton `Fork` en haut à droite de ce dépôt pour copier le code sur votre compte GitHub.
2. **Créer un projet Firebase :**
   - Allez sur [Firebase Console](https://console.firebase.google.com/) et créez un nouveau projet (gratuit).
   - Allez dans **Authentication** et activez les fournisseurs **Adresse e-mail/Mot de passe** et **Google**.
   - Allez dans **Firestore Database** et créez une base de données.
   - Dans l'onglet **Règles** de Firestore, collez ces règles de sécurité :
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /saves/{userEmail} {
           allow read: if true;
           allow write: if request.auth != null && request.auth.token.email == userEmail;
         }
       }
     }
     ```
3. **Lier votre code à votre base :**
   - Dans les paramètres de votre projet Firebase, ajoutez une application "Web" `</>`.
   - Firebase va vous donner un objet `firebaseConfig` contenant vos clés API.
   - Ouvrez le fichier `js/cloud.js` de votre copie du jeu, et remplacez mon `firebaseConfig` par le vôtre.
4. **Héberger le jeu :**
   - Sur votre dépôt GitHub, allez dans `Settings` > `Pages`.
   - Sous _Source_, choisissez la branche `main` et sauvegardez. Votre jeu sera en ligne quelques minutes plus tard !
   - _(N'oubliez pas d'ajouter votre nouvelle URL GitHub Pages dans les domaines autorisés de votre Authentication Firebase !)_

---

## 💻 Développement Local

Le jeu utilise des modules ES6 (`import` / `export`). Vous ne pouvez donc pas simplement double-cliquer sur `index.html` pour l'ouvrir.
Pour tester le jeu en local sur votre machine :

1. Utilisez un serveur local. L'extension **Live Server** sur VS Code est fortement recommandée.
2. Lancez Live Server sur le fichier `index.html`.

---

## ❤️ Soutenir le projet

Si le jeu vous a plu et que vous avez passé un bon moment à nourrir Aubin, n'hésitez pas à me soutenir !  
☕ **[M'offrir un burger (PayPal)](https://paypal.me/RomainDancette)**

---

_Développé avec faim et passion._ 🍔
