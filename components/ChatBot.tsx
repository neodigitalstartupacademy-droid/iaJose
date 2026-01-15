
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Info, ExternalLink, Paperclip, X, FileText, Image as ImageIcon, Volume2, Loader2, Square, Play, Settings2, Mic, MicOff, Trash2, RotateCcw, History, Download, Share2, Languages, Globe, VolumeX, Activity, Target, UserPlus, Headset, MessageSquareText, Check, ChevronDown, PlayCircle, Speaker, UploadCloud, Save, Bookmark, Calendar, Music, Radio } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DistributorData, SavedSession } from '../types';
import { getAI, analyzeMedicalDocument, textToSpeech } from '../services/geminiService';
import { playPcmAudio, stopAllAudio } from '../services/audioService';
import { MODELS, SYSTEM_INSTRUCTIONS, JOSE_ID, DEFAULT_NEOLIFE_LINK, VOICES } from '../constants';

interface ChatBotProps {
    distData: DistributorData | null;
    isOwner: boolean;
    initialIntent?: string | null;
}

const SUGGESTED_PROMPTS = [
  { label: 'Analyse bilan sanguin', prompt: 'Pouvez-vous m\'aider à analyser mon dernier bilan sanguin pour optimiser ma nutrition cellulaire ?', icon: <Activity size={14} /> },
  { label: 'Conseils Trio Relance', prompt: 'Expliquez-moi les bienfaits du Trio de Relance NeoLife pour ma vitalité.', icon: <Sparkles size={14} /> },
  { label: 'Opportunité NeoLife', prompt: 'Comment fonctionne l\'opportunité business NeoLife et le système GMBC-OS ?', icon: <Target size={14} /> },
  { label: 'Comment s\'inscrire ?', prompt: 'Quelles sont les étapes pour devenir distributeur NeoLife avec votre équipe ?', icon: <UserPlus size={14} /> }
];

