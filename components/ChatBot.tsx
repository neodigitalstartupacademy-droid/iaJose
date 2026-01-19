
import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Paperclip, X, Activity, Brain, ShieldCheck, Stethoscope as MedIcon, ScrollText, Target, Sparkles, Trash2, History, Volume2, ChevronDown, Microscope, Play, Info, Beaker, GraduationCap, Pill, Thermometer, FlaskConical, Search, FileSearch, ClipboardList, Zap } from 'lucide-react';
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
  "Un patient guéri est un client perdu : brisez la matrice.",
  "Le vieillissement n'est qu'une carence nutritionnelle prolongée.",
  "Nourrissez vos cellules, elles répareront votre vie.",
  "La Médecine du Futur est la nutrition cellulaire de précision."
];

const CHRONIC_LIST = [
  { id: 'diabete', label: 'Diabète & Glycémie', icon: '🧬' },
  { id: 'hypertension', label: 'Hypertension / Cardio', icon: '❤️' },
  { id: 'arthrose', label: 'Arthrose & Rhumatismes', icon: '🦴' },
  { id: 'cholesterol', label: 'Lipides / Cholestérol', icon: '🧪' },
  { id: 'immunite', label: 'Immunité / VIH', icon: '🛡️' },
  { id: 'poids', label: 'Gestion du Métabolisme', icon: '⚖️' }
];

