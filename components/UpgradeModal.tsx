
import React from 'react';
import { X, Check, Star, Zap, Shield, Crown, MessageCircle, Phone } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  // REMPLACEZ CE NUMÉRO PAR LE VOTRE (Format international sans +)
  const WHATSAPP_NUMBER = "1234567890"; 
  
  const handleWhatsAppPurchase = () => {
    // 1. Construire le lien WhatsApp
    const message = encodeURIComponent("Bonjour, je souhaite souscrire à l'offre StudyGenius Pro pour débloquer toutes les fonctionnalités.");
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    // 2. Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank');

    // 3. Simuler l'activation (Pour la démo seulement - En production, vous activeriez après paiement)
    const btn = document.getElementById('whatsapp-btn');
    if (btn) {
        btn.textContent = "Vérification en cours...";
        btn.classList.add('opacity-75', 'cursor-wait');
    }
    
    // On active le mode premium après un court délai pour permettre à l'utilisateur de tester
    setTimeout(() => {
        onUpgrade();
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl my-auto flex flex-col lg:flex-row overflow-hidden animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] lg:max-h-none">
        
        {/* Close Button (Mobile optimized placement) */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 text-white/80 lg:text-slate-400 hover:text-white lg:hover:text-slate-600 dark:hover:text-slate-200 bg-black/20 lg:bg-transparent p-2 rounded-full hover:bg-black/40 lg:hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Fermer"
        >
            <X className="w-6 h-6" />
        </button>

        {/* Left Side - Visual & Value Prop */}
        <div className="w-full lg:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Decorative Blobs */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-20%] left-[-20%] w-64 h-64 rounded-full bg-white blur-3xl"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 rounded-full bg-pink-500 blur-3xl"></div>
          </div>
          
          <div className="relative z-10 mt-8 lg:mt-0">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-6 border border-white/10">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span>Devenez un Génie</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">Débloquez tout le potentiel de vos études.</h2>
            <p className="text-indigo-100 opacity-90 text-sm sm:text-base">Rejoignez l'élite des étudiants. Quiz illimités, exports PDF et analyses approfondies.</p>
          </div>

          <div className="relative z-10 mt-8 space-y-4 hidden sm:block">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><Zap className="w-5 h-5" /></div>
                <span className="font-medium text-sm">IA sans limite de vitesse</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg"><Shield className="w-5 h-5" /></div>
                <span className="font-medium text-sm">Garantie satisfait ou remboursé</span>
             </div>
          </div>
        </div>

        {/* Right Side - Pricing & Action */}
        <div className="w-full lg:w-3/5 p-6 sm:p-8 lg:p-10 bg-white dark:bg-slate-800 flex flex-col overflow-y-auto">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center lg:text-left">Choisir votre plan</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center lg:text-left mb-8 text-sm">Passez au niveau supérieur dès aujourd'hui.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Free Plan */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Gratuit</h4>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">0 FCFA <span className="text-sm font-normal text-slate-500">/mois</span></div>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Quiz limités (5 questions)</li>
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Résumés courts</li>
                    <li className="flex gap-2 items-center text-slate-400"><X className="w-4 h-4 flex-shrink-0" /> Pas d'export PDF</li>
                </ul>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-5 relative bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                    Recommandé
                </div>
                <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-2">Pro Premium</h4>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3000 FCFA <span className="text-sm font-normal text-slate-500">/mois</span></div>
                <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> <b>Tout illimité</b></li>
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> Quiz longs & Flashcards</li>
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-indigo-600 flex-shrink-0" /> Exportation & Impression</li>
                </ul>
            </div>
          </div>

          <div className="mt-auto">
            <button
                id="whatsapp-btn"
                onClick={handleWhatsAppPurchase}
                className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
                <MessageCircle className="w-6 h-6 fill-current" />
                <span>Activer via WhatsApp</span>
            </button>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Contact direct avec le manager pour validation instantanée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
