
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateHighlights, SummaryLength } from '../services/geminiService';
import { FileData } from '../types';
import { Lightbulb, Loader2, RefreshCw, Copy, Check, AlignLeft, AlignCenter, AlignJustify, Volume2, Square, Lock } from 'lucide-react';

export const Highlights: React.FC<{ file: FileData; isPremium?: boolean; onShowUpgrade?: () => void }> = ({ file, isPremium = false, onShowUpgrade = () => {} }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('MEDIUM');
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);

  useEffect(() => {
    setSpeechSynthesisSupported('speechSynthesis' in window);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const fetchHighlights = async () => {
    setLoading(true);
    // Stop any ongoing speech when regenerating
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    try {
      const text = await generateHighlights(file, summaryLength);
      setContent(text);
    } catch (e) {
      setContent("Erreur lors de la génération des points clés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [file, summaryLength]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'fr-FR'; // Set to French
      utterance.rate = 1.0;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleLengthChange = (length: SummaryLength) => {
    if (!isPremium && length === 'LONG') {
        onShowUpgrade();
    } else {
        setSummaryLength(length);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 animate-in fade-in duration-500" role="status">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-yellow-500" aria-hidden="true" />
        <p className="font-medium">Analyse intelligente et extraction des Highlights ({summaryLength.toLowerCase()})...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-2">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-white">Highlights & Résumé</h2>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
            {/* Length Selector */}
            <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm" role="group" aria-label="Longueur du résumé">
                <button
                    onClick={() => handleLengthChange('SHORT')}
                    aria-pressed={summaryLength === 'SHORT'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${summaryLength === 'SHORT' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    title="Résumé court"
                >
                    <AlignLeft className="w-3 h-3" /> Court
                </button>
                <button
                    onClick={() => handleLengthChange('MEDIUM')}
                    aria-pressed={summaryLength === 'MEDIUM'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${summaryLength === 'MEDIUM' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    title="Résumé moyen"
                >
                    <AlignCenter className="w-3 h-3" /> Moyen
                </button>
                <button
                    onClick={() => handleLengthChange('LONG')}
                    aria-pressed={summaryLength === 'LONG'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!isPremium ? 'opacity-60 cursor-pointer' : ''} ${summaryLength === 'LONG' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    title="Résumé détaillé"
                >
                    {!isPremium ? <Lock className="w-3 h-3" /> : <AlignJustify className="w-3 h-3" />} Long
                </button>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

            {/* Actions */}
            <div className="flex gap-2">
                {speechSynthesisSupported && (
                  <button
                    onClick={toggleSpeech}
                    aria-label={isSpeaking ? "Arrêter la lecture" : "Lire le résumé"}
                    className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isSpeaking 
                        ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 ring-2 ring-red-100 dark:ring-red-900 animate-pulse' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                    }`}
                    title={isSpeaking ? "Arrêter" : "Écouter"}
                  >
                    {isSpeaking ? <Square className="w-4 h-4 fill-current" aria-hidden="true" /> : <Volume2 className="w-4 h-4" aria-hidden="true" />}
                    <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Écouter"}</span>
                  </button>
                )}

                <button 
                    onClick={handleCopy}
                    aria-label={copied ? "Copié dans le presse-papier" : "Copier le contenu"}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    title="Copier"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                    <span className="hidden sm:inline">{copied ? "Copié" : "Copier"}</span>
                </button>
                <button 
                    onClick={fetchHighlights}
                    aria-label="Régénérer le résumé"
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    title="Régénérer"
                >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Régénérer</span>
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="prose prose-slate dark:prose-invert prose-headings:text-indigo-900 dark:prose-headings:text-indigo-300 prose-li:marker:text-yellow-500 max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
