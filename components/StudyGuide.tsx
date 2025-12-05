
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateStudyGuide } from '../services/geminiService';
import { FileData, StudyGuideSection } from '../types';
import { Download, Loader2, Copy, Check, ArrowDownAZ, AlignJustify, ListOrdered, Lock } from 'lucide-react';

type SortMethod = 'ORIGINAL' | 'TITLE' | 'LENGTH';

export const StudyGuide: React.FC<{ file: FileData; isPremium?: boolean; onShowUpgrade?: () => void }> = ({ file, isPremium = false, onShowUpgrade = () => {} }) => {
  const [sections, setSections] = useState<StudyGuideSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sortMethod, setSortMethod] = useState<SortMethod>('ORIGINAL');

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true);
      try {
        const data = await generateStudyGuide(file);
        setSections(data);
      } catch (e) {
        setSections([{ title: "Erreur", content: "Erreur lors de la génération du guide." }]);
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [file]);

  const getSortedSections = () => {
    const sorted = [...sections];
    if (sortMethod === 'TITLE') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMethod === 'LENGTH') {
      // Sort by length descending (longest content first)
      sorted.sort((a, b) => b.content.length - a.content.length);
    }
    return sorted;
  };

  const getFullMarkdown = () => {
    return getSortedSections().map(s => `## ${s.title}\n\n${s.content}`).join('\n\n');
  };

  const handlePrint = () => {
    if (!isPremium) {
        onShowUpgrade();
        return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Guide d'étude - ${file.name}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
              h1, h2, h3 { color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 32px; }
              code { background: #f1f5f9; padding: 2px 5px; border-radius: 4px; }
              pre { background: #f1f5f9; padding: 15px; border-radius: 8px; overflow-x: auto; }
              ul { padding-left: 20px; }
              li { margin-bottom: 8px; }
            </style>
          </head>
          <body>
            <h1>Guide d'étude : ${file.name}</h1>
            ${document.getElementById('markdown-content')?.innerHTML || ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopy = async () => {
    const content = getFullMarkdown();
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400" role="status">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
        <p>Rédaction du guide d'étude structuré par l'IA...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-800">
        <h2 className="font-bold text-slate-800 dark:text-white">Guide d'étude : {file.name}</h2>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-4 justify-center">
           {/* Sorting Controls */}
           <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase px-2 mr-1">Trier:</span>
              <button 
                onClick={() => setSortMethod('ORIGINAL')}
                className={`p-1.5 rounded-md transition-colors ${sortMethod === 'ORIGINAL' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                title="Ordre original (logique)"
                aria-label="Trier par ordre original"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSortMethod('TITLE')}
                className={`p-1.5 rounded-md transition-colors ${sortMethod === 'TITLE' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                title="Ordre alphabétique"
                aria-label="Trier par ordre alphabétique"
              >
                <ArrowDownAZ className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSortMethod('LENGTH')}
                className={`p-1.5 rounded-md transition-colors ${sortMethod === 'LENGTH' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                title="Par longueur de contenu"
                aria-label="Trier par longueur"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
           </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

          <div className="flex items-center gap-2">
            <button 
                onClick={handleCopy}
                aria-label={copied ? "Contenu copié" : "Copier le contenu"}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                <span className="hidden sm:inline">{copied ? "Copié" : "Copier"}</span>
            </button>

            <button 
                onClick={handlePrint}
                aria-label="Exporter ou imprimer le guide d'étude"
                className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${!isPremium ? 'text-slate-400 cursor-pointer bg-slate-100 dark:bg-slate-700' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
            >
                {!isPremium ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" aria-hidden="true" />}
                <span className="hidden sm:inline">Exporter</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-900">
        <div id="markdown-content" className="max-w-4xl mx-auto space-y-8">
          {sections.length === 0 ? (
             <p className="text-center text-slate-500 dark:text-slate-400 italic">Aucun contenu généré.</p>
          ) : (
            getSortedSections().map((section, idx) => (
              <section 
                key={idx} 
                className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md"
              >
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <span className="text-indigo-200 dark:text-indigo-800 select-none">#</span>
                  {section.title}
                </h2>
                <div className="text-slate-700 dark:text-slate-300">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mt-6 mb-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-5 mb-2 uppercase tracking-wide opacity-80" {...props} />,
                      
                      p: ({node, ...props}) => <p className="leading-8 mb-5 text-base md:text-lg font-normal text-slate-700 dark:text-slate-300" {...props} />,
                      
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 mb-5 space-y-2 marker:text-indigo-500 dark:marker:text-indigo-400" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 mb-5 space-y-2 marker:text-indigo-500 dark:marker:text-indigo-400 font-medium" {...props} />,
                      li: ({node, ...props}) => <li className="pl-2 leading-8 text-base md:text-lg" {...props} />,
                      
                      strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 px-1 rounded" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-300 dark:border-indigo-700 pl-5 py-2 italic my-6 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 rounded-r-lg" {...props} />,
                      
                      code: ({node, inline, className, children, ...props}: any) => {
                         return inline 
                           ? <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400 border border-slate-200 dark:border-slate-600" {...props}>{children}</code>
                           : <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-sm"><pre className="p-5 text-slate-100 text-sm font-mono leading-relaxed overflow-x-auto"><code>{children}</code></pre></div>
                      },

                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-slate-800" {...props} />,
                      tbody: ({node, ...props}) => <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700" {...props} />,
                      tr: ({node, ...props}) => <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" {...props} />,
                      th: ({node, ...props}) => <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap" {...props} />,
                      td: ({node, ...props}) => <td className="px-6 py-4 whitespace-normal text-sm text-slate-700 dark:text-slate-300 leading-relaxed align-top" {...props} />
                    }}
                  >{section.content}</ReactMarkdown>
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
};