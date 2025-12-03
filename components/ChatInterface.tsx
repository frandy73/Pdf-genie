import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, RefreshCw, History, X, Sparkles, MessageCircleQuestion } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, FileData } from '../types';
import { sendChatMessage, generateSuggestedQuestions } from '../services/geminiService';

interface ChatInterfaceProps {
  file: FileData;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ file }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Bonjour ! J'ai analysé **${file.name}**. Que souhaitez-vous savoir ?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (file) {
        const questions = await generateSuggestedQuestions(file);
        setSuggestions(questions);
      }
    };
    fetchSuggestions();
  }, [file]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass only the message history (excluding the new user message which is handled in the service)
      const responseText = await sendChatMessage(file, messages, textToSend);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Désolé, une erreur est survenue.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      <style>{`
        @keyframes indeterminate {
          0% { left: -100%; width: 100%; }
          50% { left: 0%; width: 50%; }
          100% { left: 100%; width: 10%; }
        }
        .progress-bar-animate {
          animation: indeterminate 2s infinite linear;
        }
      `}</style>

      {/* Header */}
      <div className="bg-indigo-600 dark:bg-indigo-700 p-4 flex justify-between items-center text-white z-20 shadow-md transition-colors">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" aria-hidden="true" />
          <h2 className="font-semibold">Chat avec {file.name}</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 hover:bg-indigo-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            title="Historique chat"
            aria-label="Voir l'historique de la conversation"
          >
            <History className="w-4 h-4" aria-hidden="true" />
          </button>
          <button 
            onClick={() => setMessages([{ role: 'model', text: "Conversation réinitialisée." }])}
            className="p-2 hover:bg-indigo-500 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            title="Réinitialiser"
            aria-label="Réinitialiser la conversation"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Progress Bar Area */}
      {isLoading && (
        <div className="bg-indigo-50 dark:bg-slate-800 border-b border-indigo-100 dark:border-slate-700 p-3 animate-in fade-in slide-in-from-top-2 z-10">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Génération de la réponse...</span>
          </div>
          <div className="w-full bg-indigo-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 bg-indigo-600 dark:bg-indigo-500 rounded-full progress-bar-animate"></div>
          </div>
        </div>
      )}

      {/* Messages Main Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900"
        role="log"
        aria-live="polite"
        aria-label="Historique de la conversation"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`
                max-w-[85%] rounded-2xl p-4 shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-none'}
                ${msg.isError ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : ''}
              `}
            >
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs font-bold uppercase tracking-wider" aria-hidden="true">
                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                {msg.role === 'user' ? 'Vous' : 'IA'}
              </div>
              <div className="sr-only">
                {msg.role === 'user' ? 'Vous avez dit :' : 'L\'IA répond :'}
              </div>
              <div className={`text-sm md:text-base ${msg.role === 'user' ? '' : ''}`}>
                <ReactMarkdown
                  components={{
                    // Links: Blue, underline, open in new tab
                    a: ({ node, ...props }) => (
                      <a 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`${msg.role === 'user' ? 'text-indigo-200 hover:text-white' : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'} underline break-all`} 
                        {...props} 
                      />
                    ),
                    // Lists: Proper indentation and bullets
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 mb-3 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 mb-3 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    // Headings
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                    // Paragraphs
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                    // Blockquotes
                    blockquote: ({node, ...props}) => (
                      <blockquote className={`border-l-4 pl-3 italic my-2 ${msg.role === 'user' ? 'border-indigo-400 text-indigo-100' : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`} {...props} />
                    ),
                    // Code Blocks & Inline Code
                    code: ({ node, inline, className, children, ...props }: any) => {
                      if (inline) {
                        return (
                          <code 
                            className={`px-1 py-0.5 rounded font-mono text-sm ${msg.role === 'user' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'}`} 
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-600">
                           <pre className="bg-slate-900 dark:bg-black text-slate-50 p-3 text-xs md:text-sm font-mono leading-relaxed" {...props}>
                              <code>{children}</code>
                           </pre>
                        </div>
                      );
                    },
                    // Tables
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-600" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-slate-50 dark:bg-slate-700" {...props} />,
                    tbody: ({ node, ...props }) => <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-600" {...props} />,
                    th: ({ node, ...props }) => (
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="px-3 py-2 whitespace-normal text-sm text-slate-600 dark:text-slate-300" {...props} />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2 opacity-70">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
              <span className="text-sm text-slate-500 dark:text-slate-400 italic" role="status">L'IA rédige...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col transition-colors">
        <div className="p-4 pb-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez une question sur le document..."
              aria-label="Votre message"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              aria-label="Envoyer le message"
              className="bg-indigo-600 dark:bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Send className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Suggestions - Only show when conversation hasn't really started (1 message = initial bot greeting) */}
        {suggestions.length > 0 && messages.length === 1 && !isLoading && (
          <div className="px-4 pb-4 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
            <div className="w-full flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
               <MessageCircleQuestion className="w-3 h-3" />
               Pour commencer
            </div>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="text-xs md:text-sm bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all text-left truncate max-w-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* History Sidebar Panel */}
      {showHistory && (
        <div 
          className="absolute inset-0 z-30 flex justify-end bg-black/20 dark:bg-black/50 backdrop-blur-sm transition-all animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Panneau d'historique de chat"
        >
          <div className="w-full md:w-80 h-full bg-white dark:bg-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                Historique
              </h3>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Fermer l'historique"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center italic text-sm">Aucun message pour le moment.</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="text-sm border-b border-slate-100 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {msg.role === 'user' ? 'VOUS' : 'IA'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">Message {idx + 1}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-1">
                      {msg.role === 'model' ? (
                         // Simple text rendering for history to keep it compact, or remove markdown formatting
                         msg.text.replace(/[*#_`]/g, '')
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};