
import React, { useState, useEffect } from 'react';
import { Activity, ClipboardCheck, ArrowRight, RefreshCcw, Info, Volume2, Loader2, Square, Play, ShieldCheck, Sparkles, Heart, Zap, CheckCircle2, Share2, Frown, Meh, Smile, Laugh } from 'lucide-react';
import { generateEducationalResponse, textToSpeech } from '../services/geminiService';
import { playPcmAudio, stopAllAudio } from '../services/audioService';
import ReactMarkdown from 'react-markdown';

const QUESTIONS = [
  { 
    id: 'fatigue', 
    text: 'Votre niveau de fatigue ?', 
    description: 'De 1 (En pleine forme) à 10 (Épuisement total)',
    type: 'range' 
  },
  { 
    id: 'digestion', 
    text: 'Votre digestion ?', 
    description: 'Comment vous sentez-vous après les repas ?',
    type: 'options',
    options: [
      { val: 'Parfait', icon: <CheckCircle2 className="text-green-500" /> },
      { val: 'Ballonnements', icon: <Activity className="text-amber-500" /> },
      { val: 'Lourdeurs', icon: <Activity className="text-orange-500" /> },
      { val: 'Transit Difficile', icon: <Zap className="text-red-500" /> }
    ] 
  },
  { 
    id: 'sleep', 
    text: 'Votre sommeil ?', 
    description: 'Qualité de vos nuits et récupération.',
    type: 'options',
    options: [
      { val: 'Récupérateur', icon: <Smile className="text-green-500" /> },
      { val: 'Réveils Nocturnes', icon: <Meh className="text-amber-500" /> },
      { val: 'Insomnie', icon: <Frown className="text-red-500" /> }
    ] 
  },
  { 
    id: 'goal', 
    text: 'Votre priorité ?', 
    description: 'Quel résultat voulez-vous en premier ?',
    type: 'options',
    options: [
      { val: 'Vitalité Élite', icon: <Zap className="text-blue-500" /> },
      { val: 'Poids Idéal', icon: <Activity className="text-purple-500" /> },
      { val: 'Immunité Forte', icon: <ShieldCheck className="text-teal-500" /> }
    ] 
  }
];

