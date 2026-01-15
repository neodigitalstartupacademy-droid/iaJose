
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, MessageSquare, Shield, Users, ArrowRight, Link, Copy, Check, Clock, Crown, TrendingUp, Share2, BarChart3, Target, MousePointer2, Info, UserPlus, ShoppingCart, Zap, UserCheck, AlertCircle, Sparkles, Heart, Loader2, XCircle, CheckCircle2, Save, Globe, Wand2 } from 'lucide-react';
import { AppView, DistributorData, UserAccount } from '../types';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK } from '../constants';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
  isOwner: boolean;
  distData: DistributorData | null;
}

type AliasStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, isOwner, distData }) => {
  const [copied, setCopied] = useState<'smart' | 'direct' | null>(null);
  const [customId, setCustomId] = useState(distData?.id || '');
  const [customShop, setCustomShop] = useState(distData?.shopUrl || '');
  const [alias, setAlias] = useState(distData?.alias || '');
  const [aliasStatus, setAliasStatus] = useState<AliasStatus>(distData?.alias ? 'available' : 'idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  // Simulation de base de données d'alias réservés/pris
  const TAKEN_ALIASES = ['neo', 'vitalite', 'sante', 'jose', 'admin', 'startup', 'coach', 'gmbc', 'ndsa', 'systeme', 'expert', 'pro', 'vip', 'leader'];

  const cleanShopUrl = useMemo(() => customShop.trim().replace(/\/+$/, ''), [customShop]);
  
  const smartLink = useMemo(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('ref', customId || JOSE_ID);
    params.set('shop', cleanShopUrl || DEFAULT_NEOLIFE_LINK);
    
    // Si un alias est valide et disponible, on l'ajoute au lien
    if (alias && aliasStatus === 'available') {
      params.set('alias', alias.toLowerCase().trim());
    }
    
    return `${baseUrl}?${params.toString()}`;
  }, [customId, cleanShopUrl, alias, aliasStatus]);

  useEffect(() => {
    const normalizedAlias = alias.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    
    if (!alias.trim()) {
      setAliasStatus('idle');
      setSuggestions([]);
      return;
    }

    if (alias.length < 3) {
      setAliasStatus('invalid');
      setSuggestions([]);
      return;
    }

    // Ne pas re-vérifier si c'est déjà l'alias actuel de l'utilisateur
    if (alias === distData?.alias) {
      setAliasStatus('available');
      return;
    }

    setAliasStatus('checking');
    
    const timer = setTimeout(() => {
      if (TAKEN_ALIASES.includes(normalizedAlias)) {
        setAliasStatus('taken');
        // Générer des suggestions intelligentes basées sur l'alias saisi
        setSuggestions([
          `${normalizedAlias}-pro`,
          `coach-${normalizedAlias}`,
          `${normalizedAlias}-vitality`,
          `synergy-${normalizedAlias}`,
          `${normalizedAlias}-success`
        ].filter(s => !TAKEN_ALIASES.includes(s)));
      } else {
        setAliasStatus('available');
        setSuggestions([]);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [alias, distData?.alias]);

  const handleCopy = (type: 'smart' | 'direct') => {
    const text = type === 'smart' ? smartLink : `${cleanShopUrl}/enrollment`;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const applySuggestion = (s: string) => {
    setAlias(s);
    setAliasStatus('checking'); // Relance la vérification pour la forme
  };

  const handleSaveConfig = () => {
    if (!customId || !customShop) return;
    setIsSaving(true);
    
    const savedUser = localStorage.getItem('jose_current_user');
    if (savedUser) {
      const user: UserAccount = JSON.parse(savedUser);
      user.distData = {
        ...user.distData,
        id: customId,
        shopUrl: customShop,
        alias: aliasStatus === 'available' ? alias : distData?.alias
      };
      localStorage.setItem('jose_current_user', JSON.stringify(user));
    }

    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Synergy Hero Section */}
      <div className={`relative overflow-hidden rounded-[2.5rem] p-10 lg:p-16 text-white shadow-2xl group`}>
        <div className="absolute inset-0 synergy-bg transition-transform duration-700 group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] animate-pulse"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center gap-2">
              <Sparkles size={12} /> Synergy Platform v3.1
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
            L'intelligence NDSA au cœur de <span className="text-green-300">votre croissance NeoLife.</span>
          </h1>
          
          <p className="text-blue-50 text-xl font-medium mb-12 leading-relaxed opacity-90">
            Coach JOSÉ fusionne l'automatisation technologique NDSA avec la science nutritionnelle NeoLife pour créer le premier système de duplication infini.
          </p>
          
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={() => onViewChange(AppView.CHAT)}
              className="px-10 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95"
            >
              Lancer Coach JOSÉ <ArrowRight size={22} className="text-green-600" />
            </button>
            <div className="flex -space-x-3 items-center">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-blue-600 bg-slate-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+15}`} alt="User" />
                    </div>
                ))}
                <div className="pl-6 text-xs font-bold text-blue-100">Plus de 1,200 partenaires utilisent JOSÉ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Synergy Link Generator */}
      <div className="relative glass-effect rounded-[3rem] p-10 border-2 border-white shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 synergy-bg rounded-2xl flex items-center justify-center text-white shadow-xl animate-pulse-synergy">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Générateur de Croissance</h3>
                <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                  <Heart size={14} className="text-green-500" /> Propulsé par la synergie NDSA × NeoLife
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleSaveConfig}
              disabled={isSaving || !customId || !customShop}
              className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 ${
                saveStatus === 'success' ? 'bg-green-600 text-white shadow-green-200' : 'bg-slate-900 text-white hover:bg-black'
              }`}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {saveStatus === 'success' ? 'Configuration Enregistrée' : 'Enregistrer ma Config'}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
          <div className="group space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Identifiant NeoLife</label>
              <div className="relative">
                <input 
                    type="text" 
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-black shadow-inner pl-12"
                    placeholder="ID Distributeur"
                />
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
              </div>
          </div>
          <div className="group space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-green-600 transition-colors">URL Boutique</label>
              <div className="relative">
                <input 
                    type="text" 
                    value={customShop}
                    onChange={(e) => setCustomShop(e.target.value)}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-green-500 focus:bg-white transition-all text-slate-900 font-black shadow-inner pl-12"
                    placeholder="shopneolife.com/..."
                />
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors" />
              </div>
          </div>
          <div className="group space-y-3 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-amber-500 transition-colors">Alias Personnalisé</label>
              <div className="relative">
                  <input 
                      type="text" 
                      value={alias}
                      onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className={`w-full p-5 bg-slate-50 border-2 rounded-2xl outline-none transition-all text-slate-900 font-black shadow-inner pr-12 pl-12 ${
                        aliasStatus === 'available' ? 'border-green-500 bg-green-50/30' : 
                        aliasStatus === 'taken' ? 'border-red-500 bg-red-50/30' : 
                        aliasStatus === 'invalid' ? 'border-amber-500 bg-amber-50/30' : 'border-slate-100 focus:border-amber-500'
                      }`}
                      placeholder="Ex: club-vitalite"
                  />
                  <Wand2 size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    aliasStatus === 'available' ? 'text-green-500' : 
                    aliasStatus === 'taken' ? 'text-red-500' : 'text-slate-300 group-focus-within:text-amber-500'
                  }`} />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {aliasStatus === 'checking' && <Loader2 size={20} className="text-amber-500 animate-spin" />}
                    {aliasStatus === 'available' && <CheckCircle2 size={20} className="text-green-500 animate-in zoom-in" />}
                    {aliasStatus === 'taken' && <XCircle size={20} className="text-red-500 animate-in zoom-in" />}
                    {aliasStatus === 'invalid' && <AlertCircle size={20} className="text-amber-500" />}
                  </div>
              </div>
          </div>
        </div>

        {/* Status Indicators & Suggestions */}
        <div className="px-2 mb-8">
            {aliasStatus === 'invalid' && (
               <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-top-1">
                <Info size={12} /> L'alias doit faire au moins 3 caractères (lettres, chiffres et tirets).
               </p>
            )}
            {aliasStatus === 'available' && (
               <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-top-1">
                <Check size={12} /> Cet alias est parfait ! Votre Smart Link sera unique.
               </p>
            )}
            {aliasStatus === 'taken' && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} /> Cet alias est déjà pris. Suggestions Coach JOSÉ :
                  </p>
                  <button onClick={() => setAlias('')} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase transition-colors">Vider</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i} 
                      onClick={() => applySuggestion(s)}
                      className="px-6 py-3 bg-white border border-red-200 text-red-700 text-xs font-black rounded-xl hover:bg-red-50 hover:border-red-400 transition-all active:scale-95 shadow-sm flex items-center gap-2 group"
                    >
                      <Sparkles size={12} className="group-hover:animate-pulse" /> {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        {(customId || customShop) ? (
          <div className="p-8 md:p-12 synergy-bg rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-between gap-10">
            <div className="relative z-10 space-y-4 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-2xl uppercase tracking-tighter flex items-center justify-center md:justify-start gap-3">
                    <Zap className="text-amber-400 fill-amber-400" size={24} /> 
                    Votre Smart Link Synergique
                  </h4>
                  <p className="text-blue-100 text-sm font-medium opacity-90 max-w-md">Utilisez cet alias court pour automatiser votre prospection avec Coach JOSÉ.</p>
                </div>
                <div className="flex gap-4">
                   <button 
                    onClick={() => handleCopy('smart')}
                    className="flex-1 md:flex-none px-10 py-5 bg-white text-blue-700 rounded-2xl font-black text-sm uppercase shadow-xl hover:scale-105 active:scale-95 transition-all min-w-[200px] flex items-center justify-center gap-3"
                  >
                    {copied === 'smart' ? <Check size={20} /> : <Copy size={20} />}
                    {copied === 'smart' ? 'Copié !' : 'Copier le Lien'}
                  </button>
                </div>
              </div>
              <div className="mt-6 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/20 font-mono text-[10px] md:text-xs break-all select-all flex items-center gap-4 group">
                <Link size={16} className="text-blue-300 shrink-0" />
                <span className="flex-1 opacity-80 group-hover:opacity-100 transition-opacity truncate md:whitespace-normal">{smartLink}</span>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-green-400/10 rounded-full blur-[100px]"></div>
          </div>
        ) : (
          <div className="p-20 border-4 border-dashed border-slate-100 rounded-[3rem] text-center bg-slate-50/30 mt-10">
            <Sparkles size={64} className="text-slate-200 mx-auto mb-8 animate-pulse" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Entrez vos données pour activer la duplication synergique</p>
          </div>
        )}
      </div>

      {/* Visual Stats with Synergy Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Conversion Système', value: '42%', color: 'blue', icon: <TrendingUp /> },
          { label: 'Santé Cellulaire', value: '856', color: 'green', icon: <Activity /> },
          { label: 'Réussite Équipe', value: 'Elite', color: 'amber', icon: <Crown /> }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 shadow-lg group hover:scale-105 transition-all duration-300 flex flex-col items-center md:items-start">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all group-hover:synergy-bg group-hover:text-white ${
              stat.color === 'blue' ? 'bg-blue-100 text-blue-600' : 
              stat.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {React.cloneElement(stat.icon as React.ReactElement, { size: 24 })}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
