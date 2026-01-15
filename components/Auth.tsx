
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

  // Pré-remplissage pour le mode NDSA
  useEffect(() => {
    if (isNDSAMode) {
      setEmail('neodigitalstartupacademy@gmail.com');
    } else {
      setEmail('');
    }
  }, [isNDSAMode]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isNDSAMode) {
      if (password === 'Makoutode1982@') {
        onLogin({
          email: 'neodigitalstartupacademy@gmail.com',
          distData: { id: JOSE_ID, shopUrl: DEFAULT_NEOLIFE_LINK, joinDate: Date.now() }
        });
        return;
      }
      setError('Clé de souveraineté invalide.');
      return;
    }

    if (!email || !password) {
      setError('Identifiants requis.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('jose_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Identifiants incorrects.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-12">
          <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 transition-all duration-1000 shadow-2xl ${isNDSAMode ? 'bg-slate-950 text-blue-500 rotate-12 scale-110' : 'synergy-bg text-white'}`}>
             {isNDSAMode ? <Zap size={44} className="animate-pulse fill-current" /> : <span className="text-5xl font-black italic">J</span>}
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">COACH JOSÉ</h1>
          <p className="text-slate-400 text-[10px] font-black tracking-[0.5em] uppercase mt-3">Elite Closing System</p>
        </div>

        <div className={`bg-white border-2 rounded-[3.5rem] p-12 transition-all duration-700 ${isNDSAMode ? 'border-slate-950 shadow-[0_40px_80px_rgba(0,0,0,0.15)]' : 'border-slate-50 shadow-sm'}`}>
          <div className="flex mb-10 p-1.5 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setIsNDSAMode(false)}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isNDSAMode ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
            >
              Partenaire
            </button>
            <button 
              onClick={() => setIsNDSAMode(true)}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isNDSAMode ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400'}`}
            >
              NDSA
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Architecte</label>
              <div className="relative">
                <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 ${isNDSAMode ? 'text-blue-500' : 'text-slate-300'}`} size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => !isNDSAMode && setEmail(e.target.value)}
                  readOnly={isNDSAMode}
                  placeholder="votre@email.com"
                  className={`w-full border-2 outline-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold transition-all ${isNDSAMode ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-50 focus:border-blue-600 focus:bg-white'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de Passe</label>
              <div className="relative">
                {isNDSAMode ? <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} /> : <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />}
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border-2 outline-none rounded-2xl py-5 pl-14 pr-14 text-sm font-bold transition-all ${isNDSAMode ? 'bg-slate-950 border-slate-900 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-50 focus:border-blue-600 focus:bg-white'}`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-5 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-2xl flex items-center gap-3 animate-bounce">
                <ShieldCheck size={18} /> {error}
              </div>
            )}

            <button 
              type="submit"
              className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 ${isNDSAMode ? 'bg-slate-950 text-blue-500 hover:bg-black border border-blue-500/20' : 'synergy-bg text-white hover:opacity-90'}`}
            >
              {isNDSAMode ? 'ENTRER DANS LA TOUR' : 'OUVRIR LE SYSTÈME'}
              <ArrowRight size={22} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
