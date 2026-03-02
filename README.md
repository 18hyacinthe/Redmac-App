# 🗺️ CarteMa — Cartographie Collaborative des Points de Vente au Maroc

<p align="center">
  <strong>Application mobile & web de cartographie participative des points de vente informels au Maroc</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54.0.27-blue?logo=expo" />
  <img src="https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Bun-1.3-F9F1E1?logo=bun" />
  <img src="https://img.shields.io/badge/Version-1.0.0-green" />
</p>

---

## 📋 Table des Matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture Technique](#-architecture-technique)
- [Structure du Projet](#-structure-du-projet)
- [Système de Rôles](#-système-de-rôles)
- [Écrans de l'Application](#-écrans-de-lapplication)
- [Modèles de Données](#-modèles-de-données)
- [Service API](#-service-api)
- [Providers (Contexte)](#-providers-contexte)
- [Constantes & Configuration](#-constantes--configuration)
- [Design System](#-design-system)
- [Permissions](#-permissions)
- [Installation & Lancement](#-installation--lancement)
- [Build & Déploiement](#-build--déploiement)

---

## 🎯 Présentation

**CarteMa** est une application mobile et web de cartographie collaborative permettant aux utilisateurs de signaler, localiser et valider des **points de vente informels** (épiceries, kiosques, cafés, vendeurs ambulants, etc.) à travers tout le Maroc.

L'application repose sur un système communautaire à 3 niveaux de rôles : **Utilisateur**, **Kamdem** (contributeur terrain) et **Administrateur**.

### Objectifs principaux :
- 🗺️ Cartographier les points de vente informels du Maroc
- 👥 Permettre aux citoyens de contribuer au référencement
- ✅ Valider les signalements via des contributeurs terrain (Kamdems)
- 🏆 Récompenser les contributions par un système de points
- 📊 Fournir des statistiques aux administrateurs

---

## ✨ Fonctionnalités

### 🗺️ Carte Interactive
- **Carte OpenStreetMap** utilisant Leaflet intégré dans une WebView (mobile)
- **Vue liste** en fallback pour la version web
- **Marqueurs colorés** par statut : vert (validé), orange (en attente), rouge (rejeté)
- **Recherche** par nom, ville ou quartier
- **Filtres avancés** par statut (Tous, Validé, En attente, Rejeté) et par catégorie (Épicerie, Kiosque, Café, Vendeur ambulant, Autre)
- **Géolocalisation** de l'utilisateur avec bouton "Ma position"
- **Popups informatifs** sur chaque marqueur avec nom, catégorie et statut
- **Navigation** vers la page de détails au clic sur un marqueur
- **Légende** dynamique en bas de la carte
- **Animation flyTo** pour se déplacer sur la carte

### ➕ Ajout de Points de Vente
- **Géolocalisation automatique** de la position courante
- **Sélection de catégorie** obligatoire (Épicerie, Kiosque, Café, Vendeur ambulant, Autre)
- **Champs optionnels** : nom du point, repère/près de, description (max 200 caractères), horaires
- **Photo** via appareil photo ou galerie avec prévisualisation et suppression
- **Détection de doublons** : alerte si un point similaire existe dans un rayon de 30 mètres
- **Limite journalière** : maximum 10 soumissions par jour
- **Notification de succès** avec redirection vers la carte
- **Compteur de caractères** en temps réel pour la description

### 📊 Activité & Points de Récompense
- **Tableau de bord des points** accumulés par l'utilisateur
- **Historique complet** des activités avec icônes distinctives :
  - 🏅 Point ajouté (SUBMISSION)
  - ✅ Point validé (VALIDATION_ACCEPTED)
  - ❌ Point rejeté (VALIDATION_REJECTED)
  - 📷 Bonus photo (BONUS_PHOTO)
- **Badge de points gagnés** (+N) pour chaque activité positive
- **Dates formatées** en français (jour, mois, année, heure)
- **Navigation** vers le détail du point depuis l'historique
- **Information** : les points serviront à obtenir des bons de réduction chez des partenaires

### 👤 Profil Utilisateur
- **Carte de profil** avec avatar, pseudo, rôle et ville assignée
- **Statistiques** : nombre de points et ancienneté (en jours)
- **Menu contextuel** selon le rôle :
  - **Kamdem** : accès à la page "Points à valider"
  - **Admin** : accès au "Dashboard Admin" et à "Gestion utilisateurs"
- **Paramètres** et **Aide & Support** (placeholders)
- **Déconnexion** avec confirmation

### 🔍 Détail d'un Point de Vente
- **Photo** du point ou placeholder avec icône
- **Informations complètes** : nom, catégorie, statut, repère, horaires, description
- **Localisation** : coordonnées GPS + ville/quartier
- **Métadonnées** : auteur de la soumission, date de création
- **Bouton "Itinéraire"** : ouvre Google Maps / Apple Plans / app Android Maps
- **Motif de rejet** affiché si le point a été rejeté
- **Actions Kamdem** (si le point est en attente) :
  - ✅ Valider le point
  - ✏️ Corriger (édition inline du nom et description)
  - ❌ Rejeter avec motif obligatoire (modale de saisie)

### 🔐 Authentification
- **Écran de connexion** (email + mot de passe)
- **Écran d'inscription** (pseudo + email + mot de passe + confirmation)
- **Validations** : pseudo min 3 caractères, email valide, mot de passe min 6 caractères, correspondance des mots de passe
- **Comptes de démonstration** affichés sur l'écran de connexion :
  - Admin : `admin@demo.ma` / `admin123`
  - Kamdem : `kamdem@demo.ma` / `kamdem123`
- **Présentation modale** des écrans d'authentification
- **Mode par défaut** : l'application est accessible sans connexion avec un utilisateur par défaut (rôle ADMIN)

### ✅ Validation Kamdem
- **Liste des points en attente** de validation
- **Filtrage par zone** : les Kamdems ne voient que les points de leur ville assignée
- **Badge compteur** du nombre de points à traiter
- **Cartes détaillées** avec nom, catégorie, repère, date et indicateur photo
- **Navigation** vers le détail pour valider/rejeter

### 📊 Dashboard Administrateur
- **Statistiques globales** en grille :
  - Total des points
  - Points validés
  - Points en attente
  - Points rejetés
- **Répartition par ville** triée par nombre décroissant
- **Accès rapide** à la gestion des utilisateurs
- **Protection d'accès** : vérification du rôle ADMIN

### 👥 Gestion des Utilisateurs (Admin)
- **Liste complète** des utilisateurs avec pseudo, email, rôle, points
- **Badges visuels** pour le rôle et le statut bloqué
- **Panneau d'actions extensible** par utilisateur :
  - **Changement de rôle** : Utilisateur / Kamdem / Admin
  - **Blocage/Déblocage** de l'utilisateur
- **Confirmations** par dialogue Alert avant chaque action

### 🚫 Page 404
- **Écran "Page introuvable"** avec message et lien de retour à l'accueil

---

## 🏗️ Architecture Technique

### Stack Technologique

| Technologie | Version | Usage |
|---|---|---|
| **Expo** | ~54.0.27 | Framework React Native |
| **React Native** | 0.81.5 | UI mobile natif |
| **React** | 19.1.0 | Bibliothèque UI |
| **TypeScript** | ~5.9.2 | Typage statique |
| **Expo Router** | ~6.0.17 | Navigation file-based |
| **TanStack React Query** | ^5.83.0 | Gestion du cache & requêtes |
| **Zustand** | ^5.0.2 | State management (disponible) |
| **Leaflet** | 1.9.4 | Carte interactive (via WebView) |
| **Lucide React Native** | ^0.475.0 | Icônes SVG |
| **Bun** | ≥1.3 | Runtime & package manager |

### Bibliothèques Expo Utilisées

| Package | Usage |
|---|---|
| `expo-location` | Géolocalisation GPS |
| `expo-camera` | Accès à la caméra |
| `expo-image-picker` | Sélection photo (galerie & caméra) |
| `expo-image` | Affichage optimisé d'images |
| `expo-linear-gradient` | Dégradés visuels |
| `expo-blur` | Effet de flou |
| `expo-haptics` | Retour haptique |
| `expo-linking` | Liens profonds & ouverture d'URLs |
| `expo-web-browser` | Navigateur intégré |
| `expo-splash-screen` | Écran de démarrage |
| `expo-status-bar` | Configuration de la barre de statut |
| `expo-constants` | Variables de configuration |
| `expo-font` | Chargement de polices |
| `expo-symbols` | Symboles SF natifs |
| `expo-system-ui` | Personnalisation UI système |

### Autres Dépendances

| Package | Usage |
|---|---|
| `react-native-gesture-handler` | Gestion des gestes tactiles |
| `react-native-safe-area-context` | Gestion des zones sûres |
| `react-native-screens` | Optimisation de la navigation |
| `react-native-svg` | Rendu SVG |
| `react-native-maps` | Cartes natives (disponible) |
| `react-native-web` | Support web |
| `react-native-worklets` | Worklets natifs |
| `@react-native-async-storage/async-storage` | Stockage local persistant |
| `@nkzw/create-context-hook` | Création de hooks de contexte |
| `@rork-ai/toolkit-sdk` | SDK Rork AI |

---

## 📁 Structure du Projet

```
APP-PROJET-IT/
├── app/                          # 📱 Écrans (Expo Router - file-based routing)
│   ├── _layout.tsx               # Layout racine (providers, stack navigator)
│   ├── index.tsx                  # Redirect → /(tabs)/carte
│   ├── +not-found.tsx             # Page 404
│   ├── (tabs)/                    # 🔻 Navigation par onglets (Tab Bar)
│   │   ├── _layout.tsx            # Configuration des 4 onglets
│   │   ├── carte.tsx              # 🗺️ Carte interactive (Leaflet/WebView)
│   │   ├── ajouter.tsx            # ➕ Formulaire d'ajout de point
│   │   ├── activite.tsx           # 📊 Historique & points de récompense
│   │   └── profil.tsx             # 👤 Profil utilisateur & menus
│   ├── auth/                      # 🔐 Authentification
│   │   ├── login.tsx              # Écran de connexion
│   │   └── register.tsx           # Écran d'inscription
│   ├── point/
│   │   └── [id].tsx               # 🔍 Détail d'un point de vente (route dynamique)
│   ├── kamdem/
│   │   └── validation.tsx         # ✅ Liste des points à valider (Kamdem)
│   └── admin/
│       ├── dashboard.tsx          # 📊 Dashboard statistiques (Admin)
│       └── users.tsx              # 👥 Gestion des utilisateurs (Admin)
├── providers/                     # 🔄 Contextes React
│   ├── AuthProvider.tsx           # Gestion de l'authentification
│   └── DataProvider.tsx           # Gestion des données (points, activités, users)
├── services/
│   └── api.ts                     # 🌐 Service API REST (fetch wrapper)
├── types/
│   └── index.ts                   # 📝 Interfaces TypeScript
├── constants/
│   ├── colors.ts                  # 🎨 Palette de couleurs (light, dark, map)
│   └── categories.ts             # 📂 Catégories, labels, constantes métier
├── assets/
│   └── images/
│       ├── icon.png               # Icône de l'application
│       ├── adaptive-icon.png      # Icône adaptive Android
│       ├── splash-icon.png        # Image du splash screen
│       └── favicon.png            # Favicon web
├── app.json                       # ⚙️ Configuration Expo
├── package.json                   # 📦 Dépendances & scripts
├── tsconfig.json                  # TypeScript config
├── metro.config.js                # Metro bundler config
├── eas.json                       # EAS Build config
└── eslint.config.js               # ESLint config
```

---

## 🔑 Système de Rôles

L'application implémente un système RBAC (Role-Based Access Control) à 3 niveaux :

| Rôle | Code | Droits |
|---|---|---|
| **Utilisateur** | `UTILISATEUR` | Voir la carte, ajouter des points, voir son activité |
| **Kamdem** | `KAMDEM` | Tout ci-dessus + valider/rejeter/corriger les points de sa zone |
| **Administrateur** | `ADMIN` | Tout ci-dessus + dashboard stats, gestion utilisateurs, voir les points rejetés |

### Fonctionnalités par rôle :

```
                    UTILISATEUR    KAMDEM    ADMIN
Voir la carte           ✅          ✅        ✅
Ajouter un point        ✅          ✅        ✅
Voir son activité       ✅          ✅        ✅
Voir son profil         ✅          ✅        ✅
Valider un point        ❌          ✅        ✅
Rejeter un point        ❌          ✅        ✅
Corriger un point       ❌          ✅        ✅
Voir points rejetés     ❌          ❌        ✅
Dashboard stats         ❌          ❌        ✅
Gérer utilisateurs      ❌          ❌        ✅
Bloquer utilisateurs    ❌          ❌        ✅
Changer les rôles       ❌          ❌        ✅
```

---

## 📱 Écrans de l'Application

### 1. Carte (`/(tabs)/carte`)
- **Navigation** : Onglet principal, page d'accueil par défaut
- **Mobile** : Carte Leaflet en plein écran via WebView
  - Recherche en overlay
  - Filtres déployables (statut + catégorie)
  - Bouton localisation (coin inférieur droit)
  - Légende (coin inférieur gauche)
- **Web** : Liste scrollable des points avec barre de recherche
- **Interactions** : Clic marqueur → popup → navigation détails

### 2. Ajouter (`/(tabs)/ajouter`)
- **Formulaire complet** avec sections :
  1. Localisation GPS auto-détectée + bouton actualiser
  2. Catégorie (grille de boutons)
  3. Nom (optionnel)
  4. Repère (optionnel)
  5. Description avec compteur (optionnel, max 200 car.)
  6. Horaires (optionnel)
  7. Photo (caméra ou galerie) avec prévisualisation
- **Footer fixe** avec bouton de soumission
- **Box d'information** sur le processus de validation

### 3. Activité (`/(tabs)/activite`)
- **Carte de points** avec total accumulé
- **Box info** sur le futur programme de fidélité
- **Liste chronologique** des activités avec icônes, badges de points et dates

### 4. Profil (`/(tabs)/profil`)
- **En-tête coloré** avec la couleur principale
- **Carte profil** : avatar, pseudo, badge rôle, ville
- **Carte stats** : points + ancienneté
- **Menu dynamique** selon le rôle

### 5. Détail Point (`/point/[id]`)
- **Route dynamique** par ID
- **Image ou placeholder**
- **Infos complètes** + bouton itinéraire
- **Actions Kamdem** si applicable
- **Modale de rejet** avec saisie du motif

### 6. Connexion (`/auth/login`) — Modale
- Formulaire email/mot de passe
- Comptes de démonstration
- Lien vers inscription

### 7. Inscription (`/auth/register`) — Modale
- Formulaire complet avec validations
- Box info sur les avantages

### 8. Validation Kamdem (`/kamdem/validation`)
- Liste filtrée par zone assignée
- Compteur badge
- Navigation vers les détails

### 9. Dashboard Admin (`/admin/dashboard`)
- Grille de 4 statistiques
- Répartition par ville
- Bouton gestion utilisateurs

### 10. Gestion Utilisateurs (`/admin/users`)
- Liste avec panneau d'actions extensible
- Changement de rôle + blocage

---

## 📝 Modèles de Données

### User
```typescript
interface User {
  id: string;
  email: string;
  pseudo: string;
  role: 'UTILISATEUR' | 'KAMDEM' | 'ADMIN';
  points: number;
  ville_assignee?: string;
  created_at: string;
  is_blocked: boolean;
}
```

### PointDeVente
```typescript
interface PointDeVente {
  id: string;
  nom_affiche: string;
  categorie: 'EPICERIE' | 'KIOSQUE' | 'CAFE' | 'VENDEUR_AMBULANT' | 'AUTRE';
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  latitude: number;
  longitude: number;
  ville?: string;
  quartier?: string;
  description?: string;
  repere?: string;
  photo_url?: string;
  horaires?: string;
  validation_comment?: string;
  created_by_user_id?: string;
  created_by?: { id: string; pseudo: string };
  validated_by_user_id?: string;
  validated_by?: { id: string; pseudo: string };
  created_at: string;
  updated_at?: string;
}
```

### Activity
```typescript
interface Activity {
  id: string;
  type: 'SUBMISSION' | 'VALIDATION_ACCEPTED' | 'VALIDATION_REJECTED' | 'BONUS_PHOTO';
  delta_points: number;
  user_id: string;
  point_id?: string;
  point?: { id: string; nom_affiche: string; categorie: PointCategory };
  created_at: string;
}
```

---

## 🌐 Service API

Le service API (`services/api.ts`) est un wrapper `fetch` centralisé qui :

- **Auto-détecte l'URL du backend** selon la plateforme :
  - Web → `http://localhost:3001/api`
  - Mobile → IP dynamique via `Constants.expoConfig.hostUri`
  - Android Emulator → `http://10.0.2.2:3001/api`
- **Gère les erreurs HTTP** avec messages structurés
- **Headers JSON** automatiques

### Endpoints disponibles :

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/points` | Liste tous les points |
| `GET` | `/points/public` | Liste les points publics |
| `GET` | `/points/:id` | Détail d'un point |
| `POST` | `/points` | Créer un point |
| `PATCH` | `/points/:id` | Modifier un point |
| `PATCH` | `/points/:id/validate` | Valider/rejeter un point |
| `GET` | `/points/to-validate` | Points en attente (filtrable par ville) |
| `GET` | `/activities/me` | Historique d'activités |
| `GET` | `/users` | Liste des utilisateurs |
| `PATCH` | `/users/:id/role` | Changer le rôle |
| `PATCH` | `/users/:id/block` | Bloquer/débloquer |
| `GET` | `/stats` | Statistiques globales |

---

## 🔄 Providers (Contexte)

### AuthProvider
- **Utilisateur par défaut** : rôle ADMIN, pas de connexion requise
- **Fonctions exposées** : `login()`, `register()`, `logout()`, `continueAsGuest()`, `updateUserPoints()`
- **État** : `user`, `isGuest`, `isLoading`

### DataProvider
- **Chargement automatique** des points publics au montage
- **CRUD complet** sur les points de vente
- **Validation** (accepter/rejeter avec commentaire)
- **Statistiques calculées** en temps réel (total, validés, en attente, rejetés, par ville)
- **Filtrage intelligent** des points à valider par zone Kamdem
- **Fonctions exposées** : `addPoint()`, `updatePoint()`, `validatePoint()`, `getPointsToValidate()`, `getUserActivities()`, `getStats()`, `updateUserRole()`, `blockUser()`, `refreshData()`

---

## 🎨 Design System

### Palette de Couleurs

#### Mode Clair
| Token | Couleur | Usage |
|---|---|---|
| `tint` | `#C65D3B` | Couleur principale (terre cuite) |
| `background` | `#F8F6F3` | Fond de l'application |
| `card` | `#FFFFFF` | Fond des cartes |
| `text` | `#1A1A1A` | Texte principal |
| `textSecondary` | `#6B6B6B` | Texte secondaire |
| `border` | `#E0DDD9` | Bordures |
| `success` | `#6B8E4E` | Validé / succès |
| `warning` | `#D4A373` | En attente / avertissement |
| `danger` | `#C65D3B` | Rejeté / erreur |
| `pending` | `#8B7355` | En cours |

#### Carte
| Token | Couleur | Usage |
|---|---|---|
| `valide` | `#6B8E4E` | Marqueur validé (vert) |
| `enAttente` | `#D4A373` | Marqueur en attente (orange) |
| `rejete` | `#C65D3B` | Marqueur rejeté (rouge) |

### Composants UI Récurrents
- **Cards** avec `borderRadius: 12-20px`, shadows, `elevation`
- **Badges** colorés pour les rôles et statuts
- **Boutons** arrondis avec feedback visuel
- **Filtres chips** avec état actif
- **Modales** personnalisées (rejet)
- **Info boxes** avec bordure latérale colorée

---

## 🔒 Permissions

### iOS (`Info.plist`)
- `NSLocationAlwaysAndWhenInUseUsageDescription` — Localisation
- `NSLocationAlwaysUsageDescription` — Localisation en arrière-plan
- `NSLocationWhenInUseUsageDescription` — Localisation en utilisation
- `NSPhotoLibraryUsageDescription` — Accès aux photos
- `NSCameraUsageDescription` — Accès à la caméra
- `NSMicrophoneUsageDescription` — Accès au microphone
- `UIBackgroundModes: [location]` — Localisation en arrière-plan

### Android (`AndroidManifest.xml`)
- `ACCESS_COARSE_LOCATION` — Localisation approximative
- `ACCESS_FINE_LOCATION` — Localisation précise
- `ACCESS_BACKGROUND_LOCATION` — Localisation en arrière-plan
- `FOREGROUND_SERVICE` — Service de premier plan
- `FOREGROUND_SERVICE_LOCATION` — Service localisation
- `CAMERA` — Accès à la caméra
- `READ_EXTERNAL_STORAGE` — Lecture du stockage
- `WRITE_EXTERNAL_STORAGE` — Écriture du stockage
- `RECORD_AUDIO` — Enregistrement audio

---

## 🚀 Installation & Lancement

### Prérequis
- [Bun](https://bun.sh/) ≥ 1.3
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Node.js ≥ 18 (recommandé pour compatibilité)

### Installation

```bash
# Cloner le projet
git clone <repo-url>
cd APP-PROJET-IT

# Installer les dépendances avec Bun
bun install
```

### Lancer l'application

```bash
# Démarrer en mode développement (avec tunnel)
bun start

# Démarrer en mode web
bun run start-web

# Démarrer en mode web avec logs de debug
bun run start-web-dev

# Linter
bun run lint
```

### Scripts disponibles

| Script | Commande | Description |
|---|---|---|
| `start` | `bunx rork start -p <id> --tunnel` | Démarrage mobile avec tunnel ngrok |
| `start-web` | `bunx rork start -p <id> --web --tunnel` | Démarrage web avec tunnel |
| `start-web-dev` | `DEBUG=expo* bunx rork start ...` | Démarrage web avec debug |
| `lint` | `expo lint` | Analyse statique ESLint |

---

## 📦 Build & Déploiement

### Configuration EAS

Le fichier `eas.json` est configuré pour les builds EAS (Expo Application Services).

```bash
# Build de développement
eas build --profile development --platform android

# Build preview (APK)
eas build --profile preview --platform android

# Build production
eas build --profile production --platform android
```

### Identifiants de l'application

| Plateforme | Bundle ID |
|---|---|
| iOS | `com.cartema.app` |
| Android | `com.cartema.app` |

### EAS Project ID
```
ef5e7ced-b86a-4b18-a07d-52c87907a783
```

---

## 🔗 Backend

L'application communique avec une API REST backend sur le port `3001`. Le backend est dans un projet séparé (`APP-PROJET-IT-BACKEND`).

**URL de l'API** : `http://<host>:3001/api`

---

## 📄 Licence

Projet privé — Tous droits réservés.

---

<p align="center">
  <strong>CarteMa</strong> — Cartographions le Maroc ensemble 🇲🇦
</p>
