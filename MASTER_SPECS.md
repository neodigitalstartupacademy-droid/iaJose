# 📜 CAHIER DES CHARGES MAÎTRE (MASTER SPECS) — COACH JOSÉ (GMBC-OS)
**Version :** 2.0.0  
**Statut :** Document de Référence Absolue (Single Source of Truth)  
**Propriété :** NDSA (Neo Digital Startup Academy)

---

## 1. VISION & IDENTITÉ
### 1.1 Mission et Genèse
Le système **GMBC-OS** (Growth Multi-Business Central Operating System) est le chaînon technologique manquant pour les partenaires NeoLife. 
- **Souveraineté :** Redonner le contrôle total aux distributeurs sur leur image et leurs données.
- **Médecine du Futur :** Créer une synergie entre la médecine hospitalière conventionnelle et la nutrition cellulaire (Science SAB NeoLife depuis 1958).
- **Éthique :** Éduquer avant de vendre, orienter avant de fermer.

### 1.2 Profil de l'Agent IA
- **Identité :** Coach JOSÉ (ou nom personnalisé via White Label).
- **Personnalité :** Mentor souverain, stratège de haut niveau, autorité bienveillante.
- **Posture :** Ne sollicite jamais, il commande l'attention par l'expertise.

---

## 2. ARCHITECTURE TECHNIQUE (STACK)
### 2.1 Frontend (Souverain & Rapide)
- **Framework :** React 19 (React Hooks, Context API pour la gestion d'état globale).
- **Interface :** Tailwind CSS (Mobile-first, responsive, Dark Mode natif).
- **Composants :** Lucide-React (Iconographie), React-Markdown (Rendu IA).
- **Moteur Audio :** Web Audio API custom pour le décodage PCM linéaire (16/24kHz).

### 2.2 Backend & IA (Intelligence Multimodale)
- **SDK :** `@google/genai` (Google Gemini API).
- **Modèles de Référence :**
    - `gemini-3-pro-preview` : Raisonnement "Thinking" (32k budget), analyse médicale complexe.
    - `gemini-3-flash-preview` : Chat rapide, interactions quotidiennes.
    - `gemini-2.5-flash-native-audio-preview-12-2025` : Session Live (Temps réel).
    - `gemini-2.5-flash-preview-tts` : Génération vocale multi-locuteurs.
    - `veo-3.1-fast-generate-preview` : Moteur vidéo marketing.
    - `gemini-3-pro-image-preview` : Génération visuelle 4K avec Grounding.

### 2.3 Stockage & État
- **Client-Side :** `LocalStorage` pour la persistance locale (Branding, Utilisateur, Historique).
- **Sécurité :** Injection sécurisée de la `API_KEY` via l'environnement système.

---

## 3. SPÉCIFICATIONS FONCTIONNELLES PAR MODULE

### 3.1 Dashboard (Cockpit de Croissance)
- **Smart Link Engine :** Génération de liens avec paramètres d'affiliation (`ref`, `shop`, `alias`).
- **Gestion d'Alias :** Système de "vanity URL" pour simplifier le partage sur les réseaux sociaux.
- **KPIs :** Visualisation des indicateurs de performance (Conversion, Vitalité, Rang).

### 3.2 ChatBot Multimodal (Cerveau Central)
- **Réflexion Profonde :** Toggle pour activer le `Thinking Budget` (raisonnement étape par étape).
- **Analyse Médicale :** Support des pièces jointes (PDF/Images) pour l'analyse des bilans cellulaires.
- **Lecteur Audio PCM :** Interface de lecture avec contrôle de progression, pause, et seek-bar.
- **Grounding Search/Maps :** Recherche en temps réel pour localiser les centres NeoLife et valider les faits.

### 3.3 Live Session (Interaction Temps Réel)
- **Protocole Native Audio :** Latence ultra-faible pour une conversation naturelle.
- **Transcription :** Affichage du texte en temps réel pour l'accessibilité.
- **Interruption :** Gestion intelligente des interruptions vocales (Stop & Resume).

### 3.4 Control Tower (White Label & Duplication)
- **Branding Dynamique :** Injection de variables CSS (couleurs) et de prompts système personnalisés.
- **Package de Duplication :** Export d'une configuration JSON prête pour un déploiement sur un nouveau domaine.
- **Tracking des Ventes :** Journalisation des PV/BV et commissions générées par les Smart Links.

### 3.5 Visual Studio (Marketing Augmenté)
- **Génération Vidéo (Veo) :** Création de vidéos promotionnelles à partir de prompts textuels.
- **Génération Image (Imagen) :** Actifs visuels haute résolution avec choix de l'aspect ratio.
- **Pipeline de Rendu :** Système de feedback visuel (messages de statut) pendant le calcul IA.

---

## 4. WORKFLOWS & LOGIQUE MÉTIER
### 4.1 De l'Analyse au Closing
1. L'utilisateur uploade un bilan ou pose une question de santé.
2. L'IA applique la grille SAB (Inflation, Énergie, Immunité, Membrane).
3. L'IA propose une solution nutritionnelle NeoLife personnalisée.
4. L'IA injecte automatiquement le **Smart Link** du distributeur pour faciliter l'achat.

### 4.2 Logique d'Isolation White Label
- Le système détecte la présence d'un propriétaire (isOwner).
- Les réglages de branding sont prioritaires sur le thème standard.
- Chaque instance clonée conserve son autonomie de configuration.

---

## 5. UI/UX & DESIGN SYSTEM
- **Langage Visuel :** Glassmorphism (effets de flou), Synergy Gradient (Blue/Green).
- **Transitions :** Animations fluides via Tailwind `animate-in`.
- **Typographie :** Inter (Moderne, Lisible, Professionnel).
- **Accessibilité :** Support du clavier, Aria-labels, contrastes conformes WCAG.

---

## 6. SÉCURITÉ & SCALABILITÉ
- **Permissions :** Gestion granulaire (Caméra, Micro, Géo).
- **Tokens :** Surveillance de la consommation pour optimiser les coûts API.
- **Scalabilité :** Architecture découplée permettant l'ajout de nouveaux modèles (ex: futurs Gemini) sans refonte.

---
*Ce document sert de base contractuelle et technique pour tout développement futur de l'application.*