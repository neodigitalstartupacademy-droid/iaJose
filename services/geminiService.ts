
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTIONS } from "../constants";

export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Fixed: Correctly handle systemInstruction by calling the factory function to get the string
export const analyzeMedicalDocument = async (prompt: string, base64Data?: string, mimeType?: string, systemInstruction?: string) => {
  const ai = getAI();
  
  const parts: any[] = [{ text: prompt }];
  
  if (base64Data && mimeType) {
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: MODELS.TEXT_COMPLEX,
    contents: { parts },
    config: {
      // Fixed: SYSTEM_INSTRUCTIONS is a function, it must be called to return the string
      systemInstruction: systemInstruction || SYSTEM_INSTRUCTIONS(),
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text;
};

// Fixed: Correctly handle systemInstruction by calling the factory function to get the string
export const generateEducationalResponse = async (prompt: string, useThinking: boolean = false, systemInstruction?: string) => {
  const ai = getAI();
  const config: any = {
    // Fixed: SYSTEM_INSTRUCTIONS is a function, it must be called to return the string
    systemInstruction: systemInstruction || SYSTEM_INSTRUCTIONS(),
  };

  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  const response = await ai.models.generateContent({
    model: MODELS.TEXT_COMPLEX,
    contents: prompt,
    config
  });

  return response.text;
};

export const searchGrounding = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.TEXT_FAST,
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title,
    uri: chunk.web?.uri
  })) || [];

  return { text: response.text, sources };
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1", size: string = "1K") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size as any
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: MODELS.VIDEO,
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
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
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;

  return base64Audio;
};
