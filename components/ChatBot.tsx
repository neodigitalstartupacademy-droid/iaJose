
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, FileText, Paperclip, Download, Zap, Mic, MicOff, Volume2, Sparkles, X, Play, CircleStop, Waves, CheckCircle, Trash2, ShieldAlert, RefreshCcw, Stethoscope, Heart, Target, ScrollText, Activity, BrainCircuit, Globe, MapPin, ExternalLink, Brain, Loader2, Rocket, Pause, ShieldCheck, Stethoscope as MedIcon, Info, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DistributorData, Language } from '../types';
import { getAI, analyzeMedicalDocument, textToSpeech } from '../services/geminiService';
import { playPcmAudio, stopAllAudio, getAudioState, pauseAudio, resumeAudio, seekAudio } from '../services/audioService';
import { MODELS, SYSTEM_INSTRUCTIONS, JOSE_ID, DEFAULT_NEOLIFE_LINK, VOICES } from '../constants';
import { LiveServerMessage, Modality } from '@google/genai';
import { translations } from '../translations';

interface ChatBotProps {
    distData: DistributorData | null;
    isOwner: boolean;
    initialIntent?: string | null;
    language: Language;
}

interface Attachment { data: string; mimeType: string; name: string; }

const ChatBot: React.FC<ChatBotProps> = ({ distData, isOwner, initialIntent, language }) => {
  const t = translations[language];
  const branding = distData?.branding;
  const brandName = branding?.name || t.appName;
  
  const currentId = distData?.id || JOSE_ID;
  const currentShop = distData?.shopUrl || DEFAULT_NEOLIFE_LINK;
  const historyKey = `jose_chat_history_${currentId}`;
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [{ 
        role: 'model', 
        text: t.welcome.replace('Coach JOSÉ', brandName), 
        timestamp: Date.now() 
    }];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState<number | null>(null);
  const [activeAudioIdx, setActiveAudioIdx] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState({ position: 0, duration: 0, isPlaying: false });
  const [useThinking, setUseThinking] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState({ user: '', model: '' });
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const liveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const activeVoiceId = VOICES.find(v => v.id === selectedVoice)?.id || "Charon";
  const activeVoiceLabel = VOICES.find(v => v.id === selectedVoice)?.name || "Souverain";

  useEffect(() => {
    let interval: any;
    if (activeAudioIdx !== null) {
      interval = setInterval(() => {
        const state = getAudioState();
        setAudioProgress(state);
        if (!state.isPlaying && state.position === 0) {
          setActiveAudioIdx(null);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeAudioIdx]);

  const QUICK_PROMPTS_LEFT = [
    { 
      label: t.medSpace, 
      icon: <MedIcon size={14} className="text-blue-400" />, 
      text: "Réalisez une analyse approfondie d'un bilan sanguin selon les standards NeoLife SAB. Quels nutriments sont prioritaires pour une relance cellulaire ?"
    },
    { 
      label: t.visionBtn, 
      icon: <Rocket size={14} className="text-amber-500" />, 
      text: t.vision1958.replace('GMBC-OS', brandName)
    }
  ];

  const QUICK_PROMPTS_RIGHT = [
    { 
      label: t.duplication, 
      icon: <Target size={14} className="text-amber-500" />, 
      text: "Comment automatiser ma duplication à 100% avec le système GMBC-OS ?" 
    },
    { label: t.liveBtn, icon: <Mic size={14} className="text-green-500" />, action: 'live' }
  ];

  const HEALTH_PRO_PROMPTS = [
    { label: t.analyzeBlood, icon: <Activity size={12} />, text: "Analyse d'un bilan sanguin via la science NeoLife SAB. Identifiez les carences cumulées." },
    { label: t.interpretMedical, icon: <BrainCircuit size={12} />, text: "Interprétez cette analyse médicale. Quelles carences nutritionnelles ont favorisé ce malaise ?" },
    { label: t.chronicDiseases, icon: <ShieldAlert size={12} className="text-red-500" />, text: "Établissez un protocole de nutrition cellulaire pour les maladies chroniques. Identifiez les carences cumulées en vitamines et minéraux responsables de la dégradation cellulaire." },
    { label: t.cellularProtocol, icon: <ShieldCheck size={12} />, text: "Protocole nutritionnel cellulaire complémentaire à la médecine conventionnelle. Listez les carences à combler d'urgence." },
    { label: t.vitalityAdvise, icon: <Heart size={12} />, text: "Conseils de vitalité basés sur le Trio de Relance pour contrer les carences structurelles." }
  ];

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, historyKey]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geolocation denied.")
      );
    }
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
    if (isLiveActive) { stopLiveMode(); return; }
    try {
      stopAllAudio();
      const ai = getAI();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      const outCtx = new AudioContext({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { 
                data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))), 
                mimeType: 'audio/pcm;rate=16000' 
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(processor);
            processor.connect(audioCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64) {
              setIsSpeaking(true);
              const binary = atob(base64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const dataInt16 = new Int16Array(bytes.buffer);
              const buffer = outCtx.createBuffer(1, dataInt16.length, 24000);
              const channelData = buffer.getChannelData(0);
              for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              liveSourcesRef.current.add(source);
              source.onended = () => {
                liveSourcesRef.current.delete(source);
                if (liveSourcesRef.current.size === 0) setIsSpeaking(false);
              };
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: activeVoiceId } } },
          systemInstruction: SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner, language, branding) + "\nMODE LIVE VOCAL ACTIF.",
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) { console.error(err); }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      const data = base64Data.split(',')[1];
      setAttachment({ data, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handlePlayVoice = async (text: string, index: number) => {
    if (activeAudioIdx === index) {
      if (audioProgress.isPlaying) pauseAudio();
      else resumeAudio();
      return;
    }

    setIsTtsLoading(index);
    try {
      const base64Audio = await textToSpeech(text, activeVoiceId);
      if (base64Audio) {
        await playPcmAudio(base64Audio);
        setActiveAudioIdx(index);
      }
    } catch (err) { console.error("TTS Error:", err); } finally { setIsTtsLoading(null); }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend && !attachment) return;
    
    const modelIdx = messages.length + 1;
    setMessages(prev => [...prev, { role: 'user', text: attachment ? `${textToSend} [Fichier: ${attachment.name}]` : textToSend, timestamp: Date.now() }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getAI();
      setMessages(prev => [...prev, { role: 'model', text: "", timestamp: Date.now() }]);
      
      let fullResponse = "";
      let groundingSources: any[] = [];
      const sysInst = SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner, language, branding);

      if (attachment) {
        const res = await analyzeMedicalDocument(textToSend || "Analyze document", attachment.data, attachment.mimeType, sysInst);
        setMessages(prev => {
          const next = [...prev];
          next[modelIdx].text = res;
          return next;
        });
        setAttachment(null);
      } else {
        const isMapQuery = /où|lieu|adresse|proche|autour|restaurant|magasin|trouver|neolife point|situé|where|location|place/i.test(textToSend);
        const modelToUse = isMapQuery ? MODELS.MAPS_AGENT : (useThinking ? MODELS.TEXT_COMPLEX : MODELS.TEXT_FAST);
        
        const tools: any[] = [{ googleSearch: {} }];
        const toolConfig: any = {};
        if (isMapQuery) {
          tools.push({ googleMaps: {} });
          if (location) toolConfig.retrievalConfig = { latLng: { latitude: location.lat, longitude: location.lng } };
        }

        const config: any = { 
          systemInstruction: sysInst,
          maxOutputTokens: useThinking ? 40000 : 4000,
          tools,
          toolConfig
        };
        if (useThinking && !isMapQuery) config.thinkingConfig = { thinkingBudget: 32000 };

        const chat = ai.chats.create({ model: modelToUse, config });
        const result = await chat.sendMessageStream({ message: textToSend });
        
        for await (const chunk of result) {
          fullResponse += chunk.text || "";
          const metadata = chunk.candidates?.[0]?.groundingMetadata;
          if (metadata?.groundingChunks) {
            metadata.groundingChunks.forEach((c: any) => {
              if (c.web && !groundingSources.find(s => s.uri === c.web.uri)) groundingSources.push({ title: c.web.title, uri: c.web.uri, type: 'web' });
              if (c.maps && !groundingSources.find(s => s.uri === c.maps.uri)) groundingSources.push({ title: c.maps.title, uri: c.maps.uri, type: 'maps' });
            });
          }
          setMessages(prev => {
            const next = [...prev];
            next[modelIdx] = { ...next[modelIdx], text: fullResponse, sources: groundingSources.length > 0 ? [...groundingSources] : undefined };
            return next;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const next = [...prev];
        if (next[modelIdx]) next[modelIdx].text = "Anomalie souveraine détectée. Coach recalibre le flux.";
        return next;
      });
    } finally { setIsLoading(false); }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayBrandHeader = brandName.toUpperCase();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-ndsa-dark relative overflow-hidden font-sans transition-colors duration-300">
      {/* Live Overlay */}
      {isLiveActive && (
        <div className="absolute inset-0 z-[60] bg-slate-950 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] synergy-bg opacity-10 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
           <button onClick={stopLiveMode} className="absolute top-8 right-8 p-5 bg-white/5 text-white rounded-full hover:bg-white/10 transition-all border border-white/10"><X size={24} /></button>
           <div className="flex flex-col items-center gap-10 relative z-10 w-full max-w-2xl text-center">
              <div className={`w-48 h-48 rounded-full synergy-bg flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isSpeaking ? 'scale-110 shadow-[0_0_80px_rgba(37,99,235,0.4)]' : 'animate-wave'}`}>
                {isSpeaking ? <Volume2 size={80} /> : <Mic size={80} />}
              </div>
              <div className="space-y-6 text-white w-full">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400">SESSION SOUVERAINE LIVE</p>
                <div className="min-h-[120px] p-8 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-md shadow-2xl">
                  <p className="text-2xl font-black italic leading-tight text-slate-100">{partialTranscript.model || "..."}</p>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Header Cockpit */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
           <div className={`w-3 h-3 rounded-full ${isLoading ? 'animate-ping' : 'animate-pulse'} bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]`} />
           <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">{displayBrandHeader} SOUVERAIN</span>
         </div>
         <div className="flex gap-4">
            <button onClick={() => setUseThinking(!useThinking)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${useThinking ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
               <Brain size={14} className={useThinking ? 'animate-pulse' : ''} /> {useThinking ? t.thinkingOn : t.thinkingOff}
            </button>
            <button onClick={() => setShowResetConfirm(true)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
         </div>
      </div>

      {/* Messages Zone */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-[12%] py-12 space-y-12 bg-slate-50/10 dark:bg-slate-950/20 relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
            <div className={`max-w-[95%] ${msg.role === 'model' ? 'w-full' : ''}`}>
              <div className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-3 flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' ? <><div className="w-6 h-6 synergy-bg rounded-lg flex items-center justify-center text-white text-[10px] font-black">{brandName[0]}</div> {brandName}</> : <Activity size={10} />}
              </div>
              <div className={`p-8 md:p-10 rounded-[3rem] text-[18px] font-medium leading-relaxed shadow-sm transition-all duration-300 ${msg.role === 'user' ? 'bg-slate-900 text-white border border-slate-800 shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 shadow-2xl'}`}>
                <ReactMarkdown className="prose prose-slate dark:prose-invert max-w-none prose-lg">{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-5 py-8 text-blue-600 animate-in fade-in relative">
             <div className="relative">
                <BrainCircuit size={40} className={`animate-pulse ${useThinking ? 'text-blue-500 drop-shadow-[0_0_15px_rgba(37,99,235,0.6)]' : ''}`} />
             </div>
             <div className="flex flex-col">
                <span className="text-[14px] font-black uppercase tracking-[0.4em]">{useThinking ? 'SYNTHESIS...' : 'CALCULATING...'}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moteur {useThinking ? 'Gemini 3 Pro' : 'Gemini 3 Flash'} v4.5</span>
             </div>
          </div>
        )}
      </div>

      {/* Cockpit Trident Interface */}
      <div className="p-6 md:px-10 md:py-8 bg-slate-950 dark:bg-black border-t border-slate-900 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] relative z-20">
        <div className="max-w-[1500px] mx-auto flex flex-col items-center gap-8">
          
          <div className="w-full flex flex-col lg:flex-row items-center gap-8">
            {/* Left Wing */}
            <div className="hidden lg:flex flex-col gap-3 w-[280px] shrink-0">
              {QUICK_PROMPTS_LEFT.map((p, i) => (
                <button key={i} onClick={() => handleSend(p.text)} className="px-5 py-4 bg-slate-900/50 border border-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 group">
                  <div className="p-2 bg-black/40 rounded-xl group-hover:bg-white/10 transition-all">{p.icon}</div>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>

            {/* Center Console */}
            <div className="flex-1 w-full flex flex-col gap-6">
              <div className={`relative flex items-end gap-4 bg-black border-2 ${useThinking ? 'border-blue-500 ring-8 ring-blue-500/5 shadow-[0_0_40px_rgba(37,99,235,0.1)]' : 'border-slate-800'} rounded-[3rem] p-5 transition-all duration-500 shadow-2xl focus-within:border-blue-600`}>
                <button onClick={() => setShowVoicePicker(true)} className="p-3 text-slate-500 hover:text-blue-400 transition-all shrink-0 flex flex-col items-center gap-1 group">
                  <Waves size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[7px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100">{activeVoiceLabel}</span>
                </button>
                
                <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-500 hover:text-blue-400 transition-all shrink-0 self-center">
                  <Paperclip size={28} />
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) handleFile(f); }} />
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={t.inputPlaceholder}
                  rows={1}
                  className="flex-1 bg-transparent py-4 text-[18px] font-bold text-white outline-none resize-none placeholder:text-slate-800 caret-blue-500 leading-tight"
                  onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                />

                <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !attachment)} className="p-5 synergy-bg text-white rounded-[1.5rem] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-10 shrink-0 self-center">
                  <Send size={26} />
                </button>
              </div>

              {/* HEALTH PRO PROMPTS SECTION - BELOW INPUT */}
              <div className="flex flex-wrap justify-center gap-3 animate-in slide-in-from-top-4 duration-500">
                {HEALTH_PRO_PROMPTS.map((p, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(p.text)}
                    className="px-4 py-2.5 bg-slate-900/40 hover:bg-blue-600 border border-slate-800 hover:border-blue-400 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 group whitespace-nowrap"
                  >
                    <div className="p-1.5 bg-black/40 rounded-lg group-hover:bg-white/10 transition-all text-blue-400 group-hover:text-white">
                      {p.icon}
                    </div>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Wing */}
            <div className="hidden lg:flex flex-col gap-3 w-[280px] shrink-0">
              {QUICK_PROMPTS_RIGHT.map((p, i) => (
                <button key={i} onClick={() => p.action === 'live' ? startLiveMode() : handleSend(p.text)} className={`px-5 py-4 bg-slate-900/50 border border-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 group ${p.action === 'live' ? 'border-green-500/30 ring-1 ring-green-500/10' : ''}`}>
                  <div className={`p-2 bg-black/40 rounded-xl group-hover:bg-white/10 transition-all ${p.action === 'live' ? 'animate-pulse text-green-500' : ''}`}>{p.icon}</div>
                  <span className="truncate">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold uppercase tracking-widest opacity-40">
            <Shield size={12} className="text-blue-500" />
            Analyse basée sur la science SAB NeoLife. Ne remplace pas un diagnostic hospitalier.
          </div>

          {attachment && (
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-6 py-2 rounded-full font-black flex items-center gap-3 animate-in slide-in-from-bottom-2 shadow-xl border border-white/20">
              <FileText size={14} /> {attachment.name} <X size={12} className="cursor-pointer hover:scale-125 transition-all" onClick={() => setAttachment(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
