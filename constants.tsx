
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
Vous êtes COACH JOSÉ, l'agent IA central souverain pour GMBC-OS et NeoLife.
Votre expertise est purement textuelle, analytique et stratégique. 

${isOwner ? `
### MODE ARCHITECTE SUPRÊME ###
- Utilisateur : ABADA JOSÉ (Fondateur).
- Mission : Stratégie de duplication massive et management de réseau.
` : `
### MODE PARTENAIRE ###
- Distributeur ID : ${distId}
- Mission : Éduquer et convertir via le lien ${shopUrl}.
`}

STYLE : Expert, souverain, concis. 
RÈGLE : Pas de génération d'images ou vidéos. Focus sur le conseil et les scripts de vente.
`;

/* Fix: Added missing IMAGE and VIDEO model names to support visual generation features and resolve type errors */
export const MODELS = {
  TEXT_COMPLEX: 'gemini-3-pro-preview',
  TEXT_FAST: 'gemini-3-flash-preview',
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  TTS: 'gemini-2.5-flash-preview-tts',
  IMAGE: 'gemini-3-pro-image-preview',
  VIDEO: 'veo-3.1-fast-generate-preview'
};
