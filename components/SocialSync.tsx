
import React, { useState, useMemo } from 'react';
import { Share2, Link as LinkIcon, Copy, Check, MessageCircle, Instagram, Facebook, Smartphone, Zap, Sparkles, Globe, QrCode, Wand2, Target, ArrowRight } from 'lucide-react';
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const socialChannels = [
    { 
      id: 'whatsapp', 
      name: 'WhatsApp Closing', 
      icon: <MessageCircle size={20} />, 
      color: 'bg-green-500', 
      msg: `Lien direct vers votre discussion Coach JOSÉ.` 
    },
    { 
      id: 'instagram', 
      name: 'Instagram Bio', 
      icon: <Instagram size={20} />, 
      color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500', 
      msg: `Lien optimisé pour votre biographie.` 
    },
    { 
      id: 'facebook', 
      name: 'Facebook Post', 
      icon: <Facebook size={20} />, 
      color: 'bg-blue-600', 
      msg: `Lien avec aperçu stratégique.` 
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Atelier */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl rotate-12">
               <Share2 size={24} />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Atelier Social Sync</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
            PROSPECTION <span className="synergy-text">INTELLIGENTE</span>
          </h1>
          <p className="mt-6 text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
            Générez vos actifs digitaux. Chaque clic transforme un inconnu en prospect éduqué par Coach JOSÉ.
          </p>
        </div>

        <div className="flex p-1.5 bg-slate-100 rounded-2xl shadow-inner min-w-[300px]">
           <button 
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'links' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
           >
             Liens Elite
           </button>
           <button 
            onClick={() => setActiveTab('assets')}
            className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
           >
             Actifs Sociaux
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Le Smart Link Souverain */}
           <div className="synergy-bg rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                    <Zap size={24} className="text-amber-300 fill-amber-300" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Votre Smart Link Maître</h3>
                </div>

                <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-8 font-mono text-sm break-all">
                  {smartLink}
                </div>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => handleCopy(smartLink, 'master')}
                    className="flex-1 py-5 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {copied === 'master' ? <Check size={20} /> : <Copy size={20} />}
                    {copied === 'master' ? 'COPIÉ !' : 'COPIER LE LIEN'}
                  </button>
                  <button className="p-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all">
                    <QrCode size={24} />
                  </button>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-[80px]"></div>
           </div>

           {/* Canaux Sociaux */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {socialChannels.map((channel) => (
                <div key={channel.id} className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 hover:shadow-xl transition-all group">
                   <div className={`w-12 h-12 ${channel.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                     {channel.icon}
                   </div>
                   <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight mb-2">{channel.name}</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed mb-6">{channel.msg}</p>
                   <button 
                    onClick={() => handleCopy(smartLink, channel.id)}
                    className="w-full py-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                   >
                     {copied === channel.id ? 'COPIÉ' : 'OBTENIR'}
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* Sidebar Stratégie */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl space-y-8">
              <div className="flex items-center gap-3">
                 <Wand2 size={24} className="text-blue-500" />
                 <h3 className="font-black text-lg uppercase tracking-tight">Accroches JOSÉ</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Utilisez ces phrases pour accompagner votre lien sur vos réseaux sociaux :
              </p>

              <div className="space-y-4">
                 {[
                   "J'ai délégué mon éducation santé à une IA souveraine. Testez Coach JOSÉ ici.",
                   "Plus besoin de tout savoir. Laissez mon système savoir pour vous.",
                   "Le futur de la nutrition cellulaire est là. Discutez avec Coach JOSÉ."
                 ].map((hook, i) => (
                   <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-bold italic leading-relaxed group cursor-pointer hover:bg-white/10 transition-all">
                      "{hook}"
                      <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleCopy(hook, `hook-${i}`)} className="text-blue-500 flex items-center gap-1">
                           <Copy size={12} /> {copied === `hook-${i}` ? 'Copié' : 'Copier'}
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 text-center">
              <Target size={32} className="text-blue-600 mx-auto mb-4" />
              <h4 className="text-sm font-black text-blue-900 uppercase mb-2">Objectif Conversion</h4>
              <p className="text-[10px] text-blue-500 font-bold leading-relaxed uppercase">
                Chaque clic sur votre Smart Link identifie automatiquement votre prospect. JOSÉ l'orientera vers VOTRE boutique NeoLife.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSync;
