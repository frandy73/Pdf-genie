
import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Loader2, RefreshCw, History, X, CircleAlert, RotateCcw, Pencil, ArchiveRestore, ArrowUp } from 'lucide-react';
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
  const [canRestore, setCanRestore] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Unique key for local storage based on file name
  const storageKey = `chat_history_${file.name}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check for saved history on mount or file change
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Only suggest restore if there is more than just the initial message
            if (parsed.length > 1) {
                setCanRestore(true);
            }
        } catch (e) {
            console.error("Error parsing chat history", e);
        }
    } else {
        setCanRestore(false);
    }
  }, [file.name, storageKey]);

  // Auto-save history when messages change
  useEffect(() => {
    if (messages.length > 1) {
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (file) {
        const questions = await generateSuggestedQuestions(file);
        setSuggestions(questions);
      }
    };
    fetchSuggestions();
  }, [file]);

  const handleRestoreHistory = () => {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
          try {
              setMessages(JSON.parse(saved));
              setCanRestore(false);
              setTimeout(scrollToBottom, 100);
          } catch (e) {
              console.error("Restore failed", e);
          }
      }
  };

  const handleDismissRestore = () => {
      setCanRestore(false);
  };

  const handleReset = () => {
    const initialMsg: Message = { role: 'model', text: `Bonjour ! J'ai analysé **${file.name}**. Que souhaitez-vous savoir ?` };
    setMessages([initialMsg]);
    setShowHistory(false);
    setInput('');
    setCanRestore(false);
    localStorage.removeItem(storageKey);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setCanRestore(false); 

    try {
      const responseText = await sendChatMessage(file, messages, textToSend);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "Une erreur technique est survenue lors de la communication avec l'IA.", 
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryWithEdit = (index: number) => {
    const previousUserMsg = messages[index - 1];
    if (previousUserMsg && previousUserMsg.role === 'user') {
        setInput(previousUserMsg.text);
        inputRef.current?.focus();
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300 font-sans">
      <style>{`
        @keyframes indeterminate {
          0% { left: -100%; width: 100%; }
          50% { left: 0%; width: 50%; }
          100% { left: 100%; width: 10%; }
        }
        .progress-bar-animate {
          animation: indeterminate 2s infinite linear;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .mask-gradient {
            mask-image: linear-gradient(to right, black 85%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
      `}</style>

      {/* Header - Sticky Top */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-3 md:p-4 flex justify-between items-center z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
             <Bot className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white leading-tight line-clamp-1">{file.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               Assistant IA actif
            </p>
          </div>
        </div>
        <div className="flex gap-1 md:gap-2">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-full transition-colors"
            title="Historique"
          >
            <History className="w-5 h-5" />
          </button>
          <button 
            onClick={handleReset}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-full transition-colors"
            title="Nouvelle conversation"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Restore Session Banner */}
      {canRestore && messages.length === 1 && (
         <div className="absolute top-[70px] left-0 right-0 mx-auto max-w-lg z-30 px-4">
           <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 shadow-xl rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-top-5">
              <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-full">
                    <ArchiveRestore className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800 dark:text-white">Conversation trouvée</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Reprendre là où vous étiez ?</p>
                  </div>
              </div>
              <div className="flex gap-2">
                  <button 
                      onClick={handleDismissRestore}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2"
                  >
                      Ignorer
                  </button>
                  <button 
                      onClick={handleRestoreHistory}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm shadow-emerald-200 dark:shadow-none"
                  >
                      Restaurer
                  </button>
              </div>
           </div>
         </div>
      )}

      {/* Main Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth" id="chat-container">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isError = msg.isError;
            
            return (
              <div 
                key={idx} 
                className={`flex gap-3 md:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {/* Avatar */}
                <div className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
                    ${isUser ? 'bg-indigo-100 dark:bg-indigo-900/50' : (isError ? 'bg-red-100 dark:bg-red-900/50' : 'bg-white dark:bg-slate-700')}
                `}>
                    {isUser ? (
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    ) : isError ? (
                        <CircleAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                    ) : (
                        <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    )}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`
                        px-5 py-3.5 shadow-sm text-sm md:text-base leading-relaxed
                        ${isUser 
                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none'}
                        ${isError ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200' : ''}
                    `}>
                        <ReactMarkdown
                            components={{
                                a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" className={`underline underline-offset-2 ${isUser ? 'text-indigo-200 hover:text-white' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300'}`} {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 my-2 space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 my-2 space-y-1" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-1 mb-1" {...props} />,
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className={`border-l-2 pl-3 italic opacity-80 my-2 ${isUser ? 'border-white/50' : 'border-slate-300 dark:border-slate-600'}`} {...props} />,
                                code: ({ node, inline, className, children, ...props }: any) => {
                                    if (inline) return <code className={`px-1 rounded text-xs md:text-sm font-mono ${isUser ? 'bg-indigo-700/50' : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700'}`} {...props}>{children}</code>;
                                    return (
                                        <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                                            <pre className="p-3 text-xs md:text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200" {...props}><code>{children}</code></pre>
                                        </div>
                                    );
                                },
                                table: ({ node, ...props }) => <div className="overflow-x-auto my-3 rounded-lg border border-slate-200 dark:border-slate-700"><table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} /></div>,
                                th: ({ node, ...props }) => <th className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400" {...props} />,
                                td: ({ node, ...props }) => <td className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 text-sm" {...props} />,
                            }}
                        >
                            {msg.text}
                        </ReactMarkdown>

                        {/* Actions for Error */}
                        {isError && (
                            <div className="mt-3 pt-2 border-t border-red-200 dark:border-red-800/50 flex gap-2">
                                <button onClick={() => handleRetryWithEdit(idx)} className="text-xs flex items-center gap-1 font-semibold hover:underline"><Pencil className="w-3 h-3" /> Modifier</button>
                                <button onClick={handleReset} className="text-xs flex items-center gap-1 font-semibold hover:underline"><RotateCcw className="w-3 h-3" /> Recommencer</button>
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                        {isUser ? 'Vous' : 'IA'}
                    </span>
                </div>
              </div>
            );
          })}
          
          {/* Loading Indicator inside flow */}
          {isLoading && (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area - Floating Bottom */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800">
         <div className="max-w-3xl mx-auto space-y-3">
             
            {/* Suggestions */}
            {suggestions.length > 0 && messages.length === 1 && !isLoading && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-gradient">
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSend(suggestion)}
                            className="whitespace-nowrap flex-shrink-0 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Box */}
            <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900 focus-within:border-indigo-400 dark:focus-within:border-indigo-600 transition-all">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Posez votre question sur le document..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 min-h-[44px] px-3 py-2 text-sm md:text-base"
                />
                <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className={`
                        p-2.5 rounded-xl flex-shrink-0 transition-all duration-200
                        ${input.trim() 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none transform hover:scale-105' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}
                    `}
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                </button>
            </div>
            
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
                L'IA peut faire des erreurs. Vérifiez les informations importantes dans le document.
            </p>
         </div>
      </div>

      {/* History Sidebar Panel (Overlay) */}
      {showHistory && (
        <div className="absolute inset-0 z-50 flex justify-end">
             {/* Backdrop */}
             <div 
                className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm animate-in fade-in"
                onClick={() => setShowHistory(false)}
             ></div>
             
             {/* Panel */}
             <div className="relative w-full max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Historique
                    </h3>
                    <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.slice(1).map((msg, idx) => ( // Skip greeting
                        <div key={idx} className="group relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors pb-4">
                            <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-500 transition-colors"></div>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                                {msg.role === 'user' ? 'Vous' : 'IA'}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                                {msg.text.replace(/[*#_`]/g, '')}
                            </p>
                        </div>
                    ))}
                    {messages.length <= 1 && (
                        <div className="text-center py-10 text-slate-400 dark:text-slate-600 text-sm">
                            Historique vide
                        </div>
                    )}
                </div>
             </div>
        </div>
      )}
    </div>
  );
};
