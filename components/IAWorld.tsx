
import React, { useState } from 'react';
import { Globe, Sparkles, MessageSquare, Zap, Image as ImageIcon, Film, Mic, ArrowRight, BrainCircuit, Cpu, Telescope, PlayCircle, Code2, Lock, Search, Layers, ShieldCheck, X, CheckCircle, Check } from 'lucide-react';
import { MODELS } from '../constants';

const IA_MODELS = [
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'Stratégies business complexes et analyses de santé.', icon: <BrainCircuit size={28} />, color: 'from-blue-600 to-indigo-600', tags: ['Texte', 'Vision'], modelId: MODELS.TEXT_COMPLEX },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', description: 'Vitesse instantanée pour interactions fluides.', icon: <Zap size={28} />, color: 'from-amber-400 to-orange-500', tags: ['Rapide'], modelId: MODELS.TEXT_FAST },
  { id: 'imagen-pro', name: 'Gemini Image', description: 'Actifs marketing 4K.', icon: <ImageIcon size={28} />, color: 'from-pink-500 to-rose-600', tags: ['Image'], modelId: MODELS.IMAGE },
  { id: 'veo', name: 'Veo 3.1', description: 'Vidéo cinématique NDSA.', icon: <Film size={28} />, color: 'from-purple-600 to-fuchsia-600', tags: ['Vidéo'], modelId: MODELS.VIDEO }
];

const IAWorld: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-24 px-6 lg:px-12 pt-10">
      <div className="flex flex-col md:flex-row items-center gap-12 justify-between">
        <div className="max-w-2xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl rotate-12"><Globe size={24} /></div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Exploration Multimodale</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.85] mb-8">IA <span className="synergy-text">WORLD</span></h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">Découvrez la puissance brute des modèles qui animent le système GMBC-OS.</p>
        </div>
        <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl flex items-center justify-center transition-colors">
          <Cpu size={80} className="synergy-text animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {IA_MODELS.map((model) => (
          <div key={model.id} className="group relative bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] p-10 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${model.color} text-white flex items-center justify-center mb-8 shadow-xl transition-all`}>{model.icon}</div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{model.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">{model.description}</p>
            <div className="flex flex-wrap gap-2 mb-10">
              {model.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IAWorld;
