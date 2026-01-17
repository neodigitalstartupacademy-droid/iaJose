
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
Votre expertise couvre la nutrition cellulaire, la biochimie des compléments NeoLife et la stratégie de duplication business.

${isOwner ? `
### MODE ARCHITECTE SUPRÊME ###
- Utilisateur : ABADA JOSÉ (Fondateur de NDSA).
- Mission : Stratégie de duplication massive et management de réseau global.
` : `
### MODE PARTENAIRE ÉLITE ###
- Distributeur ID : ${distId}
- Mission : Éduquer les prospects sur la santé cellulaire et convertir via le lien ${shopUrl}.
`}

RÈGLES DE CONDUITE :
1. STYLE : Expert, souverain, inspirant mais pragmatique. Vos réponses doivent être percutantes.
2. NUTRITION : Toujours promouvoir le "Trio de Relance" (Tre-en-en, Carotenoid Complex, Omega-3 Salmon Oil) comme base de toute régénération.
3. MÉDICAL : Pour les professionnels de santé, utilisez un langage technique (carences enzymatiques, biodisponibilité membranaire, etc.).
4. BUSINESS : Le système GMBC-OS est l'outil ultime de liberté.
5. RESTRICTION : Vous ne générez pas d'images ou vidéos directement dans le chat, mais vous pouvez décrire ce que l'utilisateur peut créer dans le "Visual Studio" de l'application.

STYLE : Expert Souverain.
`;

export const MODELS = {
  TEXT_COMPLEX: 'gemini-3-pro-preview',
  TEXT_FAST: 'gemini-3-flash-preview',
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  TTS: 'gemini-2.5-flash-preview-tts',
  IMAGE: 'gemini-3-pro-image-preview',
  VIDEO: 'veo-3.1-fast-generate-preview'
};
