
import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Mic, 
  Image as ImageIcon, 
  Activity, 
  ExternalLink 
} from 'lucide-react';
import { AppView } from '../types';
// Fixed: Using the correct exported member DEFAULT_NEOLIFE_LINK from constants
import { DEFAULT_NEOLIFE_LINK } from '../constants';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  isOwner: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, isOwner }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Tableau de Bord' },
    { id: AppView.CHAT, icon: <MessageSquare size={20} />, label: 'Coach José Chat' },
    { id: AppView.CELLULAR_CHECK, icon: <Activity size={20} />, label: 'Bilan Cellulaire' },
    { id: AppView.LIVE, icon: <Mic size={20} />, label: 'Session Live (Voix)' },
    { id: AppView.VISUALS, icon: <ImageIcon size={20} />, label: 'Studio Visuel' },
  ];

  return (
    <aside className={`${isOpen ? 'w-72' : 'w-0 overflow-hidden'} transition-all duration-300 bg-slate-900 text-white flex flex-col shrink-0 lg:static fixed inset-y-0 left-0 z-40`}>
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-inner">
          J
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">COACH JOSÉ</h1>
          <p className="text-[10px] text-slate-400 font-medium">GMBC-OS AI CENTRAL</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <a 
          // Fixed: NEOLIFE_LINK was corrected to DEFAULT_NEOLIFE_LINK
          href={DEFAULT_NEOLIFE_LINK} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-4 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group"
        >
          <div className="flex flex-col text-left">
            <span className="text-xs text-slate-400">Rejoindre NeoLife</span>
            <span className="text-sm font-semibold">Boutique Officielle</span>
          </div>
          <ExternalLink size={16} className="text-slate-500 group-hover:text-white" />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
