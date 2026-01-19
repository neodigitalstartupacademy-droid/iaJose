
import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Zap, Layers, Globe, Palette, Copy, Check, Save, Loader2, Wand2, ArrowRight, Share2, Rocket, Layout, Settings, Key, ShoppingCart, Users, Banknote, BarChart3, TrendingUp, Search, BookOpen, Cpu, Terminal, Sparkles, Server, Code, Database, Smartphone, CheckCircle } from 'lucide-react';
import { NeoLifeSale, UserAccount } from '../types';

const MOCK_SALES: NeoLifeSale[] = [
  { id: 'S-9821', productName: 'Pro Vitality Pack', customerName: 'Jean Dupont', customerContact: 'jean.d@email.com', pv: 36, bv: 42, commission: 8.50, date: Date.now() - 86400000 },
  { id: 'S-9822', productName: 'Tre-en-en (120)', customerName: 'Marie Curie', customerContact: '+33 6 12 34 56 78', pv: 24, bv: 28, commission: 5.60, date: Date.now() - 172800000 },
  { id: 'S-9823', productName: 'NeoLifeShake Vanilla', customerName: 'Marc Antoine', customerContact: 'm.antoine@web.fr', pv: 28, bv: 32, commission: 7.20, date: Date.now() - 259200000 },
  { id: 'S-9824', productName: 'Carotenoid Complex', customerName: 'Sophie Germain', customerContact: 'sophie.g@email.com', pv: 38, bv: 44, commission: 9.10, date: Date.now() - 345600000 },
];

interface ControlTowerProps {
  language: any;
  onUpdateBranding?: () => void;
}

