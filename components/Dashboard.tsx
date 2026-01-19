
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, MessageSquare, Shield, ShieldCheck, Users, ArrowRight, Link, Copy, Check, Clock, Crown, TrendingUp, Share2, BarChart3, Target, MousePointer2, Info, UserPlus, ShoppingCart, Zap, UserCheck, AlertCircle, Sparkles, Heart, Loader2, XCircle, CheckCircle2, Save, Globe, Wand2, ShieldAlert, ScrollText } from 'lucide-react';
import { AppView, DistributorData, UserAccount, Language } from '../types';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK } from '../constants';
import { translations } from '../translations';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
  isOwner: boolean;
  distData: DistributorData | null;
  language: Language;
}

type AliasStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const WISDOM_NUGGETS = [
  "La santé ne commence pas dans l'assiette, mais dans l'état intérieur.",
  "Un patient guéri est un client perdu : brisez la matrice de la maladie.",
  "Le vieillissement n'est pas une maladie, mais un épuisement de nutriments.",
  "Vos cellules ne demandent pas des pilules, elles demandent de la vie.",
  "La Médecine du Futur est la nutrition cellulaire de précision.",
  "Le Smart Link est votre arme de duplication massive."
];

const Dashboard: React.FC<DashboardProps> = ({ onViewChange, isOwner, distData, language }) => {
  const t = translations[language];
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const [copied, setCopied] = useState<'smart' | 'direct' | null>(null);
  const [customId, setCustomId] = useState(distData?.id || '');
  const [customShop, setCustomShop] = useState(distData?.shopUrl || '');
  const [alias, setAlias] = useState(distData?.alias || '');
  const [aliasStatus, setAliasStatus] = useState<AliasStatus>(distData?.alias ? 'available' : 'idle');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

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
    const interval = setInterval(() => {
      setWisdomIdx(prev => (prev + 1) % WISDOM_NUGGETS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!alias.trim()) { setAliasStatus('idle'); return; }
    if (alias.length < 3) { setAliasStatus('invalid'); return; }
    setAliasStatus('available');
  }, [alias]);

  const handleCopy = (type: 'smart' | 'direct') => {
    const text = type === 'smart' ? smartLink : `${cleanShopUrl}/enrollment`;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveConfig = () => {
    setIsSaving(true);
    const savedUser = localStorage.getItem('jose_current_user');
    if (savedUser) {
      const user: UserAccount = JSON.parse(savedUser);
      user.distData = { ...user.distData, id: customId, shopUrl: customShop, alias: alias };
      localStorage.setItem('jose_current_user', JSON.stringify(user));
    }
    setTimeout(() => { setIsSaving(false); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4 pt-10">
      {/* Wisdom Ticker */}
      <div className="bg-blue-600/10 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 overflow-hidden relative group">
         <div className="flex items-center gap-4 animate-in slide-in-from-right duration-1000" key={wisdomIdx}>
            <ScrollText size={18} className="text-blue-600 shrink-0" />
            <p className="text-sm font-bold text-slate-700 dark:text-blue-300 italic">
               "{WISDOM_NUGGETS[wisdomIdx]}"
            </p>
         </div>
         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500/40 uppercase tracking-widest hidden md:block">NDSA ARCHIVES</div>
      </div>

      <div className={`relative overflow-hidden rounded-[2.5rem] p-10 lg:p-16 text-white shadow-2xl group`}>
        <div className="absolute inset-0 synergy-bg transition-transform duration-700 group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center gap-2">
              <Sparkles size={12} /> Synergy Platform v4.5
            </span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tighter uppercase">
            {language === Language.FR ? "L'intelligence NDSA au cœur de " : "NDSA Intelligence at the heart of "}
            <span className="text-green-300">{language === Language.FR ? "votre croissance NeoLife." : "your NeoLife growth."}</span>
          </h1>
          <button onClick={() => onViewChange(AppView.CHAT)} className="px-10 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95">
            {t.chat} <ArrowRight size={22} className="text-green-600" />
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
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{t.growthGenerator}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-500" /> Validation GMBC-OS
                </p>
              </div>
            </div>
            <button onClick={handleSaveConfig} disabled={isSaving} className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 ${saveStatus === 'success' ? 'bg-green-600 text-white' : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-black'}`}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
              {saveStatus === 'success' ? t.saved : t.save}
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
          <div className="group space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">ID NeoLife</label>
              <div className="relative">
                <input type="text" value={customId} onChange={(e) => setCustomId(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white font-black pl-12" placeholder={t.idPlaceholder} />
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
          </div>
          <div className="group space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">URL Boutique</label>
              <div className="relative">
                <input type="text" value={customShop} onChange={(e) => setCustomShop(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-green-500 transition-all text-slate-900 dark:text-white font-black pl-12" placeholder={t.shopPlaceholder} />
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
          </div>
          <div className="group space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Alias</label>
              <div className="relative">
                <input type="text" value={alias} onChange={(e) => setAlias(e.target.value.toLowerCase())} className={`w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 rounded-2xl outline-none transition-all text-slate-900 dark:text-white font-black pl-12 ${aliasStatus === 'available' ? 'border-green-500' : 'border-slate-100'}`} placeholder={t.aliasPlaceholder} />
                <Wand2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
          </div>
        </div>

        {smartLink && (
          <div className="p-8 synergy-bg rounded-[2.5rem] text-white shadow-2xl mt-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h4 className="font-black text-2xl uppercase tracking-tighter">{t.smartLinkLabel}</h4>
              <button onClick={() => handleCopy('smart')} className="px-10 py-5 bg-white text-blue-700 rounded-2xl font-black text-sm uppercase shadow-xl active:scale-95 transition-all">
                {copied === 'smart' ? t.saved : t.copy}
              </button>
            </div>
            <div className="bg-black/20 p-6 rounded-2xl border border-white/20 font-mono text-xs break-all opacity-80">{smartLink}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: t.conversion, value: '42%', color: 'blue', icon: <TrendingUp /> }, 
          { label: t.vitality, value: '856', color: 'green', icon: <Activity /> }, 
          { label: t.rank, value: 'Elite', color: 'amber', icon: <Crown /> }
        ].map((stat, i) => (
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
