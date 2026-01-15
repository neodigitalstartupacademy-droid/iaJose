
import React, { useState } from 'react';
import { 
  GraduationCap, 
  Play, 
  CheckCircle, 
  Lock, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  Target, 
  Zap, 
  ShieldCheck, 
  Star,
  Clock,
  MessageSquare,
  ArrowLeft,
  Award,
  Mic
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ACADEMY_DATA = [
  {
    id: 'm1',
    title: "L'Esprit GMBC-OS",
    description: "Comprendre la vision du fondateur ABADA José et la puissance du système souverain.",
    duration: "45 min",
    level: "Débutant",
    icon: <ShieldCheck className="text-blue-500" />,
    lessons: [
      { id: 'l1-1', title: "Pourquoi GMBC-OS ?", content: "Découvrez comment le système résout le dilemme temps/argent.", completed: true },
      { id: 'l1-2', title: "Le Partenariat NeoLife", content: "Pourquoi NeoLife est le moteur nutritionnel parfait pour ce système.", completed: false },
      { id: 'l1-3', title: "L'Ethique du Réseau", content: "Bâtir un héritage durable et éthique.", completed: false }
    ]
  },
  {
    id: 'm2',
    title: "Expertise Cellulaire",
    description: "Maîtriser la science NeoLife pour conseiller avec autorité.",
    duration: "1h 30",
    level: "Intermédiaire",
    icon: <Zap className="text-green-500" />,
    lessons: [
      { id: 'l2-1', title: "Le Trio de Relance", content: "Analyse profonde de Tre-en-en, Carotenoid Complex et Salmon Oil.", completed: false },
      { id: 'l2-2', title: "Analyser un Bilan Sanguin", content: "Comment identifier les carences prioritaires.", completed: false },
      { id: 'l2-3', title: "La Cure de Détoxification", content: "Le protocole de départ pour chaque nouveau client.", completed: false }
    ]
  },
  {
    id: 'm3',
    title: "Duplication Massive",
    description: "Comment utiliser l'IA Coach JOSÉ pour automatiser votre croissance.",
    duration: "1h 15",
    level: "Expert",
    icon: <Target className="text-amber-500" />,
    lessons: [
      { id: 'l3-1', title: "Maîtriser le Smart Link", content: "Comment diffuser votre lien de synergie efficacement.", completed: false },
      { id: 'l3-2', title: "Convertir via l'IA", content: "Laisser JOSÉ faire 90% du travail d'éducation.", completed: false },
      { id: 'l3-3', title: "Suivi d'Equipe Automatisé", content: "Utiliser les outils de tracking GMBC-OS.", completed: false }
    ]
  }
];

const Academy: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);

  const calculateProgress = () => {
    const total = ACADEMY_DATA.reduce((acc, mod) => acc + mod.lessons.length, 0);
    const completed = ACADEMY_DATA.reduce((acc, mod) => acc + mod.lessons.filter(l => l.completed).length, 0);
    return Math.round((completed / total) * 100);
  };

  if (activeLesson) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <button 
          onClick={() => setActiveLesson(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={16} /> Retour au module
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video synergy-bg rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
               <Play size={64} fill="white" className="relative z-10 animate-pulse" />
               <div className="absolute bottom-6 left-6 right-6">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Coach JOSÉ présente :</p>
                 <p className="text-xl font-black uppercase">{activeLesson.title}</p>
               </div>
            </div>

            <div className="glass-effect rounded-[2.5rem] p-10 border-2 border-white shadow-xl">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-6 uppercase">{activeLesson.title}</h2>
              <div className="prose prose-slate max-w-none prose-sm">
                <p className="text-lg leading-relaxed text-slate-600 font-medium">
                  {activeLesson.content} Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Cette leçon est conçue pour vous donner les clés de la réussite avec le système GMBC-OS.
                </p>
                <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                  <Sparkles className="text-blue-500 mt-1" size={20} />
                  <p className="text-sm text-blue-800 font-bold italic">
                    "Souvenez-vous : vous ne vendez pas des produits, vous installez un système de liberté." - Coach JOSÉ
                  </p>
                </div>
              </div>
              <button className="w-full mt-10 py-5 synergy-bg text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                <CheckCircle size={20} /> Marquer comme terminée
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-effect rounded-[2rem] p-8 border border-white/50 shadow-lg">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <MessageSquare size={16} className="text-blue-600" /> Assistant IA
               </h3>
               <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                 Vous avez une question sur cette leçon ? Coach JOSÉ est prêt à vous répondre.
               </p>
               <button className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                 Poser une question à JOSÉ
               </button>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-slate-100">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Contenu du module</h3>
               <div className="space-y-4">
                 {selectedModule.lessons.map((lesson: any) => (
                   <div 
                    key={lesson.id} 
                    onClick={() => setActiveLesson(lesson)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                     activeLesson.id === lesson.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'
                   }`}>
                     <div className="flex items-center gap-3">
                       {lesson.completed ? <CheckCircle size={14} className="text-green-500" /> : <Play size={14} className="text-slate-300" />}
                       <span className={`text-xs font-bold ${activeLesson.id === lesson.id ? 'text-blue-700' : 'text-slate-600'}`}>{lesson.title}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header Academy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
               <GraduationCap size={24} />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Formation Continue</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
            Académie <span className="synergy-text">GMBC-OS</span>
          </h1>
          <p className="mt-6 text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
            Le savoir est la base de la duplication. Apprenez à maîtriser le système pour bâtir votre empire NeoLife.
          </p>
        </div>

        <div className="glass-effect rounded-[2rem] p-8 min-w-[300px] border border-white/50 shadow-xl">
           <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ma Progression</span>
             <span className="text-xs font-black text-blue-600">{calculateProgress()}%</span>
           </div>
           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
             <div className="h-full synergy-bg transition-all duration-1000" style={{ width: `${calculateProgress()}%` }}></div>
           </div>
           <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
             <Award size={14} className="text-amber-500" /> Prochain Badge : Expert Cellulaire
           </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ACADEMY_DATA.map((module) => (
          <div key={module.id} className="group flex flex-col glass-effect rounded-[3rem] p-10 border-2 border-white shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <BookOpen size={120} />
            </div>

            <div className="mb-8 p-5 bg-slate-50 rounded-2xl w-fit shadow-inner group-hover:synergy-bg group-hover:text-white transition-all">
               {React.cloneElement(module.icon as any, { size: 32 })}
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1"><Clock size={12} /> {module.duration}</span>
                <span className="flex items-center gap-1"><Star size={12} /> {module.level}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">{module.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{module.description}</p>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-4">
               {module.lessons.map(lesson => (
                 <div key={lesson.id} className="flex items-center gap-3 opacity-60">
                   {lesson.completed ? <CheckCircle size={14} className="text-green-500" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200"></div>}
                   <span className="text-[11px] font-bold text-slate-700 truncate">{lesson.title}</span>
                 </div>
               ))}
            </div>

            <button 
              onClick={() => { setSelectedModule(module); setActiveLesson(module.lessons[0]); }}
              className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              Rejoindre <ChevronRight size={16} />
            </button>
          </div>
        ))}

        {/* Locked Module Example */}
        <div className="group flex flex-col bg-slate-100/50 rounded-[3rem] p-10 border-2 border-dashed border-slate-200 shadow-sm relative overflow-hidden opacity-80">
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-[2px] z-10 p-10 text-center">
              <div className="p-5 bg-white rounded-2xl shadow-md mb-6"><Lock size={32} className="text-slate-400" /></div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Masterclass Leadership</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Débloqué au rang de Manager Emeraude</p>
           </div>
           
           <div className="mb-8 p-5 bg-white rounded-2xl w-fit shadow-sm"><Zap size={32} className="text-slate-200" /></div>
           <div className="h-6 w-3/4 bg-slate-200 rounded-full mb-4"></div>
           <div className="h-4 w-full bg-slate-200 rounded-full mb-2"></div>
           <div className="h-4 w-5/6 bg-slate-200 rounded-full"></div>
        </div>
      </div>

      {/* Synergistic Footer */}
      <div className="synergy-bg rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[200%] bg-white/5 rotate-12 pointer-events-none"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
               <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Formation Accélérée Coach JOSÉ</h3>
               <p className="text-blue-100 font-medium text-lg leading-relaxed opacity-90">
                 Vous voulez une explication personnalisée sur un sujet NeoLife ? Lancez une session Live avec JOSÉ.
               </p>
            </div>
            {/* Added Mic icon to fix the compilation error */}
            <button className="px-10 py-5 bg-white text-blue-700 rounded-2xl font-black uppercase text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
               <Mic size={20} /> Session Live Strategique
            </button>
         </div>
      </div>
    </div>
  );
};

export default Academy;
