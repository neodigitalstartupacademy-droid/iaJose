
import React, { useState } from 'react';
import { Mail, Lock, UserPlus, LogIn, ShieldCheck, ArrowRight, Sparkles, Crown, Terminal } from 'lucide-react';
import { UserAccount } from '../types';
import { JOSE_ID, DEFAULT_NEOLIFE_LINK } from '../constants';

interface AuthProps {
  onLogin: (user: UserAccount) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFounderMode, setIsFounderMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [founderKey, setFounderKey] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isFounderMode) {
      if (email === 'jose@gmbcos.com' && founderKey === 'JOSE_GMBC_2025') {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100 rounded-full blur-[120px] opacity-30"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transition-all duration-500 rotate-3 hover:rotate-0 ${isFounderMode ? 'bg-slate-900 shadow-amber-500/50 scale-110' : 'bg-blue-600 shadow-blue-200'}`}>
            {isFounderMode ? <Crown className="text-amber-500" size={40} /> : <span className="text-white text-4xl font-black">J</span>}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {isFounderMode ? 'ACCÈS ARCHITECTE' : 'COACH JOSÉ'}
          </h1>
          <p className="text-slate-500 font-medium italic">
            {isFounderMode ? 'Bienvenue chez vous, José.' : 'Votre Système Intelligent NeoLife'}
          </p>
        </div>

        <div className={`glass-effect rounded-[2.5rem] p-8 lg:p-10 shadow-2xl border transition-all duration-500 ${isFounderMode ? 'border-amber-500/30 shadow-amber-500/10' : 'border-white/50 shadow-slate-200'}`}>
          <div className="flex mb-8 p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => { setIsRegistering(false); setIsFounderMode(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${!isRegistering && !isFounderMode ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
            >
              <LogIn size={14} /> Connexion
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setIsFounderMode(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${isRegistering ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
            >
              <UserPlus size={14} /> Inscription
            </button>
            <button 
              onClick={() => { setIsFounderMode(true); setIsRegistering(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${isFounderMode ? 'bg-slate-900 shadow-md text-amber-500' : 'text-slate-500'}`}
            >
              <Crown size={14} /> Fondateur
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isFounderMode ? 'text-amber-500' : 'text-slate-400'}`} size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isFounderMode ? "jose@gmbcos.com" : "votre@email.com"}
                  className={`w-full bg-slate-50 border outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all ${isFounderMode ? 'border-amber-500/30 focus:border-amber-500 text-slate-900' : 'border-slate-200 focus:border-blue-500'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {isFounderMode ? 'Code Architecte' : 'Mot de passe'}
              </label>
              <div className="relative">
                {isFounderMode ? (
                  <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                ) : (
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                )}
                <input 
                  type="password" 
                  value={isFounderMode ? founderKey : password}
                  onChange={(e) => isFounderMode ? setFounderKey(e.target.value) : setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all ${isFounderMode ? 'border-amber-500/30 focus:border-amber-500' : 'border-slate-200 focus:border-blue-500'}`}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
                <ShieldCheck size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${isFounderMode ? 'bg-slate-900 hover:bg-black text-amber-500 shadow-amber-500/10' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
            >
              {isFounderMode ? 'LANCER GOD MODE' : isRegistering ? 'Créer mon compte' : 'Accéder au système'}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <Sparkles size={12} className={isFounderMode ? 'text-amber-500' : 'text-blue-500'} /> Accès Fondateur Permanent Activé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
