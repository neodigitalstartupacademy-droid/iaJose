
let currentSource: AudioBufferSourceNode | null = null;
let currentContext: AudioContext | null = null;
let currentGainNode: GainNode | null = null;
let currentVolume: number = 1.0;

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
    try {
      currentSource.stop();
    } catch (e) {
      // Ignorer si déjà arrêté
    }
    currentSource = null;
  }
};

export const setAudioVolume = (volume: number) => {
  currentVolume = volume;
  if (currentGainNode) {
    currentGainNode.gain.setTargetAtTime(volume, currentContext!.currentTime, 0.05);
  }
};

export const playPcmAudio = async (base64Audio: string) => {
  try {
    stopAllAudio();

    if (!currentContext) {
      currentContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    if (currentContext.state === 'suspended') {
      await currentContext.resume();
    }

    const bytes = decodeBase64(base64Audio);
    const audioBuffer = await decodePcmData(bytes, currentContext, 24000, 1);
    
    const source = currentContext.createBufferSource();
    const gainNode = currentContext.createGain();
    
    source.buffer = audioBuffer;
    gainNode.gain.value = currentVolume;
    
    source.connect(gainNode);
    gainNode.connect(currentContext.destination);
    
    source.start();
    
    currentSource = source;
    currentGainNode = gainNode;
    
    return source;
  } catch (error) {
    console.error("Erreur lors de la lecture audio:", error);
    return null;
  }
};
