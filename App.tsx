
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, Mic, Activity, ShieldCheck, LogOut, Zap, Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { AppView, DistributorData, UserAccount, Language } from './types';
import Dashboard from './components/Dashboard';
import ChatBot from './components/ChatBot';
import LiveSession from './components/LiveSession';
import CellularCheck from './components/CellularCheck';
import Academy from './components/Academy';
import ControlTower from './components/ControlTower';
import SocialSync from './components/SocialSync';
import IAWorld from './components/IAWorld';
import VisualStudio from './components/VisualStudio';
import FinancialFreedom from './components/FinancialFreedom';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK, FOUNDER_EMAIL } from './constants';
import { translations } from './translations';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('jose_language');
    return (saved as Language) || Language.FR;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('jose_theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('jose_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOwner, setIsOwner] = useState(false);
  const [initialIntent, setInitialIntent] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (currentUser) {
      setIsOwner(currentUser.distData.id === JOSE_ID || currentUser.email === FOUNDER_EMAIL);
      
      const branding = currentUser.distData.branding;
      if (branding?.primaryColor) {
        document.documentElement.style.setProperty('--ndsa-blue', branding.primaryColor);
      } else {
        document.documentElement.style.setProperty('--ndsa-blue', '#2563eb');
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('jose_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('jose_language', language);
  }, [language]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('jose_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsOwner(false);
    localStorage.removeItem('jose_current_user');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleViewChange = (view: AppView) => {
    setActiveView(view);
    if (view !== AppView.CHAT) {
      setInitialIntent(null);
    }
  };

  const refreshUser = () => {
    const saved = localStorage.getItem('jose_current_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  };

  if (!currentUser) return <Auth onLogin={handleLogin} />;

  const currentBrandName = currentUser.distData.branding?.name || t.appName;

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar 
        activeView={activeView} 
        onViewChange={handleViewChange} 
        isOpen={isSidebarOpen} 
        isOwner={isOwner} 
        language={language}
        brandName={currentBrandName}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className={`h-20 border-b flex items-center justify-between px-6 shrink-0 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500">
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3">
              {t[activeView as keyof typeof t] || activeView.replace('_', ' ')} 
              {isOwner && <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] rounded-full">SOUVERAIN</span>}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all flex items-center gap-2"
              >
                <Globe size={20} />
                <span className="text-[10px] font-black uppercase">{language}</span>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-2">
                  {[
                    { id: Language.FR, label: 'FR', flag: '🇫🇷' },
                    { id: Language.EN, label: 'EN', flag: '🇬🇧' },
                    { id: Language.ES, label: 'ES', flag: '🇪🇸' },
                    { id: Language.PT, label: 'PT', flag: '🇵🇹' }
                  ].map(lang => (
                    <button 
                      key={lang.id}
                      onClick={() => { setLanguage(lang.id); setIsLangOpen(false); }}
                      className={`w-full px-4 py-3 text-left text-[10px] font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${language === lang.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-500'}`}
                    >
                      <span>{lang.flag} {lang.label}</span>
                      {language === lang.id && <Zap size={10} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all"
              title={theme === 'light' ? 'Activer Mode Sombre' : 'Activer Mode Clair'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar">
          {activeView === AppView.DASHBOARD && <Dashboard onViewChange={handleViewChange} isOwner={isOwner} distData={currentUser.distData} language={language} />}
          {activeView === AppView.CHAT && <ChatBot distData={currentUser.distData} isOwner={isOwner} initialIntent={initialIntent} language={language} />}
          {activeView === AppView.IA_WORLD && <IAWorld language={language} />}
          {activeView === AppView.LIVE && <LiveSession isOwner={isOwner} language={language} />}
          {activeView === AppView.CELLULAR_CHECK && <CellularCheck onViewChange={handleViewChange} onSetIntent={setInitialIntent} language={language} />}
          {activeView === AppView.ACADEMY && <Academy language={language} />}
          {activeView === AppView.CONTROL_TOWER && <ControlTower language={language} onUpdateBranding={refreshUser} />}
          {activeView === AppView.SOCIAL_SYNC && <SocialSync distId={currentUser.distData.id} shopUrl={currentUser.distData.shopUrl} language={language} />}
          {activeView === AppView.VISUAL_STUDIO && <VisualStudio language={language} />}
          {activeView === AppView.FINANCIAL_FREEDOM && <FinancialFreedom />}
        </section>
      </main>
    </div>
  );
};

export default App;