const ControlTower: React.FC<ControlTowerProps> = ({ language, onUpdateBranding }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('jose_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [brandName, setBrandName] = useState(currentUser?.distData?.branding?.name || 'Coach JOSÉ');
  const [primaryColor, setPrimaryColor] = useState(currentUser?.distData?.branding?.primaryColor || '#2563eb');
  const [customPrompt, setCustomPrompt] = useState(currentUser?.distData?.branding?.customPrompt || '');
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'brand' | 'white-label'>('sales');
  const [cloningDomain, setCloningDomain] = useState('');
  const [clonePackage, setClonePackage] = useState<string | null>(null);

  const [sales] = useState<NeoLifeSale[]>(MOCK_SALES);

  const stats = useMemo(() => {
    return sales.reduce((acc, sale) => ({
      pv: acc.pv + sale.pv,
      bv: acc.bv + sale.bv,
      comm: acc.comm + sale.commission
    }), { pv: 0, bv: 0, comm: 0 });
  }, [sales]);

  const handleDeploy = () => {
    setIsDeploying(true);
    
    // Actually save the branding to the current user
    const savedUser = localStorage.getItem('jose_current_user');
    if (savedUser) {
      const user: UserAccount = JSON.parse(savedUser);
      user.distData.branding = {
        name: brandName,
        primaryColor: primaryColor,
        customPrompt: customPrompt
      };
      localStorage.setItem('jose_current_user', JSON.stringify(user));
      setCurrentUser(user);
    }

    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      if (onUpdateBranding) onUpdateBranding();
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 2000);
  };

  const handleGenerateClone = () => {
    if (!cloningDomain) return;
    const config = {
      domain: cloningDomain,
      branding: {
        name: brandName,
        primaryColor: primaryColor,
        customPrompt: customPrompt
      },
      apiKeyPlaceholder: "INSERT_NEW_API_KEY_HERE",
      distributorId: currentUser?.distData?.id || "NEW_ID_HERE"
    };
    setClonePackage(JSON.stringify(config, null, 2));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-6">
      {/* Navigation de la Tour */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-900 border border-blue-500/30 text-blue-500 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.2)] rotate-12">
               <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Module Architecte Souverain</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
            TOUR DE <span className="text-blue-600">CONTRÔLE</span>
          </h1>
        </div>
        
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner overflow-x-auto max-w-full">
           {[
             { id: 'sales', label: 'Ventes & PV', icon: <ShoppingCart size={16} /> },
             { id: 'brand', label: 'Branding', icon: <Palette size={16} /> },
             { id: 'white-label', label: 'Duplication', icon: <Cpu size={16} /> }
           ].map(tab => (
             <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
             >
               {tab.icon} {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'sales' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total PV', val: stats.pv, color: 'text-blue-500', icon: <BarChart3 size={20} /> },
              { label: 'Total BV', val: stats.bv, color: 'text-green-500', icon: <TrendingUp size={20} /> },
              { label: 'Commissions', val: `${stats.comm.toFixed(2)}€`, color: 'text-amber-500', icon: <Banknote size={20} /> },
              { label: 'Clients Actifs', val: sales.length, color: 'text-purple-500', icon: <Users size={20} /> }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 p-8 rounded-[2.5rem] flex flex-col gap-2 relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-sm">
                <div className={`absolute top-0 right-0 p-6 opacity-5 ${stat.color} group-hover:opacity-10 transition-opacity`}>
                   {stat.icon}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>

          {/* Table des Ventes */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm">
            <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Journal des Transactions NeoLife</h3>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Données synchronisées en temps réel</p>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="px-10 py-6">Produit</th>
                    <th className="px-6 py-6">Client & Contact</th>
                    <th className="px-6 py-6 text-center">PV</th>
                    <th className="px-6 py-6 text-center">BV</th>
                    <th className="px-6 py-6 text-right">Commission</th>
                    <th className="px-10 py-6 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-blue-500/5 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{sale.productName}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{sale.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-bold text-slate-600 dark:text-slate-300">{sale.customerName}</td>
                      <td className="px-6 py-6 text-center"><span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black rounded-lg">{sale.pv}</span></td>
                      <td className="px-6 py-6 text-center"><span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-black rounded-lg">{sale.bv}</span></td>
                      <td className="px-6 py-6 text-right font-black text-amber-500">+{sale.commission.toFixed(2)}€</td>
                      <td className="px-10 py-6 text-right"><span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase rounded-full">Validé</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'brand' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm space-y-10">
                <div className="flex items-center gap-4 border-b border-slate-50 dark:border-slate-800 pb-6">
                  <Palette className="text-blue-600" size={24} />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Identité Visuelle White Label</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de l'Agent IA</label>
                     <input 
                      type="text" 
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-600 text-slate-900 dark:text-white font-bold transition-all"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Couleur Primaire</label>
                     <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-14 p-1 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer"
                     />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prompt Maître (Expertise Métier)</label>
                  <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Instructions profondes pour l'IA..."
                    className="w-full h-48 p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] outline-none focus:border-blue-600 text-slate-800 dark:text-white font-medium resize-none"
                  />
                </div>

                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="w-full py-6 synergy-bg text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isDeploying ? <Loader2 className="animate-spin" /> : deploySuccess ? <Check className="text-green-400" /> : <Rocket size={18} />}
                  {deploySuccess ? 'DÉPLOIEMENT RÉUSSI !' : 'DÉPLOYER LA CONFIGURATION'}
                </button>
            </div>
          </div>
          
          <div className="space-y-8">
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl space-y-8 sticky top-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl" style={{ backgroundColor: primaryColor }}>
                    {brandName.substring(0,1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-tighter">{brandName}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Aperçu White Label</p>
                  </div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                   <p className="text-sm font-medium opacity-60 italic leading-relaxed">
                     "Je suis votre assistant souverain optimisé pour votre business."
                   </p>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'white-label' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Colonne Guide Théorique & Pratique */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3.5rem] p-12 shadow-sm space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-3xl"><BookOpen size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Guide de Duplication White Label</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Protocole Industriel GMBC-OS</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm mb-4 flex items-center gap-2"><Server size={18} className="text-blue-500" /> Infrastructure Automatisée</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Pour dupliquer l'application vers un autre business, vous devez isoler l'architecture :
                  </p>
                  <ul className="mt-4 space-y-3">
                    <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle size={14} className="text-green-500" /> 1. Cloner l'instance Source</li>
                    <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle size={14} className="text-green-500" /> 2. Paramétrer la nouvelle Marque</li>
                    <li className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300"><CheckCircle size={14} className="text-green-500" /> 3. Injecter les Smart Links partenaires</li>
                  </ul>
                </div>

                <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800">
                  <h4 className="font-black text-blue-900 dark:text-blue-400 uppercase text-sm mb-4 flex items-center gap-2"><Code size={18} /> Injection Pratique</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300/70 leading-relaxed font-medium">
                    Le système utilise des <strong>Smart Links</strong>. Chaque business possède sa propre configuration exportable ci-contre.
                  </p>
                </div>
              </div>
            </div>

            {/* Colonne Action Directe */}
            <div className="space-y-8">
              <div className="bg-slate-950 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Cpu size={140} /></div>
                <div className="relative z-10 space-y-8">
                  <h3 className="text-4xl font-black uppercase tracking-tighter leading-[0.9]">Console de<br/><span className="text-blue-500">Duplication Directe</span></h3>
                  <p className="text-sm font-medium text-slate-400 max-w-sm">Générez le package de déploiement JSON pour cloner vos réglages.</p>
                  
                  <div className="space-y-5">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-3 focus-within:border-blue-500/50 transition-all">
                       <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nouveau Domaine (Destination)</label>
                       <div className="flex items-center gap-3">
                         <Globe size={18} className="text-slate-500" />
                         <input 
                           type="text" 
                           value={cloningDomain}
                           onChange={(e) => setCloningDomain(e.target.value)}
                           placeholder="ma-nouvelle-app.io" 
                           className="bg-transparent border-none outline-none text-white font-bold w-full text-lg placeholder:text-slate-800" 
                         />
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateClone}
                    className="w-full py-7 bg-white text-slate-950 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Sparkles size={18} className="text-blue-600 animate-pulse" /> GÉNÉRER LE PACKAGE CLONE
                  </button>

                  {clonePackage && (
                    <div className="mt-8 animate-in slide-in-from-top-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase text-slate-500">Config JSON</span>
                        <button onClick={() => {navigator.clipboard.writeText(clonePackage)}} className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1 hover:text-white"><Copy size={12}/> Copier</button>
                      </div>
                      <pre className="p-6 bg-black/50 border border-white/10 rounded-3xl font-mono text-[10px] text-blue-300 overflow-x-auto max-h-40 custom-scrollbar">
                        {clonePackage}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-10 synergy-bg rounded-[3.5rem] text-white shadow-2xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Terminal size={24} /></div>
                  <h4 className="text-xl font-black uppercase tracking-tighter">Statut du Réseau</h4>
                </div>
                <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase tracking-widest">
                  Chaque duplication renforce l'intelligence collective du système. Souveraineté totale.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlTower;
