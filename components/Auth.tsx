
import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, ShieldCheck, ArrowRight, Sparkles, Crown, Terminal, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK } from '../constants';

interface AuthProps {
  onLogin: (user: UserAccount) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFounderMode, setIsFounderMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showFounderKey, setShowFounderKey] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [founderKey, setFounderKey] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isFounderMode) {
      if (email === 'neodigitalstartupacademy@gmail.com' && founderKey === 'Makoutode1982@') {
        const founderUser: UserAccount = {
          email,
          distData: {
            id: JOSE_ID,
            shopUrl: DEFAULT_NEOLIFE_LINK,
            joinDate: Date.now()
          }
        };
        onLogin(founderUser);
        return;
      } else {
        setError('Identifiants Fondateur invalides.');
        return;
      }
    }

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('jose_users') || '[]');

    if (isRegistering) {
      if (users.find((u: any) => u.email === email)) {
        setError('Cet email est déjà utilisé.');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const refId = params.get('ref') || JOSE_ID;
      const shop = params.get('shop') || DEFAULT_NEOLIFE_LINK;

      const newUser: UserAccount = {
        email,
        password,
        distData: {
          id: refId,
          shopUrl: shop,
          joinDate: Date.now()
        }
      };

      users.push(newUser);
      localStorage.setItem('jose_users', JSON.stringify(users));
      onLogin(newUser);
    } else {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Email ou mot de passe incorrect.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] synergy-bg rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl transition-all duration-700 ${isFounderMode ? 'bg-slate-900 shadow-amber-500/30 rotate-12 scale-110' : 'synergy-bg shadow-blue-200'}`}>
            {isFounderMode ? <Crown className="text-amber-500" size={48} /> : <span className="text-white text-5xl font-black">J</span>}
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase">
            {isFounderMode ? 'ARCHITECTE' : 'COACH JOSÉ'}
          </h1>
          <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">
            {isFounderMode ? 'Système Souverain GMBC-OS' : 'Votre IA de croissance NeoLife'}
          </p>
        </div>

        <div className={`bg-white rounded-[3rem] p-10 shadow-2xl border-4 transition-all duration-500 ${isFounderMode ? 'border-amber-500' : 'border-slate-50'}`}>
          <div className="flex mb-10 p-2 bg-slate-50 rounded-2xl">
            <button 
              onClick={() => { setIsRegistering(false); setIsFounderMode(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!isRegistering && !isFounderMode ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
            >
              <LogIn size={14} /> Connexion
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setIsFounderMode(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isRegistering ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
            >
              <UserPlus size={14} /> Inscription
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identifiant</label>
              <div className="relative">
                <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 ${isFounderMode ? 'text-amber-500' : 'text-slate-400'}`} size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-slate-50 border-2 border-slate-50 outline-none rounded-2xl py-5 pl-14 pr-4 text-sm font-bold focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isFounderMode ? 'Clé de Souveraineté' : 'Mot de passe'}</label>
                {!isFounderMode && password.length > 0 && (
                  <span className={`text-[9px] font-bold uppercase ${password.length > 8 ? 'text-green-500' : 'text-amber-500'}`}>
                    {password.length > 8 ? 'SÉCURISÉ' : 'FAIBLE'}
                  </span>
                )}
              </div>
              <div className="relative group">
                {isFounderMode ? (
                  <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
                ) : (
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                )}
                <input 
                  type={isFounderMode ? (showFounderKey ? "text" : "password") : (showPassword ? "text" : "password")}
                  value={isFounderMode ? founderKey : password}
                  onChange={(e) => isFounderMode ? setFounderKey(e.target.value) : setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border-2 outline-none rounded-2xl py-5 pl-14 pr-14 text-sm font-bold transition-all ${isFounderMode ? 'border-amber-200 focus:border-amber-500' : 'border-slate-50 focus:border-blue-600 focus:bg-white'}`}
                />
                <button 
                  type="button"
                  onClick={() => isFounderMode ? setShowFounderKey(!showFounderKey) : setShowPassword(!showPassword)}
                  className={`absolute right-5 top-1/2 -translate-y-1/2 transition-all p-1 rounded-md ${showPassword || showFounderKey ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  {(isFounderMode ? showFounderKey : showPassword) ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {showPassword && !isFounderMode && (
                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-2">
                  <CheckCircle2 size={10} /> Mode visibilité activé - Vérifiez votre saisie
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-2xl flex items-center gap-2 animate-pulse">
                <ShieldCheck size={16} /> {error}
              </div>
            )}

            <button 
              type="submit"
              className={`w-full font-black py-6 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 text-xs uppercase tracking-[0.2em] ${isFounderMode ? 'bg-slate-900 text-amber-500 hover:bg-black shadow-amber-500/20' : 'synergy-bg text-white hover:opacity-90 shadow-blue-200'}`}
            >
              {isFounderMode ? 'ACTIVER SYSTÈME' : isRegistering ? 'Initialiser Compte' : 'Accéder au Système'}
              <ArrowRight size={20} />
            </button>
          </form>

          <button 
            onClick={() => setIsFounderMode(!isFounderMode)}
            className="w-full mt-8 text-[9px] font-black text-slate-300 uppercase tracking-widest hover:text-amber-500 transition-colors"
          >
            {isFounderMode ? 'Retour à la connexion standard' : 'Accès Fondateur GMBC-OS'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