const ChatBot: React.FC<ChatBotProps> = ({ distData, isOwner, initialIntent }) => {
  const currentId = distData?.id || JOSE_ID;
  const currentShop = distData?.shopUrl || DEFAULT_NEOLIFE_LINK;
  const storageKey = `jose_chat_history_${currentId}`;
  const archiveKey = `jose_session_archives_${currentId}`;

  const [detectedLang, setDetectedLang] = useState<string>(navigator.language.split('-')[0].toUpperCase());

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
    
    if (initialIntent === 'opportunity') {
      welcomeText = `Bonjour ! Je suis Coach JOSÉ.\n\nVous avez cliqué sur un lien concernant l'**Opportunité NeoLife & GMBC-OS**. C'est un excellent choix.\n\nJe suis ici pour vous montrer comment transformer votre vie financière grâce à notre système de duplication. \n\n**Par quoi voulez-vous commencer ?**\n- Comprendre le modèle d'affaires ?\n- Voir les témoignages de réussite ?\n- Savoir comment vous inscrire immédiatement ?`;
    }

    return [{ role: 'model', text: welcomeText, timestamp: Date.now() }];
  });
  
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    const saved = localStorage.getItem(archiveKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isConversational, setIsConversational] = useState(false);
  const [commandRecognized, setCommandRecognized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ data: string, type: string, name: string } | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [autoDetectLang, setAutoDetectLang] = useState(true);
  const [thinkingMode, setThinkingMode] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const selectedVoiceData = VOICES.find(v => v.id === selectedVoice) || VOICES[0];

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, storageKey]);

  useEffect(() => {
    localStorage.setItem(archiveKey, JSON.stringify(savedSessions));
  }, [savedSessions, archiveKey]);

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = autoDetectLang ? navigator.language : (detectedLang === 'FR' ? 'fr-FR' : 'en-US');

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        
        const currentTranscript = finalTranscript || interimTranscript;
        if (currentTranscript.trim()) {
          setInput(currentTranscript);
        }

        const sendCommands = ["envoyer", "send", "enviar", "ارسل", "terminé", "done", "okay", "ok", "c'est tout", "confirmer"];
        if (sendCommands.some(cmd => currentTranscript.toLowerCase().endsWith(cmd)) && event.results[event.results.length-1].isFinal) {
          const cleanText = currentTranscript.replace(new RegExp(sendCommands.join('|'), 'gi'), '').trim();
          if (cleanText) {
             setCommandRecognized(true);
             setTimeout(() => setCommandRecognized(false), 1500);
             handleSend(cleanText, true);
          }
        }
      };

      recognitionRef.current.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e.error);
        if (e.error !== 'no-speech') setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        // Redémarrage automatique si le mode conversation est actif et que JOSÉ ne parle pas
        if (isConversational && isSpeaking === null && !isLoading) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.warn("Recognition restart failed (already running?)");
          }
        } else {
          setIsRecording(false);
        }
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [detectedLang, autoDetectLang, isConversational, isSpeaking, isLoading]);

  const toggleConversationalMode = () => {
    const nextState = !isConversational;
    setIsConversational(nextState);
    if (nextState) {
      setAutoSpeak(true);
      startRecording();
    } else {
      stopRecording();
      stopAllAudio();
      setIsSpeaking(null);
    }
  };

  const startRecording = () => {
    if (isRecording) return;
    stopAllAudio();
    setIsSpeaking(null);
    setInput('');
    setIsRecording(true);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn("Recognition already active");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
  };

  const handleTestVoice = async () => {
    if (isTestingVoice) return;
    setIsTestingVoice(true);
    stopAllAudio();
    try {
      const testText = detectedLang === 'FR' ? "Bonjour, voici ma nouvelle voix de Coach JOSÉ." : "Hello, this is my new Coach JOSÉ voice.";
      const base64Audio = await textToSpeech(testText, selectedVoice);
      if (base64Audio) {
        const source = await playPcmAudio(base64Audio);
        if (source) source.onended = () => setIsTestingVoice(false);
        else setIsTestingVoice(false);
      } else setIsTestingVoice(false);
    } catch (err) { setIsTestingVoice(false); }
  };

  const handleSaveSession = () => {
    if (messages.length <= 1) return;
    const firstUserMessage = messages.find(m => m.role === 'user')?.text || "Nouvelle Session";
    const title = firstUserMessage.length > 40 ? firstUserMessage.substring(0, 40) + "..." : firstUserMessage;
    
    const newArchive: SavedSession = {
      id: Date.now().toString(),
      title,
      timestamp: Date.now(),
      messages: [...messages]
    };

    setSavedSessions(prev => [newArchive, ...prev]);
    alert("Session archivée avec succès !");
  };

  const handleDeleteArchive = (id: string) => {
    if (confirm("Supprimer cette archive ?")) {
      setSavedSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const loadArchivedSession = (session: SavedSession) => {
    if (confirm("Charger cette session ?")) {
      setMessages(session.messages);
      setShowArchive(false);
      stopAllAudio();
      setIsSpeaking(null);
    }
  };

  const handleExport = (format: 'txt' | 'json', sessionData?: ChatMessage[]) => {
    const dataToExport = sessionData || messages;
    let blob: Blob;
    let filename: string;

    if (format === 'json') {
      const content = JSON.stringify({ distributor: currentId, exportDate: new Date().toLocaleString(), session: dataToExport }, null, 2);
      blob = new Blob([content], { type: 'application/json' });
      filename = `CoachJOSE_Session_${Date.now()}.json`;
    } else {
      const content = dataToExport.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.role === 'user' ? 'VOUS' : 'COACH JOSÉ'}:\n${m.text}\n\n`).join('');
      blob = new Blob([content], { type: 'text/plain' });
      filename = `CoachJOSE_Transcript_${Date.now()}.txt`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (confirm("Effacer l'historique ?")) {
      setMessages([{ role: 'model', text: `Conversation effacée. Je vous écoute.`, timestamp: Date.now() }]);
      localStorage.removeItem(storageKey);
      stopAllAudio();
      setIsSpeaking(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const handleSpeak = async (text: string, index: number) => {
    if (isSpeaking === index) {
      stopAllAudio();
      setIsSpeaking(null);
      if (isConversational) startRecording();
      return;
    }

    // Toujours arrêter l'écoute quand JOSÉ commence à parler
    stopRecording();
    
    setIsSpeaking(index);

    try {
      let base64Audio = messages[index]?.audio;
      if (!base64Audio) {
        base64Audio = await textToSpeech(text, selectedVoice);
        if (base64Audio) {
           setMessages(prev => {
             const updated = [...prev];
             if (updated[index]) updated[index].audio = base64Audio;
             return updated;
           });
        }
      }

      if (base64Audio) {
        const source = await playPcmAudio(base64Audio);
        if (source) {
          source.onended = () => {
            setIsSpeaking(null);
            // Redémarrage automatique de l'écoute après la fin de la parole en mode conversation
            if (isConversational) {
              startRecording();
            }
          };
        } else {
          setIsSpeaking(null);
          if (isConversational) startRecording();
        }
      } else {
        setIsSpeaking(null);
        if (isConversational) startRecording();
      }
    } catch (err) { 
      setIsSpeaking(null); 
      if (isConversational) startRecording();
    }
  };

  const processFile = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({ data: (reader.result as string).split(',')[1], type: file.type || 'application/octet-stream', name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (overrideInput?: string, fromVoice: boolean = false) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && !attachedFile) || isLoading) return;
    
    // Stop recording when sending
    stopRecording();

    const userText = textToSend || (attachedFile ? `Analyse du document : ${attachedFile.name}` : "");
    const userMessage: ChatMessage = { role: 'user', text: userText, timestamp: Date.now() };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = "";
      const currentInstruction = SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner);

      if (attachedFile) {
        responseText = await analyzeMedicalDocument(userText, attachedFile.data, attachedFile.type, currentInstruction);
      } else {
        const ai = getAI();
        const chat = ai.chats.create({
          model: MODELS.TEXT_COMPLEX,
          config: {
            systemInstruction: currentInstruction + `\nLANGUE UTILISATEUR DÉTECTÉE: ${detectedLang}. Répondez avec précision.`,
            thinkingConfig: thinkingMode ? { thinkingBudget: 32768 } : undefined
          }
        });
        const response = await chat.sendMessage({ message: userText });
        responseText = response.text || "Erreur de génération.";
      }

      const responseMessage: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => {
        const newMsgs = [...prev, responseMessage];
        // Lecture automatique de la réponse
        if (autoSpeak || fromVoice || isConversational) {
          setTimeout(() => handleSpeak(responseText, newMsgs.length - 1), 300);
        } else if (isConversational) {
          // Si autoSpeak est off mais conversation on, on redémarre juste le mic
          startRecording();
        }
        return newMsgs;
      });
      setAttachedFile(null);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Erreur système. Réessayez.", timestamp: Date.now() }]);
      if (isConversational) startRecording();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processFile(f); }}
      className={`relative max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col rounded-[2.5rem] shadow-2xl border overflow-hidden transition-all duration-700 ${isOwner ? 'bg-slate-900 border-amber-500/20 shadow-amber-500/5' : isConversational ? 'bg-blue-50/30 border-blue-400 shadow-blue-500/10' : 'glass-effect border-slate-200'}`}
    >
      {/* Magnetic Pulse Overlay for Conversational Mode */}
      {isConversational && (
        <div className="absolute inset-0 pointer-events-none border-4 border-blue-500/20 rounded-[2.5rem] animate-pulse"></div>
      )}

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-600/10 backdrop-blur-sm border-4 border-dashed border-blue-600 rounded-[2.5rem] flex flex-col items-center justify-center transition-all animate-in fade-in duration-300">
          <UploadCloud size={64} className="text-blue-600 animate-bounce mb-4" />
          <p className="text-2xl font-black text-blue-700">Déposez votre document ici</p>
        </div>
      )}

      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between z-10 ${isOwner ? 'bg-slate-800' : 'bg-white/70 backdrop-blur-md'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl relative transition-all duration-500 shadow-inner ${isSpeaking !== null ? 'bg-blue-600 scale-105 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : isOwner ? 'bg-amber-500 rotate-3 hover:rotate-0' : isConversational ? 'bg-blue-700 animate-pulse' : 'bg-slate-900'}`}>
            J
            {(isSpeaking !== null || isRecording) && (
                <div className={`absolute -inset-2 rounded-2xl border-2 ${isRecording ? (commandRecognized ? 'border-green-500' : 'border-red-400') : 'border-blue-400'} animate-ping opacity-20`}></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-black text-sm tracking-tight ${isOwner ? 'text-amber-500' : 'text-slate-900'}`}>COACH JOSÉ</p>
              {isConversational && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-tighter border border-blue-200">
                  <Radio size={10} className="animate-pulse" /> MAINS LIBRES
                </div>
              )}
            </div>
            <p className={`text-[10px] font-bold flex items-center gap-1.5 ${isRecording ? (commandRecognized ? 'text-green-500' : 'text-red-500') : isSpeaking !== null ? 'text-blue-500' : 'text-green-600'}`}>
              <span className={`w-2 h-2 rounded-full ${isRecording ? (commandRecognized ? 'bg-green-500' : 'bg-red-500 animate-pulse') : isSpeaking !== null ? 'bg-blue-500 animate-bounce' : 'bg-green-500 animate-pulse'}`}></span> 
              {isRecording ? (commandRecognized ? 'COMMANDE REÇUE !' : 'À VOTRE ÉCOUTE...') : isSpeaking !== null ? 'COACH JOSÉ PARLE...' : 'SYSTÈME OPÉRATIONNEL'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setShowArchive(!showArchive)} className={`p-2.5 rounded-xl transition-all ${showArchive ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:text-blue-600'}`} title="Archives des Sessions">
             <History size={20} />
           </button>
           <button 
              onClick={toggleConversationalMode} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md active:scale-95 ${isConversational ? 'bg-blue-600 text-white animate-pulse shadow-blue-200 border-2 border-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              title="Activer le mode mains-libres"
            >
             <Headset size={16} /> 
             <span className="hidden sm:inline">{isConversational ? 'Quitter Mode Voix' : 'Mode Conversation'}</span>
           </button>
           <button onClick={() => setShowVoiceSettings(!showVoiceSettings)} className={`p-2.5 rounded-xl transition-all ${showVoiceSettings ? 'bg-blue-100 text-blue-600 shadow-inner' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:shadow-sm'}`}>
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Archives Panel */}
      {showArchive && (
        <div className="absolute inset-x-0 top-[81px] bottom-0 z-30 bg-slate-900/95 backdrop-blur-xl animate-in slide-in-from-top-4 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-3"><History className="text-blue-500" /> Archives des Sessions</h3>
            <button onClick={() => setShowArchive(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"><X size={24} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {savedSessions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <Bookmark size={48} className="opacity-20" />
                <p className="font-bold">Aucune session archivée.</p>
              </div>
            ) : (
              savedSessions.map((session) => (
                <div key={session.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center justify-between group hover:border-blue-500 transition-all">
                  <div className="flex-1 cursor-pointer" onClick={() => loadArchivedSession(session)}>
                    <p className="text-white font-bold mb-1 group-hover:text-blue-400 transition-colors">{session.title}</p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(session.timestamp).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><MessageSquareText size={12} /> {session.messages.length} messages</span>
                      {session.messages.some(m => m.audio) && <span className="flex items-center gap-1 text-blue-500"><Music size={12} /> Audio Inclus</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleExport('json', session.messages)} className="p-3 bg-slate-700 text-slate-300 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><Download size={18} /></button>
                    <button onClick={() => handleDeleteArchive(session.id)} className="p-3 bg-slate-700 text-slate-300 hover:bg-red-600 hover:text-white rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showVoiceSettings && (
        <div className="bg-white/80 backdrop-blur-xl p-8 border-b border-blue-100 animate-in slide-in-from-top-4 duration-500 z-10 shadow-2xl">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                 <Languages size={14} className="text-blue-600" /> Langue
               </p>
               <button onClick={() => setAutoDetectLang(!autoDetectLang)} className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black border transition-all ${autoDetectLang ? 'bg-blue-600 text-white border-blue-700 shadow-lg' : 'bg-white text-slate-500 border-slate-200'}`}>
                 {autoDetectLang ? 'Auto-Détection ON' : 'Mode Manuel'}
               </button>
             </div>
             <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                 <Speaker size={14} className="text-blue-600" /> Voix
               </p>
               <div className="flex items-center gap-3">
                 <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="flex-1 pl-5 pr-12 py-3.5 rounded-2xl text-[10px] font-black bg-white border border-slate-200 text-slate-800 outline-none appearance-none cursor-pointer">
                   {VOICES.map(voice => <option key={voice.id} value={voice.id}>{voice.name}</option>)}
                 </select>
                 <button onClick={handleTestVoice} disabled={isTestingVoice} className={`p-3.5 rounded-2xl transition-all shadow-md ${isTestingVoice ? 'bg-blue-100 text-blue-500 animate-pulse' : 'bg-white border border-slate-200 text-blue-600 hover:bg-blue-50'}`}>
                   {isTestingVoice ? <Loader2 size={20} className="animate-spin" /> : <PlayCircle size={20} />}
                 </button>
               </div>
             </div>
             <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                 <Save size={14} className="text-blue-600" /> Exportation
               </p>
               <div className="flex gap-2">
                 <button onClick={() => handleExport('txt')} className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Texte</button>
                 <button onClick={() => handleExport('json')} className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Données</button>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 custom-scrollbar bg-slate-50/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] relative group rounded-[2.5rem] p-8 shadow-md transition-all duration-300 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200' 
                : isOwner ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
            } ${isSpeaking === idx ? 'ring-8 ring-blue-500/10 scale-[1.03] shadow-2xl z-[5]' : ''}`}>
              
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown className={msg.role === 'user' ? 'text-white' : ''}>{msg.text}</ReactMarkdown>
              </div>

              {msg.role === 'model' && (
                <div className={`mt-6 pt-6 border-t flex items-center justify-between ${isOwner ? 'border-slate-800' : 'border-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleSpeak(msg.text, idx)}
                      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm ${
                        isSpeaking === idx ? 'bg-red-500 text-white animate-pulse shadow-red-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {isSpeaking === idx ? <Square size={12} fill="currentColor" /> : <Volume2 size={12} />}
                      {isSpeaking === idx ? 'Arrêter la lecture' : 'Écouter'}
                    </button>
                    {msg.audio && (
                      <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2.5 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1.5 border border-blue-100">
                        <Bookmark size={10} /> Voix Archivée
                      </span>
                    )}
                  </div>
                  {isSpeaking === idx && (
                    <div className="flex gap-1.5 items-center h-6 pr-4">
                      {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="w-1.5 bg-blue-500 rounded-full animate-wave-fast" style={{height: `${40 + Math.random() * 60}%`, animationDelay: `${i*0.06}s`}}></div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex items-center gap-6 border-l-8 border-l-blue-600">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest block">Coach JOSÉ élabore votre stratégie...</span>
                <span className="text-[9px] text-slate-400 italic">Analyse cellulaire & business en cours</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className={`p-8 border-t transition-all ${isOwner ? 'bg-slate-800 border-slate-700' : isConversational ? 'bg-blue-100/40 border-blue-200' : 'bg-white border-slate-50'}`}>
        {isRecording && (
          <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-6">
             <div className="flex gap-2.5 items-center h-16 mb-4">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <div key={i} className={`w-1.5 rounded-full animate-wave-fast transition-all duration-300 ${commandRecognized ? 'bg-green-500 scale-y-110' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} style={{ height: `${25 + Math.random() * 75}%`, animationDelay: `${i * 0.05}s` }}></div>)}
             </div>
             <div className="flex items-center gap-3">
               <Radio size={14} className="text-blue-600 animate-pulse" />
               <p className={`text-[11px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${commandRecognized ? 'text-green-600' : 'text-blue-700'}`}>
                  {commandRecognized ? 'COMMANDE REÇUE' : 'JOSÉ VOUS ÉCOUTE...'}
               </p>
             </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <button onClick={() => fileInputRef.current?.click()} className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[1.5rem] transition-all bg-slate-50 border border-slate-100 shadow-sm" title="Ajouter un document">
                <Paperclip size={24} />
              </button>
              <button 
                onClick={toggleRecording} 
                className={`p-4 rounded-[1.5rem] transition-all shadow-lg active:scale-95 border ${isRecording ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-white text-slate-400 border-slate-100 hover:text-blue-600 hover:border-blue-200'}`}
                title={isRecording ? "Arrêter l'écoute" : "Démarrer l'écoute"}
              >
                {isRecording ? <Mic size={26} /> : <MicOff size={26} />}
              </button>
              <button onClick={handleSaveSession} className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-[1.5rem] transition-all bg-slate-50 border border-slate-100 shadow-sm" title="Archiver la session actuelle">
                <Save size={24} />
              </button>
            </div>

            <input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) processFile(f); }} className="hidden" accept="image/*,.pdf,.docx,.txt" />
            
            <div className="relative flex-1 group">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                placeholder={isRecording ? "Dites quelque chose ou écrivez..." : "Posez une question à JOSÉ..."} 
                className={`w-full px-8 py-5 rounded-[1.5rem] focus:outline-none text-sm font-semibold transition-all border shadow-inner ${isOwner ? 'bg-slate-900 border-slate-700 text-white focus:border-amber-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white'} ${isRecording ? 'border-blue-400 ring-4 ring-blue-500/10' : ''}`} 
              />
              {attachedFile && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black animate-in zoom-in shadow-lg">
                  <FileText size={14} /><span className="max-w-[100px] truncate">{attachedFile.name}</span><button onClick={() => setAttachedFile(null)} className="hover:text-red-200 ml-1"><X size={14}/></button>
                </div>
              )}
            </div>

            <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !attachedFile)} className={`p-5 rounded-[1.5rem] text-white shadow-2xl active:scale-95 transition-all group ${isOwner ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'} disabled:bg-slate-300 disabled:shadow-none`}>
              <Send size={26} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>

          {!isConversational && !isRecording && (
              <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
                {SUGGESTED_PROMPTS.map((item, idx) => (
                  <button key={idx} onClick={() => handleSend(item.prompt)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border text-[11px] font-black whitespace-nowrap transition-all shadow-sm ${isOwner ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-md'}`}>
                    <span className="text-blue-500">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes wave-fast { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1.4); } }
        .animate-wave-fast { animation: wave-fast 0.5s ease-in-out infinite; transform-origin: center; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ChatBot;
