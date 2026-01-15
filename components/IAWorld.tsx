
import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  Image as ImageIcon, 
  Film, 
  Mic, 
  ArrowRight, 
  BrainCircuit, 
  Cpu, 
  Telescope,
  PlayCircle,
  Code2,
  Lock,
  Search,
  // Added missing icons
  Layers,
  ShieldCheck,
  X,
  CheckCircle,
  Check
} from 'lucide-react';
import { MODELS } from '../constants';

const IA_MODELS = [
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    description: 'Le sommet du raisonnement multimodal. Idéal pour les stratégies business complexes et les analyses de santé croisées.',
    capability: 'Raisonnement Élite & Multimodal',
    icon: <BrainCircuit size={28} />,
    color: 'from-blue-600 to-indigo-600',
    tags: ['Texte', 'Vision', 'Code', 'Raisonnement'],
    modelId: MODELS.TEXT_COMPLEX
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    description: 'Vitesse instantanée pour les interactions quotidiennes. Le moteur de Coach JOSÉ pour les réponses fluides.',
    capability: 'Performance & Vitesse',
    icon: <Zap size={28} />,
    color: 'from-amber-400 to-orange-500',
    tags: ['Fast-Text', 'Multilingual'],
    modelId: MODELS.TEXT_FAST
  },
  {
    id: 'imagen-pro',
    name: 'Gemini Pro Image',
    description: 'Génération visuelle de qualité studio. Créez des actifs marketing 4K pour votre réseau NeoLife.',
    capability: 'Art Génératif Pro',
    icon: <ImageIcon size={28} />,
    color: 'from-pink-500 to-rose-600',
    tags: ['Génération 4K', 'Édition Image'],
    modelId: MODELS.IMAGE
  },
  {
    id: 'veo',
    name: 'Veo 3.1',
    description: 'Cinéma génératif haute fidélité. Donnez vie à votre vision GMBC-OS en vidéo 1080p.',
    capability: 'Vidéo Cinématique',
    icon: <Film size={28} />,
    color: 'from-purple-600 to-fuchsia-600',
    tags: ['Vidéo 720p/1080p', 'Veo Engine'],
    modelId: MODELS.VIDEO
  },
  {
    id: 'gemini-native-audio',
    name: 'Native Audio 2.5',
    description: 'Interaction vocale humaine à latence zéro. Écoutez JOSÉ vous conseiller avec une fluidité naturelle.',
    capability: 'Audio Natif & Direct',
    icon: <Mic size={28} />,
    color: 'from-teal-500 to-emerald-600',
    tags: ['Vocal Temps Réel', 'Audio Stream'],
    modelId: MODELS.LIVE
  },
  {
    id: 'gemini-tts',
    name: 'Gemini TTS',
    description: 'Transformation texte-parole haute qualité. Une voix pour chaque personnalité de votre équipe.',
    capability: 'Synthèse Vocale Élite',
    icon: <PlayCircle size={28} />,
    color: 'from-cyan-500 to-blue-500',
    tags: ['Multi-voix', 'Narration'],
    modelId: MODELS.TTS
  }
];

