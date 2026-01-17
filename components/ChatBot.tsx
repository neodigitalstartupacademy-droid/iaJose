
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, FileText, Paperclip, Download, Zap, Mic, MicOff, Volume2, Sparkles, X, Play, CircleStop, Waves, CheckCircle, Trash2, ShieldAlert, RefreshCcw, Stethoscope, Heart, Target, ScrollText, Activity, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DistributorData } from '../types';
import { getAI, analyzeMedicalDocument, textToSpeech } from '../services/geminiService';
import { playPcmAudio, stopAllAudio } from '../services/audioService';
import { MODELS, SYSTEM_INSTRUCTIONS, JOSE_ID, DEFAULT_NEOLIFE_LINK, VOICES } from '../constants';
import { LiveServerMessage, Modality } from '@google/genai';

interface ChatBotProps {
    distData: DistributorData | null;
    isOwner: boolean;
    initialIntent?: string | null;
}

interface Attachment { data: string; mimeType: string; name: string; }

const ChatBot: React.FC<ChatBotProps> = ({ distData, isOwner, initialIntent }) => {
  const currentId = distData?.id || JOSE_ID;
  const currentShop = distData?.shopUrl || DEFAULT_NEOLIFE_LINK;
  const historyKey = `jose_chat_history_${currentId}`;
  const voiceKey = `jose_voice_pref_${currentId}`;
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [{ 
        role: 'model', 
        text: "Système Souverain activé. Je suis le Coach JOSÉ, votre architecte de croissance cellulaire et business. Comment allons-nous transformer votre vitalité aujourd'hui ?", 
        timestamp: Date.now() 
    }];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState({ user: '', model: '' });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [activePlayback, setActivePlayback] = useState<{ index: number; progress: number; duration: number; volume: number } | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem(voiceKey) || VOICES[0].id);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackTimerRef = useRef<number | null>(null);
  
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const liveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const activeVoiceName = VOICES.find(v => v.id === selectedVoice)?.name || "Défaut";

  const QUICK_PROMPTS = [
    { 
      label: 'Passerelle des Médecins et corps médicaux', 
      icon: <Stethoscope size={14} className="text-blue-400" />, 
      text: "Je suis un professionnel de santé. Analyse ce cas clinique pour identifier les carences nutritionnelles au niveau cellulaire. Établis un protocole de nutrition cellulaire NeoLife complet (incluant le Trio de Relance) pour accompagner le traitement clinique conventionnel." 
    },
    { 
      label: 'Conseils de vitalité', 
      icon: <Heart size={14} className="text-red-500" />, 
      text: "Explique-moi les bienfaits biochimiques du Trio de Relance NeoLife pour la régénération cellulaire et l'optimisation de la vitalité quotidienne." 
    },
    { 
      label: 'Opportunité Business', 
      icon: <Target size={14} className="text-amber-500" />, 
      text: "Comment transformer ma consommation personnelle en opportunité entrepreneuriale NeoLife avec le système GMBC ?" 
    },
    { 
      label: 'Script de Vente Élite', 
      icon: <ScrollText size={14} className="text-blue-500" />, 
      text: "Génère un script de closing percutant pour un prospect intéressé par la détox cellulaire." 
    },
    { label: 'Session Live Vocal', icon: <Mic size={14} className="text-green-500" />, action: 'live' }
  ];

  // Handling initial intent (from Cellular Check)
  useEffect(() => {
    if (initialIntent === 'health') {
        const checkDone = sessionStorage.getItem('jose_initial_intent_done');
        if (!checkDone) {
            handleSend("J'ai terminé mon Bilan Cellulaire. Peux-tu analyser mes résultats et me proposer mon protocole de nutrition cellulaire personnalisé NeoLife ?");
            sessionStorage.setItem('jose_initial_intent_done', 'true');
        }
    }
  }, [initialIntent]);

  const encodeAudio = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudio = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodePcm = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
        localStorage.setItem(historyKey, JSON.stringify(messages));
        setSaveStatus('saved');
    }, 500);
    
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    return () => clearTimeout(timer);
  }, [messages, historyKey]);

  useEffect(() => {
    localStorage.setItem(voiceKey, selectedVoice);
  }, [selectedVoice, voiceKey]);

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) window.clearInterval(playbackTimerRef.current);
      stopAllAudio();
      stopLiveMode();
    };
  }, []);

  const stopLiveMode = useCallback(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close?.();
      liveSessionRef.current = null;
    }
    setIsLiveActive(false);
    setIsSpeaking(false);
    setPartialTranscript({ user: '', model: '' });
    liveSourcesRef.current.forEach(s => s.stop());
    liveSourcesRef.current.clear();
  }, []);

  const startLiveMode = async () => {
    if (isLiveActive) {
      stopLiveMode();
      return;
    }

    try {
      stopAllAudio();
      const ai = getAI();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encodeAudio(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64) {
              setIsSpeaking(true);
              const outCtx = outAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodePcm(decodeAudio(base64), outCtx);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.onended = () => {
                liveSourcesRef.current.delete(source);
                if (liveSourcesRef.current.size === 0) setIsSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              liveSourcesRef.current.add(source);
            }

            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              setPartialTranscript(prev => ({ ...prev, user: text }));
            }

            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              setPartialTranscript(prev => ({ ...prev, model: prev.model + text }));
            }

            if (msg.serverContent?.turnComplete) {
              const fullU = partialTranscript.user.trim();
              const fullM = partialTranscript.model.trim();
              if (fullU || fullM) {
                setMessages(prev => [
                    ...prev, 
                    { role: 'user', text: fullU || "[Vocal]", timestamp: Date.now(), isLive: true },
                    { role: 'model', text: fullM || "[Réponse]", timestamp: Date.now(), isLive: true }
                ]);
              }
              setPartialTranscript({ user: '', model: '' });
            }

            if (msg.serverContent?.interrupted) {
              setIsSpeaking(false);
              liveSourcesRef.current.forEach(s => s.stop());
              liveSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopLiveMode(),
          onerror: () => stopLiveMode()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } },
          systemInstruction: SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner) + "\nVous êtes en MODE LIVE VOCAL. Répondez de manière fluide, naturelle et professionnelle. Ne mentionnez pas que vous êtes une IA sauf si demandé. Soyez le Coach JOSÉ.",
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Live Init Error:", err);
      setIsLiveActive(false);
    }
  };

  const handleFile = (file: File) => {
    const r = new FileReader();
    r.onload = () => setAttachment({ 
        data: (r.result as string).split(',')[1], 
        mimeType: file.type, 
        name: file.name 
    });
    r.readAsDataURL(file);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend && !attachment) return;
    
    const userMsg: ChatMessage = { role: 'user', text: attachment ? `${textToSend} [Fichier: ${attachment.name}]` : textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getAI();
      const modelIdx = messages.length + 1;
      setMessages(prev => [...prev, { role: 'model', text: "", timestamp: Date.now() }]);
      
      let fullResponse = "";
      const sysInst = SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner);

      if (attachment) {
        const res = await analyzeMedicalDocument(textToSend || "Analyse ce document médical.", attachment.data, attachment.mimeType, sysInst);
        setMessages(prev => {
          const next = [...prev];
          next[modelIdx].text = res;
          return next;
        });
        setAttachment(null);
      } else {
        const chat = ai.chats.create({ 
          model: MODELS.TEXT_FAST, 
          config: { 
            systemInstruction: sysInst,
            maxOutputTokens: 2000,
            thinkingConfig: { thinkingBudget: 0 }
          } 
        });
        const result = await chat.sendMessageStream({ message: textToSend });
        for await (const chunk of result) {
          fullResponse += chunk.text || "";
          setMessages(prev => {
            const next = [...prev];
            next[modelIdx].text = fullResponse;
            return next;
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioPlayback = async (idx: number, text: string) => {
    if (activePlayback?.index === idx) {
      stopAllAudio();
      if (playbackTimerRef.current) window.clearInterval(playbackTimerRef.current);
      setActivePlayback(null);
      return;
    }

    stopAllAudio();
    if (playbackTimerRef.current) window.clearInterval(playbackTimerRef.current);
    
    setActivePlayback({ index: idx, progress: 0, duration: 0, volume: activePlayback?.volume || 0.8 });
    
    let audio = messages[idx].audio;
    if (!audio) {
        audio = await textToSpeech(text, selectedVoice) as string;
        if (audio) {
            setMessages(prev => {
                const next = [...prev];
                next[idx] = { ...next[idx], audio };
                return next;
            });
        }
    }

    if (audio) {
      const source = await playPcmAudio(audio);
      if (source && source.buffer) {
        const duration = source.buffer.duration;
        setActivePlayback(prev => prev ? { ...prev, duration } : null);
        
        const startTime = Date.now();
        playbackTimerRef.current = window.setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed >= duration) {
            if (playbackTimerRef.current) window.clearInterval(playbackTimerRef.current);
            setActivePlayback(null);
          } else {
            setActivePlayback(prev => prev ? { ...prev, progress: elapsed } : null);
          }
        }, 100);

        source.onended = () => {
          if (playbackTimerRef.current) window.clearInterval(playbackTimerRef.current);
          setActivePlayback(null);
        };
      }
    } else {
      setActivePlayback(null);
    }
  };

  const clearHistory = () => {
    const initialMsg: ChatMessage = { role: 'model', text: "Système réinitialisé. Nouvelle session stratégique activée.", timestamp: Date.now() };
    setMessages([initialMsg]);
    setShowResetConfirm(false);
    stopAllAudio();
  };

  return (
    <div 
        className="flex flex-col h-full bg-white relative overflow-hidden font-sans"
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) handleFile(file); }}
    >
      {/* Live Mode Overlay - Visualisation Ultra-Fidélité */}
      {isLiveActive && (
        <div className="absolute inset-0 z-[60] bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] synergy-bg opacity-10 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
           
           <div className="absolute top-8 right-8">
              <button onClick={stopLiveMode} className="p-5 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10">
                <X size={24} />
              </button>
           </div>
           
           <div className="flex flex-col items-center gap-10 w-full max-w-3xl text-center relative z-10">
              <div className="relative group">
                 <div className={`w-56 h-56 rounded-full synergy-bg flex items-center justify-center text-white shadow-[0_0_120px_rgba(37,99,235,0.4)] transition-all duration-700 ${isSpeaking ? 'animate-pulse scale-110' : 'animate-bounce'}`}>
                    {isSpeaking ? <Volume2 size={80} /> : <Mic size={80} />}
                 </div>
                 <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 px-10 py-3 text-[11px] font-black uppercase rounded-full tracking-[0.3em] shadow-2xl transition-all duration-500 ${isSpeaking ? 'bg-blue-600 text-white' : 'bg-red-600 text-white animate-pulse'}`}>
                   {isSpeaking ? 'JOSÉ PARLE' : 'JOSÉ ÉCOUTE'}
                 </div>
              </div>

              <div className="space-y-8 w-full">
                <div className="min-h-[80px] px-4">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-3">VOTRE VOIX :</p>
                  <p className="text-2xl font-black text-white leading-tight h-16 overflow-hidden">
                    {partialTranscript.user || "..."}
                  </p>
                </div>
                <div className="min-h-[140px] p-10 bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 synergy-bg opacity-30"></div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-3">PENSÉE JOSÉ :</p>
                  <p className="text-xl font-medium text-slate-200 leading-relaxed italic animate-in fade-in">
                    {partialTranscript.model || (isSpeaking ? "Génération du flux audio..." : "Je suis à votre entière écoute...")}
                  </p>
                </div>
              </div>

              {/* Waveform Dynamique Multi-Barres */}
              <div className="flex gap-2.5 h-32 items-center justify-center w-full px-12">
                 {[...Array(30)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`w-1.5 bg-blue-500 rounded-full transition-all duration-300 ${isSpeaking || partialTranscript.user ? 'animate-wave' : 'h-2 opacity-20'}`} 
                        style={{ 
                            animationDelay: `${i * 0.04}s`, 
                            height: isSpeaking || partialTranscript.user ? `${Math.random() * 80 + 20}%` : '8px' 
                        }} 
                    />
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Header Sticky */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-[20%] py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
           <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
             <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
               COACH JOSÉ v4.2 SOUVERAIN
             </span>
           </div>
           <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-tighter transition-all ${saveStatus === 'saved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600 animate-pulse'}`}>
             {saveStatus === 'saved' ? <CheckCircle size={10} /> : <RefreshCcw size={10} className="animate-spin" />}
             {saveStatus === 'saved' ? 'SYNC' : 'SAVE'}
           </div>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={() => setShowResetConfirm(true)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <Trash2 size={20} />
            </button>
         </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-[20%] py-10 space-y-10 bg-slate-50/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[92%] ${msg.role === 'model' ? 'w-full' : ''}`}>
              <div className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-2.5 flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' ? (
                  <>
                    <div className="w-6 h-6 synergy-bg rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-sm">J</div>
                    <span className="text-blue-600">COACH JOSÉ</span>
                  </>
                ) : (
                  <>
                    VOUS <Activity size={10} />
                  </>
                )}
              </div>
              <div className={`p-8 rounded-[3rem] text-[16px] leading-relaxed transition-all duration-300 shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white font-medium' : 'bg-white text-slate-900 border border-slate-100 shadow-md'}`}>
                <ReactMarkdown className="prose prose-sm max-w-none prose-slate">
                    {msg.text}
                </ReactMarkdown>
                
                {msg.role === 'model' && msg.text && !msg.isLive && (
                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    {activePlayback?.index === idx ? (
                      <div className="bg-slate-950 rounded-[2.5rem] p-5 flex flex-col gap-4 w-full animate-in zoom-in-95">
                        <div className="flex items-center justify-between gap-5">
                          <button onClick={() => handleAudioPlayback(idx, msg.text)} className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                            <CircleStop size={20} />
                          </button>
                          <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${(activePlayback.progress / activePlayback.duration) * 100}%` }} />
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 tracking-tighter">{(activePlayback.duration - activePlayback.progress).toFixed(1)}s</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-6">
                        <button onClick={() => handleAudioPlayback(idx, msg.text)} className="flex items-center gap-3 text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all">
                          <Play size={14} fill="currentColor" /> {msg.audio ? 'RÉÉCOUTER' : 'VOIX DU COACH'}
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(msg.text)} className="flex items-center gap-3 text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all">
                          <Download size={14} /> COPIER
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-5 py-8 animate-in fade-in">
             <div className="relative">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <BrainCircuit size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
             </div>
             <span className="text-[12px] font-black text-blue-500 uppercase tracking-[0.4em] animate-pulse">Architecture de Solution...</span>
          </div>
        )}
      </div>

      {/* Voice Selection Floating Panel */}
      {showVoicePicker && (
        <div className="absolute bottom-[280px] left-6 md:left-[20%] right-6 md:right-[20%] bg-slate-950 border border-white/5 rounded-[4rem] p-10 shadow-[0_40px_140px_rgba(0,0,0,0.8)] z-[70] animate-in slide-in-from-bottom-10">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
            <h4 className="text-[12px] font-black text-blue-400 uppercase tracking-[0.5em]">Signature Vocale Souveraine</h4>
            <button onClick={() => setShowVoicePicker(false)} className="text-slate-500 hover:text-white transition-colors p-3 bg-white/5 rounded-full"><X size={24} /></button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => { setSelectedVoice(v.id); setShowVoicePicker(false); }}
                className={`flex flex-col text-left p-8 rounded-[2.5rem] border-2 transition-all duration-300 ${selectedVoice === v.id ? 'bg-blue-600 border-blue-400 text-white shadow-2xl scale-105' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:border-white/10'}`}
              >
                <span className="text-lg font-black uppercase tracking-tight mb-2">{v.name}</span>
                <span className="text-[11px] opacity-60 leading-tight font-medium uppercase tracking-widest">{v.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Interface */}
      <div className="p-8 md:px-[20%] border-t border-slate-900 bg-slate-950 shadow-[0_-40px_120px_rgba(0,0,0,0.95)]">
        
        {/* Quick Strategic Prompts - ACTIVATED BELOW BAR */}
        <div className="mb-10 flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => { if (prompt.action === 'live') { startLiveMode(); } else if (prompt.text) { handleSend(prompt.text); } }}
              className={`px-6 py-4 bg-slate-900 border ${prompt.label.includes('Médecins') ? 'border-blue-500/50 text-blue-300' : 'border-slate-800 text-slate-400'} hover:bg-blue-600 hover:border-blue-500 hover:text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-4 shadow-2xl active:scale-95 group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-2.5 bg-black/40 rounded-xl group-hover:bg-white/10 transition-colors relative z-10">
                {prompt.icon} 
              </div>
              <span className="relative z-10">{prompt.label}</span>
            </button>
          ))}
        </div>

        <div className={`relative flex items-end gap-5 bg-black border-2 ${attachment || isLiveActive ? 'border-blue-500 ring-8 ring-blue-500/10' : 'border-slate-800'} focus-within:border-blue-600 focus-within:ring-6 focus-within:ring-blue-600/10 rounded-[3.5rem] p-7 transition-all duration-500 shadow-2xl`}>
          
          <button onClick={() => setShowVoicePicker(!showVoicePicker)} className="p-3 text-slate-500 hover:text-blue-400 transition-all flex flex-col items-center gap-2 group">
             <Waves size={36} className="group-hover:scale-110 transition-transform" />
             <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100">{activeVoiceName}</span>
          </button>
          
          <button onClick={() => fileInputRef.current?.click()} className={`p-3 transition-all hover:scale-110 ${attachment ? 'text-blue-400' : 'text-slate-500 hover:text-blue-400'}`}>
            <Paperclip size={36} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Commandez l'intelligence JOSÉ..."
            rows={1}
            disabled={isLiveActive}
            className="flex-1 bg-transparent py-5 text-[18px] font-bold text-white outline-none resize-none max-h-[40vh] placeholder:text-slate-800 caret-blue-500 leading-relaxed disabled:opacity-50"
            onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />

          <div className="flex items-center gap-4">
            <button 
              onClick={startLiveMode}
              className={`p-6 rounded-[2.5rem] transition-all flex items-center justify-center shadow-xl active:scale-90 ${isLiveActive ? 'bg-red-600 text-white shadow-red-500/40' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-blue-600'}`}
              title="Session Vocale Live Native"
            >
              <Mic size={30} className={isLiveActive ? 'animate-pulse' : ''} />
            </button>
            <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !attachment)} className="p-6 synergy-bg text-white rounded-[2.5rem] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-5 flex items-center justify-center">
              <Send size={30} />
            </button>
          </div>
        </div>
        
        {attachment && (
          <div className="mt-8 flex items-center gap-6 px-10 py-6 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] text-[15px] text-blue-300 font-bold animate-in slide-in-from-bottom-4 shadow-inner">
             <FileText size={24} className="text-blue-400" /> 
             <span className="truncate max-w-[300px]">{attachment.name}</span>
             <button onClick={() => setAttachment(null)} className="ml-auto p-2.5 text-slate-600 hover:text-white hover:bg-white/10 rounded-full transition-all"><X size={22} /></button>
          </div>
        )}
      </div>

      {/* Global Reset Dialog */}
      {showResetConfirm && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-10 bg-slate-950/60 backdrop-blur-2xl animate-in fade-in">
           <div className="bg-white rounded-[4rem] p-16 border-2 border-slate-50 shadow-[0_80px_160px_rgba(0,0,0,0.4)] max-w-lg w-full text-center">
              <ShieldAlert size={80} className="text-red-600 mx-auto mb-10 animate-bounce" />
              <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-6">Effacer l'Intelligence ?</h3>
              <p className="text-md text-slate-500 font-medium mb-14 leading-relaxed">Cette opération de souveraineté est irréversible. L'intégralité de l'historique et des signatures vocales sera détruite.</p>
              <div className="grid grid-cols-2 gap-6">
                 <button onClick={() => setShowResetConfirm(false)} className="py-7 bg-slate-100 text-slate-600 font-black text-[12px] uppercase rounded-3xl hover:bg-slate-200 transition-all">ANNULER</button>
                 <button onClick={clearHistory} className="py-7 bg-red-600 text-white font-black text-[12px] uppercase rounded-3xl shadow-2xl shadow-red-200 hover:bg-red-700 transition-all">RÉINITIALISER</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
