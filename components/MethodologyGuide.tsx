
import React from 'react';
import { Eye, Database, Scale, BrainCircuit, Rocket, Compass, ArrowRight } from 'lucide-react';

export const MethodologyGuide: React.FC = () => {
  const steps = [
    {
      id: 1,
      category: "Compréhension & Contexte",
      subtitle: "Le Cadre",
      description: "Le but : Identifier rapidement le sujet, l'objectif principal de l'auteur, et le contexte de publication. Ce niveau établit votre base de connaissance.",
      keyQuestions: "Qui ? Quoi ? Quand ? Pourquoi ? (Ex : Quelle est la thèse centrale ? Pour quel public l'auteur écrit-il ?)",
      icon: Eye,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
    },
    {
      id: 2,
      category: "Extraction Factuelle",
      subtitle: "La Moëlle",
      description: "Le but : Isoler tous les faits, les preuves et les définitions nécessaires à la mémorisation. Ce niveau crée le matériel brut pour vos Flashcards.",
      keyQuestions: "Quels faits ? Quelles définitions ? (Ex : Quels sont les trois arguments principaux ? Liste des termes techniques.)",
      icon: Database,
      color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
    },
    {
      id: 3,
      category: "Analyse Structurelle",
      subtitle: "L'Évaluation",
      description: "Le but : Évaluer la qualité et la logique de l'argumentation. Vous passez de la simple lecture à la pensée critique en identifiant les forces et les faiblesses.",
      keyQuestions: "Comment ? Y a-t-il des limites ? (Ex : L'argumentation est-elle cohérente ? Quelles sont les faiblesses de la preuve ?)",
      icon: Scale,
      color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
    },
    {
      id: 4,
      category: "Synthèse & Mémorisation",
      subtitle: "La Rétention",
      description: "Le but : Transformer l'information extraite en outils de révision. Ce niveau produit directement vos Quiz, Q/R, et synthèses finales pour tester votre savoir.",
      keyQuestions: "Comment le tester ? Comment le résumer ? (Ex : Générez un QCM sur la section 2. Quel est le point clé à retenir de cette idée ?)",
      icon: BrainCircuit,
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
    },
    {
      id: 5,
      category: "Application & Projection",
      subtitle: "La Valeur Ajoutée",
      description: "Le but : Donner un sens pratique au document en appliquant ses idées à des situations réelles et en anticipant les conséquences futures.",
      keyQuestions: "Et après ? Comment l'utiliser ? (Ex : Comment puis-je appliquer ce principe dans mon travail ? Quelles sont les implications futures de cette découverte ?)",
      icon: Rocket,
      color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800"
    }
  ];

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto p-4 md:p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
            <Compass className="w-6 h-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Guide Méthodologique</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-8 ml-1">
          Suivez ces 5 étapes pour maîtriser n'importe quel document PDF avec StudyGenius.
        </p>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md"
            >
              {/* Number Indicator */}
              <div className="absolute top-0 left-0 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-br-xl text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-b border-slate-200 dark:border-slate-600">
                ÉTAPE 0{step.id}
              </div>

              {/* Icon Section */}
              <div className={`p-6 md:w-32 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r ${step.color.replace('bg-', 'bg-opacity-20 ')} border-opacity-50`}>
                <div className={`p-3 rounded-full ${step.color} bg-opacity-100 mb-2`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {step.category}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${step.color} bg-opacity-20 border`}>
                    {step.subtitle}
                  </span>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  {step.description}
                </p>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                    <div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">Questions Clés</span>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic">
                        "{step.keyQuestions}"
                        </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
