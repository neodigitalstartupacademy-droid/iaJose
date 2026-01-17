
import React, { useState } from 'react';
import { GraduationCap, Play, CheckCircle, Lock, ChevronRight, Sparkles, BookOpen, Target, Zap, ShieldCheck, Star, Clock, MessageSquare, ArrowLeft, Award, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AppView } from '../types';

const ACADEMY_DATA = [
  { id: 'm1', title: "L'Esprit GMBC-OS", description: "Vision ABADA José et système souverain.", duration: "45 min", level: "Débutant", icon: <ShieldCheck className="text-blue-500" />, lessons: [{ id: 'l1-1', title: "Pourquoi GMBC-OS ?", content: "Dilemme temps/argent.", completed: true }] },
  { id: 'm2', title: "Expertise Cellulaire", description: "Science NeoLife pour conseiller.", duration: "1h 30", level: "Intermédiaire", icon: <Zap className="text-green-500" />, lessons: [{ id: 'l2-1', title: "Le Trio de Relance", content: "Tre-en-en, Carotenoid, Salmon.", completed: false }] },
  { id: 'm3', title: "Duplication Massive", description: "Automatisation via JOSÉ.", duration: "1h 15", level: "Expert", icon: <Target className="text-amber-500" />, lessons: [{ id: 'l3-1', title: "Maîtriser le Smart Link", content: "Lien de synergie.", completed: false }] }
];

const Academy: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4 pt-10 transition-colors">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm transition-colors"><GraduationCap size={24} /></div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Formation Continue</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">Académie <span className="synergy-text">GMBC-OS</span></h1>
          <p className="mt-6 text-slate-500 dark:text-slate-400 font-medium max-w-xl text-lg">Maîtrisez le système pour bâtir votre empire NeoLife.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ACADEMY_DATA.map((module) => (
          <div key={module.id} className="group flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-white dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl w-fit group-hover:synergy-bg group-hover:text-white transition-all">{module.icon}</div>
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{module.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{module.description}</p>
            </div>
            <button className="mt-10 w-full py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 dark:hover:bg-blue-400 transition-all flex items-center justify-center gap-2">
              Rejoindre <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Academy;