const CellularCheck: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({ fatigue: '5' });
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleAnswer = (val: string) => {
    const q = QUESTIONS[step];
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      generateAnalysis(newAnswers);
    }
  };

  const generateAnalysis = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true);
    setScanProgress(0);
    
    // Animation de scan cellulaire
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 2;
      });
    }, 50);

    try {
      const prompt = `Générez un bilan de nutrition cellulaire concis et percutant basé sur ces données : ${JSON.stringify(finalAnswers)}. 
      STRUCTURE : 
      1. ÉTAT CELLULAIRE : Résumé du déséquilibre.
      2. PROTOCOLE DE RELANCE : Le Trio de Relance NeoLife impératif + 1 produit spécifique.
      3. LOGIQUE BIO-CHIMIQUE : Pourquoi ça va marcher.
      4. ACTION : Lien direct pour commander.
      TON : Coach expert, rassurant, souverain.`;
      
      const analysis = await generateEducationalResponse(prompt, true);
      setResult(analysis);
    } catch (error) {
      setResult("Instabilité système. J'ai vos données, je ré-analyse.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFatigueEmoji = (val: number) => {
    if (val <= 3) return <Laugh size={48} className="text-green-500" />;
    if (val <= 6) return <Smile size={48} className="text-amber-500" />;
    if (val <= 8) return <Meh size={48} className="text-orange-500" />;
    return <Frown size={48} className="text-red-500" />;
  };

  const reset = () => {
    setStep(0);
    setAnswers({ fatigue: '5' });
    setResult(null);
    stopAllAudio();
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.08)] border-2 border-slate-50 overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Progress Bar Top */}
        {!result && !isLoading && (
          <div className="h-2 w-full bg-slate-100 flex">
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`flex-1 transition-all duration-700 ${i <= step ? 'synergy-bg' : ''}`} />
            ))}
          </div>
        )}

        <div className="p-10 md:p-16 flex-1 flex flex-col">
          {!result && !isLoading && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-500 flex-1 flex flex-col">
              <div className="mb-12">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">Coach JOSÉ Analyse</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                  {QUESTIONS[step].text}
                </h2>
                <p className="text-slate-400 font-medium mt-4 text-lg">{QUESTIONS[step].description}</p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {QUESTIONS[step].type === 'range' ? (
                  <div className="space-y-12 animate-in zoom-in-95 duration-700">
                    <div className="flex justify-center flex-col items-center gap-6">
                      <div className="p-8 bg-slate-50 rounded-[3rem] shadow-inner">
                        {getFatigueEmoji(parseInt(answers.fatigue))}
                      </div>
                      <span className="text-6xl font-black text-slate-900 tracking-tighter">{answers.fatigue}</span>
                    </div>
                    <div className="space-y-6">
                      <input 
                        type="range" min="1" max="10" 
                        value={answers.fatigue} 
                        onChange={(e) => setAnswers({...answers, fatigue: e.target.value})}
                        className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        <span>Forme Olympique</span>
                        <span>Épuisement</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setStep(step + 1)}
                      className="w-full py-6 synergy-bg text-white rounded-3xl font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                      CONTINUER <ArrowRight size={22} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700">
                    {QUESTIONS[step].options?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt.val)}
                        className="p-8 text-left bg-slate-50 hover:bg-white border-2 border-transparent hover:border-blue-600 rounded-[2.5rem] transition-all flex items-center justify-between group shadow-sm hover:shadow-2xl"
                      >
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                            {opt.icon}
                          </div>
                          <span className="text-xl font-black text-slate-800 uppercase tracking-tighter">{opt.val}</span>
                        </div>
                        <ArrowRight size={24} className="text-slate-200 group-hover:text-blue-600 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
              <div className="relative w-48 h-48 mb-12">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="96" cy="96" r="92" 
                    fill="none" stroke="url(#synergy-grad)" strokeWidth="8" 
                    strokeDasharray="578" strokeDashoffset={578 - (578 * scanProgress / 100)}
                    strokeLinecap="round" className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="synergy-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={48} className="text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">Scan Cellulaire...</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                Coach JOSÉ analyse vos biomarqueurs digitaux
              </p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in zoom-in-95 duration-1000">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <Sparkles size={16} className="text-blue-600" />
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Bilan Finalisé</span>
                    </div>
                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                      VOTRE <span className="synergy-text">STRATÉGIE</span>
                    </h3>
                 </div>
                 <div className="flex gap-4">
                   <button 
                     onClick={reset} 
                     className="p-5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                     title="Recommencer"
                   >
                      <RefreshCcw size={22} />
                   </button>
                   <button 
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="p-5 bg-slate-950 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
                   >
                     <Share2 size={22} /> <span className="text-xs font-black uppercase tracking-widest hidden md:block">Partager</span>
                   </button>
                 </div>
              </div>
              
              <div className="bg-slate-50/50 rounded-[3rem] p-10 md:p-14 border-2 border-slate-50 shadow-inner mb-12">
                <div className="prose prose-slate max-w-none prose-xl leading-relaxed text-slate-800 font-medium">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>

              <div className="synergy-bg rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
                  <div className="max-w-xl">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      <Zap size={24} className="text-amber-400 fill-amber-400" />
                      <h4 className="text-2xl font-black uppercase tracking-tighter">Prêt pour la Relance ?</h4>
                    </div>
                    <p className="text-blue-50 text-lg font-medium opacity-90">
                      Ce protocole a été validé par Coach JOSÉ. Lancez votre cure aujourd'hui pour réinitialiser vos cellules.
                    </p>
                  </div>
                  <button className="px-12 py-6 bg-white text-blue-700 rounded-3xl font-black uppercase text-sm shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-4">
                    COMMANDER MON PACK <ArrowRight size={22} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 flex items-center justify-center gap-3 text-slate-400">
        <ShieldCheck size={18} />
        <p className="text-[10px] font-black uppercase tracking-widest">Souveraineté des données garantie • Analyse GMBC-OS</p>
      </div>
    </div>
  );
};

export default CellularCheck;
