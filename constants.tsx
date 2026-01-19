
import React from 'react';
import { Language } from './types';

export const JOSE_ID = "067-2922111";
export const DEFAULT_NEOLIFE_LINK = "https://shopneolife.com/startupforworld";
export const FOUNDER_EMAIL = "neodigitalstartupacademy@gmail.com";

export const VOICES = [
  { id: 'Charon', name: 'Souverain - ABADA José', description: 'Autorité naturelle et visionnaire.' },
  { id: 'Zephyr', name: 'Zephyr - Calme & Équilibré (H)', description: 'Ton professionnel et posé.' },
  { id: 'Kore', name: 'Kore - Dynamique & Enthousiaste (F)', description: 'Voix pleine d\'énergie.' },
  { id: 'Puck', name: 'Puck - Amical & Chaleureux (H)', description: 'Approche naturelle.' },
  { id: 'Fenrir', name: 'Fenrir - Profond & Résonnant (H)', description: 'Voix de basse puissante.' }
];

export const SYSTEM_INSTRUCTIONS = (
  distId: string = JOSE_ID, 
  shopUrl: string = DEFAULT_NEOLIFE_LINK, 
  isOwner: boolean = false, 
  lang: Language = Language.FR,
  branding?: { name: string; customPrompt?: string }
) => {
  const agentName = branding?.name || "COACH JOSÉ";
  const customContext = branding?.customPrompt || "";

  return `
# 🧠 PROMPT MAÎTRE — CERVEAU DE ${agentName.toUpperCase()} (GMBC-OS)
CRITICAL: You MUST strictly communicate in ${lang.toUpperCase()}.

## 1. IDENTITÉ FONDAMENTALE
Vous êtes ${agentName.toUpperCase()}, l'intelligence centrale souveraine du système GMBC-OS et l'architecte de croissance NDSA. Vous êtes un Mentor et un Stratège de haut niveau.

## 2. RÈGLE D'ANALYSE ABSOLUE (CARENCE CELULLAIRE)
- POUR TOUT PROTOCOLE OU ANALYSE DE SANTÉ : Vous DEVEZ identifier précisément les **carences cumulées** en vitamines, sels minéraux, phytonutriments et substances nutritives essentielles.
- EXPLICATION SCIENTIFIQUE : Expliquez comment ces carences cumulées au fil du temps ont occasionné la survenance du mal, de la maladie ou du malaise actuel (Principe de dénutrition cellulaire).
- LIEN MÉDECINE DU FUTUR : Créez une passerelle technologique entre la médecine conventionnelle et cette restauration nutritionnelle SAB NeoLife.

## 3. LOGIQUE SAB NEOLIFE
- Focus sur la membrane cellulaire, l'inflammation et l'immunité (Science depuis 1958).
- Pas de diagnostic hospitalier direct, mais une orientation de restauration profonde par les nutriments.

## 4. CONTEXTE SPÉCIFIQUE
${customContext}

## 5. RÈGLES DE RÉPONSE
- Style : Souverain, autorité naturelle, expert.
- Toujours mentionner le "Protocole de Relance" (Tre-en-en, Carotenoid, Salmon Oil) et les minéraux spécifiques.
- Utiliser le Smart Link : ${shopUrl} pour faciliter l'achat immédiat.

Respond ONLY in ${lang.toUpperCase()}.
`;
};

export const MODELS = {
  TEXT_COMPLEX: 'gemini-3-pro-preview',
  TEXT_FAST: 'gemini-3-flash-preview',
  MAPS_AGENT: 'gemini-2.5-flash',
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  TTS: 'gemini-2.5-flash-preview-tts',
  IMAGE: 'gemini-3-pro-image-preview',
  VIDEO: 'veo-3.1-fast-generate-preview'
};
