
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTIONS } from "../constants";

export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMedicalDocument = async (prompt: string, base64Data?: string, mimeType?: string, systemInstruction?: string) => {
  const ai = getAI();
  const parts: any[] = [{ text: prompt }];
  if (base64Data && mimeType) {
    parts.push({ inlineData: { data: base64Data, mimeType } });
  }

  const response = await ai.models.generateContent({
    model: MODELS.TEXT_COMPLEX,
    contents: { parts },
    config: {
      systemInstruction: systemInstruction || SYSTEM_INSTRUCTIONS(),
      maxOutputTokens: 35000,
      thinkingConfig: { thinkingBudget: 32000 }
    }
  });
  return response.text;
};

export const generateEducationalResponse = async (prompt: string, useThinking: boolean = false, systemInstruction?: string) => {
  const ai = getAI();
  const config: any = { systemInstruction: systemInstruction || SYSTEM_INSTRUCTIONS() };

  if (useThinking) {
    config.maxOutputTokens = 30000;
    config.thinkingConfig = { thinkingBudget: 24000 };
  }

  const response = await ai.models.generateContent({
    model: useThinking ? MODELS.TEXT_COMPLEX : MODELS.TEXT_FAST,
    contents: prompt,
    config
  });
  return response.text;
};

export const textToSpeech = async (text: string, voiceName: string = 'Kore') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.TTS,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1", imageSize: string = "1K") => {
  if (!(await (window as any).aistudio.hasSelectedApiKey())) {
    await (window as any).aistudio.openSelectKey();
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: imageSize as any
      },
      tools: [{googleSearch: {}}]
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image data returned from model");
};
