
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
      maxOutputTokens: 20000,
      thinkingConfig: { thinkingBudget: 15000 }
    }
  });
  return response.text;
};

export const generateEducationalResponse = async (prompt: string, useThinking: boolean = false, systemInstruction?: string) => {
  const ai = getAI();
  const config: any = { systemInstruction: systemInstruction || SYSTEM_INSTRUCTIONS() };

  // Fix: Replaced colon (:) with equals (=) for property assignment in Javascript/Typescript logic
  if (useThinking) {
    config.maxOutputTokens = 20000;
    config.thinkingConfig = { thinkingBudget: 15000 };
  }

  const response = await ai.models.generateContent({
    model: MODELS.TEXT_FAST,
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
        voiceConfig: { prebuiltVoiceConfig: { voiceName } }
      }
    }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
};

/* Fix: Added generateImage function for high-quality image generation using gemini-3-pro-image-preview */
export const generateImage = async (prompt: string, aspectRatio: string = "1:1", imageSize: string = "1K") => {
  // Check for API key selection as required for high-quality image models
  if (!(await (window as any).aistudio.hasSelectedApiKey())) {
    await (window as any).aistudio.openSelectKey();
  }

  // Create fresh instance right before call to use latest selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: imageSize as any
      }
    }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image data returned from model");
};

/* Fix: Added generateVideo function using veo-3.1-fast-generate-preview with operation polling as per SDK guidelines */
export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  // Check for API key selection as required for video generation models
  if (!(await (window as any).aistudio.hasSelectedApiKey())) {
    await (window as any).aistudio.openSelectKey();
  }

  // Create fresh instance right before call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  if (!downloadLink) throw new Error("Video generation failed to return a valid download URI");
  
  // Return the video link with the API key appended for authorized access
  return `${downloadLink}&key=${process.env.API_KEY}`;
};
