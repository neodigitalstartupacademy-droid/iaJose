
import React, { useState } from 'react';
import { ShieldCheck, Zap, Layers, Globe, Palette, Copy, Check, Save, Loader2, Wand2, ArrowRight, Share2, Rocket, Layout, Settings, Key } from 'lucide-react';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK } from '../constants';

const ControlTower: React.FC = () => {
  const [brandName, setBrandName] = useState('Coach JOSÉ');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [licenses, setLicenses] = useState([
    { id: 'LIC-001', client: 'BioHealth Corp', status: 'Active', created: '12/05/2024' },
    { id: 'LIC-002', client: 'Vitality Dynamics', status: 'Pending', created: '15/06/2024' }
  ]);

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 2000);
  };

  const generateLicense = () => {
    const newLic = { 
      id: `LIC-${Math.floor(Math.random()*1000).toString().padStart(3, '0')}`,
      client: 'Nouveau Client',
      status: 'Active',
      created: new Date().toLocaleDateString()
    };
    setLicenses([newLic, ...licenses]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Tour de Contrôle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-950 text-blue-500 rounded-2xl shadow-xl rotate-12">
               <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Module Architecte Souverain</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
            TOUR DE <span className="text-blue-600">CONTRÔLE</span>
          </h1>
          <p className="mt-6 text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
            Clonez le système GMBC-OS, personnalisez l'IA et déployez-la sous votre propre marque.
          </p>
        </div>
        
        <div className="flex gap-4">
          <button onClick={generateLicense} className="px-8 py-5 bg-white border-2 border-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3">
            <Key size={18} /> Générer Licence
          </button>
          <button onClick={handleDeploy} className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            {isDeploying ? <Loader2 className="animate-spin" /> : deploySuccess ? <Check className="text-green-400" /> : <Rocket size={18} />}
            {deploySuccess ? 'DÉPLOYÉ !' : 'DÉPLOYER WHITE LABEL'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Paramètres de Marque */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-10">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <Palette className="text-blue-600" size={24} />
                <h3 className="text-xl font-black text-slate-900 uppercase">Identité Visuelle White Label</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de l'Agent IA</label>
                   <input 
                    type="text" 
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold"
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Couleur Primaire (HEX)</label>
                   <div className="flex gap-3">
                      <input 
                        type="color" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-14 w-20 p-1 bg-white border-2 border-slate-100 rounded-xl cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-mono font-bold"
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructions Système Clonnées (Prompt)</label>
                <textarea 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Redéfinissez la personnalité et les objectifs de cette IA clonée..."
                  className="w-full h-48 p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:border-blue-600 focus:bg-white transition-all font-medium resize-none"
                />
              </div>
           </div>

           {/* Liste des Licences Actives */}
           <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 uppercase flex items-center gap-3">
                  <Layout className="text-blue-600" size={24} /> Licences Commerciales
                </h3>
                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">{licenses.length} ACTIVES</span>
              </div>

              <div className="space-y-4">
                {licenses.map((lic) => (
                  <div key={lic.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors font-black text-xs">
                         ID
                       </div>
                       <div>
                         <p className="text-sm font-black text-slate-900">{lic.client}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lic.id} • Créé le {lic.created}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${lic.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                         {lic.status}
                       </span>
                       <button className="p-3 bg-white text-slate-300 hover:text-blue-600 rounded-xl transition-all shadow-sm">
                         <Settings size={18} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Sidebar Prévisualisation */}
        <div className="space-y-8">
           <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl space-y-8 sticky top-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl" style={{ backgroundColor: primaryColor }}>
                  {brandName.substring(0,1).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-xl uppercase tracking-tighter">{brandName}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Version White Label 3.1</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Statut du déploiement</p>
                   <div className="flex items-center justify-between">
                     <span className="text-sm font-bold">Système Central</span>
                     <span className="flex items-center gap-2 text-green-400 text-xs font-black"><Check size={14} /> OPTIMISÉ</span>
                   </div>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Estimation de Valeur</p>
                   <div className="text-3xl font-black tracking-tighter text-blue-500">2,400 € / an</div>
                   <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Par licence déployée</p>
                </div>
              </div>

              <div className="pt-6">
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  En clonant ce système, vous accordez une licence d'utilisation à votre client. La souveraineté des données reste sous le contrôle NDSA via GMBC-OS.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ControlTower;
