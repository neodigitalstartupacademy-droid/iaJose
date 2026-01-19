
import React, { useState } from 'react';
import { ImageIcon, Download, Sparkles, Loader2, Zap, RefreshCcw, ShieldCheck, BrainCircuit } from 'lucide-react';
import { generateImage } from '../services/geminiService';

const VisualStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResultUrl(null);

    try {
      const url = await generateImage(prompt, aspectRatio, imageSize);
      setResultUrl(url);
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
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
            VISUAL <span className="synergy-text">STUDIO</span>
          </h1>
          <p className="mt-4 text-slate-500 font-medium text-lg">Générez vos actifs marketing NeoLife avec la puissance d'Imagen Pro 4.0.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] p-10 shadow-lg space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Format de Rendu</label>
              <div className="grid grid-cols-3 gap-3">
                 {[
                   {val: '16:9', label: 'Paysage'},
                   {val: '9:16', label: 'Portrait'},
                   {val: '1:1', label: 'Carré'}
                 ].map(opt => (
                   <button 
                    key={opt.val} 
                    onClick={() => setAspectRatio(opt.val as any)}
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${aspectRatio === opt.val ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400'}`}
                   >
                     {opt.label}
                   </button>
                 ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Résolution Ultra</label>
              <div className="grid grid-cols-3 gap-3">
                {['1K', '2K', '4K'].map(s => (
                  <button key={s} onClick={() => setImageSize(s as any)} className={`py-3 rounded-xl text-[10px] font-black border-2 transition-all ${imageSize === s ? 'synergy-bg text-white border-transparent shadow-lg' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vision Créative (Prompt)</label>
              <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder={`Décrivez votre vision marketing pour votre actif visuel (ex: Cellules de vitalité, Lifestyle NeoLife)...`} 
                className="w-full h-44 p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:border-blue-500 font-medium text-sm resize-none transition-all text-slate-900 dark:text-white" 
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
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-white relative z-10">
               {loading ? (
                 <div className="space-y-12 animate-in fade-in duration-500 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-40 h-40 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center"><BrainCircuit className="text-blue-500" size={48} /></div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-3xl font-black tracking-tighter uppercase max-w-lg">Génération de l'actif visuel haute fidélité...</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Moteur Imagen Pro 4.0</p>
                    </div>
                 </div>
               ) : resultUrl ? (
                 <div className="w-full animate-in zoom-in-95 duration-700">
                   <img src={resultUrl} className="max-w-full rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-2 border-white/10 mx-auto" alt="AI Generated" />
                   <div className="mt-10 flex justify-center gap-6">
                      <a href={resultUrl} download="jose-studio-asset" className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 transition-transform"><Download size={20} /> Télécharger</a>
                      <button onClick={() => setResultUrl(null)} className="px-10 py-5 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white/20 transition-all"><RefreshCcw size={20} /> Nouvelle Vision</button>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-8 opacity-40">
                   <div className="p-10 bg-white/5 rounded-[3rem] border border-white/5 inline-block">
                     <ImageIcon size={100} />
                   </div>
                   <div className="space-y-4">
                     <h3 className="text-3xl font-black uppercase tracking-tighter">Cockpit d'Image NDSA</h3>
                     <p className="text-base font-medium max-w-sm mx-auto opacity-70 leading-relaxed">Prêt pour la création de visuels souverains.</p>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualStudio;
