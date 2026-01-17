
import React from 'react';
import { LayoutDashboard, MessageSquare, Mic, Activity, Globe, Share2, GraduationCap, Layout, Zap } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  isOwner: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, isOwner }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: <LayoutDashboard size={18} />, label: 'Tableau de Bord' },
    { id: AppView.SOCIAL_SYNC, icon: <Share2 size={18} />, label: 'Social Sync' },
    { id: AppView.IA_WORLD, icon: <Globe size={18} />, label: 'IA World' },
    { id: AppView.CHAT, icon: <MessageSquare size={18} />, label: 'Coach JOSÉ IA' },
    { id: AppView.CELLULAR_CHECK, icon: <Activity size={18} />, label: 'Bilan Cellulaire' },
    { id: AppView.ACADEMY, icon: <GraduationCap size={18} />, label: 'Académie GMBC' },
    { id: AppView.LIVE, icon: <Mic size={18} />, label: 'Session Live' },
  ];

  if (isOwner) menuItems.push({ id: AppView.CONTROL_TOWER, icon: <Layout size={18} />, label: 'Tour de Contrôle' });

  return (
    <aside className={`${isOpen ? 'w-80' : 'w-0 overflow-hidden'} transition-all duration-500 bg-slate-950 text-white flex flex-col shrink-0 border-r border-white/5`}>
      <div className="p-8 border-b border-white/5 text-center">
        <h1 className="font-black text-xl synergy-text tracking-tighter">COACH JOSÉ</h1>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">SOUVERAINETÉ NDSA</p>
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
