
import React, { useState, useEffect } from 'react';
import { Activity, ArrowRight, RefreshCcw, ShieldCheck, Sparkles, Zap, CheckCircle2, Share2, Frown, Meh, Smile, Laugh, Loader2 } from 'lucide-react';
import { generateEducationalResponse } from '../services/geminiService';
import { stopAllAudio } from '../services/audioService';
import ReactMarkdown from 'react-markdown';

const QUESTIONS = [
  { 
    id: 'fatigue', 
    text: 'Niveau de fatigue chronique', 
    description: 'De 1 (Énergie totale) à 10 (Épuisement profond)',
    type: 'range' 
  },
  { 
    id: 'digestion', 
    text: 'Votre confort digestif', 
    description: 'Ballonnements, lourdeurs ou transit ?',
    type: 'options',
    options: [
      { val: 'Optimal', icon: <CheckCircle2 className="text-green-500" /> },
      { val: 'Difficile', icon: <Activity className="text-orange-500" /> },
      { val: 'Lent', icon: <Zap className="text-red-500" /> }
    ] 
  },
  { 
    id: 'sleep', 
    text: 'Qualité du sommeil', 
    description: 'Récupérez-vous vraiment la nuit ?',
    type: 'options',
    options: [
      { val: 'Profond', icon: <Smile className="text-green-500" /> },
      { val: 'Agité', icon: <Meh className="text-amber-500" /> },
      { val: 'Insomnie', icon: <Frown className="text-red-500" /> }
    ] 
  },
  { 
    id: 'goal', 
    text: 'Votre objectif Élite', 
    description: 'Quelle est la priorité absolue ?',
    type: 'options',
    options: [
      { val: 'Vitalité', icon: <Zap className="text-blue-500" /> },
      { val: 'Poids', icon: <Activity className="text-purple-500" /> },
      { val: 'Défenses', icon: <ShieldCheck className="text-teal-500" /> }
    ] 
  }
];

const CellularCheck: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({ fatigue: '5' });
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    const interval = setInterval(() => {
      setScanProgress(p => p >= 100 ? 100 : p + 4);
    }, 60);

    try {
      const prompt = `Analyse de santé cellulaire pour : ${JSON.stringify(finalAnswers)}. 
      Donnez un score de vitalité sur 100. Recommandez le Trio de Relance NeoLife. 
      Format: Titre, Score, Analyse, Protocole. Soyez percutant.`;
      const analysis = await generateEducationalResponse(prompt, true);
      setResult(analysis);
    } catch (e) {
      setResult("Analyse interrompue. Je traite vos données manuellement.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const getFatigueVisual = (val: number) => {
    if (val <= 3) return { icon: <Laugh size={64} className="text-green-500" />, text: 'Énergie Élite' };
    if (val <= 6) return { icon: <Smile size={64} className="text-amber-500" />, text: 'Fatigue Modérée' };
    if (val <= 8) return { icon: <Meh size={64} className="text-orange-500" />, text: 'Signes d\'Alertes' };
    return { icon: <Frown size={64} className="text-red-500" />, text: 'Épuisement Critique' };
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white rounded-[4rem] shadow-2xl border-2 border-slate-50 overflow-hidden min-h-[650px] flex flex-col">
        {!result && !isLoading && (
          <div className="h-3 w-full bg-slate-100 flex">
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`flex-1 transition-all duration-1000 ${i <= step ? 'synergy-bg' : ''}`} />
            ))}
          </div>
        )}

        <div className="p-12 md:p-20 flex-1 flex flex-col">
          {!result && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 flex-1 flex flex-col">
              <div className="mb-12 text-center md:text-left">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 block">Étape {step + 1} / {QUESTIONS.length}</span>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">
                  {QUESTIONS[step].text}
                </h2>
                <p className="text-slate-400 font-medium text-xl">{QUESTIONS[step].description}</p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {QUESTIONS[step].type === 'range' ? (
                  <div className="space-y-16 py-10">
                    <div className="flex flex-col items-center gap-8">
                      <div className="p-12 bg-slate-50 rounded-[3.5rem] shadow-inner transition-transform duration-500 hover:scale-110">
                        {getFatigueVisual(parseInt(answers.fatigue)).icon}
                      </div>
                      <div className="text-center">
                        <span className="text-8xl font-black synergy-text tracking-tighter">{answers.fatigue}</span>
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400 mt-2">
                          {getFatigueVisual(parseInt(answers.fatigue)).text}
                        </p>
                      </div>
                    </div>
                    <div className="px-4">
                      <input 
                        type="range" min="1" max="10" 
                        value={answers.fatigue} 
                        onChange={(e) => setAnswers({...answers, fatigue: e.target.value})}
                        className="w-full h-6 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600 shadow-inner"
                      />
                    </div>
                    <button 
                      onClick={() => setStep(step + 1)}
                      className="w-full py-7 synergy-bg text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                      VALIDER <ArrowRight size={24} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {QUESTIONS[step].options?.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt.val)}
                        className="p-10 text-left bg-slate-50 hover:bg-white border-4 border-transparent hover:border-blue-600 rounded-[3rem] transition-all flex items-center justify-between group shadow-sm hover:shadow-2xl"
                      >
                        <div className="flex items-center gap-8">
                          <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:scale-125 transition-transform duration-500">
                            {opt.icon}
                          </div>
                          <span className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{opt.val}</span>
                        </div>
                        <ArrowRight size={28} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-700">
              <div className="relative w-64 h-64 mb-16">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="128" cy="128" r="120" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle 
                    cx="128" cy="128" r="120" fill="none" stroke="url(#bilan-grad)" 
                    strokeWidth="12" strokeDasharray="753" strokeDashoffset={753 - (753 * scanProgress / 100)}
                    strokeLinecap="round" className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="bilan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={64} className="text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">Analyse en cours...</h3>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-sm">Détection des déséquilibres cellulaires</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in zoom-in-95 duration-1000">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                 <div>
                    <h3 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                      VOTRE <span className="synergy-text">BILAN</span>
                    </h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Généré par Coach JOSÉ • GMBC-OS</p>
                 </div>
                 <div className="flex gap-4">
                   <button onClick={() => { setStep(0); setResult(null); }} className="p-6 bg-slate-100 text-slate-500 rounded-3xl hover:bg-slate-950 hover:text-white transition-all">
                      <RefreshCcw size={28} />
                   </button>
                   <button onClick={() => navigator.clipboard.writeText(result)} className="px-10 py-6 bg-slate-950 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                     <Share2 size={24} /> Partager
                   </button>
                 </div>
              </div>
              
              <div className="bg-slate-50/50 rounded-[4rem] p-12 md:p-16 border-2 border-slate-50 shadow-inner mb-16">
                <div className="prose prose-slate max-w-none prose-2xl leading-relaxed text-slate-800 font-medium">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>

              <button className="w-full py-8 synergy-bg text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6">
                ACCÉDER AU PROTOCOLE <ArrowRight size={28} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CellularCheck;
