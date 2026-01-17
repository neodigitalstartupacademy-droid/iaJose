
import React, { useState, useEffect } from 'react';
import { Activity, ArrowRight, RefreshCcw, ShieldCheck, Sparkles, Zap, CheckCircle2, Share2, Frown, Meh, Smile, Laugh, Loader2 } from 'lucide-react';
import { generateEducationalResponse } from '../services/geminiService';
import { stopAllAudio } from '../services/audioService';
import ReactMarkdown from 'react-markdown';
import { AppView } from '../types';

interface CellularCheckProps {
  onViewChange?: (view: AppView) => void;
  onSetIntent?: (intent: string) => void;
}

const QUESTIONS = [
  { id: 'fatigue', text: 'Niveau de fatigue chronique', description: 'De 1 à 10', type: 'range' },
  { id: 'digestion', text: 'Votre confort digestif', description: 'Ballonnements ou transit ?', type: 'options', options: [{ val: 'Optimal', icon: <CheckCircle2 className="text-green-500" /> }, { val: 'Difficile', icon: <Activity className="text-orange-500" /> }, { val: 'Lent', icon: <Zap className="text-red-500" /> }] },
  { id: 'sleep', text: 'Qualité du sommeil', description: 'Récupération nocturne', type: 'options', options: [{ val: 'Profond', icon: <Smile className="text-green-500" /> }, { val: 'Agité', icon: <Meh className="text-amber-500" /> }, { val: 'Insomnie', icon: <Frown className="text-red-500" /> }] },
  { id: 'goal', text: 'Objectif Élite', description: 'Priorité absolue', type: 'options', options: [{ val: 'Vitalité', icon: <Zap className="text-blue-500" /> }, { val: 'Poids', icon: <Activity className="text-purple-500" /> }, { val: 'Défenses', icon: <ShieldCheck className="text-teal-500" /> }] }
];

const CellularCheck: React.FC<CellularCheckProps> = ({ onViewChange, onSetIntent }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({ fatigue: '5' });
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleAnswer = (val: string) => {
    const q = QUESTIONS[step];
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else generateAnalysis(newAnswers);
  };

  const generateAnalysis = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true); setScanProgress(0);
    const interval = setInterval(() => setScanProgress(p => p >= 100 ? 100 : p + 4), 60);
    try {
      const prompt = `Analyse de santé cellulaire pour : ${JSON.stringify(finalAnswers)}. Score/100. NeoLife Trio.`;
      const analysis = await generateEducationalResponse(prompt, true);
      setResult(analysis);
    } catch (e) { setResult("Erreur d'analyse."); } finally { clearInterval(interval); setIsLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border-2 border-slate-50 dark:border-slate-800 overflow-hidden min-h-[650px] flex flex-col transition-colors duration-300">
        <div className="p-12 md:p-20 flex-1 flex flex-col">
          {!result && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 flex-1 flex flex-col">
              <div className="mb-12">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Étape {step + 1} / {QUESTIONS.length}</span>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mt-2">{QUESTIONS[step].text}</h2>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {QUESTIONS[step].type === 'range' ? (
                  <div className="space-y-10">
                    <div className="text-center">
                      <span className="text-8xl font-black synergy-text tracking-tighter">{answers.fatigue}</span>
                    </div>
                    <input type="range" min="1" max="10" value={answers.fatigue} onChange={(e) => setAnswers({...answers, fatigue: e.target.value})} className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none accent-blue-600" />
                    <button onClick={() => setStep(step + 1)} className="w-full py-7 synergy-bg text-white rounded-[2rem] font-black uppercase shadow-xl transition-all">VALIDER</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {QUESTIONS[step].options?.map((opt, i) => (
                      <button key={i} onClick={() => handleAnswer(opt.val)} className="p-10 text-left bg-slate-50 dark:bg-slate-950 border-4 border-transparent hover:border-blue-600 rounded-[3rem] transition-all flex items-center justify-between group shadow-sm">
                        <span className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{opt.val}</span>
                        <ArrowRight size={28} className="text-slate-200 group-hover:text-blue-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in">
              <Activity size={80} className="text-blue-600 animate-pulse mb-8" />
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Analyse...</h3>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in zoom-in-95 duration-1000">
              <h3 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-10">VOTRE <span className="synergy-text">BILAN</span></h3>
              <div className="bg-slate-50 dark:bg-slate-950 p-12 rounded-[4rem] border-2 border-slate-50 dark:border-slate-800 shadow-inner mb-10 text-slate-800 dark:text-slate-200">
                <ReactMarkdown className="prose dark:prose-invert max-w-none">{result}</ReactMarkdown>
              </div>
              <button onClick={() => { if (onViewChange) onViewChange(AppView.CHAT); }} className="w-full py-8 synergy-bg text-white rounded-[2.5rem] font-black uppercase text-lg shadow-2xl transition-all">ACCÉDER AU PROTOCOLE</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CellularCheck;
