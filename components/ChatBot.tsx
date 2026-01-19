
import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Paperclip, X, Activity, Brain, ShieldCheck, Stethoscope as MedIcon, ScrollText, Target, Sparkles, Trash2, History, Volume2, ChevronDown, Microscope, Play, Info, Beaker, GraduationCap, Pill, Thermometer, FlaskConical, Search, FileSearch, ClipboardList, Zap, PlusCircle, LayoutGrid, HeartPulse } from 'lucide-react';
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

const WISDOM_QUOTES = [
  "La santé ne commence pas dans l'assiette, mais dans l'état intérieur.",
  "Nourrissez vos cellules, elles répareront votre vie.",
  "La Médecine du Futur est la nutrition cellulaire de précision.",
  "Le Smart Link est votre arme de duplication massive."
];

const CHRONIC_LIST = [
  { id: 'diabete', label: 'Diabète', icon: '🧬' },
  { id: 'cardio', label: 'Cardio', icon: '❤️' },
  { id: 'arthrose', label: 'Arthrose', icon: '🦴' },
  { id: 'chol', label: 'Lipides', icon: '🧪' },
  { id: 'immuno', label: 'Immunité', icon: '🛡️' }
];

const MEDICAL_RESEARCH_CENTRES = [
  { id: 'cardio', label: 'Cardiologie', icon: <Activity size={16} />, prompt: "Analyse terrain Cardio-vasculaire.", scenarios: ["Post-AVC", "Hypertension", "Cholestérol"] },
  { id: 'endo', label: 'Endocrino', icon: <FlaskConical size={16} />, prompt: "Analyse terrain Métabolique.", scenarios: ["Thyroïde", "Diabète type 2", "Cortisol"] },
  { id: 'gastro', label: 'Gastro', icon: <Pill size={16} />, prompt: "Analyse barrière intestinale.", scenarios: ["Microbiote", "Leaky Gut", "Reflux"] },
  { id: 'gyn', label: 'Gynéco', icon: <ShieldCheck size={16} />, prompt: "Analyse équilibre hormonal.", scenarios: ["Ménopause", "Fertilité", "Cycle"] },
  { id: 'onco', label: 'Onco-Soutien', icon: <Microscope size={16} />, prompt: "Soutien terrain oncologie.", scenarios: ["Chimio-soutien", "Relance Immunité"] }
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
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const [readingIdx, setReadingIdx] = useState<number | null>(null);
  const [showChronicMenu, setShowChronicMenu] = useState(false);
  const [showMedMenu, setShowMedMenu] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState<any | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setWisdomIdx(p => (p + 1) % WISDOM_QUOTES.length), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, historyKey]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend && !attachment) return;
    
    stopAllAudio();
    setReadingIdx(null);
    setShowChronicMenu(false);
    setShowMedMenu(false);
    
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
        const professionalPrompt = activeSpecialty 
            ? `ANALYSE NEXUS CLINIQUE (${activeSpecialty.label.toUpperCase()}) : ${textToSend || "Identifier les carences cellulaires prioritaires."}`
            : `ANALYSE TERRAIN SAB : ${textToSend || "Interprétation de rapport"}`;
            
        const res = await analyzeMedicalDocument(professionalPrompt, attachment.data, attachment.mimeType, sysInst);
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
      setMessages(prev => { const next = [...prev]; if (next[modelIdx]) next[modelIdx].text = "Lien interrompu. Reconnexion..."; return next; });
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleVoiceRead = async (text: string, index: number) => {
    if (readingIdx === index) { stopAllAudio(); setReadingIdx(null); return; }
    stopAllAudio();
    setReadingIdx(index);
    try {
      const cleanText = text.replace(/[*#_~]/g, '').slice(0, 1500);
      const base64Audio = await textToSpeech(cleanText, VOICES[0].id);
      if (base64Audio) await playPcmAudio(base64Audio);
    } catch (err) { setReadingIdx(null); }
  };

  const handleReset = () => {
    stopAllAudio();
    setMessages([{ role: 'model', text: t.welcome.replace('Coach JOSÉ', brandName), timestamp: Date.now() }]);
    localStorage.removeItem(historyKey);
    setActiveSpecialty(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 relative overflow-hidden transition-all duration-500 font-inter">
      
      {/* 🌟 Dynamic Wisdom Header - Slim & Discreet */}
      <div className="h-8 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 flex items-center justify-center px-4 overflow-hidden shrink-0">
         <div className="flex items-center gap-3 animate-in slide-in-from-right duration-[2500ms]" key={wisdomIdx}>
            <Sparkles size={8} className="text-blue-500 animate-pulse" />
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 italic tracking-[0.2em] uppercase">"{WISDOM_QUOTES[wisdomIdx]}"</p>
         </div>
      </div>

      {/* 📖 CENTRED READING AREA - Typography 20px (Optimized for Focus) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-[12%] lg:px-[22%] xl:px-[28%] py-16 space-y-24 bg-transparent scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-10 duration-1000`}>
            <div className={`w-full relative ${msg.role === 'user' ? 'max-w-[85%] ml-auto' : 'max-w-none'}`}>
              
              {msg.role === 'model' && (
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 dark:border-slate-900/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 synergy-bg rounded-lg flex items-center justify-center text-white font-black text-lg shadow-md">{brandName[0]}</div>
                    <div className="leading-tight">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">{brandName} NEXUS</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest italic tracking-tighter">Science Cellulaire SAB v4.5</p>
                    </div>
                  </div>
                  <button onClick={() => handleVoiceRead(msg.text, idx)} className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${readingIdx === idx ? 'bg-blue-600 text-white shadow-xl animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-600'}`}>
                    <Volume2 size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden md:block">{readingIdx === idx ? "SYNTHÈSE..." : "ÉCOUTER"}</span>
                  </button>
                </div>
              )}

              {/* PROFESSIONAL TYPOGRAPHY - 20px Base (prose-xl) */}
              <div className={`max-w-none ${msg.role === 'model' ? 'prose prose-xl md:prose-2xl dark:prose-invert prose-slate prose-headings:font-black prose-p:leading-[1.8] prose-li:my-4 prose-strong:text-blue-600' : 'bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-8 md:p-12 text-xl md:text-2xl font-bold shadow-2xl border border-slate-800 inline-block float-right transition-transform hover:scale-[1.01]'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <div className="clear-both"></div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-10 py-12 opacity-40 justify-center md:justify-start">
             <div className="relative">
                <div className="w-12 h-12 border border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <Brain className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={20} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-400 italic">Croisement des données Nexus...</p>
          </div>
        )}
      </div>

      {/* 🧭 CONTEXTUAL TRAY - Suggested scenarios */}
      {activeSpecialty && !isLoading && (
         <div className="px-6 md:px-[20%] py-4 flex flex-wrap gap-2 justify-center animate-in slide-in-from-bottom-6 z-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mr-2"><Search size={12}/> SCÉNARIOS CLINIQUES :</span>
            {activeSpecialty.scenarios.map((sc: string, i: number) => (
                <button key={i} onClick={() => handleSend(`Analyse de terrain pour le cas : ${sc}.`)} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    {sc}
                </button>
            ))}
         </div>
      )}

      {/* 🕹️ SATELLITE COCKPIT - Ergonomic Command Bar */}
      <div className="px-6 md:px-[8%] lg:px-[12%] pb-10 pt-6 bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.02)] shrink-0">
        <div className="max-w-7xl mx-auto flex items-end gap-5">
          
          {/* 📍 LEFT SATELLITE: Professional Tools (Healthcare/Hospital) */}
          <div className="flex items-center gap-4 mb-2">
             <div className="relative flex flex-col items-center group">
                <button 
                    onClick={() => { setShowMedMenu(!showMedMenu); setShowChronicMenu(false); }} 
                    className={`p-5 rounded-2xl transition-all shadow-lg border-2 ${showMedMenu ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:text-blue-600'}`}
                >
                    <MedIcon size={24} />
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 text-center leading-tight">Espace Corps<br/>Hospitaliers</span>
                
                {showMedMenu && (
                    <div className="absolute bottom-full left-0 mb-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.3)] w-[320px] md:w-[600px] grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-bottom-4 z-50">
                        <div className="col-span-full mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b pb-4 flex items-center justify-between">
                            <span className="flex items-center gap-3"><HeartPulse size={14} /> ESPACE CORPS HOSPITALIERS</span>
                            <Info size={12} className="text-blue-500" />
                        </div>
                        {MEDICAL_RESEARCH_CENTRES.map(m => (
                            <button key={m.id} onClick={() => { setActiveSpecialty(m); handleSend(m.prompt); }} className="flex flex-col items-center gap-3 p-5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-xl transition-all group">
                                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg group-hover:bg-blue-400 transition-colors shadow-sm">{m.icon}</div>
                                <span className="text-[10px] font-black uppercase text-center leading-none">{m.label}</span>
                            </button>
                        ))}
                    </div>
                )}
             </div>

             <div className="relative flex flex-col items-center group">
                <button 
                    onClick={() => { setShowChronicMenu(!showChronicMenu); setShowMedMenu(false); }} 
                    className={`p-5 rounded-2xl transition-all shadow-lg border-2 ${showChronicMenu ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:text-blue-600'}`}
                >
                    <ShieldCheck size={24} />
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 text-center leading-tight">Maladies<br/>Chroniques</span>
                
                {showChronicMenu && (
                    <div className="absolute bottom-full left-0 mb-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.3)] w-[300px] md:w-[450px] grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-4 z-50">
                         <div className="col-span-full mb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b pb-4">PROTOCOLES PATHOLOGIES</div>
                         {CHRONIC_LIST.map(c => (
                            <button key={c.id} onClick={() => handleSend(`Analyse terrain pour pathologie : ${c.label}.`)} className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                                <span className="text-3xl">{c.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-tighter">{c.label}</span>
                            </button>
                         ))}
                    </div>
                )}
             </div>

             <div className="flex flex-col items-center group">
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`p-5 rounded-2xl transition-all border-2 shadow-lg ${attachment ? 'bg-blue-600 text-white border-blue-600 animate-pulse' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:text-blue-600'}`}
                >
                    <Paperclip size={24} />
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload=(ev)=>setAttachment({data:(ev.target?.result as string).split(',')[1], mimeType:f.type, name:f.name}); r.readAsDataURL(f); } }} />
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 text-center leading-tight">Bilan<br/>Dossier</span>
             </div>
          </div>

          {/* 🎯 CENTRE: MAIN INPUT (Command Center) */}
          <div className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] px-8 transition-all focus-within:border-blue-600/40 focus-within:bg-white dark:focus-within:bg-slate-950 shadow-inner group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={activeSpecialty ? `Expertise ${activeSpecialty.label.toUpperCase()} active...` : "Instruction Coach JOSÉ..."}
              rows={1}
              className="flex-1 bg-transparent py-7 text-2xl font-bold text-slate-900 dark:text-white outline-none resize-none placeholder:text-slate-200 min-h-[72px] max-h-56"
              onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
            />
            {input.length === 0 && !activeSpecialty && (
              <Zap size={20} className="text-blue-400 absolute right-8 top-1/2 -translate-y-1/2 opacity-20" />
            )}
          </div>

          {/* ⚙️ RIGHT SATELLITE: AI Brain & Send (with labels) */}
          <div className="flex items-center gap-4 mb-2">
             <div className="flex flex-col items-center group">
                <button 
                    onClick={() => setUseThinking(!useThinking)} 
                    className={`p-5 rounded-2xl transition-all border-2 shadow-lg ${useThinking ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:text-blue-600'}`}
                >
                    <Brain size={24} className={useThinking ? 'animate-pulse' : ''} />
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 text-center leading-tight">Analyse Profonde<br/>(Pensée IA)</span>
             </div>
             
             <div className="flex flex-col items-center group">
                <button 
                    onClick={() => handleSend()} 
                    disabled={isLoading || (!input.trim() && !attachment)} 
                    className="p-7 synergy-bg text-white rounded-[2.2rem] shadow-[0_15px_40px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                >
                    <Send size={26} />
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest mt-2 text-slate-400 dark:text-slate-600 group-hover:text-blue-600 text-center leading-tight">Envoyer<br/>Nexus</span>
             </div>
          </div>
        </div>

        {/* 📋 COCKPIT FOOTER - Global orientation */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mt-10 px-10 border-t border-slate-50 dark:border-slate-900/50 pt-8 gap-6">
            <div className="flex items-center gap-8 text-[10px] text-slate-400 dark:text-slate-700 font-black uppercase tracking-[0.4em]">
                <div className="flex items-center gap-3 text-blue-500/80"><Info size={14} /> CLINICAL OS v4.5</div>
                <span className="opacity-20">|</span>
                <span>SOUVERAINETÉ NDSA</span>
            </div>
            <div className="flex items-center gap-10">
                <button onClick={() => handleSend("Générer un rapport de synthèse global sur l'état du terrain cellulaire.")} className="text-[10px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest flex items-center gap-4 transition-colors group">
                    <ScrollText size={16} className="group-hover:scale-110 transition-transform" /> SYNTHÈSE GLOBALE
                </button>
                <button onClick={handleReset} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-4 group">
                    <Trash2 size={16} className="group-hover:scale-110 transition-transform" /> PURGER NEXUS
                </button>
            </div>
        </div>
      </div>

      {/* 🏥 Active Context Badge (Header Overlay) */}
      {activeSpecialty && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 px-10 py-4 bg-slate-950/90 backdrop-blur-md text-white rounded-full shadow-[0_40px_100px_rgba(37,99,235,0.5)] border-2 border-blue-500/50 flex items-center gap-5 animate-in slide-in-from-top-12 duration-700 z-50">
            <div className="w-10 h-10 rounded-xl synergy-bg flex items-center justify-center border border-white/10 shadow-lg">
                {activeSpecialty.icon}
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.5em]">MODE ACTIF : {activeSpecialty.label}</span>
            <button onClick={() => setActiveSpecialty(null)} className="ml-6 p-1 hover:text-red-500 transition-colors"><X size={20} /></button>
        </div>
      )}

      {/* 📎 Attachment Badge (Floating) */}
      {attachment && (
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] px-10 py-4 rounded-full font-black flex items-center gap-6 shadow-2xl border border-white/20 animate-in slide-in-from-bottom-12 z-50">
          <FileSearch size={20} className="animate-pulse" /> {attachment.name.toUpperCase()} <X size={16} className="cursor-pointer ml-6 hover:rotate-90 transition-all" onClick={() => setAttachment(null)} />
        </div>
      )}
    </div>
  );
};

export default ChatBot;
