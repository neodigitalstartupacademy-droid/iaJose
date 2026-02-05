
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Activity, Brain, ShieldCheck, Stethoscope as MedIcon, ScrollText, Sparkles, Trash2, Volume2, Microscope, Info, Pill, FlaskConical, Search, FileSearch, Zap, Lightbulb, ArrowRight, Layers, Flame, HeartPulse, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, DistributorData, Language } from '../types';
import { getAI, analyzeMedicalDocument, textToSpeech } from '../services/geminiService';
import { playPcmAudio, stopAllAudio } from '../services/audioService';
import { MODELS, SYSTEM_INSTRUCTIONS, JOSE_ID, DEFAULT_NEOLIFE_LINK, VOICES } from '../constants';
import { translations } from '../translations';

interface ChatBotProps {
    distData: DistributorData | null;
    isOwner: boolean;
    initialIntent?: string | null;
    language: Language;
}

interface Attachment { data: string; mimeType: string; name: string; }

const MEDICAL_RESEARCH_CENTRES = [
  { id: 'cardio', label: 'Cardiologie', icon: <Activity size={16} />, prompt: "Analyse terrain Cardio-vasculaire.", scenarios: ["Post-AVC", "Hypertension"] },
  { id: 'endo', label: 'Endocrino', icon: <FlaskConical size={16} />, prompt: "Analyse terrain Métabolique.", scenarios: ["Thyroïde", "Diabète type 2"] },
  { id: 'gastro', label: 'Gastro', icon: <Pill size={16} />, prompt: "Analyse barrière intestinale.", scenarios: ["Microbiote", "Leaky Gut"] },
  { id: 'onco', label: 'Onco-Soutien', icon: <Microscope size={16} />, prompt: "Soutien terrain oncologie.", scenarios: ["Chimio-soutien"] }
];

