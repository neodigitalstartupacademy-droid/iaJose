
import React, { useState, useEffect } from 'react';
import { Activity, MessageSquare, Shield, Users, ArrowRight, Link, Copy, Check, Clock, Crown, TrendingUp, Share2, BarChart3, Target, MousePointer2, Info } from 'lucide-react';
import { AppView, DistributorData } from '../types';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK } from '../constants';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
  isOwner: boolean;
  distData: DistributorData | null;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, isOwner, distData }) => {
  const [copied, setCopied] = useState(false);
  const [customId, setCustomId] = useState(distData?.id || '');
  const [customShop, setCustomShop] = useState(distData?.shopUrl || '');

  const generatedLink = `${window.location.origin}${window.location.pathname}?ref=${customId}&shop=${encodeURIComponent(customShop)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon Coach JOSÉ - NeoLife',
          text: 'Découvrez comment transformer votre santé et vos finances avec Coach JOSÉ.',
          url: generatedLink,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className={`relative overflow-hidden rounded-3xl p-8 lg:p-12 text-white shadow-2xl ${isOwner ? 'bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-500/20' : 'bg-slate-900'}`}>
        <div className="relative z-10 max-w-2xl">
          <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border ${isOwner ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-blue-600/30 border-blue-500/50 text-blue-300'}`}>
            {isOwner ? 'Centre de Commandement Fondateur' : 'Système de Duplication Actif'}
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {isOwner ? "José, gérez votre duplication et votre réseau." : "Propulsez votre business NeoLife à la vitesse supérieure."}
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Coach JOSÉ est votre commercial 24h/24. Il utilise l'IA pour analyser la santé de vos clients et les parrainer dans votre réseau NeoLife.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onViewChange(AppView.CHAT)}
              className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg"
            >
              Lancer Coach JOSÉ <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent hidden lg:block"></div>
      </div>

      {/* Distributor Tool: Smart Link Generator & Tracker (Distributors Only) */}
      {!isOwner && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="relative glass-effect rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                  <Link className="text-blue-600" />
                  <h3 className="text-xl font-bold text-slate-900">Générateur de Lien de Prospection</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                  <Shield size={14} /> Accès Distributeur Actif
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Votre ID NeoLife Unique</label>
                  <input 
                      type="text" 
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                      placeholder="Ex: 067-XXXXXXX"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-300 transition-all text-slate-800 font-medium"
                  />
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Lien de votre Boutique NeoLife</label>
                  <input 
                      type="text" 
                      value={customShop}
                      onChange={(e) => setCustomShop(e.target.value)}
                      placeholder="https://shopneolife.com/nom-boutique"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-300 transition-all text-slate-800 font-medium"
                  />
              </div>
            </div>

            {customId && customShop ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="truncate text-sm font-medium text-blue-800 w-full md:w-auto font-mono">
                        {generatedLink}
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <button 
                            onClick={handleCopy}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copié' : 'Copier'}
                        </button>
                        <button 
                            onClick={handleShare}
                            className="flex items-center justify-center p-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                            title="Partager vers les réseaux sociaux"
                        >
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
                <div className="flex items-start gap-2 text-blue-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    {/* Added Info icon to imports */}
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed">Ce lien intelligent injecte automatiquement vos coordonnées dans Coach JOSÉ. Vos prospects seront directement redirigés vers votre boutique pour leurs achats.</p>
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl text-center bg-slate-50/30">
                 <p className="text-sm text-slate-400">Entrez votre ID et votre lien boutique pour activer votre système de prospection automatique.</p>
              </div>
            )}
          </div>

          {/* Simulated Tracking Stats (Distributors Only) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <MousePointer2 size={20} />
                </div>
                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12.4%</span>
              </div>
              <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Clics sur le lien</h4>
              <p className="text-2xl font-black text-slate-900">1,284</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Target size={20} />
                </div>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Top Performeur</span>
              </div>
              <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Prospects Qualifiés</h4>
              <p className="text-2xl font-black text-slate-900">86</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 italic">Temps réel</span>
              </div>
              <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-wider">Taux de Conversion</h4>
              <p className="text-2xl font-black text-slate-900">6.7%</p>
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
            <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-widest">Duplication Réseau</h4>
            <p className="text-lg font-black text-slate-900">Automatisée via Coach JOSÉ</p>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex items-center gap-6 group hover:bg-white hover:border-amber-100 transition-all">
          <div className="w-14 h-14 bg-white text-amber-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Crown size={28} />
          </div>
          <div>
            <h4 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-widest">Statut Partenaire</h4>
            <p className="text-lg font-black text-slate-900">{isOwner ? 'Fondateur GMBC-OS' : 'Membre NeoLife Actif'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
