import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { QuizMode } from './components/QuizMode';
import { FlashcardMode } from './components/FlashcardMode';
import { StudyGuide } from './components/StudyGuide';
import { Highlights } from './components/Highlights';
import { FAQMode } from './components/FAQMode';
import { generateFileDescription } from './services/geminiService';
import { FileData, AppMode } from './types';
import { MessageSquare, BookOpen, BrainCircuit, GraduationCap, Sparkles, LogOut, LayoutDashboard, HelpCircle, FileText, Loader2, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.UPLOAD);
  const [fileDescription, setFileDescription] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleFileLoaded = async (uploadedFile: FileData) => {
    setFile(uploadedFile);
    setMode(AppMode.DASHBOARD);
    setFileDescription('');
    
    // Generate description
    try {
      const desc = await generateFileDescription(uploadedFile);
      setFileDescription(desc);
    } catch (e) {
      console.error(e);
      setFileDescription("Description non disponible.");
    }
  };

  const handleReset = () => {
    if (confirm("Voulez-vous vraiment fermer ce document et revenir à l'accueil ?")) {
      setFile(null);
      setMode(AppMode.UPLOAD);
      setFileDescription('');
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, targetMode: AppMode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMode(targetMode);
    }
  };

  // Render Sidebar Navigation
  const SidebarItem = ({ activeMode, icon: Icon, label }: { activeMode: AppMode, icon: any, label: string }) => (
    <button
      onClick={() => setMode(activeMode)}
      aria-current={mode === activeMode ? 'page' : undefined}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500
        ${mode === activeMode 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
      `}
    >
      <Icon className={`w-5 h-5 ${mode === activeMode ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );

  // Main Content Switcher
  const renderContent = () => {
    if (!file) return null;

    switch (mode) {
      case AppMode.CHAT:
        return <ChatInterface file={file} />;
      case AppMode.QUIZ:
        return <QuizMode file={file} />;
      case AppMode.FLASHCARDS:
        return <FlashcardMode file={file} />;
      case AppMode.GUIDE:
        return <StudyGuide file={file} />;
      case AppMode.HIGHLIGHTS:
        return <Highlights file={file} />;
      case AppMode.FAQ:
        return <FAQMode file={file} />;
      case AppMode.DASHBOARD:
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full content-start overflow-y-auto pb-10">
            {/* Header / Document Overview Card */}
            <div className="col-span-full mb-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl flex-shrink-0 flex items-center justify-center w-16 h-16">
                  <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    {file.name}
                  </h2>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {fileDescription ? (
                      <p className="animate-in fade-in">{fileDescription}</p>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 italic">
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Analyse du document et génération de la description...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Cards */}
            <div 
              onClick={() => setMode(AppMode.GUIDE)}
              onKeyDown={(e) => handleCardKeyDown(e, AppMode.GUIDE)}
              role="button"
              tabIndex={0}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer hover:scale-[1.02] transition-transform focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
              <BookOpen className="w-8 h-8 mb-4 opacity-80" aria-hidden="true" />
              <h3 className="text-xl font-bold mb-1">Guide d'étude</h3>
              <p className="text-indigo-100 text-sm">Générer un résumé structuré</p>
            </div>

            <div 
              onClick={() => setMode(AppMode.QUIZ)}
              onKeyDown={(e) => handleCardKeyDown(e, AppMode.QUIZ)}
              role="button"
              tabIndex={0}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                 <GraduationCap className="w-6 h-6 text-orange-600 dark:text-orange-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Quiz</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Testez vos connaissances</p>
            </div>

            <div 
              onClick={() => setMode(AppMode.FLASHCARDS)}
              onKeyDown={(e) => handleCardKeyDown(e, AppMode.FLASHCARDS)}
              role="button"
              tabIndex={0}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                 <BrainCircuit className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Flashcards</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Mémorisation rapide</p>
            </div>

            <div 
              onClick={() => setMode(AppMode.CHAT)}
              onKeyDown={(e) => handleCardKeyDown(e, AppMode.CHAT)}
              role="button"
              tabIndex={0}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group col-span-1 md:col-span-2 lg:col-span-2 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Chat avec le document</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Posez des questions précises ou demandez des analyses approfondies.</p>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">Commencer la discussion &rarr;</span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div 
               onClick={() => setMode(AppMode.HIGHLIGHTS)}
               onKeyDown={(e) => handleCardKeyDown(e, AppMode.HIGHLIGHTS)}
               role="button"
               tabIndex={0}
               className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="bg-yellow-100 dark:bg-yellow-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                 <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Highlights</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Résumé et points essentiels</p>
            </div>

             <div 
               onClick={() => setMode(AppMode.FAQ)}
               onKeyDown={(e) => handleCardKeyDown(e, AppMode.FAQ)}
               role="button"
               tabIndex={0}
               className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                 <HelpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Questions & Réponses</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">FAQ générée automatiquement</p>
            </div>
          </div>
        );
    }
  };

  if (mode === AppMode.UPLOAD || !file) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
        <FileUpload onFileLoaded={handleFileLoaded} />
        {/* Toggle Theme in Upload Mode */}
        <div className="absolute top-4 right-4">
             <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-20 shadow-sm transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h1 className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
            <BookOpen className="w-6 h-6" aria-hidden="true" />
            <span className="hidden md:inline">Genius</span>
            <span className="md:hidden">StudyGenius</span>
          </h1>
          <button
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem activeMode={AppMode.DASHBOARD} icon={LayoutDashboard} label="Tableau de bord" />
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider pl-4">Études</div>
          <SidebarItem activeMode={AppMode.GUIDE} icon={BookOpen} label="Guide d'étude" />
          <SidebarItem activeMode={AppMode.HIGHLIGHTS} icon={Sparkles} label="Highlights" />
          <SidebarItem activeMode={AppMode.FAQ} icon={HelpCircle} label="Questions & Rép." />
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider pl-4">Pratique</div>
          <SidebarItem activeMode={AppMode.CHAT} icon={MessageSquare} label="Discussion" />
          <SidebarItem activeMode={AppMode.QUIZ} icon={GraduationCap} label="Quiz" />
          <SidebarItem activeMode={AppMode.FLASHCARDS} icon={BrainCircuit} label="Flashcards" />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full hidden md:flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
          >
             {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             <span>{isDarkMode ? "Mode Clair" : "Mode Sombre"}</span>
          </button>

          <button 
            onClick={handleReset}
            className="w-full flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Changer de fichier
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center transition-colors">
           <span className="font-bold text-indigo-700 dark:text-indigo-400">StudyGenius</span>
           <button onClick={() => setMode(AppMode.DASHBOARD)} className="text-slate-600 dark:text-slate-300" aria-label="Retour au tableau de bord"><LayoutDashboard /></button>
        </div>
        
        <div className="flex-1 overflow-hidden p-4 md:p-8 relative">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;