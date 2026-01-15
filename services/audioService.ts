
let currentSource: AudioBufferSourceNode | null = null;
let currentContext: AudioContext | null = null;

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodePcmData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const stopAllAudio = () => {
  if (currentSource) {
    currentSource.stop();
    currentSource = null;
  }
};

export const playPcmAudio = async (base64Audio: string) => {
  try {
    stopAllAudio(); // Arrête toute lecture en cours

    if (!currentContext) {
      currentContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    const bytes = decodeBase64(base64Audio);
    const audioBuffer = await decodePcmData(bytes, currentContext, 24000, 1);
    
    const source = currentContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(currentContext.destination);
    source.start();
    
    currentSource = source;
    return source;
  } catch (error) {
    console.error("Erreur lors de la lecture audio:", error);
    return null;
  }
};
