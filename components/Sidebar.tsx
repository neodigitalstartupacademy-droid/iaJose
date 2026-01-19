
import React from 'react';
import { LayoutDashboard, MessageSquare, Mic, Activity, Globe, Share2, GraduationCap, Layout, Zap, Wand2 } from 'lucide-react';
import { AppView, Language } from '../types';
import { translations } from '../translations';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  isOwner: boolean;
  language: Language;
  brandName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, isOwner, language, brandName }) => {
  const t = translations[language];
  const displayBrand = brandName || t.appName;
  
  const menuItems = [
    { id: AppView.DASHBOARD, icon: <LayoutDashboard size={18} />, label: t.dashboard },
    { id: AppView.SOCIAL_SYNC, icon: <Share2 size={18} />, label: t.socialSync },
    { id: AppView.IA_WORLD, icon: <Globe size={18} />, label: t.iaWorld },
    { id: AppView.CHAT, icon: <MessageSquare size={18} />, label: t.chat },
    { id: AppView.VISUAL_STUDIO, icon: <Wand2 size={18} />, label: t.studio },
    { id: AppView.CELLULAR_CHECK, icon: <Activity size={18} />, label: t.check },
    { id: AppView.ACADEMY, icon: <GraduationCap size={18} />, label: t.academy },
    { id: AppView.LIVE, icon: <Mic size={18} />, label: t.live },
  ];

  if (isOwner) menuItems.push({ id: AppView.CONTROL_TOWER, icon: <Layout size={18} />, label: t.control });

  return (
    <aside className={`${isOpen ? 'w-80' : 'w-0 overflow-hidden'} transition-all duration-500 bg-slate-950 text-white flex flex-col shrink-0 border-r border-white/5`}>
      <div className="p-8 border-b border-white/5 text-center">
        <h1 className="font-black text-xl synergy-text tracking-tighter uppercase">{displayBrand}</h1>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t.slogan}</p>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
              activeView === item.id ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
