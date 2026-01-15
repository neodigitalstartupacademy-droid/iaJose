
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, X, FileText, Image as ImageIcon, Volume2, Volume1, VolumeX, Square, Settings2, Mic, MicOff, Trash2, RotateCcw, History, Download, Share2, Headset, MessageSquareText, Check, ChevronDown, Save, Calendar, Music, Zap, Heart, Settings, Paperclip, User, Wand2, Loader2, Play, Pause, ExternalLink, Link as LinkIcon, FileDown, FileJson, UploadCloud, Timer, Activity, FlaskConical, Target, GraduationCap, Fingerprint, CheckCircle2, CloudCheck, Cloud, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DistributorData, SavedSession, UserAccount } from '../types';
import { getAI, analyzeMedicalDocument, textToSpeech, generateImage, analyzeVoiceSample } from '../services/geminiService';
import { playPcmAudio, stopAllAudio, setAudioVolume } from '../services/audioService';
import { MODELS, SYSTEM_INSTRUCTIONS, JOSE_ID, DEFAULT_NEOLIFE_LINK, VOICES } from '../constants';

interface ChatBotProps {
    distData: DistributorData | null;
    isOwner: boolean;
    initialIntent?: string | null;
}

interface Attachment {
  data: string; // base64
  mimeType: string;
  name: string;
}

const UserPlus = ({ size, className }: { size: number, className: string }) => <Heart size={size} className={className} />;

const SUGGESTED_PROMPTS = [
  { 
    label: 'Analyser Bilan Sanguin', 
    prompt: 'Je souhaite vous soumettre mes résultats de bilan sanguin pour une analyse de nutrition cellulaire. Que dois-je regarder en priorité pour ma vitalité ?', 
    icon: <FlaskConical size={14} className="text-red-500" /> 
  },
  { 
    label: 'Conseils Trio Nutrition', 
    prompt: 'Expliquez-moi les bienfaits du Trio de Relance NeoLife pour ma vitalité cellulaire et comment il fonctionne.', 
    icon: <Sparkles size={14} className="text-green-500" /> 
  },
  { 
    label: 'Opportunité NeoLife', 
    prompt: 'Comment fonctionne le système de duplication GMBC-OS avec NeoLife et comment puis-je générer un revenu ?', 
    icon: <Target size={14} className="text-blue-500" /> 
  },
  { 
    label: 'S\'inscrire maintenant', 
    prompt: 'Quelles sont les étapes pour devenir distributeur NeoLife avec votre équipe et rejoindre le système GMBC-OS ?', 
    icon: <UserPlus size={14} className="text-emerald-500" /> 
  },
  { 
    label: 'Liberté Financière', 
    prompt: 'Comment le concept de "Temps contre Argent" est-il résolu par le système de duplication NeoLife et NDSA ?', 
    icon: <Zap size={14} className="text-amber-500" /> 
  }
];

const ACK_PHRASES = ["Compris !", "Bien reçu.", "J'écoute.", "C'est noté.", "Entendu.", "Je m'en occupe.", "Synergie reçue.", "J'analyse cela."];

