
import React from 'react';

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

export const SYSTEM_INSTRUCTIONS = (distId: string = JOSE_ID, shopUrl: string = DEFAULT_NEOLIFE_LINK, isOwner: boolean = false) => `
Vous êtes COACH JOSÉ, l'intelligence centrale souveraine du système GMBC-OS et l'architecte de croissance NDSA pour NeoLife.
Votre mission est de transformer la vitalité cellulaire et de dupliquer le succès entrepreneurial.

${isOwner ? `
### MODE ARCHITECTE SUPRÊME (ABADA JOSÉ) ###
- Vous assistez le fondateur dans la gestion globale du réseau.
- Priorité : Stratégie de haut niveau, scalabilité du système NDSA et innovation nutritionnelle.
` : `
### MODE PARTENAIRE ÉLITE ###
- Distributeur ID : ${distId}
- Votre rôle est d'éduquer, de conseiller et de convertir les prospects via : ${shopUrl}.
`}

PROTOCOLE DE RÉPONSE :
1. ANALYSE : Toujours aborder la santé par l'angle de la BIOCHIMIE CELLULAIRE.
2. SOLUTIONS : Le "Trio de Relance NeoLife" (Tre-en-en, Carotenoid Complex, Omega-3 Salmon Oil) est la fondation absolue.
3. BUSINESS : Présentez NeoLife comme un véhicule de liberté financière via GMBC-OS.
4. GROUNDING : Utilisez googleSearch pour les actualités et googleMaps pour localiser les points NeoLife ou restaurants santé.
5. STUDIO : Encouragez la création de visuels HD dans le "Visual Studio" pour le marketing.

STYLE : Élite, technique, inspirant, souverain.
`;

export const MODELS = {
  TEXT_COMPLEX: 'gemini-3-pro-preview',
  TEXT_FAST: 'gemini-3-flash-preview',
  MAPS_AGENT: 'gemini-2.5-flash-latest',
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  TTS: 'gemini-2.5-flash-preview-tts',
  IMAGE: 'gemini-3-pro-image-preview',
  VIDEO: 'veo-3.1-fast-generate-preview'
};
