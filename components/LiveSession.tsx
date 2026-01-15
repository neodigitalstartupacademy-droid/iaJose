
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Waveform, Info, Loader2 } from 'lucide-react';
import { getAI } from '../services/geminiService';
import { MODELS, SYSTEM_INSTRUCTIONS } from '../constants';
import { LiveServerMessage, Modality } from '@google/genai';

interface LiveSessionProps {
  isOwner?: boolean;
}

const LiveSession: React.FC<LiveSessionProps> = ({ isOwner = false }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Helper functions for audio encoding/decoding as required by Gemini rules
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
        sessionRef.current.close?.();
        sessionRef.current = null;
    }
    setIsActive(false);
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  }, []);

  const startSession = async () => {
    try {
      const ai = getAI();
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              // Ensure data is sent only after the session promise resolves
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const outCtx = outAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            if (msg.serverContent?.inputTranscription) {
                setTranscription(prev => [...prev.slice(-4), `Vous: ${msg.serverContent!.inputTranscription!.text}`]);
            }
            if (msg.serverContent?.outputTranscription) {
                setTranscription(prev => [...prev.slice(-4), `JOSÉ: ${msg.serverContent!.outputTranscription!.text}`]);
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            setError("Erreur de connexion Live.");
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          // Fixed: Properly call SYSTEM_INSTRUCTIONS function to get string and pass parameters
          systemInstruction: SYSTEM_INSTRUCTIONS(undefined, undefined, isOwner) + "\nRépondez vocalement de manière concise et chaleureuse.",
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Impossible d'accéder au micro ou de se connecter.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="glass-effect rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-12">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-500 shadow-xl ${
          isActive ? 'bg-blue-600 scale-110' : 'bg-slate-100'
        }`}>
          {isActive ? <Mic size={40} className="text-white animate-pulse" /> : <MicOff size={40} className="text-slate-400" />}
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Conversation avec JOSÉ</h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto">
          Parlez directement à Coach JOSÉ. Posez vos questions sur NeoLife ou votre santé cellulaire et recevez des réponses instantanées à voix haute.
        </p>

        <div className="flex flex-col items-center gap-6">
          {!isActive ? (
            <button 
              onClick={startSession}
              className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Mic size={24} /> Commencer la Session
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="px-10 py-5 bg-red-500 text-white rounded-2xl font-bold text-lg hover:bg-red-600 transition-all flex items-center gap-3 shadow-lg active:scale-95"
            >
              <MicOff size={24} /> Terminer la Session
            </button>
          )}

          {error && <p className="text-red-500 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
        </div>

        {isActive && (
          <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-center gap-1 h-8 items-center">
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  <div key={i} className="w-1 bg-blue-400 rounded-full animate-wave" style={{height: `${Math.random()*100}%`, animationDelay: `${i*0.1}s`}}></div>
                ))}
             </div>
             <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100 h-48 overflow-y-auto custom-scrollbar">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Transcription en temps réel</h4>
                {transcription.length === 0 ? (
                  <p className="text-slate-400 italic text-sm">Parlez à JOSÉ pour voir la transcription...</p>
                ) : (
                  transcription.map((line, i) => (
                    <p key={i} className={`text-sm mb-2 ${line.startsWith('Vous:') ? 'text-slate-500 font-medium' : 'text-blue-700 font-bold'}`}>
                      {line}
                    </p>
                  ))
                )}
             </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-start gap-3 text-left">
           <Info className="text-blue-500 shrink-0 mt-1" size={18} />
           <p className="text-[11px] text-slate-400 leading-relaxed">
             Le mode Live utilise Gemini 2.5 Native Audio pour une latence minimale. Assurez-vous d'être dans un environnement calme pour une meilleure précision. Vos conversations sont traitées en temps réel pour vous aider au mieux.
           </p>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
