
import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Square, Paperclip, Download, Zap, Mic, MicOff, Volume2, VolumeX, Sparkles, User, Heart, TrendingUp, X, Play, Pause, CircleStop, Settings2, Waves, CheckCircle, Trash2, ShieldAlert, UploadCloud, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DistributorData } from '../types';
import { getAI, analyzeMedicalDocument, textToSpeech } from '../services/geminiService';
import { playPcmAudio, stopAllAudio, setAudioVolume } from '../services/audioService';
import { MODELS, SYSTEM_INSTRUCTIONS, JOSE_ID, DEFAULT_NEOLIFE_LINK, VOICES } from '../constants';

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
    return saved ? JSON.parse(saved) : [{ role: 'model', text: "Système prêt. Comment optimiser votre croissance aujourd'hui ?", timestamp: Date.now() }];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [activePlayback, setActivePlayback] = useState<{ index: number; progress: number; duration: number; volume: number } | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem(voiceKey) || VOICES[0].id);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackTimerRef = useRef<number | null>(null);

  // Auto-save logic
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
    };
  }, []);

  const handleFile = (file: File) => {
    const r = new FileReader();
    r.onload = () => setAttachment({ 
        data: (r.result as string).split(',')[1], 
        mimeType: file.type, 
        name: file.name 
    });
    r.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const exportSession = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `GMBC_JOSE_SESSION_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearHistory = () => {
    const initialMsg: ChatMessage = { role: 'model', text: "Système réinitialisé. Nouvelle session stratégique activée.", timestamp: Date.now() };
    setMessages([initialMsg]);
    setShowResetConfirm(false);
    stopAllAudio();
  };

  const handleSend = async () => {
    const textToSend = input.trim();
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
        const res = await analyzeMedicalDocument(textToSend || "Analyse ce document.", attachment.data, attachment.mimeType, sysInst);
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

  const handleVolumeChange = (v: number) => {
    setAudioVolume(v);
    setActivePlayback(prev => prev ? { ...prev, volume: v } : null);
  };

  return (
    <div 
        className="flex flex-col h-full bg-white relative overflow-hidden font-sans"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-12 animate-in fade-in duration-300">
            <div className="w-full h-full border-4 border-dashed border-blue-500 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-32 h-32 synergy-bg rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(37,99,235,0.6)] animate-pulse">
                    <UploadCloud size={64} />
                </div>
                <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Analyse Stratégique</h2>
                    <p className="text-blue-400 font-bold uppercase tracking-[0.3em] mt-2">Relâchez le fichier pour Coach JOSÉ</p>
                </div>
            </div>
        </div>
      )}

      {/* Header de Commande Session (Sticky) */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-[20%] py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Intelligence Live</span>
           </div>
           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter transition-all ${saveStatus === 'saved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600 animate-pulse'}`}>
             {saveStatus === 'saved' ? <CheckCircle size={10} /> : <RefreshCcw size={10} className="animate-spin" />}
             {saveStatus === 'saved' ? 'Session Sauvegardée' : 'Synchronisation...'}
           </div>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={exportSession}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest rounded-xl transition-all"
              title="Exporter l'intégralité (Texte + Audio)"
            >
              <Download size={14} /> Exporter JSON
            </button>
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              <Trash2 size={14} /> Reset
            </button>
         </div>
      </div>

      {/* Overlay de Confirmation Reset */}
      {showResetConfirm && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[2.5rem] p-10 border-2 border-slate-50 shadow-2xl max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Effacer l'Intelligence ?</h3>
              <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                Cette action supprimera tout l'historique et les audios de cette session locale.
              </p>
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setShowResetConfirm(false)} className="py-4 bg-slate-100 text-slate-500 font-black text-[10px] uppercase rounded-xl hover:bg-slate-200 transition-all">Annuler</button>
                 <button onClick={clearHistory} className="py-4 bg-red-600 text-white font-black text-[10px] uppercase rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all">Réinitialiser</button>
              </div>
           </div>
        </div>
      )}

      {/* Zone de Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-[20%] py-8 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'model' ? 'w-full' : ''}`}>
              <div className={`text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.role === 'model' ? (
                  <div className="flex items-center gap-1 text-blue-500">
                    <Zap size={10} className="fill-blue-500" /> COACH JOSÉ
                  </div>
                ) : "VOUS"}
              </div>
              <div className={`p-4 rounded-2xl text-[14px] leading-relaxed transition-all duration-300 ${msg.role === 'user' ? 'bg-slate-100 text-slate-800 font-medium' : 'bg-white text-slate-900 border border-slate-50 shadow-sm'}`}>
                <ReactMarkdown className="prose prose-sm max-w-none">{msg.text}</ReactMarkdown>
                
                {msg.role === 'model' && msg.text && (
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    {activePlayback?.index === idx ? (
                      <div className="bg-slate-950 rounded-xl p-3 flex flex-col gap-3 animate-in slide-in-from-top-2">
                        <div className="flex items-center justify-between gap-4">
                          <button onClick={() => handleAudioPlayback(idx, msg.text)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
                            <CircleStop size={14} />
                          </button>
                          
                          <div className="flex-1 flex flex-col gap-1">
                            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all duration-100" 
                                style={{ width: `${(activePlayback.progress / activePlayback.duration) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                              <span>{activePlayback.progress.toFixed(1)}s</span>
                              <span>{activePlayback.duration.toFixed(1)}s</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 px-2 border-l border-slate-800">
                            {activePlayback.volume === 0 ? <VolumeX size={12} className="text-slate-500" /> : <Volume2 size={12} className="text-blue-500" />}
                            <input 
                              type="range" min="0" max="1" step="0.01" 
                              value={activePlayback.volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              className="w-16 h-1 bg-slate-800 rounded-full appearance-none accent-blue-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleAudioPlayback(idx, msg.text)}
                          className={`flex items-center gap-1.5 text-[9px] font-black hover:text-blue-600 transition-all uppercase tracking-widest ${msg.audio ? 'text-blue-500' : 'text-slate-500'}`}
                        >
                          <Play size={10} fill="currentColor" /> {msg.audio ? 'Réécouter la réponse' : 'Lire la réponse'}
                        </button>
                        <button 
                          onClick={() => navigator.clipboard.writeText(msg.text)}
                          className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest"
                        >
                          <Download size={10} /> Copier le texte
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
          <div className="flex flex-col gap-2 py-2">
             <div className="text-[10px] font-black text-blue-500 animate-pulse uppercase tracking-widest flex items-center gap-2">
               <Sparkles size={12} /> Coach JOSÉ analyse & rédige...
             </div>
          </div>
        )}
      </div>

      {/* Panneau de sélection de voix (Overlay terminal) */}
      {showVoicePicker && (
        <div className="absolute bottom-[100px] left-6 md:left-[20%] right-6 md:right-[20%] bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-5 z-50">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <div>
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Configuration Vocale</h4>
              <p className="text-xs text-slate-500 font-bold">Sélectionnez la fréquence du Coach</p>
            </div>
            <button onClick={() => setShowVoicePicker(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
            {VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => { setSelectedVoice(voice.id); setShowVoicePicker(false); }}
                className={`flex flex-col text-left p-4 rounded-2xl transition-all border ${
                  selectedVoice === voice.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                   <span className={`text-[11px] font-black uppercase tracking-tight ${selectedVoice === voice.id ? 'text-white' : 'text-slate-200'}`}>
                     {voice.name}
                   </span>
                   {selectedVoice === voice.id && <CheckCircle size={14} className="text-white" />}
                </div>
                <p className={`text-[10px] font-medium leading-tight ${selectedVoice === voice.id ? 'text-blue-100' : 'text-slate-500'}`}>
                  {voice.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Barre de Saisie Terminal Souverain (Haut Contraste Noir & Blanc) */}
      <div className="p-6 md:px-[20%] border-t border-slate-900 bg-slate-950 shadow-[0_-15px_60px_rgba(0,0,0,0.8)]">
        <div className={`relative flex items-end gap-3 bg-black border ${attachment ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-800'} focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 rounded-[2.5rem] p-5 transition-all duration-500 shadow-2xl`}>
          <button 
            onClick={() => setShowVoicePicker(!showVoicePicker)} 
            className={`p-2 transition-all hover:scale-110 ${showVoicePicker ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]' : 'text-slate-500 hover:text-blue-400'}`}
            title="Fréquence Vocale"
          >
            <Waves size={24} />
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className={`p-2 transition-all hover:scale-110 ${attachment ? 'text-blue-400 animate-pulse' : 'text-slate-500 hover:text-blue-400'}`}
            title="Joindre Fichier"
          >
            <Paperclip size={24} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }} />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={isDragging ? "Lâchez ici..." : "Commandez le système (Terminal Souverain)..."}
            rows={1}
            className="flex-1 bg-transparent py-2.5 text-[16px] font-bold text-white outline-none resize-none max-h-[40vh] placeholder:text-slate-700 caret-blue-500 leading-relaxed"
            onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />

          <button 
            onClick={() => handleSend()} 
            disabled={isLoading || (!input.trim() && !attachment)} 
            className="p-4 synergy-bg text-white rounded-[1.5rem] shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-90 transition-all disabled:opacity-5 disabled:grayscale flex items-center justify-center group"
          >
            <Send size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        
        {attachment && (
          <div className="mt-4 flex items-center gap-3 px-5 py-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-[12px] text-blue-300 font-black animate-in slide-in-from-bottom-2 shadow-inner">
             <FileText size={16} className="text-blue-400" /> 
             <span className="truncate max-w-[250px]">{attachment.name}</span>
             <button 
               onClick={() => setAttachment(null)} 
               className="ml-auto p-1 text-slate-600 hover:text-white hover:bg-white/5 rounded-lg transition-all"
             >
               <X size={16} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
