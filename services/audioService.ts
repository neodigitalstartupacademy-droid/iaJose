
let currentContext: AudioContext | null = null;
let currentBuffer: AudioBuffer | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentGainNode: GainNode | null = null;
let startTime: number = 0;
let pausedAt: number = 0;
let currentVolume: number = 1.0;
let isPlaying: boolean = false;

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
    } catch (e) {}
    currentSource = null;
  }
  isPlaying = false;
  pausedAt = 0;
  startTime = 0;
};

export const pauseAudio = () => {
  if (isPlaying && currentContext && currentSource) {
    try {
      currentSource.stop();
      // FIX: Ensure pausedAt is never negative
      pausedAt = Math.max(0, currentContext.currentTime - startTime);
    } catch (e) {
      console.error("Pause error:", e);
    }
    isPlaying = false;
  }
};

export const resumeAudio = () => {
  if (!isPlaying && currentBuffer) {
    playFrom(pausedAt);
  }
};

export const seekAudio = (percent: number) => {
  if (currentBuffer) {
    const position = currentBuffer.duration * percent;
    playFrom(position);
  }
};

const playFrom = (position: number) => {
  if (!currentContext || !currentBuffer) return;

  // FIX: Force context resume if it was suspended by the browser
  if (currentContext.state === 'suspended') {
    currentContext.resume();
  }

  if (currentSource) {
    try { currentSource.stop(); } catch(e) {}
  }

  const source = currentContext.createBufferSource();
  const gainNode = currentContext.createGain();
  
  source.buffer = currentBuffer;
  gainNode.gain.value = currentVolume;
  
  source.connect(gainNode);
  gainNode.connect(currentContext.destination);
  
  // FIX: Ensure offset is positive and within bounds
  const safeOffset = Math.max(0, Math.min(position, currentBuffer.duration - 0.001));
  
  try {
    source.start(0, safeOffset);
    currentSource = source;
    currentGainNode = gainNode;
    startTime = currentContext.currentTime - safeOffset;
    isPlaying = true;

    source.onended = () => {
      if (currentContext && (currentContext.currentTime - startTime) >= currentBuffer!.duration - 0.01) {
        isPlaying = false;
        pausedAt = 0;
      }
    };
  } catch (err) {
    console.error("Audio Start Error:", err);
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
    currentBuffer = await decodePcmData(bytes, currentContext, 24000, 1);
    
    playFrom(0);
    
    return {
      duration: currentBuffer.duration,
      getContext: () => currentContext,
      getStartTime: () => startTime
    };
  } catch (error) {
    console.error("Erreur lors de la lecture audio:", error);
    return null;
  }
};

export const getAudioState = () => {
  if (!currentContext || !currentBuffer) return { position: 0, duration: 0, isPlaying: false };
  const position = isPlaying ? Math.max(0, currentContext.currentTime - startTime) : pausedAt;
  return {
    position: Math.min(position, currentBuffer.duration),
    duration: currentBuffer.duration,
    isPlaying
  };
}
