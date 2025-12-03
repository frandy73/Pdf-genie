
import React from 'react';
import { X, Check, Zap, Shield, Crown, MessageCircle } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  // Numéro WhatsApp du manager (Exemple générique, à remplacer)
  const WHATSAPP_NUMBER = "237000000000"; 
  
  const handleWhatsAppPurchase = () => {
    // Message pré-rempli pour faciliter la validation
    const message = encodeURIComponent("Bonjour, je souhaite activer mon compte Premium StudyGenius. Je suis prêt à procéder au paiement.");
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    window.open(whatsappUrl, '_blank');

    // Feedback visuel sur le bouton
    const btn = document.getElementById('whatsapp-btn');
    if (btn) {
        btn.innerHTML = `<span class="animate-pulse">Validation en attente...</span>`;
        btn.classList.add('opacity-75', 'cursor-wait');
    }
    
    // Simulation d'activation pour la démo (dans un vrai cas, l'admin active le compte après réception)
    setTimeout(() => {
        onUpgrade();
        onClose();
    }, 6000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center">
      {/* Container principal responsive : Pleine largeur mobile, max-width desktop, flex column mobile, row desktop */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col lg:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-300 ring-1 ring-white/10">
        
        {/* Bouton Fermer */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 p-2 rounded-full text-slate-500 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Fermer"
        >
            <X className="w-5 h-5" />
        </button>

        {/* Côté Gauche : Visuel & Avantages */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Décoration d'arrière-plan */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white blur-3xl"></div>
             <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-pink-500 blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-6 border border-white/10 uppercase tracking-wide shadow-lg">
                <Crown className="w-3 h-3 text-yellow-300" />
                <span>Offre Premium</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">Libérez votre potentiel.</h2>
            <p className="text-indigo-100 text-lg opacity-90">Accédez à des outils d'étude illimités et boostez vos résultats.</p>
          </div>

          <div className="relative z-10 mt-8 space-y-5">
             <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors"><Zap className="w-6 h-6 text-yellow-300" /></div>
                <div>
                    <div className="font-bold text-lg">IA Illimitée</div>
                    <div className="text-xs text-indigo-200 opacity-80">Générez autant de quiz et résumés que nécessaire.</div>
                </div>
             </div>
             <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors"><Shield className="w-6 h-6 text-emerald-300" /></div>
                <div>
                    <div className="font-bold text-lg">Validation Simplifiée</div>
                    <div className="text-xs text-indigo-200 opacity-80">Contact direct via WhatsApp pour activer votre compte.</div>
                </div>
             </div>
          </div>
        </div>

        {/* Côté Droit : Plans & Action de paiement */}
        <div className="w-full lg:w-7/12 p-6 lg:p-10 bg-white dark:bg-slate-800 flex flex-col">
          <div className="text-center lg:text-left mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choisissez votre formule</h3>
            <p className="text-slate-500 dark:text-slate-400">Investissez dans votre réussite dès aujourd'hui.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Plan Gratuit */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-slate-50 dark:bg-slate-800/50 opacity-75 hover:opacity-100">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300">Standard</h4>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Gratuit</div>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-slate-400" /> Quiz simples (5 questions)</li>
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-slate-400" /> Mode lecture limité</li>
                </ul>
            </div>

            {/* Plan Premium */}
            <div className="border-2 border-indigo-600 dark:border-indigo-500 rounded-xl p-5 relative bg-indigo-50/50 dark:bg-indigo-900/10 cursor-pointer shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-md flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-current" /> Recommandé
                </div>
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-indigo-700 dark:text-indigo-400">Premium</h4>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5000 FCFA <span className="text-xs font-normal text-slate-500">/an</span></div>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" /> <b>Export PDF & Impression</b></li>
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" /> Quiz & Flashcards illimités</li>
                    <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" /> Résumés détaillés (Long)</li>
                </ul>
            </div>
          </div>

          <div className="mt-auto">
            <button
                id="whatsapp-btn"
                onClick={handleWhatsAppPurchase}
                className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 dark:shadow-none transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 group focus:outline-none focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900"
            >
                <MessageCircle className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                <span>Contacter le Manager pour Payer</span>
            </button>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
                Paiement sécurisé par Mobile Money (Orange/MTN) ou virement.<br/>
                Votre compte sera activé instantanément par le manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
