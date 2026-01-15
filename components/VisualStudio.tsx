
import React, { useState } from 'react';
import { ImageIcon, Film, Play, Download, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { generateImage, generateVideo } from '../services/geminiService';

const VisualStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('16:9');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'image' | 'video'>('video');
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResultUrl(null);
    setStatus(mode === 'video' ? "Préparation de la génération vidéo Veo..." : "Génération de l'image haute qualité...");

    try {
      if (mode === 'image') {
        const url = await generateImage(prompt, aspectRatio, imageSize);
        setResultUrl(url);
      } else {
        setStatus("Génération en cours... Cela peut prendre 2-3 minutes.");
        const url = await generateVideo(prompt, aspectRatio === '1:1' ? '16:9' : aspectRatio as any);
        setResultUrl(url);
      }
    } catch (err) {
      console.error(err);
      setStatus("Erreur lors de la génération. Vérifiez vos paramètres ou votre clé API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-effect rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Sparkles size={20} className="text-blue-600" /> Configuration
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Type de média</label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button 
                    onClick={() => setMode('video')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'video' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    <Film size={16} /> Vidéo Veo
                  </button>
                  <button 
                    onClick={() => setMode('image')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'image' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    <ImageIcon size={16} /> Image Pro
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Format (Ratio)</label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as any)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                >
                  <option value="16:9">Paysage (16:9)</option>
                  <option value="9:16">Portrait (9:16)</option>
                  {mode === 'image' && <option value="1:1">Carré (1:1)</option>}
                </select>
              </div>

              {mode === 'image' && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Résolution</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1K', '2K', '4K'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setImageSize(size as any)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          imageSize === size ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Description (Prompt)</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'video' ? "Ex: Un athlète rayonnant de vitalité courant dans une forêt lumineuse..." : "Ex: Une cellule humaine stylisée et lumineuse, ultra haute qualité..."}
                  className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Générer mon Visuel
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <div className="glass-effect rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-white/50">
              <span className="text-sm font-bold text-slate-900">Prévisualisation du Studio</span>
              {resultUrl && (
                <a 
                  href={resultUrl} 
                  download={`jose-visual-${Date.now()}`}
                  className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <Download size={14} /> Télécharger
                </a>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/5 relative">
              {loading ? (
                <div className="text-center space-y-6 animate-in fade-in">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {mode === 'video' ? <Film size={24} className="text-blue-600" /> : <ImageIcon size={24} className="text-blue-600" />}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900 font-bold text-lg">Inspiration du Coach JOSÉ...</p>
                    <p className="text-slate-500 text-sm italic">"{status}"</p>
                  </div>
                  <div className="flex gap-1 justify-center">
                     <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                     <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              ) : resultUrl ? (
                <div className="w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-500">
                  {mode === 'image' ? (
                    <img src={resultUrl} alt="Génération" className="max-w-full max-h-[600px] rounded-2xl shadow-2xl border-4 border-white" />
                  ) : (
                    <video src={resultUrl} controls autoPlay loop className="max-w-full max-h-[600px] rounded-2xl shadow-2xl border-4 border-white" />
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4 max-w-sm px-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                    {mode === 'video' ? <Film size={32} /> : <ImageIcon size={32} />}
                  </div>
                  <h4 className="text-slate-900 font-bold">Prêt pour la création ?</h4>
                  <p className="text-slate-400 text-sm">
                    Configurez votre prompt à gauche pour générer du contenu visuel professionnel pour votre équipe NeoLife.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t text-[10px] text-slate-400 text-center italic">
              Les générations sont propulsées par Veo 3.1 et Gemini Pro Image. Les droits appartiennent à GMBC-OS & NDSA.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualStudio;
