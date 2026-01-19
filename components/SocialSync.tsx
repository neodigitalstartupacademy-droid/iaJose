
import React, { useState, useMemo } from 'react';
import { Share2, Link as LinkIcon, Copy, Check, MessageCircle, Instagram, Facebook, Smartphone, Zap, Sparkles, Globe, QrCode, Wand2, Target, ArrowRight, ShieldCheck, AlertCircle, Download } from 'lucide-react';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK } from '../constants';

interface SocialSyncProps {
  distId: string;
  shopUrl: string;
}

const SocialSync: React.FC<SocialSyncProps> = ({ distId, shopUrl }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'assets'>('links');

  const smartLink = useMemo(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?ref=${distId || JOSE_ID}&shop=${encodeURIComponent(shopUrl || DEFAULT_NEOLIFE_LINK)}&intent=welcome`;
  }, [distId, shopUrl]);

  // Suggestion: QR Code Souverain via Google Chart API (Pas besoin de lib externe)
  const qrCodeUrl = useMemo(() => {
    return `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(smartLink)}&choe=UTF-8`;
  }, [smartLink]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4 pt-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl rotate-12">
               <Share2 size={24} />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Module Social-Ready v4.0</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
            PRODUITS <span className="synergy-text">SOCIAUX</span>
          </h1>
        </div>

        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-inner min-w-[300px]">
           <button onClick={() => setActiveTab('links')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'links' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-400'}`}>Liens</button>
           <button onClick={() => setActiveTab('assets')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-400'}`}>QR Code</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           {activeTab === 'links' ? (
             <div className="bg-slate-950 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                <div className="absolute inset-0 synergy-bg opacity-10 blur-[80px]"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><ShieldCheck size={28} /></div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Lien Intelligent NDSA</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">SÉCURISÉ CONTRE LE BLOCAGE</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 font-mono text-xs text-blue-300 break-all">{smartLink}</div>
                  <button onClick={() => handleCopy(smartLink, 'smart')} className="w-full py-6 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                    {copied === 'smart' ? <Check size={20} /> : <Copy size={20} />}
                    {copied === 'smart' ? 'COPIÉ !' : 'COPIER LE SMART LINK'}
                  </button>
                </div>
             </div>
           ) : (
             <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3.5rem] p-12 shadow-xl flex flex-col items-center animate-in zoom-in-95">
                <div className="bg-white p-6 rounded-[2rem] shadow-2xl mb-10 border-4 border-slate-50">
                   <img src={qrCodeUrl} alt="Smart Link QR Code" className="w-64 h-64" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-4">Votre QR Code Terrain</h3>
                <p className="text-slate-500 font-medium text-center max-w-sm mb-10">Idéal pour vos cartes de visite ou présentations physiques.</p>
                <a href={qrCodeUrl} download="jose-smartlink-qr.png" className="w-full py-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                  <Download size={20} /> TÉLÉCHARGER LE QR CODE
                </a>
             </div>
           )}
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl space-y-8">
              <div className="flex items-center gap-3">
                 <Target size={24} className="text-blue-500" />
                 <h3 className="font-black text-lg uppercase tracking-tight">Conseils Stratégiques</h3>
              </div>
              <div className="space-y-6">
                 {[
                   { t: "Lien Bio", d: "Indispensable sur Instagram pour convertir vos abonnés." },
                   { t: "WhatsApp", d: "Partagez votre QR Code lors de vos rencontres physiques." },
                   { t: "Closing", d: "Le Smart Link identifie automatiquement votre ID NeoLife." }
                 ].map((tip, i) => (
                   <div key={i} className="space-y-1">
                      <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{tip.t}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{tip.d}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSync;
