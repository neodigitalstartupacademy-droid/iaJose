
import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Mic, 
  Image as ImageIcon, 
  Activity, 
  ExternalLink,
  ShieldCheck,
  Zap,
  GraduationCap
} from 'lucide-react';
import { AppView } from '../types';
import { DEFAULT_NEOLIFE_LINK } from '../constants';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  isOpen: boolean;
  isOwner: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, isOpen, isOwner }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: <LayoutDashboard size={18} />, label: 'Tableau de Bord' },
    { id: AppView.CHAT, icon: <MessageSquare size={18} />, label: 'Coach JOSÉ IA' },
    { id: AppView.CELLULAR_CHECK, icon: <Activity size={18} />, label: 'Bilan Cellulaire' },
    { id: AppView.ACADEMY, icon: <GraduationCap size={18} />, label: 'Académie GMBC' },
    { id: AppView.LIVE, icon: <Mic size={18} />, label: 'Session Live' },
    { id: AppView.VISUALS, icon: <ImageIcon size={18} />, label: 'Studio Visuel' },
  ];

  return (
    <aside className={`${isOpen ? 'w-80' : 'w-0 overflow-hidden'} transition-all duration-500 bg-slate-950 text-white flex flex-col shrink-0 lg:static fixed inset-y-0 left-0 z-40 border-r border-white/5`}>
      {/* Brand Header with Synergy Gradient */}
      <div className="p-8 border-b border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-green-600/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 synergy-bg rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform">
            J
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter synergy-text">COACH JOSÉ</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">GMBC-OS × NeoLife</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
              activeView === item.id 
                ? 'synergy-bg text-white shadow-xl shadow-blue-500/20' 
                : 'text-slate-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className={`${activeView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-green-400'} transition-colors`}>
              {item.icon}
            </div>
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Synergistic Call to Action */}
      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-green-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Partenariat NDSA</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                La technologie NDSA au service de votre vitalité NeoLife.
            </p>
        </div>

        <a 
          href={DEFAULT_NEOLIFE_LINK} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-5 py-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/5"
        >
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-green-400 transition-colors">Boutique NeoLife</span>
            <span className="text-xs font-black text-white">Commander en Ligne</span>
          </div>
          <div className="p-2 synergy-bg rounded-lg">
            <Zap size={14} className="text-white" />
          </div>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
