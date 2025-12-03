import React, { useState, useEffect, useMemo } from 'react';
import { generateFAQ } from '../services/geminiService';
import { FileData, QAPair } from '../types';
import { HelpCircle, ChevronDown, ChevronUp, Loader2, Search, X, SortAsc, ListOrdered } from 'lucide-react';

export const FAQMode: React.FC<{ file: FileData }> = ({ file }) => {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'ORIGINAL' | 'AZ'>('ORIGINAL');

  useEffect(() => {
    const fetchFAQ = async () => {
      setLoading(true);
      try {
        const data = await generateFAQ(file);
        setQaPairs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQ();
  }, [file]);

  // Reset open item when search query changes to avoid confusion
  useEffect(() => {
    setOpenIndex(null);
  }, [searchQuery, sortOrder]);

  const filteredAndSortedPairs = useMemo(() => {
    let result = qaPairs.filter(pair => 
      pair.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOrder === 'AZ') {
        // Create a copy before sorting to preserve immutability if needed, though filter creates new array
        result.sort((a, b) => a.question.localeCompare(b.question));
    }
    
    return result;
  }, [qaPairs, searchQuery, sortOrder]);

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-900/60 text-slate-900 dark:text-white font-semibold rounded px-0.5 shadow-sm border border-yellow-300 dark:border-yellow-700/50">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 animate-in fade-in" role="status">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
        <p>Analyse du document et génération des Q&R...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto p-4 md:p-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Questions Fréquentes</h2>
            </div>
            
            {/* Sort Options */}
            <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm self-start md:self-auto">
                <button 
                    onClick={() => setSortOrder('ORIGINAL')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sortOrder === 'ORIGINAL' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    title="Ordre original"
                >
                    <ListOrdered className="w-4 h-4" />
                    <span className="hidden sm:inline">Défaut</span>
                </button>
                <button 
                    onClick={() => setSortOrder('AZ')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${sortOrder === 'AZ' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    title="Ordre alphabétique"
                >
                    <SortAsc className="w-4 h-4" />
                    <span className="hidden sm:inline">A-Z</span>
                </button>
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm"
            placeholder="Rechercher des mots-clés (ex: définition, concept)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Rechercher dans la FAQ"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Results Counter */}
        {searchQuery && (
            <div className="mb-4 text-sm text-slate-500 dark:text-slate-400 px-1 font-medium animate-in fade-in">
                {filteredAndSortedPairs.length} résultat{filteredAndSortedPairs.length > 1 ? 's' : ''} trouvé{filteredAndSortedPairs.length > 1 ? 's' : ''}
            </div>
        )}

        <div className="space-y-4 min-h-[300px]">
          {qaPairs.length === 0 ? (
             <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
               Impossible de générer des questions pour ce document.
             </div>
          ) : filteredAndSortedPairs.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Aucun résultat trouvé</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">Essayez d'autres mots-clés ou vérifiez l'orthographe.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
              >
                Effacer le filtre
              </button>
            </div>
          ) : (
            filteredAndSortedPairs.map((pair, idx) => (
            <div 
              key={`${idx}-${pair.question.substring(0, 10)}`} 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-900/50"
            >
              <button 
                id={`faq-button-${idx}`}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
                aria-controls={`faq-content-${idx}`}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-700/50"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-lg pr-4 leading-relaxed">
                    {highlightText(pair.question, searchQuery)}
                </span>
                {openIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400 min-w-[20px]" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500 min-w-[20px]" aria-hidden="true" />
                )}
              </button>
              
              <div 
                id={`faq-content-${idx}`}
                role="region"
                aria-labelledby={`faq-button-${idx}`}
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out bg-slate-50 dark:bg-slate-800/50
                  ${openIndex === idx ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="p-6 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                  {highlightText(pair.answer, searchQuery)}
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
};
