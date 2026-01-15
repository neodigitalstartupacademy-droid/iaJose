
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Info, ExternalLink, Paperclip, X, FileText, Image as ImageIcon, Volume2, Loader2, Square, Play, Settings2, Mic, MicOff, Trash2, RotateCcw, History, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DistributorData } from '../types';
import { getAI, analyzeMedicalDocument, textToSpeech } from '../services/geminiService';
import { playPcmAudio, stopAllAudio } from '../services/audioService';
import { MODELS, SYSTEM_INSTRUCTIONS, JOSE_ID, DEFAULT_NEOLIFE_LINK, VOICES } from '../constants';

interface ChatBotProps {
    distData: DistributorData | null;
    isOwner: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ distData, isOwner }) => {
  const currentId = distData?.id || JOSE_ID;
  const currentShop = distData?.shopUrl || DEFAULT_NEOLIFE_LINK;
  const storageKey = `jose_chat_history_${currentId}`;

  const [historyRestored, setHistoryRestored] = useState(false);

  // Initialize messages from localStorage or default
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
    return [
      { 
        role: 'model', 
        text: `Bonjour, je suis Coach JOSÉ.\n\nJe suis l'assistant intelligent de **GMBC-OS** pour le partenaire NeoLife ID: ${currentId}.\n\nDites-moi : **qu'est-ce qui vous amène aujourd'hui ?**\n\n1. Cherchez-vous à améliorer votre **Santé** et votre vitalité ?\n2. Ou êtes-vous à la recherche d'une **Opportunité** capable de vous mener à la liberté financière ?`, 
        timestamp: Date.now() 
      }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ data: string, type: string, name: string } | null>(null);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const [thinkingMode, setThinkingMode] = useState(true);

  // Show "History Restored" indicator on load if history exists
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && JSON.parse(saved).length > 1) {
      setHistoryRestored(true);
      setTimeout(() => setHistoryRestored(false), 5000);
    }
  }, [storageKey]);

  // Auto-save history when messages change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, storageKey]);

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
        
        if (event.results[0].isFinal) {
          setIsRecording(false);
          setTimeout(() => handleSend(transcript, true), 500);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleExport = () => {
    const sessionContent = messages.map(m => {
      const time = new Date(m.timestamp).toLocaleString();
      return `[${time}] ${m.role === 'user' ? 'VOUS' : 'COACH JOSÉ'}:\n${m.text}\n\n${'-'.repeat(40)}\n\n`;
    }).join('');

    const blob = new Blob([sessionContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Session_Coach_JOSE_${currentId}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (confirm("Voulez-vous vraiment effacer l'historique de votre conversation avec Coach JOSÉ ?")) {
      const defaultMsg: ChatMessage[] = [
        { 
          role: 'model', 
          text: `Historique effacé. Je suis prêt à démarrer une nouvelle session.\n\nComment puis-je vous aider aujourd'hui ?`, 
          timestamp: Date.now() 
        }
      ];
      setMessages(defaultMsg);
      localStorage.removeItem(storageKey);
      stopAllAudio();
      setIsSpeaking(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      stopAllAudio();
      setIsSpeaking(null);
      setInput('');
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachedFile({
          data: base64String,
          type: file.type || 'application/octet-stream',
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeak = async (text: string, index: number) => {
    if (isSpeaking === index) {
      stopAllAudio();
      setIsSpeaking(null);
      return;
    }

    setIsSpeaking(index);
    try {
      const base64Audio = await textToSpeech(text, selectedVoice);
      if (base64Audio) {
        const source = await playPcmAudio(base64Audio);
        if (source) {
          source.onended = () => setIsSpeaking(null);
        } else {
          setIsSpeaking(null);
        }
      } else {
        setIsSpeaking(null);
      }
    } catch (err) {
      console.error(err);
      setIsSpeaking(null);
    }
  };

  const handleSend = async (overrideInput?: string, fromVoice: boolean = false) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && !attachedFile) || isLoading) return;

    const userText = textToSend || (attachedFile ? `Analyse de ce document : ${attachedFile.name}` : "");
    const userMessage: ChatMessage = { role: 'user', text: userText, timestamp: Date.now() };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setAutoPlayNext(fromVoice);

    try {
      let responseText = "";
      const currentInstruction = SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner);

      if (attachedFile) {
        responseText = await analyzeMedicalDocument(userText, attachedFile.data, attachedFile.type);
      } else {
        const ai = getAI();
        const chat = ai.chats.create({
          model: MODELS.TEXT_COMPLEX,
          config: {
            systemInstruction: currentInstruction,
            thinkingConfig: thinkingMode ? { thinkingBudget: 32768 } : undefined
          }
        });
        const response = await chat.sendMessage({ message: userText });
        responseText = response.text || "Désolé, je n'ai pas pu générer de réponse.";
      }

      const responseMessage: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => {
        const newMsgs = [...prev, responseMessage];
        if (fromVoice || autoPlayNext) {
          handleSpeak(responseText, newMsgs.length - 1);
        }
        return newMsgs;
      });
      setAttachedFile(null);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Erreur lors du traitement. Vérifiez votre document.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col rounded-3xl shadow-xl border overflow-hidden ${isOwner ? 'bg-slate-900 border-amber-500/20' : 'glass-effect border-slate-200'}`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isOwner ? 'bg-slate-800' : 'bg-white/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative transition-all duration-500 ${isSpeaking !== null ? 'bg-blue-500 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : isOwner ? 'bg-amber-500' : 'bg-blue-600'}`}>
            J
            {isSpeaking !== null && (
                <div className="absolute -inset-1 rounded-full border-2 border-blue-400 animate-ping opacity-25"></div>
            )}
          </div>
          <div>
            <p className={`font-bold text-sm ${isOwner ? 'text-amber-500' : 'text-slate-900'}`}>Coach JOSÉ <span className="text-[10px] font-normal opacity-70 ml-1">Chef de Mission</span></p>
            <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 bg-green-500 rounded-full ${isRecording ? 'animate-ping' : 'animate-pulse'}`}></span> {isRecording ? 'JOSÉ VOUS ÉCOUTE...' : 'SYSTÈME ACTIF'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {historyRestored && (
             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 animate-in fade-in slide-in-from-right-2">
                <History size={12} /> SESSION RESTAURÉE
             </div>
           )}
           <button 
             onClick={handleExport}
             className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100"
             title="Exporter la session (Texte)"
           >
             <Download size={18} />
           </button>
           <button 
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`p-2 rounded-lg transition-colors ${showVoiceSettings ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
            title="Paramètres"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      {/* Voice Settings Dropdown */}
      {showVoiceSettings && (
        <div className="bg-blue-50 p-4 border-b border-blue-100 animate-in slide-in-from-top-2 duration-200">
           <div className="flex items-center justify-between mb-3">
             <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Configuration du Coach</p>
             <button onClick={() => setThinkingMode(!thinkingMode)} className={`text-[9px] font-bold px-2 py-1 rounded border ${thinkingMode ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-400 border-slate-200'}`}>
               Réflexion Approfondie {thinkingMode ? 'ON' : 'OFF'}
             </button>
           </div>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
             {VOICES.map(voice => (
               <button
                 key={voice.id}
                 onClick={() => setSelectedVoice(voice.id)}
                 className={`p-3 rounded-xl border text-left transition-all ${selectedVoice === voice.id ? 'bg-white border-blue-300 shadow-sm' : 'border-transparent hover:bg-white/50 text-slate-500'}`}
               >
                 <p className={`text-xs font-bold ${selectedVoice === voice.id ? 'text-blue-600' : ''}`}>{voice.name}</p>
                 <p className="text-[9px] opacity-60 leading-tight">{voice.description}</p>
               </button>
             ))}
           </div>
           <div className="mt-4 flex justify-between items-center">
              <button 
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-[10px] font-bold uppercase transition-all"
              >
                <Download size={12} /> Sauvegarder la session
              </button>
              <button 
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-[10px] font-bold uppercase transition-all"
              >
                <Trash2 size={12} /> Réinitialiser la conversation
              </button>
           </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 custom-scrollbar bg-slate-50/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] relative group rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : isOwner ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
            }`}>
              
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown className={msg.role === 'user' ? 'text-white' : ''}>{msg.text}</ReactMarkdown>
              </div>

              {msg.role === 'model' && (
                <div className={`mt-4 pt-3 border-t flex items-center gap-3 ${isOwner ? 'border-slate-700' : 'border-slate-100'}`}>
                  <button 
                    onClick={() => handleSpeak(msg.text, idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                      isSpeaking === idx 
                        ? 'bg-red-500 text-white shadow-lg scale-105' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    {isSpeaking === idx ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                    {isSpeaking === idx ? 'Arrêter' : 'Écouter JOSÉ'}
                  </button>
                </div>
              )}

              <div className={`text-[9px] mt-2 opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-300"></span>
              <span className="text-[10px] text-slate-400 ml-2 font-medium">JOSÉ élabore une stratégie...</span>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 border-t ${isOwner ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <div className="flex items-center">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="Document">
              <Paperclip size={20} />
            </button>
            <button 
              onClick={toggleRecording} 
              className={`p-2 transition-all ${isRecording ? 'text-red-500 scale-125' : 'text-slate-400 hover:text-blue-600'}`}
              title="Micro"
            >
              {isRecording ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.docx,.txt" />
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Transcription..." : "Posez une question à JOSÉ..."}
              className={`w-full px-4 py-3 rounded-xl focus:outline-none text-sm border transition-all ${isOwner ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 focus:border-blue-300'}`}
            />
            {attachedFile && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-bold shadow-sm">
                <FileText size={12} className="text-blue-600" />
                <span className="max-w-[60px] truncate">{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="text-red-500"><X size={10}/></button>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleSend()} 
            disabled={isLoading || (!input.trim() && !attachedFile)} 
            className={`p-3 rounded-xl text-white shadow-md active:scale-95 transition-all ${isOwner ? 'bg-amber-600' : 'bg-blue-600'} disabled:bg-slate-300 disabled:shadow-none`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
