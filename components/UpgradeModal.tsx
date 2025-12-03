
import React from 'react';
import { X, Check, Star, Zap, Shield, Crown } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  const handleSubscribe = () => {
    // Ici, vous intégreriez Stripe ou PayPal en réalité
    // Pour la démo, on simule un succès immédiat
    const btn = document.getElementById('sub-btn');
    if (btn) {
        btn.textContent = "Traitement...";
        btn.setAttribute('disabled', 'true');
    }
    
    setTimeout(() => {
        onUpgrade();
        onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Left Side - Visual */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
             <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-pink-500 blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span>Devenez un Génie</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 leading-tight">Débloquez tout le potentiel de vos études.</h2>
            <p className="text-indigo-100 opacity-90">Rejoignez des milliers d'étudiants qui améliorent leurs notes avec StudyGenius Pro.</p>
          </div>

          <div className="relative z-10 mt-8 space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><Zap className="w-5 h-5" /></div>
                <span className="font-medium">IA plus rapide & illimitée</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><Shield className="w-5 h-5" /></div>
                <span className="font-medium">Exportation PDF & Impression</span>
             </div>
          </div>
        </div>

        {/* Right Side - Pricing */}
        <div className="w-full md:w-3/5 p-8 bg-white dark:bg-slate-800 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center md:text-left">Choisir votre plan</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Free Plan */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 opacity-70 hover:opacity-100 transition-opacity">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Gratuit</h4>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">0€ <span className="text-sm font-normal text-slate-500">/mois</span></div>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Quiz limités (5 questions)</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Résumés standards</li>
                    <li className="flex gap-2 text-slate-400"><X className="w-4 h-4" /> Pas d'export PDF</li>
                    <li className="flex gap-2 text-slate-400"><X className="w-4 h-4" /> Pas de support prioritaire</li>
                </ul>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-5 relative bg-indigo-50/50 dark:bg-indigo-900/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Recommandé
                </div>
                <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-2">Pro</h4>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4.99€ <span className="text-sm font-normal text-slate-500">/mois</span></div>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-6">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-indigo-600" /> <b>Tout illimité</b></li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-indigo-600" /> Quiz longs (15+ questions)</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-indigo-600" /> Résumés détaillés</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-indigo-600" /> Exportation & Impression</li>
                </ul>
            </div>
          </div>

          <button
            id="sub-btn"
            onClick={handleSubscribe}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Star className="w-5 h-5 fill-current" />
            Passer à la version Pro
          </button>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
            Paiement sécurisé. Annulation possible à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
};