const QUICK_TOPICS = [
  { label: "Relance Cellulaire", prompt: "Détaille-moi le protocole de Relance Cellulaire NeoLife (Tre-en-en)." },
  { label: "Analyse de Terrain", prompt: "Comment interpréter un bilan via la science SAB ?" },
  { label: "Arthrose / Os", prompt: "Quel est le protocole nutritionnel pour l'arthrose sévère ?" },
  { label: "Diabète Type 2", prompt: "Quelles sont les carences cumulées liées au Diabète ?" },
  { label: "Duplication NDSA", prompt: "Comment utiliser GMBC-OS pour ma duplication ?" }
];

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
  const [useThinking, setUseThinking] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [readingIdx, setReadingIdx] = useState<number | null>(null);
  const [showTools, setShowTools] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState<any | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, historyKey]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend && !attachment) return;
    
    stopAllAudio();
    setReadingIdx(null);
    setShowTools(false);
    
    const modelIdx = messages.length + 1;
    setMessages(prev => [...prev, { role: 'user', text: attachment ? `${textToSend} [Dossier: ${attachment.name}]` : textToSend, timestamp: Date.now() }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getAI();
      setMessages(prev => [...prev, { role: 'model', text: "", timestamp: Date.now() }]);
      let fullResponse = "";
      const sysInst = SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner, language, branding);

      if (attachment) {
        const res = await analyzeMedicalDocument(textToSend || "Analyser ce document", attachment.data, attachment.mimeType, sysInst);
        setMessages(prev => { const next = [...prev]; next[modelIdx].text = res; return next; });
        setAttachment(null);
      } else {
        const chat = ai.chats.create({ 
          model: useThinking ? MODELS.TEXT_COMPLEX : MODELS.TEXT_FAST, 
          config: { 
            systemInstruction: sysInst, 
            maxOutputTokens: 30000, 
            tools: [{ googleSearch: {} }],
            thinkingConfig: useThinking ? { thinkingBudget: 24000 } : undefined
          } 
        });
        const result = await chat.sendMessageStream({ message: textToSend });
        for await (const chunk of result) {
          fullResponse += chunk.text || "";
          setMessages(prev => { const next = [...prev]; next[modelIdx].text = fullResponse; return next; });
        }
      }
    } catch (err) {
      setMessages(prev => { const next = [...prev]; if (next[modelIdx]) next[modelIdx].text = "Lien interrompu."; return next; });
    } finally { setIsLoading(false); }
  };

  const handleVoiceRead = async (text: string, index: number) => {
    if (readingIdx === index) { stopAllAudio(); setReadingIdx(null); return; }
    stopAllAudio();
    setReadingIdx(index);
    try {
      const cleanText = text.replace(/[*#_~]/g, '').slice(0, 1000);
      const base64Audio = await textToSpeech(cleanText, VOICES[0].id);
      if (base64Audio) await playPcmAudio(base64Audio);
    } catch (err) { setReadingIdx(null); }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafd] dark:bg-[#0f1115] relative transition-colors duration-500 font-inter">
      
      {/* 📖 CLEAN READING AREA (Gemini Style) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-16 pb-60 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={`w-full mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
              {msg.role === 'user' ? (
                <div className="flex justify-end mb-4">
                  <div className="max-w-[80%] bg-slate-200/40 dark:bg-slate-800/40 px-6 py-3 rounded-3xl text-[13px] font-bold text-slate-600 dark:text-slate-400">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-center gap-4 mb-8 opacity-60 group">
                    <div className="w-9 h-9 synergy-bg rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">{brandName[0]}</div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">{brandName} NEXUS</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SAB Science Agent v4.5</span>
                    </div>
                    <button onClick={() => handleVoiceRead(msg.text, idx)} className={`ml-auto p-2 transition-all hover:scale-125 ${readingIdx === idx ? 'text-blue-600 animate-pulse' : 'text-slate-400 hover:text-blue-600'}`}>
                        <Volume2 size={18} />
                    </button>
                  </div>
                  
                  <div className="prose prose-xl md:prose-2xl dark:prose-invert max-w-none prose-slate prose-headings:font-black prose-p:leading-[1.8] prose-p:mb-8 prose-strong:text-blue-600 prose-li:my-4">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-6 py-12 animate-pulse">
               <div className="w-12 h-12 synergy-bg rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12"><Sparkles size={24} /></div>
               <div className="space-y-2">
                 <p className="text-[12px] font-black uppercase tracking-[0.6em] text-blue-600/60 italic">Architecte Nexus en réflexion...</p>
                 <div className="h-1 w-48 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full synergy-bg w-1/2 animate-[progress_2s_infinite]"></div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* 🕹️ FLOATING ROUNDED INPUT & QUICK SUBJECTS (Gemini Style) */}
      <div className="fixed bottom-0 left-0 w-full px-6 md:px-10 pb-8 pt-4 bg-gradient-to-t from-[#f8fafd] via-[#f8fafd]/90 to-transparent dark:from-[#0f1115] dark:via-[#0f1115]/90 z-40 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          
          {/* 🎯 ALIGNED QUICK SUBJECTS (Docked to Input) */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto custom-scrollbar no-scrollbar pb-2">
              {QUICK_TOPICS.map((topic, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(topic.prompt)}
                    className="whitespace-nowrap px-5 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-100 dark:border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                  >
                      {topic.label}
                  </button>
              ))}
          </div>

          {/* Contextual Specialty Tool (Above input if active) */}
          {showTools && (
            <div className="mb-4 bg-white/95 dark:bg-[#1e1f24]/95 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.25)] border border-slate-100 dark:border-white/5 animate-in slide-in-from-bottom-6 duration-300 grid grid-cols-2 md:grid-cols-4 gap-3">
                {MEDICAL_RESEARCH_CENTRES.map(m => (
                  <button key={m.id} onClick={() => { setActiveSpecialty(m); handleSend(m.prompt); }} className="flex flex-col items-center gap-2 p-4 rounded-3xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all group">
                    <div className="w-10 h-10 synergy-bg text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">{m.icon}</div>
                    <span className="text-[8px] font-black uppercase text-slate-500">{m.label}</span>
                  </button>
                ))}
                <button onClick={() => setUseThinking(!useThinking)} className={`flex flex-col items-center gap-2 p-4 rounded-3xl transition-all ${useThinking ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-500'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${useThinking ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}><Brain size={20} /></div>
                    <span className="text-[8px] font-black uppercase">Deep Think</span>
                </button>
                <button onClick={() => setMessages([{ role: 'model', text: t.welcome.replace('Coach JOSÉ', brandName), timestamp: Date.now() }])} className="flex flex-col items-center gap-2 p-4 rounded-3xl hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-500 group">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center group-hover:text-red-500 transition-all"><Trash2 size={20} /></div>
                    <span className="text-[8px] font-black uppercase">Reset</span>
                </button>
            </div>
          )}

          {/* Pill-Shaped Rounded Input */}
          <div className={`relative flex items-center bg-white dark:bg-[#1e1f24] rounded-[3.5rem] px-8 py-3 shadow-[0_25px_70px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-white/5 transition-all focus-within:scale-[1.01] focus-within:shadow-[0_30px_90px_rgba(0,0,0,0.15)]`}>
            
            <button 
                onClick={() => setShowTools(!showTools)} 
                className={`p-3 mr-1 rounded-full transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${showTools ? 'rotate-45 text-blue-600' : 'text-slate-400'}`}
            >
                <Plus size={26} />
            </button>

            <button 
                onClick={() => fileInputRef.current?.click()} 
                className={`p-3 mr-3 rounded-full transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${attachment ? 'text-blue-600' : 'text-slate-400'}`}
            >
                <Paperclip size={26} />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={activeSpecialty ? `Mode Expertise ${activeSpecialty.label} actif...` : "Demander au Coach José..."}
              rows={1}
              className="flex-1 bg-transparent py-4 text-xl font-medium text-slate-800 dark:text-white outline-none resize-none placeholder:text-slate-200 min-h-[60px] max-h-60 custom-scrollbar"
              onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
            />
            
            <button 
                onClick={() => handleSend()} 
                disabled={isLoading || (!input.trim() && !attachment)} 
                className="ml-4 p-4 synergy-bg text-white rounded-full shadow-xl hover:scale-110 active:scale-90 transition-all disabled:opacity-20 disabled:scale-100"
            >
                <Send size={26} />
            </button>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload=(ev)=>setAttachment({data:(ev.target?.result as string).split(',')[1], mimeType:f.type, name:f.name}); r.readAsDataURL(f); } }} />

      {/* Specialty/Attachment Badges (Top) */}
      {(activeSpecialty || attachment) && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col md:flex-row gap-3 z-50">
             {activeSpecialty && (
                <div className="bg-slate-900 text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl border border-white/10 animate-in slide-in-from-top-8">
                   <MedIcon size={16} className="text-blue-500" /> {activeSpecialty.label} <X size={16} className="ml-4 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setActiveSpecialty(null)} />
                </div>
             )}
             {attachment && (
                <div className="bg-blue-600 text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl border border-white/10 animate-in slide-in-from-top-8">
                   <FileSearch size={16} /> {attachment.name.slice(0, 15)}... <X size={16} className="ml-4 cursor-pointer hover:text-slate-300 transition-colors" onClick={() => setAttachment(null)} />
                </div>
             )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
