
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Mic, Activity, ShieldCheck, LogOut, Zap, Menu, X } from 'lucide-react';
import { AppView, DistributorData, UserAccount } from './types';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import LiveSession from './components/LiveSession';
import CellularCheck from './components/CellularCheck';
import Academy from './components/Academy';
import ControlTower from './components/ControlTower';
import SocialSync from './components/SocialSync';
import IAWorld from './components/IAWorld';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK, FOUNDER_EMAIL } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('jose_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOwner, setIsOwner] = useState(false);
  const [initialIntent, setInitialIntent] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setIsOwner(currentUser.distData.id === JOSE_ID || currentUser.email === FOUNDER_EMAIL);
    }
  }, [currentUser]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('jose_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsOwner(false);
    localStorage.removeItem('jose_current_user');
  };

  const handleViewChange = (view: AppView) => {
    setActiveView(view);
    // Reset intent when changing views unless specified
    if (view !== AppView.CHAT) {
      setInitialIntent(null);
    }
  };

  if (!currentUser) return <Auth onLogin={handleLogin} />;

  return (
    <div className={`flex h-screen overflow-hidden ${isOwner ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Sidebar activeView={activeView} onViewChange={handleViewChange} isOpen={isSidebarOpen} isOwner={isOwner} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className={`h-20 border-b flex items-center justify-between px-6 shrink-0 ${isOwner ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h2 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3">
            {activeView.replace('_', ' ')} 
            {isOwner && <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] rounded-full">SOUVERAIN</span>}
          </h2>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar">
          {activeView === AppView.DASHBOARD && <Dashboard onViewChange={handleViewChange} isOwner={isOwner} distData={currentUser.distData} />}
          {activeView === AppView.CHAT && <ChatBot distData={currentUser.distData} isOwner={isOwner} initialIntent={initialIntent} />}
          {activeView === AppView.IA_WORLD && <IAWorld />}
          {activeView === AppView.LIVE && <LiveSession isOwner={isOwner} />}
          {activeView === AppView.CELLULAR_CHECK && <CellularCheck onViewChange={handleViewChange} onSetIntent={setInitialIntent} />}
          {activeView === AppView.ACADEMY && <Academy />}
          {activeView === AppView.CONTROL_TOWER && <ControlTower />}
          {activeView === AppView.SOCIAL_SYNC && <SocialSync distId={currentUser.distData.id} shopUrl={currentUser.distData.shopUrl} />}
        </section>
      </main>
    </div>
  );
};

export default App;
