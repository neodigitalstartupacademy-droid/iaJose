
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, FileText, Square, Paperclip, Play, Download, Link as LinkIcon, Sparkles, User, Zap, Mic, MicOff, Volume2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DistributorData } from '../types';
import { getAI, analyzeMedicalDocument, textToSpeech } from '../services/geminiService';
import { playPcmAudio, stopAllAudio } from '../services/audioService';
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

const ChatBot: React.FC<ChatBotProps> = ({ distData, isOwner, initialIntent }) => {
  const currentId = distData?.id || JOSE_ID;
  const currentShop = distData?.shopUrl || DEFAULT_NEOLIFE_LINK;
  const storageKey = `jose_chat_history_${currentId}`;
  const draftKey = `jose_chat_draft_${currentId}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    
    // Message de bienvenue adaptatif Social Sync
    const welcomeText = initialIntent === 'welcome' 
      ? `Bonjour ! Je suis **Coach JOSÉ**, l'assistant stratégique partenaire de l'ID **${currentId}**.\n\nComment puis-je vous orienter aujourd'hui ? Santé cellulaire ou opportunité de succès ?`
      : `Bonjour, je suis **Coach JOSÉ**. Votre système souverain de succès est prêt. Que voulez-vous closer aujourd'hui ?`;

    return [{ role: 'model', text: welcomeText, timestamp: Date.now() }];
  });
  
  const [input, setInput] = useState(() => localStorage.getItem(draftKey) || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activePlayback, setActivePlayback] = useState<{ index: number } | null>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
    localStorage.setItem(draftKey, input);
  }, [messages, input, storageKey, draftKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !attachment) return;
    
    const userMessage: ChatMessage = { 
      role: 'user', 
      text: attachment ? `${textToSend}\n\n📎 *Document : ${attachment.name}*` : textToSend, 
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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
        responseText = response.text || "Erreur de connexion.";
        sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((chunk: any) => chunk.web).map((chunk: any) => ({ title: chunk.web?.title, uri: chunk.web?.uri })) || [];
      }
      
      const newModelMsg: ChatMessage = { 
        role: 'model', 
        text: responseText, 
        timestamp: Date.now(), 
        sources: sources.length > 0 ? sources : undefined 
      };
      
      setMessages(prev => [...prev, newModelMsg]);
      handleAudioPlayback(messages.length + 1, responseText);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Le système souverain rencontre une instabilité réseau. Je reste concentré.", timestamp: Date.now() }]);
    } finally { setIsLoading(false); }
  };

  const handleAudioPlayback = async (idx: number, text: string) => {
    if (activePlayback?.index === idx) { stopAllAudio(); setActivePlayback(null); return; }
    stopAllAudio();
    const audio = await textToSpeech(text, VOICES[0].id);
    if (audio) {
      const source = await playPcmAudio(audio);
      if (source) {
        setActivePlayback({ index: idx });
        source.onended = () => setActivePlayback(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white max-w-full mx-auto relative overflow-hidden font-sans">
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-[20%] py-12 space-y-16">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-700`}>
            <div className={`max-w-full ${msg.role === 'user' ? 'max-w-[85%]' : 'w-full'}`}>
              
              <div className={`flex items-center gap-3 mb-6 text-[10px] font-black tracking-widest text-slate-300 uppercase ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Zap size={14} className="fill-blue-600" /> COACH JOSÉ SOUVERAIN
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    PARTENAIRE <User size={12} />
                  </div>
                )}
              </div>

              <div className={`transition-all ${msg.role === 'user' ? 'bg-slate-100 text-slate-800 rounded-[2.5rem] px-10 py-7 text-2xl font-medium' : 'text-slate-900'}`}>
                <div className={`prose prose-slate max-w-none ${msg.role === 'model' ? 'text-3xl md:text-[36px] leading-[1.4] font-normal tracking-tight' : 'text-2xl font-semibold opacity-80'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {msg.sources && (
                  <div className="mt-12 flex flex-wrap gap-4">
                    {msg.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-[10px] font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest">
                        <LinkIcon size={12} /> {s.title || 'Source'}
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-10 flex items-center gap-10">
                  <button onClick={() => handleAudioPlayback(idx, msg.text)} className="flex items-center gap-3 text-[11px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">
                    {activePlayback?.index === idx ? <Square size={16} fill="currentColor" /> : <Volume2 size={16} />}
                    {activePlayback?.index === idx ? 'Stop' : 'Re-Lire'}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(msg.text)} className="flex items-center gap-3 text-[11px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest">
                    <Download size={16} /> Copier
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col gap-8 py-10 animate-pulse">
            <div className="text-[11px] font-black tracking-[0.3em] text-blue-300 uppercase flex items-center gap-3">
               <Sparkles size={16} /> JOSÉ ÉLABORE LA STRATÉGIE...
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-slate-50 rounded-full w-full"></div>
              <div className="h-10 bg-slate-50 rounded-full w-4/5"></div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 md:px-[20%] pb-12 pt-6 bg-white border-t border-slate-50">
        
        {attachment && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <FileText className="text-blue-600" size={24} />
              <span className="text-sm font-black text-blue-900">{attachment.name}</span>
            </div>
            <button onClick={() => setAttachment(null)} className="p-2 bg-white text-red-500 rounded-xl shadow-sm"><X size={20} /></button>
          </div>
        )}

        <div className="relative flex items-end gap-3 bg-slate-100/60 border-2 border-slate-100 rounded-[3rem] p-4 focus-within:bg-white focus-within:border-blue-600 focus-within:shadow-2xl transition-all duration-300">
          <button onClick={() => fileInputRef.current?.click()} className="p-5 text-slate-400 hover:text-blue-600 transition-colors">
            <Paperclip size={32} />
            <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = (reader.result as string).split(',')[1];
                  setAttachment({ data: base64, mimeType: file.type, name: file.name });
                };
                reader.readAsDataURL(file);
              }
            }} />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Commandez votre IA..."
            rows={1}
            className="flex-1 bg-transparent py-5 text-2xl font-medium outline-none resize-none max-h-[40vh] placeholder:text-slate-300"
            style={{ height: 'auto' }}
            onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />

          <button onClick={toggleRecording} className={`p-5 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-blue-600'}`}>
            {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <button 
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && !attachment)}
            className="p-6 synergy-bg text-white rounded-full shadow-xl active:scale-90 transition-all disabled:opacity-20 flex items-center justify-center"
          >
            <Send size={32} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
