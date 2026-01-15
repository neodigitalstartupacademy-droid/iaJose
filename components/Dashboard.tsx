
import React, { useState, useEffect } from 'react';
import { Activity, MessageSquare, Shield, Users, ArrowRight, Link, Copy, Check, Clock, Crown, TrendingUp, Share2, BarChart3, Target, MousePointer2, Info, UserPlus, ShoppingCart, Zap, UserCheck, AlertCircle } from 'lucide-react';
import { AppView, DistributorData } from '../types';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK } from '../constants';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
  isOwner: boolean;
  distData: DistributorData | null;
}

const RESERVED_ALIASES = ['jose', 'admin', 'neolife', 'gmbcos', 'coach', 'startup', 'health', 'opportunity', 'root'];

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, isOwner, distData }) => {
  const [copied, setCopied] = useState<'smart' | 'direct' | null>(null);
  const [customId, setCustomId] = useState(distData?.id || '');
  const [customShop, setCustomShop] = useState(distData?.shopUrl || '');
  const [alias, setAlias] = useState('');
  const [aliasError, setAliasError] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [intent, setIntent] = useState<'general' | 'health' | 'opportunity'>('general');

  // Nettoyage de l'URL boutique
  const cleanShopUrl = customShop.trim().replace(/\/+$/, '');
  
  const smartLink = `${window.location.origin}${window.location.pathname}?ref=${customId}&shop=${encodeURIComponent(cleanShopUrl)}${intent !== 'general' ? `&intent=${intent}` : ''}${alias ? `&alias=${alias.toLowerCase()}` : ''}`;
  const directEnrollLink = `${cleanShopUrl}/enrollment`;

  // Validation de l'alias
  useEffect(() => {
    if (!alias) {
      setAliasError(false);
      setSuggestions([]);
      return;
    }

    const normalized = alias.toLowerCase().trim();
    if (RESERVED_ALIASES.includes(normalized)) {
      setAliasError(true);
      // Générer des suggestions
      const sugs = [
        `${normalized}-${customId.split('-')[1] || 'pro'}`,
        `coach-${normalized}`,
        `${normalized}-gmbcos`
      ];
      setSuggestions(sugs);
    } else {
      setAliasError(false);
      setSuggestions([]);
    }
  }, [alias, customId]);

  const handleCopy = (type: 'smart' | 'direct') => {
    const text = type === 'smart' ? smartLink : directEnrollLink;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Coach JOSÉ - Votre Assistant IA NeoLife',
          text: intent === 'opportunity' 
            ? 'Découvrez comment bâtir votre liberté financière avec le système GMBC-OS.' 
            : 'Obtenez votre bilan de santé cellulaire gratuit avec Coach JOSÉ.',
          url: smartLink,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      handleCopy('smart');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl p-8 lg:p-12 text-white shadow-2xl ${isOwner ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-500/20' : 'bg-slate-900'}`}>
        <div className="relative z-10 max-w-2xl">
          <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border ${isOwner ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-blue-600/30 border-blue-500/50 text-blue-300'}`}>
            {isOwner ? 'Centre de Commandement Fondateur' : 'Système de Duplication Actif'}
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {isOwner ? "José, gérez votre duplication et votre réseau." : "Votre IA de Prospection est prête à travailler."}
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Coach JOSÉ automatise le conseil santé et le parrainage. Partagez votre lien intelligent pour transformer vos contacts en clients ou partenaires.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onViewChange(AppView.CHAT)}
              className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
            >
              Parler à mon Coach JOSÉ <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent hidden lg:block"></div>
      </div>

      {/* Distributor Tool: Smart Link Generator (Distributors Only) */}
      {!isOwner && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="relative glass-effect rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Configurateur de Liens</h3>
                    <p className="text-xs text-slate-500 font-medium italic">Automatisez votre prospection digitale</p>
                  </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-wider">
                  <Shield size={12} /> Accès Partenaire Vérifié
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest group-focus-within:text-blue-600 transition-colors">Votre Identifiant NeoLife (ID)</label>
                  <input 
                      type="text" 
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                      placeholder="Ex: 067-XXXXXXX"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-bold"
                  />
              </div>
              <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest group-focus-within:text-blue-600 transition-colors">URL Boutique Officielle</label>
                  <input 
                      type="text" 
                      value={customShop}
                      onChange={(e) => setCustomShop(e.target.value)}
                      placeholder="https://shopneolife.com/votre-nom"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-bold"
                  />
              </div>
              <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest group-focus-within:text-blue-600 transition-colors">Alias du Lien (Optionnel)</label>
                  <div className="relative">
                    <input 
                        type="text" 
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        placeholder="Ex: sante-naturelle"
                        className={`w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:bg-white transition-all text-slate-900 font-bold pr-12 ${aliasError ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {alias ? (
                        aliasError ? <AlertCircle size={20} className="text-red-500" /> : <UserCheck size={20} className="text-green-500" />
                      ) : (
                        <UserCheck size={20} className="text-slate-300" />
                      )}
                    </div>
                  </div>
                  {aliasError && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                      <p className="text-[10px] text-red-500 font-bold uppercase mb-2">Cet alias est déjà réservé. Essayez :</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((sug, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setAlias(sug)}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black border border-red-100 hover:bg-red-100 transition-colors"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Intent Selector */}
            <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <label className="text-[10px] font-black text-slate-500 uppercase mb-4 block tracking-widest text-center">Ciblage du lien (Optimisation IA)</label>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <button 
                  onClick={() => setIntent('general')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${intent === 'general' ? 'bg-white border-blue-500 shadow-md scale-105' : 'bg-transparent border-slate-100 hover:border-slate-300 opacity-60'}`}
                 >
                   <MessageSquare size={20} className={intent === 'general' ? 'text-blue-600' : 'text-slate-400'} />
                   <span className="text-xs font-bold uppercase">Général</span>
                 </button>
                 <button 
                  onClick={() => setIntent('health')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${intent === 'health' ? 'bg-white border-green-500 shadow-md scale-105' : 'bg-transparent border-slate-100 hover:border-slate-300 opacity-60'}`}
                 >
                   <Activity size={20} className={intent === 'health' ? 'text-green-600' : 'text-slate-400'} />
                   <span className="text-xs font-bold uppercase">Santé / Bilan</span>
                 </button>
                 <button 
                  onClick={() => setIntent('opportunity')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${intent === 'opportunity' ? 'bg-white border-amber-500 shadow-md scale-105' : 'bg-transparent border-slate-100 hover:border-slate-300 opacity-60'}`}
                 >
                   <Target size={20} className={intent === 'opportunity' ? 'text-amber-600' : 'text-slate-400'} />
                   <span className="text-xs font-bold uppercase">Opportunité / Inscription</span>
                 </button>
               </div>
            </div>

            {customId && customShop ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Main AI Link Card */}
                <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl flex flex-col justify-between overflow-hidden relative">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={18} className="text-blue-200" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Lien Intelligent Coach JOSÉ</h4>
                      </div>
                      <p className="text-[11px] text-blue-100 mb-4 leading-relaxed">Le prospect parle au Coach, qui le redirigera vers vous pour ses achats et son inscription.</p>
                      <div className="bg-white/10 p-3 rounded-xl mb-4 font-mono text-[10px] truncate border border-white/20 select-all backdrop-blur-sm">
                        {smartLink}
                      </div>
                    </div>
                    <div className="flex gap-2 relative z-10">
                        <button 
                            onClick={() => handleCopy('smart')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-blue-600 rounded-xl font-black text-xs uppercase hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
                        >
                            {copied === 'smart' ? <Check size={16} /> : <Copy size={16} />}
                            {copied === 'smart' ? 'Copié' : 'Copier'}
                        </button>
                        <button 
                            onClick={handleShare}
                            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-lg active:scale-95"
                            title="Partager"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Direct Shop Link Card */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-between group hover:border-blue-300 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <UserPlus size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Lien d'Inscription Directe</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Lien officiel NeoLife pour l'inscription immédiate sous votre ID distributeur.</p>
                      <div className="bg-white p-3 rounded-xl mb-4 font-mono text-[10px] truncate border border-slate-200 text-slate-400">
                        {directEnrollLink}
                      </div>
                    </div>
                    <button 
                        onClick={() => handleCopy('direct')}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase transition-all active:scale-95 ${copied === 'direct' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-md'}`}
                    >
                        {copied === 'direct' ? <Check size={16} /> : <UserPlus size={16} />}
                        {copied === 'direct' ? 'Lien d\'Inscription Copié' : 'Copier Lien d\'Inscription'}
                    </button>
                </div>
              </div>
            ) : (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-slate-50/50">
                 <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                   <Link size={32} />
                 </div>
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">En attente de vos coordonnées</p>
                 <p className="text-[11px] text-slate-400 mt-2">Renseignez votre ID et votre boutique pour générer vos outils de prospection.</p>
              </div>
            )}
          </div>

          {/* Simulated Tracking Stats (Distributors Only) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <MousePointer2 size={20} />
                </div>
                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12.4%</span>
              </div>
              <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Clics sur vos liens</h4>
              <p className="text-2xl font-black text-slate-900">1,284</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Target size={20} />
                </div>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Elite</span>
              </div>
              <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Prospects Qualifiés</h4>
              <p className="text-2xl font-black text-slate-900">86</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-green-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all">
                  <ShoppingCart size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 italic">Live</span>
              </div>
              <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Commandes Générées</h4>
              <p className="text-2xl font-black text-slate-900">23</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards for all (Simplified versions for visual balance) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex items-center gap-6 group hover:bg-white hover:border-blue-100 transition-all">
          <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Users size={28} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-widest">Duplication Automatisée</h4>
            <p className="text-lg font-black text-slate-900">Votre IA travaille sans repos</p>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex items-center gap-6 group hover:bg-white hover:border-amber-100 transition-all">
          <div className="w-14 h-14 bg-white text-amber-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Crown size={28} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-widest">Niveau d'Accès</h4>
            <p className="text-lg font-black text-slate-900">{isOwner ? 'Fondateur GMBC-OS' : 'Partenaire NeoLife Distributeur'}</p>
          </div>
        </div>
      </div>
      
      {/* Social Media Tooltip */}
      <div className="p-6 bg-slate-900 rounded-3xl text-white text-center flex flex-col items-center gap-3">
         <Share2 size={32} className="text-blue-500" />
         <h4 className="font-bold">Où partager votre lien intelligent ?</h4>
         <p className="text-xs text-slate-400 max-w-lg">Bio Instagram, Posts Facebook, Statuts WhatsApp, et lors de vos conversations privées. Coach JOSÉ prendra le relais pour expliquer NeoLife à votre place.</p>
      </div>
    </div>
  );
};

export default Dashboard;