const MEDICAL_RESEARCH_CENTRES = [
  { id: 'general', label: 'Médecine Générale', icon: <MedIcon size={16} />, prompt: "Consultant Expert en Médecine Générale : Analyser les carences de terrain et proposer une stratégie de prévention SAB.", scenarios: ["Bilan de vitalité annuel", "Fatigue inexpliquée", "Soutien immunitaire saisonnier"] },
  { id: 'cardio', label: 'Cardiologie & Vasculaire', icon: <Activity size={16} />, prompt: "Nexus Recherche Cardiologie : Soutien de l'endothélium et de la fonction cardiaque. Analyser les marqueurs inflammatoires (CRPq, Homocystéine) et corréler avec Lipotropic et Omega-3 Plus.", scenarios: ["Récupération post-AVC", "Insuffisance veineuse", "Prévention Athérosclérose"] },
  { id: 'gyn', label: 'Gynécologie & Fertilité', icon: <ShieldCheck size={16} />, prompt: "Expertise Gynécologique : Équilibre des axes hormonaux. Analyser le bilan (FSH, LH, Progestérone) et identifier les besoins en Vitamine E, Zinc et Magnésium.", scenarios: ["Troubles de la Ménopause", "Syndrome des Ovaires Polykystiques", "Accompagnement Fertilité"] },
  { id: 'onco', label: 'Accompagnement Onco', icon: <Microscope size={16} />, prompt: "Oncologie Intégrative : Protection des cellules saines et réduction du stress oxydatif. Analyser le rapport pour identifier les besoins de soutien hépatique et immunitaire (Betaguard, Carotenoid).", scenarios: ["Réduction effets secondaires chimio", "Soutien post-opératoire", "Relance immunitaire profonde"] },
  { id: 'endo', label: 'Endocrinologie', icon: <FlaskConical size={16} />, prompt: "Endocrinologie Métabolique : Analyse de la résistance à l'insuline et équilibre thyroïdien. Corréler TSH/T3/T4 avec les besoins en Iode, Sélénium et Chrome (Multi).", scenarios: ["Thyroïdite d'Hashimoto", "Métabolisme ralenti", "Gestion du stress surrénalien"] },
  { id: 'gastro', label: 'Gastro-entérologie', icon: <Pill size={16} />, prompt: "Gastro-entérologie & Microbiote : Intégrité de la barrière intestinale. Analyser le rapport pour identifier une dysbiose ou une malabsorption.", scenarios: ["Côlon irritable", "Reflux gastrique chronique", "Restauration Microbiote"] },
  { id: 'neuro', label: 'Neurologie & Cerveau', icon: <Brain size={16} />, prompt: "Neuro-Nutrition : Prévention de la neuro-dégénérescence. Analyser les besoins synaptiques (Omega-3 Plus, Tre-en-en, Lecithin).", scenarios: ["TDAH / Concentration", "Prévention Alzheimer/Parkinson", "Soutien Burn-out"] }
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
    setMessages(prev => [...prev, { role: 'user', text: attachment ? `${textToSend} [DOSSIER CLINIQUE: ${attachment.name}]` : textToSend, timestamp: Date.now() }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getAI();
      setMessages(prev => [...prev, { role: 'model', text: "", timestamp: Date.now() }]);
      let fullResponse = "";
      const sysInst = SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner, language, branding);

      if (attachment) {
        // Renforcement du prompt pour l'analyse professionnelle
        const professionalPrompt = activeSpecialty 
            ? `ANALYSE CLINIQUE NEXUS - SPÉCIALITÉ : ${activeSpecialty.label.toUpperCase()}\n\nCONTEXTE : ${textToSend || "Analyse de cas pratique"}\n\nINSTRUCTION : Utilisez la terminologie médicale spécifique à ce domaine tout en identifiant les carences cellulaires selon la science SAB NeoLife.`
            : `ANALYSE MÉDICALE GÉNÉRALE : ${textToSend || "Analyse de document"}`;
            
        const res = await analyzeMedicalDocument(professionalPrompt, attachment.data, attachment.mimeType, sysInst);
        setMessages(prev => { const next = [...prev]; next[modelIdx].text = res; return next; });
        setAttachment(null);
      } else {
        const chat = ai.chats.create({ 
          model: useThinking ? MODELS.TEXT_COMPLEX : MODELS.TEXT_FAST, 
          config: { 
            systemInstruction: sysInst, 
            maxOutputTokens: useThinking ? 40000 : 4000, 
            tools: [{ googleSearch: {} }],
            thinkingConfig: useThinking ? { thinkingBudget: 32000 } : undefined
          } 
        });
        const result = await chat.sendMessageStream({ message: textToSend });
        for await (const chunk of result) {
          fullResponse += chunk.text || "";
          setMessages(prev => { const next = [...prev]; next[modelIdx].text = fullResponse; return next; });
        }
      }
    } catch (err) {
      setMessages(prev => { const next = [...prev]; if (next[modelIdx]) next[modelIdx].text = "Lien interrompu. Reconnexion au Nexus Médical..."; return next; });
    } finally { 
        setIsLoading(false); 
        // Note: On ne reset pas activeSpecialty tout de suite pour permettre d'autres questions sur le même cas
    }
  };

  const handleVoiceRead = async (text: string, index: number) => {
    if (readingIdx === index) {
      stopAllAudio();
      setReadingIdx(null);
      return;
    }
    
    stopAllAudio();
    setReadingIdx(index);
    try {
      const cleanText = text.replace(/[*#_~]/g, '').slice(0, 1500);
      const base64Audio = await textToSpeech(cleanText, VOICES[0].id);
      if (base64Audio) {
        await playPcmAudio(base64Audio);
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setReadingIdx(null);
    }
  };

  const handleReset = () => {
    stopAllAudio();
    const initial = [{ role: 'model', text: t.welcome.replace('Coach JOSÉ', brandName), timestamp: Date.now() }];
    setMessages(initial as ChatMessage[]);
    localStorage.removeItem(historyKey);
    setActiveSpecialty(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 relative overflow-hidden transition-all duration-500 font-inter">
      
      {/* Wisdom Header */}
      <div className="h-10 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-center px-6 overflow-hidden relative">
         <div className="flex items-center gap-3 animate-in slide-in-from-right duration-1000" key={wisdomIdx}>
            <Sparkles size={10} className="text-blue-500 animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 italic tracking-[0.1em] uppercase">"{WISDOM_QUOTES[wisdomIdx]}"</p>
         </div>
      </div>

      {/* Reader Area - Immersive Professional Typography */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-[8%] lg:px-[12%] py-12 space-y-24 bg-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6 duration-700`}>
            <div className={`relative transition-all ${
              msg.role === 'model' 
                ? 'w-full bg-white dark:bg-slate-900/40 rounded-[4.5rem] p-12 md:p-24 border border-slate-100 dark:border-slate-800/50 shadow-sm' 
                : 'max-w-[85%] bg-slate-900 dark:bg-slate-800 text-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-800'
            }`}>
              
              {msg.role === 'model' && (
                <div className="flex items-center justify-between mb-12 pb-10 border-b border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 synergy-bg rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">{brandName[0]}</div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600 dark:text-blue-400">{brandName} CLINICAL NEXUS</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic tracking-tighter">Support Praticien & Recherche Bio-Cellulaire</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleVoiceRead(msg.text, idx)}
                        className={`p-4 rounded-2xl transition-all flex items-center gap-4 ${readingIdx === idx ? 'bg-blue-600 text-white shadow-xl animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-600'}`}
                    >
                        <Volume2 size={22} />
                        <span className="text-[11px] font-black uppercase tracking-widest hidden md:block">
                        {readingIdx === idx ? "SYNTHÈSE EN COURS..." : "ÉCOUTER LE RAPPORT"}
                        </span>
                    </button>
                  </div>
                </div>
              )}

              {/* MASTER TYPOGRAPHY (prose-2xl) */}
              <div className={`max-w-none ${msg.role === 'model' ? 'prose prose-xl md:prose-2xl dark:prose-invert prose-slate prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:leading-[1.85] prose-li:my-6 prose-strong:text-blue-600 dark:prose-strong:text-blue-400' : 'text-2xl font-bold leading-relaxed'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-12 py-16 opacity-50">
             <div className="relative">
                <div className="w-20 h-20 border-2 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
                <Brain className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={28} />
             </div>
             <div className="space-y-2">
                <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-400">Croisement des données cliniques Nexus...</p>
                <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest italic tracking-tight">Analyse de terrain cellulaire SAB v4.5</p>
             </div>
          </div>
        )}
      </div>

      {/* Input & Expert Medical Menus */}
      <div className="p-8 md:p-12 bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border-t border-slate-100 dark:border-slate-800 space-y-8">
        <div className="max-w-6xl mx-auto">
          
          {/* EXPERT ACTION BAR */}
          <div className="relative flex flex-wrap items-center justify-center gap-4 mb-6">
            
            {/* NEXUS MÉDICAL - SPÉCIALITÉS INTERACTIVES */}
            <div className="relative">
                <button 
                    onClick={() => { setShowMedMenu(!showMedMenu); setShowChronicMenu(false); }}
                    className={`flex items-center gap-3 px-8 py-5 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-widest shadow-sm ${showMedMenu ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/30' : (activeSpecialty ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800')}`}
                >
                    <MedIcon size={18} /> {activeSpecialty ? activeSpecialty.label : 'Espace Médecins'} <ChevronDown size={14} className={`transition-transform ${showMedMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showMedMenu && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3.5rem] p-10 shadow-[0_60px_120px_rgba(0,0,0,0.5)] grid grid-cols-2 md:grid-cols-4 gap-4 w-[350px] md:w-[900px] animate-in slide-in-from-bottom-6">
                        <div className="col-span-full mb-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-6">
                            <div className="flex items-center gap-4">
                                <Microscope size={24} className="text-blue-600" />
                                <div>
                                    <h4 className="text-[14px] font-black uppercase tracking-widest text-slate-500">Centre de Recherche Clinique</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Uploadez le document patient après avoir sélectionné votre corps de métier</p>
                                </div>
                            </div>
                            <button onClick={() => { setActiveSpecialty(null); setShowMedMenu(false); }} className="text-[10px] text-slate-400 hover:text-red-500 font-black uppercase tracking-widest">Sortir du Nexus</button>
                        </div>
                        {MEDICAL_RESEARCH_CENTRES.map((spec) => (
                            <button 
                                key={spec.id} 
                                onClick={() => { setActiveSpecialty(spec); setShowMedMenu(false); }}
                                className={`flex flex-col items-center justify-center gap-4 px-4 py-8 rounded-[2rem] transition-all group border-2 ${activeSpecialty?.id === spec.id ? 'bg-blue-600 text-white border-blue-400 shadow-xl' : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-blue-400'}`}
                            >
                                <div className={`p-4 rounded-2xl transition-colors shadow-sm ${activeSpecialty?.id === spec.id ? 'bg-white/20' : 'bg-white dark:bg-slate-700 group-hover:bg-blue-500 group-hover:text-white'}`}>{spec.icon}</div>
                                <span className="text-[10px] font-black uppercase tracking-tight text-center leading-none px-2">{spec.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* PROTOCOLE MALADIES CHRONIQUES */}
            <div className="relative">
                <button 
                    onClick={() => { setShowChronicMenu(!showChronicMenu); setShowMedMenu(false); }}
                    className={`flex items-center gap-3 px-8 py-5 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-widest shadow-sm ${showChronicMenu ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}
                >
                    <ShieldCheck size={18} /> Maladies Chroniques <ChevronDown size={14} className={`transition-transform ${showChronicMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showChronicMenu && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.4)] grid grid-cols-2 md:grid-cols-3 gap-3 w-[320px] md:w-[650px] animate-in slide-in-from-bottom-2">
                         <div className="col-span-full mb-2 flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-5">
                            <Beaker size={20} className="text-blue-600" />
                            <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-500">Protocoles de Terrain SAB</h4>
                        </div>
                        {CHRONIC_LIST.map((mal) => (
                            <button 
                                key={mal.id} 
                                onClick={() => handleSend(`Protocole Maladies Chroniques pour : ${mal.label}. Analyser les carences cellulaires cumulées.`)}
                                className="flex items-center gap-4 px-6 py-5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-[1.5rem] transition-all text-left group"
                            >
                                <span className="text-3xl">{mal.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-tight leading-none">{mal.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button 
                onClick={() => handleSend("Établir un protocole nutritionnel cellulaire global pour restauration du terrain.")}
                className="flex items-center gap-3 px-8 py-5 bg-white dark:bg-slate-900 text-slate-500 hover:text-blue-600 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all shadow-sm text-[11px] font-black uppercase tracking-widest"
            >
                <ScrollText size={18} /> Protocole Cellulaire
            </button>
          </div>

          {/* SCENARIOS SUGGESTIONS - Only visible when a medical specialty is active */}
          {activeSpecialty && (
             <div className="flex flex-wrap items-center justify-center gap-2 mb-6 animate-in slide-in-from-top-4">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                    <ClipboardList size={12} /> SCÉNARIOS CLINIQUES :
                </span>
                {activeSpecialty.scenarios.map((sc: string, idx: number) => (
                    <button 
                        key={idx}
                        onClick={() => handleSend(`Scénario Clinique ${activeSpecialty.label} : ${sc}. Proposez une analyse de terrain et une stratégie de restauration.`)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-full text-[9px] font-black uppercase tracking-tight transition-all border border-slate-200 dark:border-slate-700"
                    >
                        {sc}
                    </button>
                ))}
             </div>
          )}

          {/* INPUT COMMAND CENTRE */}
          <div className="relative flex items-end gap-5 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-[3.5rem] p-5 transition-all focus-within:border-blue-600/40 focus-within:bg-white dark:focus-within:bg-slate-950 shadow-sm">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className={`p-5 rounded-[1.8rem] transition-all flex flex-col items-center justify-center gap-1 ${attachment ? 'bg-blue-600 text-white shadow-xl animate-pulse' : 'text-slate-400 hover:text-blue-600 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'}`}
              title="Attacher Bilan Biologique / Rapport (Nexus)"
            >
              <Paperclip size={26} />
              <span className="text-[8px] font-black uppercase">BIO</span>
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload=(ev)=>setAttachment({data:(ev.target?.result as string).split(',')[1], mimeType:f.type, name:f.name}); r.readAsDataURL(f); } }} />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={activeSpecialty ? `Mode Clinical Nexus (${activeSpecialty.label}). Analysez le dossier...` : "Commandez l'intelligence JOSÉ..."}
              rows={1}
              className="flex-1 bg-transparent py-5 text-2xl font-bold text-slate-900 dark:text-white outline-none resize-none placeholder:text-slate-300 min-h-[70px] max-h-56"
              onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
            />

            <div className="flex items-center gap-4 mb-2 mr-2">
                <button 
                    onClick={() => setUseThinking(!useThinking)} 
                    className={`p-5 rounded-[1.5rem] transition-all ${useThinking ? 'bg-blue-600 text-white shadow-xl' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-800 shadow-sm'}`} 
                    title="Analyse de Mécanismes Profonds"
                >
                    <Brain size={26} className={useThinking ? 'animate-pulse' : ''} />
                </button>
                <button 
                    onClick={() => handleSend()} 
                    disabled={isLoading || (!input.trim() && !attachment)} 
                    className="p-6 synergy-bg text-white rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                >
                    <Send size={26} />
                </button>
            </div>
          </div>

          {/* FOOTER CLINICAL Cockpit */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 px-10 gap-6">
             <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] text-center md:text-left">
                <Info size={14} className="text-blue-500" />
                <span>NEXUS SOUVERAIN : Support à la décision clinique via Science SAB NeoLife.</span>
             </div>
             <div className="flex items-center gap-10">
                <p className="text-[10px] text-slate-300 dark:text-slate-700 font-black uppercase tracking-widest flex items-center gap-3">
                    <GraduationCap size={14} /> CLINICAL OS v4.5
                </p>
                <button onClick={handleReset} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-3">
                   <Trash2 size={14} /> Réinitialiser le Nexus
                </button>
             </div>
          </div>
        </div>
      </div>

      {attachment && (
        <div className="absolute bottom-60 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] px-12 py-5 rounded-full font-black flex items-center gap-6 shadow-[0_40px_100px_rgba(37,99,235,0.7)] border border-white/20 animate-in slide-in-from-bottom-10 duration-500">
          <FileSearch size={22} className="animate-pulse" /> {attachment.name.toUpperCase()} <X size={18} className="cursor-pointer hover:rotate-90 transition-all ml-6" onClick={() => setAttachment(null)} />
        </div>
      )}
      
      {activeSpecialty && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 px-10 py-4 bg-slate-900 text-white rounded-full shadow-2xl border-2 border-blue-500/50 flex items-center gap-4 animate-in slide-in-from-top-6 duration-700">
            <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full synergy-bg flex items-center justify-center border-2 border-slate-900 shadow-lg">
                    {activeSpecialty.icon}
                </div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">NEXUS CLINIQUE : {activeSpecialty.label}</span>
            <button onClick={() => setActiveSpecialty(null)} className="ml-2 hover:text-red-500 transition-colors"><X size={14} /></button>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
