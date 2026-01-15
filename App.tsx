
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Mic, Image as ImageIcon, Activity, ShieldCheck, ChevronRight, Menu, X, Crown, AlertTriangle, Wallet } from 'lucide-react';
import { AppView, DistributorData } from './types';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import LiveSession from './components/LiveSession';
import VisualStudio from './components/VisualStudio';
import CellularCheck from './components/CellularCheck';
import Sidebar from './components/Sidebar';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [distData, setDistData] = useState<DistributorData | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refId = params.get('ref');
    const shop = params.get('shop');

    if (refId === JOSE_ID) {
      setIsOwner(true);
    }

    if (refId && shop) {
      const storedTrial = localStorage.getItem(`trial_${refId}`);
      const joinDate = storedTrial ? parseInt(storedTrial) : Date.now();
      if (!storedTrial) localStorage.setItem(`trial_${refId}`, joinDate.toString());

      setDistData({
        id: refId,
        shopUrl: shop,
        joinDate: joinDate
      });
    }

    const checkKey = async () => {
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="max-w-md w-full glass-effect p-8 rounded-2xl shadow-xl">
          <ShieldCheck size={48} className="text-blue-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Activation du Système</h1>
          <button onClick={handleSelectKey} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl mt-6">
            Activer Coach JOSÉ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isOwner ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden">
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isOpen={isSidebarOpen} 
        isOwner={isOwner}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        <header className={`h-16 border-b flex items-center justify-between px-6 lg:px-10 shrink-0 ${isOwner ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold capitalize">
              {activeView.replace('_', ' ')} {isOwner && <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-500 text-[10px] rounded-full uppercase">Owner Mode</span>}
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col text-right">
                <span className={`text-xs font-bold ${isOwner ? 'text-amber-500' : 'text-blue-600'}`}>
                    ID: {distData?.id || JOSE_ID}
                </span>
                <span className="text-[10px] text-slate-400">© ABADA JOSÉ - NDSA</span>
             </div>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${isOwner ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-blue-100 border-blue-200 text-blue-700'}`}>
               {isOwner ? <Crown size={16} /> : (distData?.id?.substring(0,2) || 'AJ')}
             </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          {activeView === AppView.DASHBOARD && <Dashboard onViewChange={setActiveView} isOwner={isOwner} distData={distData} />}
          {activeView === AppView.CHAT && <ChatBot distData={distData} isOwner={isOwner} />}
          {activeView === AppView.LIVE && <LiveSession isOwner={isOwner} />}
          {activeView === AppView.VISUALS && <VisualStudio isOwner={isOwner} />}
          {activeView === AppView.CELLULAR_CHECK && <CellularCheck isOwner={isOwner} />}
        </section>
      </main>
    </div>
  );
};

export default App;
