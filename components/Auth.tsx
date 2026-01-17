
import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff, Zap, ShieldCheck, Terminal } from 'lucide-react';
import { UserAccount } from '../types';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK, FOUNDER_EMAIL } from '../constants';

interface AuthProps {
  onLogin: (user: UserAccount) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isNDSAMode, setIsNDSAMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNDSAMode) setEmail(FOUNDER_EMAIL);
    else setEmail('');
  }, [isNDSAMode]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isNDSAMode) {
      if (password === 'Makoutode1982@') {
        onLogin({ email: FOUNDER_EMAIL, distData: { id: JOSE_ID, shopUrl: DEFAULT_NEOLIFE_LINK, joinDate: Date.now() } });
        return;
      }
      setError('Clé invalide.');
      return;
    }
    if (!email || !password) { setError('Identifiants requis.'); return; }
    const users = JSON.parse(localStorage.getItem('jose_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    if (user) onLogin(user); else setError('Identifiants incorrects.');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-ndsa-dark flex items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-12">
          <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 transition-all duration-1000 shadow-2xl ${isNDSAMode ? 'bg-slate-950 text-blue-500 rotate-12' : 'synergy-bg text-white'}`}>
             {isNDSAMode ? <Zap size={44} className="animate-pulse" /> : <span className="text-5xl font-black italic">J</span>}
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">COACH JOSÉ</h1>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black tracking-[0.5em] uppercase mt-3">Elite Closing System</p>
        </div>

        <div className={`bg-white dark:bg-slate-900 border-2 rounded-[3.5rem] p-12 transition-all duration-700 ${isNDSAMode ? 'border-slate-950 shadow-2xl' : 'border-slate-50 dark:border-slate-800 shadow-sm'}`}>
          <div className="flex mb-10 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button onClick={() => setIsNDSAMode(false)} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isNDSAMode ? 'bg-white dark:bg-slate-950 dark:text-blue-400 shadow-md text-blue-600' : 'text-slate-400'}`}>Partenaire</button>
            <button onClick={() => setIsNDSAMode(true)} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isNDSAMode ? 'bg-slate-950 dark:bg-slate-950 text-white shadow-lg' : 'text-slate-400'}`}>NDSA</button>
          </div>
          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input type="email" value={email} onChange={(e) => !isNDSAMode && setEmail(e.target.value)} readOnly={isNDSAMode} className="w-full border-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-2xl py-5 px-6 text-sm font-bold transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de Passe</label>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-2xl py-5 px-6 text-sm font-bold transition-all" />
            </div>
            <button type="submit" className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all ${isNDSAMode ? 'bg-slate-950 text-blue-500 border border-blue-500/20' : 'synergy-bg text-white'}`}>
              {isNDSAMode ? 'ENTRER DANS LA TOUR' : 'OUVRIR LE SYSTÈME'}
              <ArrowRight size={22} className="inline ml-2" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