const IAWorld: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<typeof IA_MODELS[0] | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-24 px-6 lg:px-12 pt-10">
      {/* Header Cinématique */}
      <div className="flex flex-col md:flex-row items-center gap-12 justify-between">
        <div className="max-w-2xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl rotate-12">
               <Globe size={24} />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Exploration Multimodale</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] mb-8">
            IA <span className="synergy-text">WORLD</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
            Découvrez la puissance brute des modèles qui animent le système GMBC-OS. Explorez les frontières de la création IA.
          </p>
        </div>

        <div className="relative group">
           <div className="absolute inset-0 synergy-bg blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
           <div className="relative bg-white border-2 border-slate-50 rounded-[3rem] p-10 shadow-2xl flex items-center justify-center">
              <Cpu size={80} className="synergy-text animate-pulse" />
           </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Modèles Actifs', val: '6', icon: <Layers className="text-blue-500" size={14} /> },
          { label: 'Modalités', val: '4', icon: <Sparkles className="text-amber-500" size={14} /> },
          { label: 'Latence Moy.', val: '150ms', icon: <Zap className="text-green-500" size={14} /> },
          { label: 'Souveraineté', val: 'NDSA', icon: <ShieldCheck className="text-purple-500" size={14} /> }
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {s.icon} {s.label}
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {IA_MODELS.map((model) => (
          <div 
            key={model.id}
            onClick={() => setSelectedModel(model)}
            className="group relative bg-white border-2 border-slate-50 rounded-[3rem] p-10 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-5 blur-[60px] transition-opacity`}></div>
            
            <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${model.color} text-white flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform`}>
               {model.icon}
            </div>

            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">{model.name}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
              {model.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-10">
              {model.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Telescope size={14} /> Explorer
              </span>
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Overlay pour le Showcase */}
      {selectedModel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setSelectedModel(null)}></div>
          <div className="relative bg-white w-full max-w-4xl h-full max-h-[800px] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
             
             {/* Modal Header */}
             <div className={`p-10 bg-gradient-to-r ${selectedModel.color} text-white flex items-center justify-between`}>
               <div className="flex items-center gap-6">
                 <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
                    {selectedModel.icon}
                 </div>
                 <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{selectedModel.name}</h2>
                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{selectedModel.capability}</p>
                 </div>
               </div>
               <button onClick={() => setSelectedModel(null)} className="p-4 bg-white/20 hover:bg-white/40 rounded-full transition-all">
                 <X size={24} />
               </button>
             </div>

             {/* Modal Content */}
             <div className="flex-1 overflow-y-auto p-12 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Spécificités Techniques</h4>
                    <div className="space-y-4">
                       <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between">
                         <span className="text-sm font-bold text-slate-900">ID Modèle</span>
                         <span className="text-[10px] font-mono bg-white px-3 py-1 border border-slate-200 rounded-lg">{selectedModel.modelId}</span>
                       </div>
                       <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between">
                         <span className="text-sm font-bold text-slate-900">Contexte (Tokens)</span>
                         <span className="text-xs font-black text-blue-600">128K - 2M</span>
                       </div>
                       <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between">
                         <span className="text-sm font-bold text-slate-900">Disponibilité</span>
                         <span className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest"><CheckCircle size={14} /> 100% OPÉRATIONNEL</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Domaines de Prédilection</h4>
                    <ul className="space-y-3">
                      {['Vision par ordinateur', 'Génération Multimodale', 'Codage stratégique', 'Analyse sémantique'].map(t => (
                        <li key={t} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                          <Zap size={16} className="text-amber-500" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-100 space-y-8">
                   <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Showcase / Demo</h4>
                      <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Bac à Sable NDSA</span>
                   </div>

                   <div className="aspect-video bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center text-white space-y-6 group">
                      <div className="p-6 bg-white/5 border border-white/10 rounded-full group-hover:scale-110 transition-transform">
                        <PlayCircle size={48} className="synergy-text" />
                      </div>
                      <h5 className="text-xl font-black uppercase tracking-tighter">Accéder au Terminal de Test</h5>
                      <p className="text-sm text-slate-500 font-medium max-w-sm">
                        Le bac à sable permet de tester les limites de {selectedModel.name} dans un environnement sécurisé NDSA.
                      </p>
                      <button className="px-10 py-4 synergy-bg rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        Lancer Simulation
                      </button>
                   </div>
                </div>
             </div>

             {/* Footer Modal */}
             <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock size={16} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Souveraineté des données 100% Garantie</span>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">
                  Documentation Technique <ArrowRight size={14} />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* CTA Final */}
      <div className="synergy-bg rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="relative z-10 max-w-xl text-center md:text-left">
           <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-6">Prêt à intégrer l'IA dans votre réseau ?</h2>
           <p className="text-lg text-blue-50 font-medium opacity-90 leading-relaxed mb-10">
             Coach JOSÉ n'est que la surface. Le système GMBC-OS vous permet de déployer ces modèles pour automatiser chaque aspect de votre business NeoLife.
           </p>
           <button className="px-12 py-6 bg-white text-blue-700 rounded-3xl font-black uppercase text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto md:mx-0">
             Activer Ma Licence Elite <ArrowRight size={22} />
           </button>
        </div>
        <div className="relative z-10 flex flex-col gap-4">
           {[
             { label: 'Gemini Ecosystem', icon: <Search size={18} /> },
             { label: 'NDSA Integrated', icon: <Check size={18} /> },
             { label: 'Sovereign Cloud', icon: <Lock size={18} /> }
           ].map((it, i) => (
             <div key={i} className="px-8 py-5 bg-black/20 backdrop-blur-md border border-white/20 rounded-[2rem] flex items-center gap-4 min-w-[240px]">
               <div className="p-2 bg-white/10 rounded-xl">{it.icon}</div>
               <span className="text-xs font-black uppercase tracking-widest">{it.label}</span>
             </div>
           ))}
        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-96 h-96 bg-green-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default IAWorld;
