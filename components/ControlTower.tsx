
import React, { useState, useMemo } from 'react';
import { ShieldCheck, Zap, Layers, Globe, Palette, Copy, Check, Save, Loader2, Wand2, ArrowRight, Share2, Rocket, Layout, Settings, Key, ShoppingCart, Users, Banknote, BarChart3, TrendingUp, Search } from 'lucide-react';
import { NeoLifeSale } from '../types';

const MOCK_SALES: NeoLifeSale[] = [
  { id: 'S-9821', productName: 'Pro Vitality Pack', customerName: 'Jean Dupont', customerContact: 'jean.d@email.com', pv: 36, bv: 42, commission: 8.50, date: Date.now() - 86400000 },
  { id: 'S-9822', productName: 'Tre-en-en (120)', customerName: 'Marie Curie', customerContact: '+33 6 12 34 56 78', pv: 24, bv: 28, commission: 5.60, date: Date.now() - 172800000 },
  { id: 'S-9823', productName: 'NeoLifeShake Vanilla', customerName: 'Marc Antoine', customerContact: 'm.antoine@web.fr', pv: 28, bv: 32, commission: 7.20, date: Date.now() - 259200000 },
  { id: 'S-9824', productName: 'Carotenoid Complex', customerName: 'Sophie Germain', customerContact: 'sophie.g@email.com', pv: 38, bv: 44, commission: 9.10, date: Date.now() - 345600000 },
];

const ControlTower: React.FC = () => {
  const [brandName, setBrandName] = useState('Coach JOSÉ');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'brand' | 'licenses'>('sales');

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
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Navigation de la Tour */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-900 border border-blue-500/30 text-blue-500 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.2)] rotate-12">
               <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Module Architecte Souverain</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
            TOUR DE <span className="text-blue-600">CONTRÔLE</span>
          </h1>
        </div>
        
        <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
           {[
             { id: 'sales', label: 'Ventes & PV', icon: <ShoppingCart size={16} /> },
             { id: 'brand', label: 'Branding', icon: <Palette size={16} /> },
             { id: 'licenses', label: 'Licences', icon: <Key size={16} /> }
           ].map(tab => (
             <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
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
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col gap-2 relative overflow-hidden group hover:border-blue-500/50 transition-all">
                <div className={`absolute top-0 right-0 p-6 opacity-5 ${stat.color} group-hover:opacity-10 transition-opacity`}>
                   {stat.icon}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>

          {/* Table des Ventes */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] overflow-hidden">
            <div className="p-10 border-b border-slate-800 flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">Journal des Transactions NeoLife</h3>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Données synchronisées en temps réel</p>
               </div>
               <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input 
                  type="text" 
                  placeholder="Rechercher client ou produit..." 
                  className="bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-6 text-xs text-white outline-none focus:border-blue-500 transition-all w-64"
                 />
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="px-10 py-6">Produit</th>
                    <th className="px-6 py-6">Client & Contact</th>
                    <th className="px-6 py-6 text-center">PV</th>
                    <th className="px-6 py-6 text-center">BV</th>
                    <th className="px-6 py-6 text-right">Commission</th>
                    <th className="px-10 py-6 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-blue-500/5 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white">{sale.productName}</span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{sale.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-300">{sale.customerName}</span>
                          <span className="text-[10px] font-medium text-blue-500 opacity-70">{sale.customerContact}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-black rounded-lg">{sale.pv}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-black rounded-lg">{sale.bv}</span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-sm font-black text-amber-500">+{sale.commission.toFixed(2)}€</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[9px] font-black uppercase rounded-full">Validé</span>
                      </td>
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
            <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 shadow-sm space-y-10">
                <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                  <Palette className="text-blue-600" size={24} />
                  <h3 className="text-xl font-black text-white uppercase">Identité Visuelle White Label</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nom de l'Agent IA</label>
                     <input 
                      type="text" 
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full p-5 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-600 text-white font-bold transition-all"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Couleur Primaire (HEX)</label>
                     <div className="flex gap-3">
                        <input 
                          type="color" 
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="h-14 w-20 p-1 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 p-5 bg-slate-950 border border-slate-800 rounded-2xl outline-none text-white font-mono font-bold"
                        />
                     </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instructions Système (Prompt)</label>
                  <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Redéfinissez la personnalité et les objectifs de cette IA..."
                    className="w-full h-48 p-6 bg-slate-950 border border-slate-800 rounded-[2rem] outline-none focus:border-blue-600 text-white font-medium resize-none"
                  />
                </div>

                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="w-full py-6 synergy-bg text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {isDeploying ? <Loader2 className="animate-spin" /> : deploySuccess ? <Check className="text-green-400" /> : <Rocket size={18} />}
                  {deploySuccess ? 'DÉPLOIEMENT RÉUSSI !' : 'DÉPLOYER LA MISE À JOUR'}
                </button>
            </div>
          </div>
          
          <div className="space-y-8">
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl space-y-8 sticky top-8 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]" style={{ backgroundColor: primaryColor }}>
                    {brandName.substring(0,1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-tighter">{brandName}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Prévisualisation Architecte</p>
                  </div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Statut Système</p>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold">Moteur Gemini</span>
                     <span className="flex items-center gap-2 text-green-400 text-xs font-black"><Check size={14} /> OPTIMISÉ</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'licenses' && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] p-10 animate-in fade-in duration-500">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
                <Layout className="text-blue-600" size={24} /> Licences Commerciales NDSA
              </h3>
              <button className="px-6 py-3 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Générer Nouvelle Clé</button>
           </div>
           <div className="p-20 border-4 border-dashed border-slate-800 rounded-[2.5rem] text-center">
             <Key size={48} className="text-slate-700 mx-auto mb-6" />
             <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Section sécurisée par le protocole de souveraineté</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ControlTower;
