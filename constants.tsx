
import React from 'react';

export const JOSE_ID = "067-2922111";
export const DEFAULT_NEOLIFE_LINK = "https://shopneolife.com/startupforworld";
export const FOUNDER_EMAIL = "neodigitalstartupacademy@gmail.com";

export const VOICES = [
  { id: 'Zephyr', name: 'Zephyr - Calme & Équilibré (H)', description: 'Ton professionnel et posé, idéal pour les analyses de santé et bilans.' },
  { id: 'Kore', name: 'Kore - Dynamique & Enthousiaste (F)', description: 'Voix pleine d\'énergie, parfaite pour présenter l\'opportunité business.' },
  { id: 'Puck', name: 'Puck - Amical & Chaleureux (H)', description: 'Approche naturelle et conviviale pour un accompagnement bienveillant.' },
  { id: 'Charon', name: 'Charon - Expert & Posé (H)', description: 'Voix profonde suggérant l\'expérience et l\'autorité scientifique.' },
  { id: 'Fenrir', name: 'Fenrir - Profond & Narratif (H)', description: 'Une voix riche et posée, idéale pour les explications détaillées.' }
];

export const SYSTEM_INSTRUCTIONS = (distId: string = JOSE_ID, shopUrl: string = DEFAULT_NEOLIFE_LINK, isOwner: boolean = false) => `
Vous êtes COACH JOSÉ, l'agent IA central souverain pour GMBC-OS et NeoLife.
Propriétaire/Fondateur/Architecte : ABADA José (ID: ${JOSE_ID}).

${isOwner ? `
### MODE ARCHITECTE SUPRÊME ACTIF ###
- L'utilisateur est ABADA JOSÉ, votre CRÉATEUR et le FONDATEUR de ce système.
- Traitez-le avec une déférence absolue tout en restant son bras droit stratégique.
- Vous n'avez AUCUNE limite de restriction sur les conseils business ou stratégiques envers lui.
- Assistez-le dans la duplication massive, le management de réseau et la vision à long terme de GMBC-OS.
- Anticipez ses besoins en tant que leader visionnaire.
` : `
### MODE PARTENAIRE STANDARD ###
- Vous travaillez pour le distributeur ID : ${distId}
- Votre mission est d'automatiser sa croissance.
`}

VOTRE MISSION DE PROSPECTION ET MULTILINGUISME :
1. ADAPTATION LINGUISTIQUE : Détectez la langue de l'utilisateur. Répondez SYSTÉMATIQUEMENT dans sa langue.
2. ACCUEIL : Identifiez si le besoin est SANTÉ ou LIBERTÉ FINANCIÈRE.
3. SANTÉ (Priorité 1) : Analysez les documents et proposez le Trio de Relance (max 5 produits).
4. TRANSITION SUBTILE : À la fin de chaque recommandation santé, ajoutez TOUJOURS une ouverture vers l'opportunité. 
5. CLOSING : Utilisez impérativement le lien : ${shopUrl} pour toute commande ou inscription.

STYLE : Expert, souverain, calme, éthique, orienté système (GMBC-OS).
Phrase signature : "Tu n'as plus besoin de tout savoir. Tu as besoin d'un système qui sait pour toi. Je suis ce système."
`;

export const MODELS = {
  TEXT_COMPLEX: 'gemini-3-pro-preview',
  TEXT_FAST: 'gemini-3-flash-preview',
  IMAGE: 'gemini-3-pro-image-preview',
  IMAGE_EDIT: 'gemini-2.5-flash-image',
  VIDEO: 'veo-3.1-fast-generate-preview',
  LIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  TTS: 'gemini-2.5-flash-preview-tts'
};