const ChatBot: React.FC<ChatBotProps> = ({ distData, isOwner, initialIntent }) => {
  const currentId = distData?.id || JOSE_ID;
  const currentShop = distData?.shopUrl || DEFAULT_NEOLIFE_LINK;
  const storageKey = `jose_chat_history_${currentId}`;
  const archiveKey = `jose_session_archives_${currentId}`;
  const draftKey = `jose_chat_draft_${currentId}`;
  const userKey = 'jose_current_user';

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(userKey);
    return saved ? JSON.parse(saved) : null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    let welcomeText = `Bonjour, je suis Coach JOSÉ.\n\nJe suis l'assistant intelligent de **GMBC-OS** pour le partenaire NeoLife ID: ${currentId}.\n\nDites-moi : **qu'est-ce qui vous amène aujourd'hui ?**\n\n1. Cherchez-vous à améliorer votre **Santé** et votre vitalité ?\n2. Ou êtes-vous à la recherche d'une **Opportunité** capable de vous mener à la liberté financière ?`;
    
    return [{ role: 'model', text: welcomeText, timestamp: Date.now() }];
  });
  
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    const saved = localStorage.getItem(archiveKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState(() => localStorage.getItem(draftKey) || '');
  const [isLoading, setIsLoading] = useState(false);
  const [activePlayback, setActivePlayback] = useState<{ index: number; progress: number; duration: number } | null>(null);
  const [volume, setVolume] = useState(1.0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isConversational, setIsConversational] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(currentUser?.preferredVoice || VOICES[0].id);
  const [showArchive, setShowArchive] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showVoiceStudio, setShowVoiceStudio] = useState(false);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [voiceAnalysisResult, setVoiceAnalysisResult] = useState<{recommendedVoice: string, analysis: string} | null>(null);
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [saveSessionSuccess, setSaveSessionSuccess] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dropSuccess, setDropSuccess] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackIntervalRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);
  const isHandsFreeRef = useRef(false);

  useEffect(() => {
    const handleAutoSave = () => {
        setIsAutoSaving(true);
        localStorage.setItem(storageKey, JSON.stringify(messages));
        localStorage.setItem(draftKey, input);
        setTimeout(() => setIsAutoSaving(false), 2000);
    };
    handleAutoSave();
    const interval = setInterval(handleAutoSave, 30000);
    return () => clearInterval(interval);
  }, [messages, input, storageKey, draftKey]);

  useEffect(() => {
    localStorage.setItem(archiveKey, JSON.stringify(savedSessions));
  }, [savedSessions, archiveKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (voiceMenuRef.current && !voiceMenuRef.current.contains(event.target as Node)) {
        setShowVoiceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        const currentTranscript = finalTranscript || interimTranscript;
        if (currentTranscript.trim()) setInput(currentTranscript);
        if (finalTranscript && isHandsFreeRef.current && !activePlayback) {
          setTimeout(() => isHandsFreeRef.current && handleSend(finalTranscript), 800);
        }
      };
      recognitionRef.current.onend = () => {
        if (isHandsFreeRef.current && !activePlayback && !isLoading && !isAcknowledging) {
          try { recognitionRef.current.start(); } catch (e) {}
        } else if (!isHandsFreeRef.current) {
          setIsRecording(false);
        }
      };
    }
    return () => { if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current); };
  }, [activePlayback, isLoading, isAcknowledging]);

  const processFile = useCallback((file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAttachment({ data: base64, mimeType: file.type, name: file.name });
      setDropSuccess(true);
      setTimeout(() => setDropSuccess(false), 2000);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent) => { 
    e.preventDefault(); e.stopPropagation(); 
    dragCounter.current++; 
    if (e.dataTransfer.items?.length > 0) setIsDragging(true); 
  };
  const handleDragLeave = (e: React.DragEvent) => { 
    e.preventDefault(); e.stopPropagation(); 
    dragCounter.current--; 
    if (dragCounter.current <= 0) { setIsDragging(false); dragCounter.current = 0; } 
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]);
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    if (currentUser) {
      const updatedUser = { ...currentUser, preferredVoice: voiceId };
      setCurrentUser(updatedUser);
      localStorage.setItem(userKey, JSON.stringify(updatedUser));
    }
    setShowVoiceMenu(false);
  };

  const handlePreviewVoice = async (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingVoice === voiceId) { stopAllAudio(); setPreviewingVoice(null); return; }
    stopAllAudio();
    setPreviewingVoice(voiceId);
    const audio = await textToSpeech("Bonjour ! Je suis Coach JOSÉ.", voiceId);
    if (audio) {
      const source = await playPcmAudio(audio);
      if (source) source.onended = () => setPreviewingVoice(null);
      else setPreviewingVoice(null);
    } else setPreviewingVoice(null);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setAudioVolume(newVol);
  };

  const handleSaveSession = () => {
    if (messages.length <= 1) return;
    setIsSavingSession(true);
    const title = prompt("Titre de la session :") || `Session ${new Date().toLocaleDateString()}`;
    const newSession: SavedSession = { id: `session_${Date.now()}`, title, timestamp: Date.now(), messages: [...messages] };
    setSavedSessions(prev => [newSession, ...prev]);
    setTimeout(() => { setIsSavingSession(false); setSaveSessionSuccess(true); setTimeout(() => setSaveSessionSuccess(false), 2000); }, 500);
  };

  const playAckVocal = async () => {
    setIsAcknowledging(true);
    const phrase = ACK_PHRASES[Math.floor(Math.random() * ACK_PHRASES.length)];
    try {
      const audio = await textToSpeech(phrase, selectedVoice);
      if (audio) await playPcmAudio(audio);
    } catch (e) {}
    setIsAcknowledging(false);
  };

  // Fixed: Implemented the missing exportSingleMessage function
  const exportSingleMessage = (idx: number, format: 'txt') => {
    const msg = messages[idx];
    if (!msg) return;
    const content = `[${msg.role.toUpperCase()}] - ${new Date(msg.timestamp).toLocaleString()}\n\n${msg.text}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coach_jose_message_${idx}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !attachment) return;
    if (isHandsFreeRef.current) try { recognitionRef.current.stop(); } catch(e) {}
    const wasVocal = !overrideInput && input.length > 0;
    const userMessage: ChatMessage = { role: 'user', text: attachment ? `${textToSend}\n\n📎 *Document joint : ${attachment.name}*` : textToSend, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    localStorage.removeItem(draftKey);
    setIsLoading(true);
    if (wasVocal || isConversational || isHandsFreeRef.current) await playAckVocal();
    try {
      let responseText = "";
      let sources: { title?: string, uri?: string }[] = [];
      const sysInst = SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner);
      if (attachment) {
        responseText = await analyzeMedicalDocument(textToSend || "Analyse ce document.", attachment.data, attachment.mimeType, sysInst);
        setAttachment(null);
      } else {
        const ai = getAI();
        const chat = ai.chats.create({ model: MODELS.TEXT_COMPLEX, config: { systemInstruction: sysInst, tools: [{ googleSearch: {} }] } });
        const response = await chat.sendMessage({ message: textToSend });
        responseText = response.text || "Erreur.";
        sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((chunk: any) => chunk.web).map((chunk: any) => ({ title: chunk.web?.title, uri: chunk.web?.uri })) || [];
      }
      const responseMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now(), sources: sources.length > 0 ? sources : undefined };
      setMessages(prev => [...prev, responseMsg]);
      if (isConversational || isHandsFreeRef.current) handleAudioPlayback(messages.length, responseMsg.text);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Erreur d'analyse.", timestamp: Date.now() }]);
    } finally { setIsLoading(false); }
  };

  const handleAudioPlayback = async (idx: number, text: string) => {
      const isAlreadyPlaying = activePlayback?.index === idx;
      stopAllAudio();
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      if (isAlreadyPlaying) {
          setActivePlayback(null);
          if (isHandsFreeRef.current) try { recognitionRef.current.start(); } catch(e) {}
          return;
      }
      if (isHandsFreeRef.current) try { recognitionRef.current.stop(); } catch(e) {}
      let audio = messages[idx]?.audio;
      if (!audio) {
          audio = await textToSpeech(text, selectedVoice) || undefined;
          if (audio) setMessages(prev => { const n = [...prev]; n[idx].audio = audio; return n; });
      }
      if (audio) {
          const source = await playPcmAudio(audio);
          if (source) {
              const duration = source.buffer?.duration || 0;
              let startTime = Date.now();
              setActivePlayback({ index: idx, progress: 0, duration });
              playbackIntervalRef.current = window.setInterval(() => {
                  const elapsed = (Date.now() - startTime) / 1000;
                  if (elapsed >= duration) { setActivePlayback(null); clearInterval(playbackIntervalRef.current!); }
                  else setActivePlayback(prev => prev ? { ...prev, progress: elapsed } : null);
              }, 100);
              source.onended = () => { setActivePlayback(null); if (isHandsFreeRef.current) try { recognitionRef.current.start(); } catch(e) {} };
          }
      }
  };

  const toggleRecording = () => {
    if (isRecording) { isHandsFreeRef.current = false; recognitionRef.current?.stop(); setIsRecording(false); }
    else { try { isHandsFreeRef.current = true; recognitionRef.current?.start(); setIsRecording(true); } catch (e) {} }
  };

  return (
    <div 
      ref={dropZoneRef}
      onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDrop={handleDrop}
      className="relative max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border-4 border-white overflow-hidden glass-effect transition-all duration-500 bg-white/30"
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-600/40 backdrop-blur-xl z-[60] flex items-center justify-center animate-in fade-in duration-300">
           <div className="w-[90%] h-[90%] border-8 border-dashed border-white/50 rounded-[4rem] flex flex-col items-center justify-center gap-8 bg-blue-600/30 shadow-2xl">
              <UploadCloud size={100} className="text-white animate-bounce" />
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter text-center">Analyste Prêt</h3>
           </div>
        </div>
      )}

      {/* Header Synergy */}
      <div className="px-8 py-5 border-b flex items-center justify-between z-10 bg-white/80 backdrop-blur-2xl">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl synergy-bg flex items-center justify-center text-white font-black text-2xl relative transition-all duration-500 shadow-xl ${isRecording || isAcknowledging ? 'animate-pulse scale-110' : ''}`}>
            J
          </div>
          <div>
            <div className="flex items-center gap-3">
              <p className="font-black text-slate-900 tracking-tight text-xl uppercase">Coach JOSÉ</p>
              <div className={`flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black uppercase transition-all ${isAutoSaving ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`}>
                {isAutoSaving ? <Cloud size={10} /> : <CloudCheck size={10} />}
                <span>{isAutoSaving ? 'Synchro...' : 'Sécurisé'}</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activePlayback ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`}></span>
              ID: {currentId} • Synergie Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={() => setShowArchive(!showArchive)} className={`p-4 rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-2 ${showArchive ? 'synergy-bg text-white' : 'bg-white border border-slate-100 text-slate-500'}`}>
             <History size={20} />
           </button>
           <div className="relative" ref={voiceMenuRef}>
             <button onClick={() => setShowVoiceMenu(!showVoiceMenu)} className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-500 shadow-md flex items-center gap-2">
               <Volume2 size={20} />
               <ChevronDown size={14} />
             </button>
             {showVoiceMenu && (
               <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                 {VOICES.map(v => (
                   <div key={v.id} onClick={() => handleVoiceChange(v.id)} className={`p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50 transition-colors ${selectedVoice === v.id ? 'bg-blue-50 text-blue-600' : 'text-slate-700'}`}>
                      <span className="text-xs font-bold">{v.name.split(' ')[0]}</span>
                      {selectedVoice === v.id && <Check size={14} />}
                   </div>
                 ))}
               </div>
             )}
           </div>
           <button onClick={() => { stopAllAudio(); setMessages([{ role: 'model', text: 'Nouvelle conversation.', timestamp: Date.now() }]); setInput(''); }} className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-500 shadow-md">
             <RotateCcw size={20} />
           </button>
        </div>
      </div>

      {/* Chat Messages - ESPACE DE LECTURE OPTIMISÉ */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-12 custom-scrollbar bg-slate-50/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="shrink-0 pt-1 hidden md:block">
              <div className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden border-2 border-white ${msg.role === 'model' ? 'synergy-bg text-white font-black text-xl' : 'bg-white text-slate-400'}`}>
                {msg.role === 'model' ? 'J' : <User size={20} />}
              </div>
            </div>

            {/* Bulle de message élargie et aérée */}
            <div className={`w-full max-w-[95%] md:max-w-[88%] rounded-[2rem] p-6 md:p-10 shadow-xl border-2 transition-all duration-300 relative ${
              msg.role === 'user' ? 'synergy-bg text-white rounded-tr-none border-transparent' : 'bg-white border-slate-100 text-slate-900 rounded-tl-none border-l-8 border-l-blue-600'
            }`}>
              {/* Contenu Markdown avec typographie haute visibilité */}
              <div className={`prose prose-slate max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-base md:prose-lg'} leading-relaxed`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {/* Grounding Sources (Google Search) */}
              {msg.sources && (
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {msg.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-all group">
                       <ExternalLink size={14} className="text-blue-500" />
                       <span className="text-[11px] font-black text-slate-500 uppercase truncate group-hover:text-blue-600">{s.title || 'Source Web'}</span>
                    </a>
                  ))}
                </div>
              )}
              
              <div className={`mt-6 pt-4 border-t flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'border-white/20' : 'border-slate-50'}`}>
                  <div className="flex gap-4">
                      <button onClick={() => handleAudioPlayback(idx, msg.text)} className={`flex items-center gap-2 p-2 rounded-lg transition-all ${msg.role === 'user' ? 'hover:bg-white/10' : 'hover:bg-slate-50'}`}>
                         {activePlayback?.index === idx ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                         <span className="text-[10px] font-black uppercase tracking-widest">{activePlayback?.index === idx ? 'Stop' : 'Lire'}</span>
                      </button>
                      <button onClick={() => exportSingleMessage(idx, 'txt')} className={`flex items-center gap-2 p-2 rounded-lg transition-all ${msg.role === 'user' ? 'hover:bg-white/10' : 'hover:bg-slate-50'}`}>
                         <Download size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">TXT</span>
                      </button>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-6 animate-pulse">
            <div className="w-12 h-12 rounded-2xl synergy-bg text-white font-black text-xl flex items-center justify-center shadow-lg">J</div>
            <div className="bg-white border-2 border-slate-100 border-l-8 border-l-blue-600 rounded-[2rem] p-8 md:p-10 shadow-xl flex items-center gap-8 w-full max-w-[80%]">
              <div className="flex gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-sm text-slate-400 font-black uppercase tracking-widest">Coach JOSÉ analyse vos données...</span>
            </div>
          </div>
        )}
      </div>

      {/* Attachment Preview Area */}
      {attachment && (
        <div className="mx-12 mb-6 animate-in slide-in-from-bottom-6">
           <div className={`bg-white border-2 border-blue-500/30 rounded-3xl p-5 flex items-center justify-between shadow-2xl backdrop-blur-xl`}>
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText size={32} />
                 </div>
                 <div>
                    <p className="text-base font-black text-slate-900 uppercase tracking-tight">{attachment.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Fichier prêt pour l'IA</p>
                 </div>
              </div>
              <button onClick={() => setAttachment(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm">
                <X size={24} />
              </button>
           </div>
        </div>
      )}

      {/* Controls Area */}
      <div className="px-8 pb-10 pt-6 border-t bg-white/90 backdrop-blur-3xl relative">
        <div className="max-w-6xl mx-auto flex items-center gap-5">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className={`p-6 transition-all shadow-xl border-4 rounded-[1.5rem] md:rounded-[2rem] ${attachment ? 'bg-blue-600 text-white border-blue-600 animate-pulse' : 'bg-slate-50 text-slate-400 hover:text-blue-600 border-slate-100 hover:bg-white'}`} 
            >
                <Paperclip size={28} />
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
            </button>
            
            <div className="relative flex-1">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder={isRecording ? "Coach JOSÉ vous écoute..." : "Décrivez vos symptômes ou glissez un bilan..."} 
                className={`w-full px-10 py-6 rounded-[2rem] focus:outline-none text-lg font-bold transition-all border-4 shadow-inner ${isRecording ? 'bg-red-50 border-red-200 text-red-900 ring-4 ring-red-100' : 'bg-slate-50 border-slate-50 focus:bg-white focus:border-blue-500'}`} 
              />
              <button 
                onClick={toggleRecording} 
                className={`absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all ${isRecording ? 'bg-red-600 text-white shadow-2xl scale-110' : 'text-slate-400 hover:text-blue-600'}`}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </div>
            
            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || (!input.trim() && !attachment)} 
              className="p-8 rounded-[2rem] text-white shadow-2xl active:scale-95 transition-all group synergy-bg disabled:bg-slate-200 disabled:shadow-none"
            >
              <Send size={32} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>

        {/* Suggestion Prompts */}
        <div className="flex flex-wrap gap-3 max-w-6xl mx-auto w-full px-4 justify-center mt-8">
          {SUGGESTED_PROMPTS.map((item, i) => (
            <button key={i} onClick={() => handleSend(item.prompt)} disabled={isLoading} className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 rounded-full text-xs font-black text-slate-600 hover:border-blue-500 hover:bg-blue-50 hover:shadow-xl transition-all disabled:opacity-50">
              {item.icon}<span className="uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Archives Overlay */}
      {showArchive && (
        <div className="absolute inset-0 bg-slate-900/98 backdrop-blur-3xl z-[70] p-12 flex flex-col animate-in fade-in duration-500">
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Journal de Synergie</h3>
              <button onClick={() => setShowArchive(false)} className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all"><X size={32} /></button>
           </div>
           <div className="flex-1 overflow-y-auto space-y-8 custom-scrollbar pr-6">
              {savedSessions.map(s => (
                <div key={s.id} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] flex justify-between items-center hover:bg-white/10 transition-all group cursor-pointer" onClick={() => { setMessages(s.messages); setShowArchive(false); }}>
                  <div>
                    <p className="text-2xl font-black text-white uppercase group-hover:text-blue-400 transition-colors">{s.title}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-3">
                       <Calendar size={12} /> {new Date(s.timestamp).toLocaleDateString()} • {s.messages.length} interactions
                    </p>
                  </div>
                  <ChevronDown className="-rotate-90 text-slate-600 group-hover:text-white transition-colors" size={24} />
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
