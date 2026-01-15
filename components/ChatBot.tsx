
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, FileText, Square, Paperclip, Play, Download, Link as LinkIcon, Sparkles, User, Zap, Mic, MicOff, Volume2, Share2, Heart, TrendingUp, Target, ArrowRight } from 'lucide-react';
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

type IntentType = 'health' | 'success' | 'unknown';

const ChatBot: React.FC<ChatBotProps> = ({ distData, isOwner, initialIntent }) => {
  const currentId = distData?.id || JOSE_ID;
  const currentShop = distData?.shopUrl || DEFAULT_NEOLIFE_LINK;
  const storageKey = `jose_chat_history_${currentId}`;
  const draftKey = `jose_chat_draft_${currentId}`;

  const [detectedIntent, setDetectedIntent] = useState<IntentType>(
    initialIntent === 'health' ? 'health' : (initialIntent === 'welcome' ? 'unknown' : 'unknown')
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    const welcomeText = initialIntent === 'welcome' 
      ? `Bonjour ! Je suis **Coach JOSÉ**, votre partenaire stratégique.\n\nQuelle est notre cible aujourd'hui : optimiser votre **vitalité cellulaire** ou bâtir votre **liberté financière** ?`
      : `Bonjour, je suis **Coach JOSÉ**. Système souverain prêt. Souhaitez-vous explorer la **santé** ou le **succès business** ?`;
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
    const textToSend = (overrideInput || input).trim();
    if (!textToSend && !attachment) return;
    
    const userMessage: ChatMessage = { 
      role: 'user', 
      text: attachment ? `${textToSend}\n\n📎 *Document : ${attachment.name}*` : textToSend, 
      timestamp: Date.now() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let fullResponseText = "";
      const sysInst = SYSTEM_INSTRUCTIONS(currentId, currentShop, isOwner);
      const ai = getAI();
      
      const modelIdx = messages.length + 1;
      setMessages(prev => [...prev, { role: 'model', text: "", timestamp: Date.now() }]);

      if (attachment) {
        const response = await analyzeMedicalDocument(textToSend || "Analyse ce document.", attachment.data, attachment.mimeType, sysInst);
        fullResponseText = response;
        setMessages(prev => {
          const next = [...prev];
          next[modelIdx] = { ...next[modelIdx], text: response };
          return next;
        });
        setAttachment(null);
        setDetectedIntent('health');
      } else {
        const lowerText = textToSend.toLowerCase();
        if (detectedIntent === 'unknown') {
          if (lowerText.match(/argent|revenu|succès|business|liberté|argent|travail/)) setDetectedIntent('success');
          else if (lowerText.match(/santé|fatigue|douleur|poids|bilan|malade/)) setDetectedIntent('health');
        }

        const chat = ai.chats.create({ 
          model: MODELS.TEXT_FAST, 
          config: { 
            systemInstruction: sysInst,
            // On évite les tools complexes pendant le stream si des erreurs 500 persistent
            tools: [{ googleSearch: {} }] 
          } 
        });
        
        const result = await chat.sendMessageStream({ message: textToSend });
        
        for await (const chunk of result) {
          const chunkText = chunk.text || "";
          fullResponseText += chunkText;
          setMessages(prev => {
            const next = [...prev];
            next[modelIdx] = { ...next[modelIdx], text: fullResponseText };
            return next;
          });
        }
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Chat Error:", err);
      setIsLoading(false);
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === 'model' && !last.text) {
          next[next.length - 1] = { ...last, text: "Désolé, une perturbation interne a eu lieu. Je réinitialise la liaison." };
        }
        return next;
      });
    }
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
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white max-w-full mx-auto relative overflow-hidden">
      {/* Statut Intention */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 flex justify-center pointer-events-none">
        <div className={`px-3 py-1 rounded-full border bg-white/95 backdrop-blur-md shadow-sm flex items-center gap-2 transition-all duration-700 ${detectedIntent !== 'unknown' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
           {detectedIntent === 'health' ? <Heart size={10} className="text-red-500" /> : <TrendingUp size={10} className="text-green-600" />}
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
             Cible : {detectedIntent === 'health' ? 'VITALITÉ' : 'RÉUSSITE'}
           </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-[25%] py-8 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
            <div className={`max-w-full ${msg.role === 'user' ? 'max-w-[85%]' : 'w-full'}`}>
              <div className={`flex items-center gap-2 mb-1 text-[9px] font-bold tracking-widest text-slate-300 uppercase ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' ? (
                  <div className="flex items-center gap-1 text-blue-500">
                    <Zap size={10} className="fill-blue-500" /> COACH JOSÉ
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    VOUS <User size={10} />
                  </div>
                )}
              </div>

              <div className={`transition-all ${msg.role === 'user' ? 'bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[14px] text-slate-600 leading-relaxed font-medium' : 'text-slate-900'}`}>
                <div className="text-[14px] leading-relaxed font-normal text-slate-800">
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-black text-slate-950" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-3" {...props} />,
                      li: ({node, ...props}) => <li className="mb-1.5" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {msg.text && (
                  <div className="mt-3 flex items-center gap-4 border-t border-slate-50 pt-3">
                    <button onClick={() => handleAudioPlayback(idx, msg.text)} className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 hover:text-blue-600 transition-all uppercase tracking-widest">
                      {activePlayback?.index === idx ? <Square size={10} fill="currentColor" /> : <Volume2 size={10} />}
                      {activePlayback?.index === idx ? 'Stop' : 'Audio'}
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(msg.text)} className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 hover:text-blue-600 transition-all uppercase tracking-widest">
                      <Download size={10} /> Copier
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col gap-2 py-2">
            <div className="text-[9px] font-black tracking-widest text-blue-400 uppercase flex items-center gap-2 animate-pulse">
               <Sparkles size={12} /> Traitement...
            </div>
          </div>
        )}
      </div>

      {/* Barre de Saisie Terminal : Blanc sur Noir pour Visibilité Maximale */}
      <div className="px-6 md:px-[25%] pb-6 pt-3 bg-white border-t border-slate-50">
        <div className="relative flex items-end gap-2 bg-slate-950 border border-slate-900 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 rounded-2xl p-2.5 transition-all duration-300 shadow-2xl">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-blue-400 transition-colors">
            <Paperclip size={20} />
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
            placeholder="Écrivez ici (Blanc sur Noir)..."
            rows={1}
            className="flex-1 bg-transparent py-2 text-[14px] font-medium text-white outline-none resize-none max-h-[30vh] placeholder:text-slate-600"
            onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />

          <button onClick={toggleRecording} className={`p-2 rounded-lg transition-all ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-slate-500 hover:text-blue-400'}`}>
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button 
            onClick={() => handleSend()} 
            disabled={isLoading || (!input.trim() && !attachment)} 
            className="p-3 synergy-bg text-white rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-10 flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
        {attachment && (
          <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-blue-400 font-bold animate-in slide-in-from-bottom-1">
             <FileText size={12} /> {attachment.name}
             <button onClick={() => setAttachment(null)} className="ml-auto text-slate-500 hover:text-red-400"><X size={12} /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
