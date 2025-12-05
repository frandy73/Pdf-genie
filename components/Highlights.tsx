
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateHighlights, SummaryLength } from '../services/geminiService';
import { FileData, Language } from '../types';
import { Lightbulb, Loader2, RefreshCw, Copy, Check, AlignLeft, AlignCenter, AlignJustify, Volume2, Square, Lock, Briefcase, GraduationCap, FileQuestion, Zap, Target, Sparkles, Flag, FileText } from 'lucide-react';

interface HighlightsProps {
    file: FileData;
    isPremium?: boolean;
    onShowUpgrade?: () => void;
    initialLength?: SummaryLength;
}

export const Highlights: React.FC<HighlightsProps> = ({ file, isPremium = false, onShowUpgrade = () => {}, initialLength = 'MEDIUM' }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>(initialLength);
  const [language, setLanguage] = useState<Language>('fr'); // Default French
  
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
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    try {
      const text = await generateHighlights(file, summaryLength, language);
      setContent(text);
    } catch (e) {
      setContent("Erreur lors de la génération des points clés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [file, summaryLength, language]);

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
      utterance.lang = language === 'ht' ? 'ht' : 'fr-FR'; // Note: 'ht' TTS support varies by browser
      utterance.rate = 1.0;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleLengthChange = (length: SummaryLength) => {
    if (!isPremium && (length === 'LONG' || length === 'ANALYST' || length === 'TEACHER' || length === 'EXAM' || length === 'APPLICATIONS')) {
        onShowUpgrade();
    } else {
        setSummaryLength(length);
    }
  }

  const getTitle = () => {
      switch(summaryLength) {
          case 'ANALYST': return 'Analyse Stratégique';
          case 'SIMPLE': return 'Résumé Simple';
          case 'DESCRIPTIVE': return 'Résumé Descriptif';
          case 'KEY_POINTS': return 'Points Clés';
          case 'TEACHER': return 'Concepts & Définitions';
          case 'EXAM': return 'Matériel de Révision';
          case 'APPLICATIONS': return 'Relations & Applications';
          default: return 'Résumé & Synthèse';
      }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 animate-in fade-in duration-500" role="status">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-yellow-500" aria-hidden="true" />
        <p className="font-medium">
             {language === 'ht' ? 'N ap travay sou rezime a...' : 'Génération du résumé...'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-2">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-white">
              {getTitle()}
            </h2>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center xl:justify-end items-center gap-4">
            
            {/* Language Selector */}
            <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm">
                 <button 
                   onClick={() => setLanguage('fr')}
                   className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${language === 'fr' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                 >
                    FR
                 </button>
                 <button 
                   onClick={() => setLanguage('ht')}
                   className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${language === 'ht' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                   title="Kreyòl Ayisyen"
                 >
                    HT
                 </button>
            </div>

            {/* Length Selector */}
            <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm overflow-x-auto max-w-full" role="group" aria-label="Type de résumé">
                <button
                    onClick={() => handleLengthChange('SIMPLE')}
                    aria-pressed={summaryLength === 'SIMPLE'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${summaryLength === 'SIMPLE' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    title="Résumé Simple"
                >
                    <AlignLeft className="w-3 h-3" /> Simple
                </button>
                <button
                    onClick={() => handleLengthChange('DESCRIPTIVE')}
                    aria-pressed={summaryLength === 'DESCRIPTIVE'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${summaryLength === 'DESCRIPTIVE' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    title="Résumé Descriptif"
                >
                    <FileText className="w-3 h-3" /> Descriptif
                </button>
                <button
                    onClick={() => handleLengthChange('KEY_POINTS')}
                    aria-pressed={summaryLength === 'KEY_POINTS'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${summaryLength === 'KEY_POINTS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    title="Points Clés"
                >
                    <Target className="w-3 h-3" /> Points Clés
                </button>
                <button
                    onClick={() => handleLengthChange('ANALYST')}
                    aria-pressed={summaryLength === 'ANALYST'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${!isPremium ? 'opacity-60 cursor-pointer' : ''} ${summaryLength === 'ANALYST' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    title="Analyse structurée"
                >
                    {!isPremium ? <Lock className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />} Analytique
                </button>
                <button
                    onClick={() => handleLengthChange('MEDIUM')}
                    aria-pressed={summaryLength === 'MEDIUM'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${summaryLength === 'MEDIUM' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    title="Résumé Standard"
                >
                    <AlignCenter className="w-3 h-3" /> Standard
                </button>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden xl:block"></div>

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
          <ReactMarkdown
            components={{
              table: ({node, ...props}) => (
                <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} />
                </div>
              ),
              thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-slate-800" {...props} />,
              tbody: ({node, ...props}) => <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700" {...props} />,
              tr: ({node, ...props}) => <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" {...props} />,
              th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider" {...props} />,
              td: ({node, ...props}) => <td className="px-6 py-4 whitespace-normal text-sm text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />
            }}
          >
              {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};