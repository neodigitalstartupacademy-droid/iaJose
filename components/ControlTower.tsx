
import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Zap, Layers, Globe, Palette, Copy, Check, Save, Loader2, Wand2, ArrowRight, Share2, Rocket, Layout, Settings, Key, ShoppingCart, Users, Banknote, BarChart3, TrendingUp, Search, BookOpen, Cpu, Terminal, Sparkles, Server, Code, Database, Smartphone, CheckCircle } from 'lucide-react';
import { NeoLifeSale, UserAccount } from '../types';

const SYNERGY_SWATCHES = [
  { name: 'Bleu NDSA', hex: '#2563eb' },
  { name: 'Vert NeoLife', hex: '#16a34a' },
  { name: 'Or Souverain', hex: '#d97706' },
  { name: 'Rouge Élite', hex: '#dc2626' },
  { name: 'Violet Vision', hex: '#7c3aed' },
  { name: 'Gris Cerveau', hex: '#334155' }
];

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

  const stats = useMemo(() => {
    return MOCK_SALES.reduce((acc, sale) => ({
      pv: acc.pv + sale.pv,
      bv: acc.bv + sale.bv,
      comm: acc.comm + sale.commission
    }), { pv: 0, bv: 0, comm: 0 });
  }, []);

  // Live Preview of Color
  useEffect(() => {
    document.documentElement.style.setProperty('--ndsa-blue', primaryColor);
  }, [primaryColor]);

  const handleDeploy = () => {
    setIsDeploying(true);
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
    }, 1500);
  };

  const handleGenerateClone = () => {
    if (!cloningDomain) return;
    const config = {
      domain: cloningDomain,
      branding: { name: brandName, primaryColor, customPrompt },
      distributorId: currentUser?.distData?.id || "NEW_ID"
    };
    setClonePackage(JSON.stringify(config, null, 2));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-6">
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

      {activeTab === 'brand' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3.5rem] p-10 md:p-14 shadow-sm space-y-12">
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
                  <Palette className="text-blue-600" size={24} />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Identité Visuelle & Couleurs</h3>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Choix Immédiat de la Couleur Souveraine</label>
                  <div className="flex flex-wrap gap-4">
                    {SYNERGY_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        onClick={() => setPrimaryColor(swatch.hex)}
                        className={`group flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${primaryColor === swatch.hex ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}
                      >
                        <div className="w-8 h-8 rounded-lg shadow-md transition-transform group-hover:scale-110" style={{ backgroundColor: swatch.hex }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{swatch.name}</span>
                      </button>
                    ))}
                    <div className="flex items-center gap-4 ml-auto p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300">
                      <span className="text-[9px] font-black text-slate-500 uppercase">Custom</span>
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 bg-transparent cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de l'Agent IA</label>
                     <input 
                      type="text" 
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-blue-600 text-slate-900 dark:text-white font-bold transition-all shadow-inner"
                     />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prompt Maître (Logique de closing)</label>
                  <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Instructions profondes pour l'IA (ex: Insister sur la duplication NDSA)..."
                    className="w-full h-48 p-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] outline-none focus:border-blue-600 text-slate-800 dark:text-white font-medium resize-none shadow-inner"
                  />
                </div>

                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="w-full py-7 synergy-bg text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  {isDeploying ? <Loader2 className="animate-spin" /> : deploySuccess ? <Check className="text-green-400" /> : <Rocket size={20} />}
                  {deploySuccess ? 'SOUVERAINETÉ DÉPLOYÉE !' : 'DÉPLOYER LA NOUVELLE IDENTITÉ'}
                </button>
            </div>
          </div>
          
          <div className="space-y-8">
             <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl space-y-10 sticky top-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-xl transition-all duration-500" style={{ backgroundColor: primaryColor }}>
                    {brandName.substring(0,1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-2xl uppercase tracking-tighter">{brandName}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Aperçu de Marque</p>
                  </div>
                </div>
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-4">
                   <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Poste de Mentor</p>
                   <p className="text-sm font-medium opacity-70 italic leading-relaxed">
                     "Je suis votre architecte de croissance. Ma configuration est désormais optimisée pour refléter votre leadership souverain."
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full synergy-bg w-2/3"></div>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full synergy-bg w-1/2"></div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total PV', val: stats.pv, color: 'text-blue-500', icon: <BarChart3 size={20} /> },
              { label: 'Total BV', val: stats.bv, color: 'text-green-500', icon: <TrendingUp size={20} /> },
              { label: 'Commissions', val: `${stats.comm.toFixed(2)}€`, color: 'text-amber-500', icon: <Banknote size={20} /> },
              { label: 'Clients Actifs', val: MOCK_SALES.length, color: 'text-purple-500', icon: <Users size={20} /> }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-10 rounded-[3rem] shadow-sm group">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">{stat.label}</span>
                <span className={`text-5xl font-black tracking-tighter ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[4rem] p-12 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Journal des Ventes Réseau</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-6">Produit</th>
                    <th className="pb-6">PV/BV</th>
                    <th className="pb-6 text-right">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {MOCK_SALES.map((sale) => (
                    <tr key={sale.id} className="group">
                      <td className="py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white">{sale.productName}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{sale.customerName}</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className="text-xs font-bold text-blue-600">{sale.pv} PV / {sale.bv} BV</span>
                      </td>
                      <td className="py-6 text-right font-black text-amber-500">+{sale.commission.toFixed(2)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'white-label' && (
        <div className="bg-slate-950 rounded-[4rem] p-16 text-white shadow-2xl space-y-12">
           <div className="flex items-center gap-6">
              <div className="p-5 bg-blue-600 rounded-[2rem] shadow-xl shadow-blue-500/20"><Cpu size={40} /></div>
              <div>
                <h3 className="text-4xl font-black uppercase tracking-tighter">Package de Duplication</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Export industriel du système GMBC-OS</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Domaine de destination</label>
                 <input 
                  type="text" 
                  value={cloningDomain} 
                  onChange={(e) => setCloningDomain(e.target.value)}
                  placeholder="ex: vitalite-pro.io"
                  className="w-full p-6 bg-white/5 border-2 border-white/10 rounded-2xl outline-none focus:border-blue-500 text-xl font-bold transition-all"
                 />
                 <button onClick={handleGenerateClone} className="w-full py-7 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">GÉNÉRER LE CLONE JSON</button>
              </div>
              {clonePackage && (
                <div className="bg-black/50 border border-white/10 rounded-[2rem] p-8 font-mono text-[11px] text-blue-300 overflow-auto max-h-[300px]">
                   {clonePackage}
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ControlTower;
