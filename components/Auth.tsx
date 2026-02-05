
import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff, Zap, ShieldCheck, Terminal, CheckCircle } from 'lucide-react';
import { UserAccount } from '../types';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK, FOUNDER_EMAIL } from '../constants';

interface AuthProps {
  onLogin: (user: UserAccount) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isNDSAMode, setIsNDSAMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNDSAMode) setEmail(FOUNDER_EMAIL);
    else setEmail('');
  }, [isNDSAMode]);

  // Raccourci Souverain "M" - Discret et Instantané
  const handlePasswordChange = (val: string) => {
    // Si l'utilisateur tape 'M' ou 'm' en mode NDSA, on déclenche l'accès maître de manière invisible
    if (isNDSAMode && (val.toUpperCase() === 'M' || val.endsWith('M') || val.endsWith('m'))) {
      const fullPass = 'Makoutode1982@';
      setPassword(fullPass);
      // Auto-login instantané pour le fondateur
      onLogin({ 
        email: FOUNDER_EMAIL, 
        distData: { id: JOSE_ID, shopUrl: DEFAULT_NEOLIFE_LINK, joinDate: Date.now() } 
      });
      return;
    }
    setPassword(val);
  };

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
    <div className="min-h-screen bg-[#f8fafd] dark:bg-[#0f1115] flex items-center justify-center p-6 transition-colors duration-500">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-12">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-1000 shadow-2xl ${isNDSAMode ? 'bg-slate-900 text-blue-500 rotate-12' : 'synergy-bg text-white'}`}>
             {isNDSAMode ? <Zap size={40} className="animate-pulse" /> : <span className="text-4xl font-black italic tracking-tighter">J</span>}
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">COACH JOSÉ</h1>
          <p className="text-slate-400 text-[9px] font-black tracking-[0.6em] uppercase mt-3">Sovereign Access System</p>
        </div>

        <div className={`bg-white dark:bg-[#1e1f24] border rounded-[2.5rem] p-10 transition-all duration-700 shadow-xl ${isNDSAMode ? 'border-blue-500/30' : 'border-slate-100 dark:border-white/5'}`}>
          <div className="flex mb-10 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <button onClick={() => setIsNDSAMode(false)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!isNDSAMode ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400'}`}>Partenaire</button>
            <button onClick={() => setIsNDSAMode(true)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isNDSAMode ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>NDSA Souverain</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email / Identifiant</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => !isNDSAMode && setEmail(e.target.value)} 
                readOnly={isNDSAMode}
                placeholder={isNDSAMode ? FOUNDER_EMAIL : "votre@email.com"}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl py-4 px-6 text-sm font-bold transition-all outline-none focus:border-blue-500/50" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de Passe</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => handlePasswordChange(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 rounded-2xl py-4 px-6 text-sm font-bold transition-all outline-none focus:border-blue-500/50" 
                />
                {isNDSAMode && password === 'Makoutode1982@' && (
                  <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <button 
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-md border transition-all flex items-center justify-center ${rememberMe ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700'}`}
              >
                {rememberMe && <CheckCircle size={12} />}
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mémoriser ma session</span>
            </div>

            <button type="submit" className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 ${isNDSAMode ? 'bg-slate-900 text-blue-500 border border-blue-500/20' : 'synergy-bg text-white'}`}>
              {isNDSAMode ? 'ACCÈS SOUVERAIN' : 'OUVRIR LE SYSTÈME'}
              <ArrowRight size={18} className="inline ml-2" />
            </button>
            
            {error && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}
          </form>
        </div>
        
        <p className="text-center mt-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] opacity-30">NDSA SECURITY PROTOCOL v4.5</p>
      </div>
    </div>
  );
};

export default Auth;
