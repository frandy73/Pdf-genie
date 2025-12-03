import React, { useState, useEffect } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { FileData, Flashcard } from '../types';
import { ChevronLeft, ChevronRight, RotateCw, Loader2, Shuffle, Volume2, VolumeX } from 'lucide-react';

interface FlashcardModeProps {
  file: FileData;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({ file }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  // Track which side is currently speaking
  const [speakingSide, setSpeakingSide] = useState<'front' | 'back' | null>(null);

  useEffect(() => {
    // Check browser support
    setSpeechSupported('speechSynthesis' in window);

    const loadCards = async () => {
      setLoading(true);
      try {
        const data = await generateFlashcards(file);
        setCards(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadCards();
    
    // Cleanup speech on unmount
    return () => {
        window.speechSynthesis.cancel();
    }
  }, [file]);

  const speakText = (text: string, side: 'front' | 'back', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    if (!speechSupported) return;

    // If clicking the same side that is speaking, stop it
    if (speakingSide === side) {
      window.speechSynthesis.cancel();
      setSpeakingSide(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingSide(side);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    
    utterance.onend = () => setSpeakingSide(null);
    utterance.onerror = () => setSpeakingSide(null);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setSpeakingSide(null);
  };

  const handleNext = () => {
    stopSpeech();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const handlePrev = () => {
    stopSpeech();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  const handleShuffle = () => {
    stopSpeech();
    // Fisher-Yates shuffle algorithm
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    stopSpeech();
    setIsFlipped(!isFlipped);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400" role="status">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
        <p>Création des cartes mémoire...</p>
      </div>
    );
  }

  if (cards.length === 0) return <div className="text-center p-10 text-slate-500 dark:text-slate-400">Aucune flashcard générée.</div>;

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Flashcards</h2>
        <p className="text-slate-500 dark:text-slate-400">Carte {currentIndex + 1} sur {cards.length}</p>
      </div>

      <div 
        className="relative w-full max-w-xl aspect-[3/2] perspective-1000 cursor-pointer group focus:outline-none"
        onClick={handleFlip}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard ${currentIndex + 1}. Contenu : ${isFlipped ? cards[currentIndex].back : cards[currentIndex].front}. Cliquez ou appuyez sur Entrée pour retourner.`}
      >
        <div 
          className={`
            relative w-full h-full text-center transition-all duration-700 transform-style-3d shadow-xl rounded-2xl
            ${isFlipped ? 'rotate-y-180' : ''}
          `}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors group-focus:ring-4 group-focus:ring-indigo-200 dark:group-focus:ring-indigo-900">
             {speechSupported && (
               <button
                 onClick={(e) => speakText(cards[currentIndex].front, 'front', e)}
                 className={`
                   absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-indigo-400
                   ${speakingSide === 'front' 
                     ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400 animate-pulse scale-110' 
                     : 'text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                 `}
                 title={speakingSide === 'front' ? "Arrêter" : "Écouter"}
                 aria-label="Écouter le recto"
               >
                 {speakingSide === 'front' ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
               </button>
             )}
            <span className="text-xs uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-widest mb-4">Question / Concept</span>
            <p className="text-2xl font-medium text-slate-800 dark:text-white leading-relaxed">{cards[currentIndex].front}</p>
            <div className="mt-8 text-xs text-slate-500 dark:text-slate-400 font-medium" aria-hidden="true">Cliquez pour retourner</div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-indigo-600 dark:bg-indigo-700 rounded-2xl rotate-y-180 flex flex-col items-center justify-center p-8 text-white">
             {speechSupported && (
               <button
                 onClick={(e) => speakText(cards[currentIndex].back, 'back', e)}
                 className={`
                   absolute top-4 right-4 p-2 rounded-full transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-white
                   ${speakingSide === 'back' 
                     ? 'bg-white text-indigo-600 ring-2 ring-indigo-200 animate-pulse scale-110' 
                     : 'text-indigo-200 hover:text-white hover:bg-indigo-500 dark:hover:bg-indigo-600'}
                 `}
                 title={speakingSide === 'back' ? "Arrêter" : "Écouter"}
                 aria-label="Écouter le verso"
               >
                 {speakingSide === 'back' ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
               </button>
             )}
            <span className="text-xs uppercase font-bold text-indigo-200 tracking-widest mb-4">Réponse / Définition</span>
            <p className="text-xl leading-relaxed">{cards[currentIndex].back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-12">
        <button
          onClick={handleShuffle}
          className="p-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          title="Mélanger les cartes"
          aria-label="Mélanger les cartes"
        >
          <Shuffle className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" aria-hidden="true"></div>

        <button 
          onClick={handlePrev}
          className="p-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          title="Précédent"
          aria-label="Carte précédente"
        >
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>

        <button 
          onClick={handleFlip}
          className="px-6 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800"
          title="Retourner la carte"
          aria-label="Retourner la carte"
        >
          <RotateCw className="w-4 h-4" aria-hidden="true" />
          Retourner
        </button>

        <button 
          onClick={handleNext}
          className="p-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500 transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          title="Suivant"
          aria-label="Carte suivante"
        >
          <ChevronRight className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};