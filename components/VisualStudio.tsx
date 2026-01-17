
import React, { useState, useEffect } from 'react';
import { ImageIcon, Film, Play, Download, Sparkles, Loader2, ArrowRight, ShieldCheck, Zap, X, BrainCircuit, Waves, RefreshCcw } from 'lucide-react';
import { generateImage, generateVideo } from '../services/geminiService';

const VIDEO_STATUS_MESSAGES = [
  "Initialisation du moteur Veo 3.1 Souverain...",
  "Analyse sémantique du prompt marketing...",
  "Encodage des vecteurs neuronaux NDSA...",
  "Synthèse des premiers frames cellulaires...",
  "Calcul de la dynamique temporelle bio-optimisée...",
  "Optimisation de la cohérence visuelle 4.5...",
  "Rendu haute fidélité NDSA en cours...",
  "Finalisation du flux MP4 stratégique..."
];

const VisualStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'image' | 'video'>('video');
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    let interval: any;
    if (loading && mode === 'video') {
      interval = setInterval(() => {
        setStatusIdx(prev => (prev + 1) % VIDEO_STATUS_MESSAGES.length);
      }, 12000);
    }
    return () => clearInterval(interval);
  }, [loading, mode]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResultUrl(null);
    setStatusIdx(0);

    try {
      if (mode === 'image') {
        const url = await generateImage(prompt, aspectRatio, imageSize);
        setResultUrl(url);
      } else {
        const url = await generateVideo(prompt, aspectRatio === '1:1' ? '16:9' : aspectRatio as any);
        setResultUrl(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl rotate-12">
               <Sparkles size={24} />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Studio Visuel Souverain v4.5</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
            VISUAL <span className="synergy-text">STUDIO</span>
          </h1>
          <p className="mt-4 text-slate-500 font-medium text-lg">Générez vos actifs marketing NeoLife avec la puissance de Veo 3.1.</p>
        </div>
        <div className="flex p-1.5 bg-slate-100 rounded-2xl shadow-inner min-w-[340px]">
           <button onClick={() => setMode('video')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'video' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>Vidéo Veo 3.1</button>
           <button onClick={() => setMode('image')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'image' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>Image Pro 4.0</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border-2 border-slate-50 rounded-[3rem] p-10 shadow-lg space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Format de Rendu</label>
              <div className="grid grid-cols-2 gap-3">
                 {[
                   {val: '16:9', label: 'Paysage'},
                   {val: '9:16', label: 'Portrait'},
                   ...(mode === 'image' ? [{val: '1:1', label: 'Carré'}] : [])
                 ].map(opt => (
                   <button 
                    key={opt.val} 
                    onClick={() => setAspectRatio(opt.val as any)}
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${aspectRatio === opt.val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-100 text-slate-400'}`}
                   >
                     {opt.label}
                   </button>
                 ))}
              </div>
            </div>

            {mode === 'image' && (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Résolution Ultra</label>
                <div className="grid grid-cols-3 gap-3">
                  {['1K', '2K', '4K'].map(s => (
                    <button key={s} onClick={() => setImageSize(s as any)} className={`py-3 rounded-xl text-[10px] font-black border-2 transition-all ${imageSize === s ? 'synergy-bg text-white border-transparent shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vision Créative (Prompt)</label>
              <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder={`Décrivez votre vision marketing pour ${mode === 'video' ? 'votre publicité' : 'votre actif visuel'}...`} 
                className="w-full h-44 p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:border-blue-500 font-medium text-sm resize-none transition-all" 
              />
            </div>

            <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="w-full py-7 synergy-bg text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={22} />}
              <span className="ml-3">{loading ? 'SYNTHÈSE EN COURS...' : 'GÉNÉRER L\'ACTIF'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-950 rounded-[4rem] border-8 border-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.4)] min-h-[650px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 synergy-bg opacity-30"></div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-white relative z-10">
               {loading ? (
                 <div className="space-y-12 animate-in fade-in duration-500 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-40 h-40 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center"><BrainCircuit className="text-blue-500" size={48} /></div>
                      <div className="absolute inset-0 synergy-bg opacity-20 blur-3xl animate-pulse rounded-full"></div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black tracking-tighter uppercase max-w-lg">{VIDEO_STATUS_MESSAGES[statusIdx]}</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Propulsé par le Cloud Souverain NDSA</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                       <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                       <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce"></span>
                    </div>
                 </div>
               ) : resultUrl ? (
                 <div className="w-full animate-in zoom-in-95 duration-700">
                   {mode === 'image' ? (
                     <img src={resultUrl} className="max-w-full rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-2 border-white/10 mx-auto" alt="AI Generated" />
                   ) : (
                     <video src={resultUrl} controls autoPlay loop className="max-w-full rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-2 border-white/10 mx-auto" />
                   )}
                   <div className="mt-10 flex justify-center gap-6">
                      <a href={resultUrl} download="jose-studio-asset" className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 transition-transform"><Download size={20} /> Télécharger</a>
                      <button onClick={() => setResultUrl(null)} className="px-10 py-5 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all"><RefreshCcw size={20} /> Nouvelle Vision</button>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-8 opacity-40">
                   <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 inline-block">
                     {mode === 'video' ? <Film size={100} /> : <ImageIcon size={100} />}
                   </div>
                   <div className="space-y-4">
                     <h3 className="text-3xl font-black uppercase tracking-tighter">Cockpit de Visualisation NDSA</h3>
                     <p className="text-base font-medium max-w-sm mx-auto opacity-70 leading-relaxed">Prêt pour la synthèse multimodale. Définissez votre vision à gauche pour débuter.</p>
                   </div>
                 </div>
               )}
            </div>
            
            <div className="p-8 bg-black/50 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
               <div className="flex items-center gap-3">
                 <ShieldCheck size={16} className="text-blue-500" />
                 <span>Architecture Sécurisée par Protocole Souverain</span>
               </div>
               <span>Moteurs Veo 3.1 & Imagen 3 Pro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualStudio;
