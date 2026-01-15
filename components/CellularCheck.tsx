
import React, { useState } from 'react';
import { Activity, ClipboardCheck, ArrowRight, RefreshCcw, Info, Volume2, Loader2, Square, Play } from 'lucide-react';
import { generateEducationalResponse, textToSpeech } from '../services/geminiService';
import { playPcmAudio, stopAllAudio } from '../services/audioService';
import ReactMarkdown from 'react-markdown';

const QUESTIONS = [
  { id: 'fatigue', text: 'Niveau de fatigue chronique (1-10)', type: 'range' },
  { id: 'digestion', text: 'Confort digestif global', options: ['Parfait', 'Ballonnements fréquents', 'Transit irrégulier', 'Douleurs'] },
  { id: 'sleep', text: 'Qualité du sommeil', options: ['Récupérateur', 'Difficile à s\'endormir', 'Réveils nocturnes', 'Insomnie'] },
  { id: 'stress', text: 'Niveau de stress quotidien', options: ['Gérable', 'Occasionnel', 'Élevé', 'Burn-out/Épuisement'] },
  { id: 'goal', text: 'Votre objectif prioritaire', options: ['Vitalité', 'Perte de poids', 'Soutien immunitaire', 'Performances sportives'] }
];

const CellularCheck: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const handleAnswer = (val: string) => {
    const q = QUESTIONS[step];
    setAnswers(prev => ({ ...prev, [q.id]: val }));
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      generateAnalysis({ ...answers, [q.id]: val });
    }
  };

  const generateAnalysis = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true);
    try {
      const prompt = `Générez un bilan de nutrition cellulaire basé sur ces données utilisateur : ${JSON.stringify(finalAnswers)}. 
      Suivez les règles de Coach JOSÉ : 
      1. Analyse fonctionnelle.
      2. Identifier le déséquilibre dominant.
      3. Proposer le Trio de Relance intelligent + max 1-2 produits spécifiques (Total max 5).
      4. Expliquer la logique cellulaire.
      5. Pas de promesse miracle, ton éducatif.`;
      
      const analysis = await generateEducationalResponse(prompt, true);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      setResult("Impossible de générer l'analyse pour le moment. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadResult = async () => {
    if (isReading) {
      stopAllAudio();
      setIsReading(false);
      return;
    }

    setIsReading(true);
    try {
      const base64Audio = await textToSpeech(result || "");
      if (base64Audio) {
        const source = await playPcmAudio(base64Audio);
        if (source) {
          source.onended = () => setIsReading(false);
        } else {
          setIsReading(false);
        }
      } else {
        setIsReading(false);
      }
    } catch (error) {
      console.error(error);
      setIsReading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    stopAllAudio();
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="glass-effect rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={24} />
            <h2 className="text-xl font-bold">Bilan Cellulaire Intelligent</h2>
          </div>
          <p className="text-blue-100 text-sm opacity-90">
            Identifiez votre déséquilibre dominant et recevez une recommandation précise.
          </p>
        </div>

        <div className="p-8">
          {!result && !isLoading && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {step + 1} / {QUESTIONS.length}</span>
                <div className="flex gap-1">
                  {QUESTIONS.map((_, i) => (
                    <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                  ))}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-8">{QUESTIONS[step].text}</h3>

              <div className="space-y-3">
                {QUESTIONS[step].options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className="w-full p-4 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-2xl transition-all flex items-center justify-between group"
                  >
                    <span className="font-medium text-slate-700">{opt}</span>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-lg font-bold text-slate-900">Coach JOSÉ analyse votre terrain...</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="text-green-600" /> Recommandation
                 </h3>
                 <div className="flex gap-4">
                   <button 
                     onClick={handleReadResult} 
                     className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${isReading ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                   >
                      {isReading ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />} 
                      {isReading ? 'Arrêter' : 'Écouter'}
                   </button>
                   <button onClick={reset} className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-xs font-bold uppercase transition-colors">
                      <RefreshCcw size={14} /> Reset
                   </button>
                 </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 prose prose-blue prose-sm max-w-none mb-8">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
                <Info className="text-blue-600 mt-1" size={20} />
                <div className="flex-1">
                   <h4 className="font-bold text-blue-900 mb-1">Coach JOSÉ vous accompagne</h4>
                   <p className="text-sm text-blue-800 leading-relaxed mb-4">
                     Ces produits NeoLife sont formulés pour nourrir vos cellules. Contactez votre distributeur pour démarrer.
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CellularCheck;
