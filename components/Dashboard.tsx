
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, MessageSquare, Shield, Users, ArrowRight, Link, Copy, Check, Clock, Crown, TrendingUp, Share2, BarChart3, Target, MousePointer2, Info, UserPlus, ShoppingCart, Zap, UserCheck, AlertCircle, Sparkles, Heart, Loader2, XCircle, CheckCircle2, Save, Globe, Wand2, ShieldAlert } from 'lucide-react';
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

  const TAKEN_ALIASES = ['neo', 'vitalite', 'sante', 'jose', 'admin', 'startup', 'coach', 'gmbc', 'ndsa', 'systeme', 'expert', 'pro', 'vip', 'leader', 'elite', 'gold', 'diamond', 'success', 'nutrition', 'cellulaire'];

  const cleanShopUrl = useMemo(() => customShop.trim().replace(/\/+$/, ''), [customShop]);
  
  const smartLink = useMemo(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('ref', customId || JOSE_ID);
    params.set('shop', cleanShopUrl || DEFAULT_NEOLIFE_LINK);
    if (alias && aliasStatus === 'available') params.set('alias', alias.toLowerCase().trim());
    return `${baseUrl}?${params.toString()}`;
  }, [customId, cleanShopUrl, alias, aliasStatus]);

  useEffect(() => {
    const normalizedAlias = alias.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (!alias.trim()) { setAliasStatus('idle'); setSuggestions([]); return; }
    if (alias.length < 3) { setAliasStatus('invalid'); setSuggestions([]); return; }
    if (alias === distData?.alias) { setAliasStatus('available'); return; }
    setAliasStatus('checking');
    const timer = setTimeout(() => {
      if (TAKEN_ALIASES.includes(normalizedAlias)) {
        setAliasStatus('taken');
        const patterns = [`${normalizedAlias}-pro`, `coach-${normalizedAlias}`, `${normalizedAlias}-vitality`];
        setSuggestions(patterns.filter(s => !TAKEN_ALIASES.includes(s)));
      } else { setAliasStatus('available'); setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [alias, distData?.alias]);

  const handleCopy = (type: 'smart' | 'direct') => {
    const text = type === 'smart' ? smartLink : `${cleanShopUrl}/enrollment`;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveConfig = () => {
    if (!customId || !customShop || (aliasStatus !== 'available' && aliasStatus !== 'idle')) return;
    setIsSaving(true);
    const savedUser = localStorage.getItem('jose_current_user');
    if (savedUser) {
      const user: UserAccount = JSON.parse(savedUser);
      user.distData = { ...user.distData, id: customId, shopUrl: customShop, alias: aliasStatus === 'available' ? alias : distData?.alias };
      localStorage.setItem('jose_current_user', JSON.stringify(user));
    }
    setTimeout(() => { setIsSaving(false); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); }, 800);
  };

  const isInvalidConfig = !customId || !customShop || aliasStatus === 'taken' || aliasStatus === 'invalid';

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4 pt-10">
      <div className={`relative overflow-hidden rounded-[2.5rem] p-10 lg:p-16 text-white shadow-2xl group`}>
        <div className="absolute inset-0 synergy-bg transition-transform duration-700 group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-black/20"></div>
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
          <button onClick={() => onViewChange(AppView.CHAT)} className="px-10 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95">
            Lancer Coach JOSÉ <ArrowRight size={22} className="text-green-600" />
          </button>
        </div>
      </div>

      <div className="relative glass-effect dark:bg-slate-900/50 rounded-[3rem] p-10 border-2 border-white dark:border-slate-800 shadow-2xl transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 synergy-bg rounded-2xl flex items-center justify-center text-white shadow-xl animate-pulse-synergy">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Générateur de Croissance</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                  <Heart size={14} className="text-green-500" /> Validation NDSA en temps réel
                </p>
              </div>
            </div>
            <button onClick={handleSaveConfig} disabled={isSaving || isInvalidConfig} className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${saveStatus === 'success' ? 'bg-green-600 text-white' : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-black'}`}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {saveStatus === 'success' ? 'Enregistrée' : 'Enregistrer'}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
          <div className="group space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">ID NeoLife</label>
              <div className="relative">
                <input type="text" value={customId} onChange={(e) => setCustomId(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white font-black pl-12" placeholder="ID Distributeur" />
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
          </div>
          <div className="group space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">URL Boutique</label>
              <div className="relative">
                <input type="text" value={customShop} onChange={(e) => setCustomShop(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-green-500 transition-all text-slate-900 dark:text-white font-black pl-12" placeholder="shopneolife.com/..." />
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
          </div>
          <div className="group space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Alias</label>
              <div className="relative">
                <input type="text" value={alias} onChange={(e) => setAlias(e.target.value.toLowerCase())} className={`w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl outline-none transition-all text-slate-900 dark:text-white font-black pl-12 ${aliasStatus === 'available' ? 'border-green-500' : aliasStatus === 'taken' ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'}`} placeholder="Ex: vitalite" />
                <Wand2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
          </div>
        </div>

        {smartLink && !isInvalidConfig && (
          <div className="p-8 synergy-bg rounded-[2.5rem] text-white shadow-2xl mt-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h4 className="font-black text-2xl uppercase tracking-tighter">Votre Smart Link</h4>
              <button onClick={() => handleCopy('smart')} className="px-10 py-5 bg-white text-blue-700 rounded-2xl font-black text-sm uppercase shadow-xl active:scale-95 transition-all">
                {copied === 'smart' ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div className="bg-black/20 p-6 rounded-2xl border border-white/20 font-mono text-xs break-all opacity-80">{smartLink}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[{ label: 'Conversion', value: '42%', color: 'blue', icon: <TrendingUp /> }, { label: 'Vitalité', value: '856', color: 'green', icon: <Activity /> }, { label: 'Rang', value: 'Elite', color: 'amber', icon: <Crown /> }].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-lg group hover:scale-105 transition-all flex flex-col items-center md:items-start">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all group-hover:synergy-bg group-hover:text-white ${stat.color === 'blue' ? 'bg-blue-100 text-blue-600' : stat.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{stat.icon}</div>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
