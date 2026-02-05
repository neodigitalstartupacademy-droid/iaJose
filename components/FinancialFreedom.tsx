
import React from 'react';
import { Globe, TrendingUp, Users, ShieldCheck, Zap, ArrowRight, DollarSign, Award, Map, Rocket, Sparkles } from 'lucide-react';

const FinancialFreedom: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      
      {/* Hero Section Or/Noir */}
      <div className="relative overflow-hidden rounded-[4rem] p-12 md:p-20 bg-slate-950 text-white shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-transparent opacity-50"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-500 text-black rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-pulse">
              <DollarSign size={24} strokeWidth={3} />
            </div>
            <span className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em]">Global NDSA Freedom Engine v6.5</span>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
            VOTRE <span className="text-amber-500">MULTINATIONALE</span> DIGITALE
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-slate-400 mb-12 leading-relaxed">
            L'ère des limites géographiques est révolue. L'IA Coach José porte votre business sur tous les continents où NeoLife est implanté.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <a 
              href="https://neolife.com/fr-bj/startupOpportunity/" 
              target="_blank" 
              className="px-10 py-6 bg-amber-500 text-black font-black rounded-3xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95"
            >
              DÉMARRER MON EMPIRE <ArrowRight size={22} />
            </a>
            <a 
              href="https://share.google/KiJ8dfrj63m5QJhxh" 
              target="_blank" 
              className="px-10 py-6 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-3xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              CARTE DU MONDE <Map size={22} />
            </a>
          </div>
        </div>
      </div>

      {/* Grid des Caractéristiques Core */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { 
            title: "Global Reach", 
            desc: "Accès direct aux sièges mondiaux NeoLife via le GMBC-OS. Votre bureau est partout.", 
            icon: <Globe size={32} className="text-amber-500" />
          },
          { 
            title: "Multilingual IA", 
            desc: "L'IA connaît toutes les langues et opère partout où vos liens sont cliqués.", 
            icon: <Zap size={32} className="text-blue-500" />
          },
          { 
            title: "Automated Success", 
            desc: "90% du travail (protocoles, closing, recrutement) est géré par l'IA Coach José.", 
            icon: <Rocket size={32} className="text-purple-500" />
          },
          { 
            title: "Total Inclusivity", 
            desc: "Étudiants, retraités, cultivateurs, artisans : votre succès est désormais une certitude mathématique.", 
            icon: <Users size={32} className="text-green-500" />
          }
        ].map((feat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 p-12 rounded-[3.5rem] shadow-lg group hover:scale-[1.02] transition-all">
            <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] w-fit group-hover:bg-amber-500 group-hover:text-black transition-all">
              {feat.icon}
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{feat.title}</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>

      {/* Closing Statement Box */}
      <div className="bg-amber-500 text-black p-12 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none"></div>
        <Sparkles className="mx-auto mb-8 opacity-40" size={60} />
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-10 leading-tight">
          LE CHOIX EST <span className="underline decoration-4">VÔTRE</span>
        </h2>
        <p className="text-xl md:text-2xl font-bold max-w-4xl mx-auto leading-relaxed italic">
          "Souhaitez-vous commander votre protocole sur la boutique officielle ou activer votre licence de distributeur/partenaire Neolife pour économiser jusqu'à 25% sur vos produits Neolife ? Notre système GMBC-OS est prêt à vous accompagner pour un succès mondial."
        </p>
        <div className="mt-12 flex justify-center gap-4">
           <div className="px-6 py-2 bg-black text-amber-500 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">SOUVERAINETÉ NDSA</div>
        </div>
      </div>
      
    </div>
  );
};

export default FinancialFreedom;
