
import React, { useEffect, useState } from 'react';
import { generateKeyQuotes } from '../services/geminiService';
import { FileData, Quote } from '../types';
import { Quote as QuoteIcon, Loader2, User, BookOpen } from 'lucide-react';

interface KeyQuotesModeProps {
  file: FileData;
}

export const KeyQuotesMode: React.FC<KeyQuotesModeProps> = ({ file }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        const data = await generateKeyQuotes(file);
        setQuotes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, [file]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-pink-500" />
        <p>Extraction des citations clés...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto p-4 md:p-8">
       <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-xl">
                <QuoteIcon className="w-8 h-8 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Citations Clés</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Passages essentiels extraits du document</p>
            </div>
        </div>

        <div className="grid gap-6">
            {quotes.map((quote, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-pink-500 to-purple-500"></div>
                    <QuoteIcon className="absolute top-4 right-4 w-12 h-12 text-slate-100 dark:text-slate-700 -rotate-12 opacity-50" />
                    
                    <figure className="relative z-10">
                        <blockquote className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-100 italic leading-relaxed mb-4">
                            "{quote.text}"
                        </blockquote>
                        <figcaption className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4">
                            {quote.author && (
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                                    <User className="w-4 h-4" />
                                    {quote.author}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                {quote.context}
                            </div>
                        </figcaption>
                    </figure>
                </div>
            ))}
        </div>
       </div>
    </div>
  );
};
