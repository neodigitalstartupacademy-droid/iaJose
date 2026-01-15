
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
  { label: 'Bilan Sanguin', prompt: 'Analyse mon bilan sanguin pour ma vitalité.', icon: <FlaskConical size={14} className="text-red-500" /> },
  { label: 'Trio Nutrition', prompt: 'Les bienfaits du Trio de Relance NeoLife ?', icon: <Sparkles size={14} className="text-green-500" /> },
  { label: 'Business', prompt: 'Comment dupliquer avec GMBC-OS ?', icon: <Target size={14} className="text-blue-500" /> },
  { label: 'Liberté', prompt: 'Concept de Temps contre Argent ?', icon: <Zap size={14} className="text-amber-500" /> }
];

const ChatBot: React.FC<ChatBotProps> = ({ distData, isOwner, initialIntent }) => {
  const currentId = distData?.id || JOSE_ID;
  const currentShop = distData?.shopUrl || DEFAULT_NEOLIFE_LINK;
  const storageKey = `jose_chat_history_${currentId}`;
  const archiveKey = `jose_session_archives_${currentId}`;
  const draftKey = `jose_chat_draft_${currentId}`;
  const userKey = 'jose_current_user';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [{ role: 'model', text: `Bonjour, je suis **Coach JOSÉ**.\n\nJe suis l'assistant intelligent souverain pour votre croissance NeoLife (ID: ${currentId}).\n\nSoumettez-moi un bilan ou posez une question sur le système GMBC-OS.`, timestamp: Date.now() }];
  });
  
  const [input, setInput] = useState(() => localStorage.getItem(draftKey) || '');
  const [isLoading, setIsLoading] = useState(false);
  const [activePlayback, setActivePlayback] = useState<{ index: number; progress: number; duration: number } | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
    localStorage.setItem(draftKey, input);
  }, [messages, input, storageKey, draftKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !attachment) return;
    const userMessage: ChatMessage = { role: 'user', text: attachment ? `${textToSend}\n\n📎 *Document : ${attachment.name}*` : textToSend, timestamp: Date.now() };
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
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now(), sources: sources.length > 0 ? sources : undefined }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Une erreur est survenue.", timestamp: Date.now() }]);
    } finally { setIsLoading(false); }
  };

  const handleAudioPlayback = async (idx: number, text: string) => {
    const isAlreadyPlaying = activePlayback?.index === idx;
    stopAllAudio();
    if (isAlreadyPlaying) { setActivePlayback(null); return; }
    let audio = messages[idx]?.audio;
    if (!audio) {
      audio = await textToSpeech(text, selectedVoice) || undefined;
      if (audio) setMessages(prev => { const n = [...prev]; n[idx].audio = audio; return n; });
    }
    if (audio) {
      const source = await playPcmAudio(audio);
      if (source) {
        setActivePlayback({ index: idx, progress: 0, duration: source.buffer?.duration || 0 });
        source.onended = () => setActivePlayback(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-white max-w-full mx-auto relative overflow-hidden">
      
      {/* Zone de discussion ultra-propre */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-[15%] py-12 space-y-16">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-full md:max-w-[95%] ${msg.role === 'user' ? 'w-auto' : 'w-full'}`}>
              
              {/* Entête de message discret */}
              <div className={`flex items-center gap-3 mb-4 text-[10px] font-black tracking-widest text-slate-400 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' ? 'COACH JOSÉ IA' : 'VOUS'}
              </div>

              {/* Texte du message - TAILLE OPTIMISÉE POUR LA LECTURE */}
              <div className={`transition-all ${msg.role === 'user' ? 'bg-slate-100 text-slate-800 rounded-3xl px-8 py-5 text-xl' : 'text-slate-900'}`}>
                <div className={`prose prose-slate max-w-none ${msg.role === 'model' ? 'text-2xl md:text-[26px] leading-[1.6] font-normal tracking-tight' : 'font-medium'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {/* Sources Web */}
                {msg.sources && (
                  <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-4">
                    {msg.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl text-[11px] font-bold text-blue-600 hover:bg-blue-100 transition-all border border-blue-100">
                        <LinkIcon size={12} /> {s.title || 'Source'}
                      </a>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
                  <button onClick={() => handleAudioPlayback(idx, msg.text)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">
                    {activePlayback?.index === idx ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    {activePlayback?.index === idx ? 'Stop' : 'Écouter'}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(msg.text); }} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">
                    <Download size={14} /> Copier
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col gap-6 py-4 animate-pulse">
            <div className="text-[10px] font-black tracking-widest text-slate-300">COACH JOSÉ RÉFLÉCHIT...</div>
            <div className="space-y-4 w-full">
              <div className="h-4 bg-slate-50 rounded-full w-3/4"></div>
              <div className="h-4 bg-slate-50 rounded-full w-full"></div>
              <div className="h-4 bg-slate-50 rounded-full w-5/6"></div>
            </div>
          </div>
        )}
      </div>

      {/* Barre de saisie ergonomique (comme ici) */}
      <div className="px-4 md:px-[15%] pb-10 pt-4 bg-white/90 backdrop-blur-md">
        
        {/* Attachment preview */}
        {attachment && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600" size={20} />
              <span className="text-sm font-bold text-blue-700">{attachment.name}</span>
            </div>
            <button onClick={() => setAttachment(null)} className="p-1 text-blue-400 hover:text-red-500"><X size={20} /></button>
          </div>
        )}

        <div className="relative group flex items-end gap-4 bg-slate-100 rounded-[2.5rem] p-3 shadow-sm border border-slate-200 focus-within:bg-white focus-within:border-blue-600 focus-within:shadow-2xl transition-all">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Paperclip size={26} />
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
            placeholder="Message à Coach JOSÉ..."
            rows={1}
            className="flex-1 bg-transparent py-4 text-xl font-medium outline-none resize-none max-h-60"
            style={{ height: 'auto' }}
            onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
          />

          <button 
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && !attachment)}
            className="p-5 synergy-bg text-white rounded-full shadow-lg active:scale-90 transition-all disabled:opacity-20"
          >
            <Send size={24} />
          </button>
        </div>

        {/* Suggestions rapides en bas */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => handleSend(p.prompt)} className="px-5 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
