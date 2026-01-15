
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Mic, Image as ImageIcon, Activity, ShieldCheck, ChevronRight, Menu, X, Crown, AlertTriangle, Wallet, LogOut, Zap, Layout, Share2 } from 'lucide-react';
import { AppView, DistributorData, UserAccount } from './types';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import LiveSession from './components/LiveSession';
import VisualStudio from './components/VisualStudio';
import CellularCheck from './components/CellularCheck';
import Academy from './components/Academy';
import ControlTower from './components/ControlTower';
import SocialSync from './components/SocialSync';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK, FOUNDER_EMAIL } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('jose_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOwner, setIsOwner] = useState(false);
  const [initialIntent, setInitialIntent] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const shop = params.get('shop');
    const intent = params.get('intent');
    
    if (intent) setInitialIntent(intent);

    // Si on arrive via un lien Social Sync, on initialise un utilisateur temporaire ou on adapte le contexte
    if (ref && shop && !currentUser) {
      const visitorUser: UserAccount = {
        email: 'prospect@socialsync.ia',
        distData: { 
          id: ref, 
          shopUrl: decodeURIComponent(shop), 
          joinDate: Date.now(),
          alias: params.get('alias') || undefined
        }
      };
      setCurrentUser(visitorUser);
      setActiveView(AppView.CHAT);
    }

    if (currentUser) {
      if (currentUser.distData.id === JOSE_ID || currentUser.email === FOUNDER_EMAIL) {
        setIsOwner(true);
      }
      
      if (intent === 'health') {
        setActiveView(AppView.CELLULAR_CHECK);
      } else if (intent === 'welcome') {
        setActiveView(AppView.CHAT);
      }
    }

    const checkKey = async () => {
      if (isOwner && process.env.API_KEY) {
        setHasApiKey(true);
        return;
      }
      if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, [currentUser, isOwner]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('jose_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsOwner(false);
    localStorage.removeItem('jose_current_user');
  };

  const handleSelectKey = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  if (!hasApiKey && !isOwner) {
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

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isOwner ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={`fixed top-4 left-4 z-50 p-2 rounded-lg shadow-md lg:hidden ${isOwner ? 'bg-slate-800 text-amber-500' : 'bg-white text-slate-900'}`}>
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isOpen={isSidebarOpen} 
        isOwner={isOwner}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        <header className={`h-20 border-b flex items-center justify-between px-6 lg:px-12 shrink-0 ${isOwner ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black tracking-tighter capitalize flex items-center gap-3">
              {activeView.replace('_', ' ')} 
              {isOwner && (
                <span className="flex items-center gap-1.5 px-4 py-1 bg-blue-500/10 text-blue-500 text-[10px] rounded-full uppercase border border-blue-500/20">
                  <Zap size={12} className="fill-current" /> NDSA ARCHITECTE
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-5">
             <div className="hidden md:flex flex-col text-right">
                <span className={`text-xs font-black tracking-widest ${isOwner ? 'text-blue-500' : 'text-blue-600'}`}>
                    {isOwner ? 'SOUVERAIN' : `ID: ${currentUser.distData.id}`}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[200px] font-bold uppercase tracking-widest">{currentUser.email}</span>
             </div>
             <button onClick={handleLogout} className={`p-3 rounded-xl transition-all ${isOwner ? 'hover:bg-red-500/10 text-slate-500 hover:text-red-400' : 'hover:bg-slate-100 text-slate-400'}`}>
               <LogOut size={20} />
             </button>
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border transition-all duration-500 shadow-lg ${isOwner ? 'bg-slate-800 border-blue-500/50 text-blue-500' : 'bg-blue-100 border-blue-200 text-blue-700'}`}>
               {isOwner ? <Zap size={22} className="animate-pulse" /> : (currentUser.email.substring(0,1).toUpperCase())}
             </div>
          </div>
        </header>

        <section className={`flex-1 overflow-y-auto custom-scrollbar p-0 ${isOwner ? 'bg-slate-950/50' : ''}`}>
          {activeView === AppView.DASHBOARD && <Dashboard onViewChange={setActiveView} isOwner={isOwner} distData={currentUser.distData} />}
          {activeView === AppView.CHAT && <ChatBot distData={currentUser.distData} isOwner={isOwner} initialIntent={initialIntent} />}
          {activeView === AppView.LIVE && <LiveSession isOwner={isOwner} />}
          {activeView === AppView.VISUALS && <VisualStudio isOwner={isOwner} />}
          {activeView === AppView.CELLULAR_CHECK && <CellularCheck isOwner={isOwner} />}
          {activeView === AppView.ACADEMY && <Academy />}
          {activeView === AppView.CONTROL_TOWER && <ControlTower />}
          {activeView === AppView.SOCIAL_SYNC && <SocialSync distId={currentUser.distData.id} shopUrl={currentUser.distData.shopUrl} />}
        </section>
      </main>
    </div>
  );
};

export default App;
