
import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { QuizMode } from './components/QuizMode';
import { FlashcardMode } from './components/FlashcardMode';
import { StudyGuide } from './components/StudyGuide';
import { Highlights } from './components/Highlights';
import { FAQMode } from './components/FAQMode';
import { MethodologyGuide } from './components/MethodologyGuide';
import { UpgradeModal } from './components/UpgradeModal';
import { MindmapMode } from './components/MindmapMode';
import { KeyQuotesMode } from './components/KeyQuotesMode';
import { generateFileDescription } from './services/geminiService';
import { saveSession, getSession, clearSession } from './services/storageService';
import { FileData, AppMode } from './types';
import { MessageSquare, BookOpen, BrainCircuit, GraduationCap, Sparkles, LogOut, LayoutDashboard, CircleHelp, FileText, Loader2, Moon, Sun, Crown, Lock, Compass, Bot, ArrowRight, Target, Network, Quote } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.UPLOAD);
  const [fileDescription, setFileDescription] = useState<string>('');
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  
  // Monetization State
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await getSession();
        if (session && session.file) {
          setFile(session.file);
          setMode(session.mode);
          setFileDescription(session.fileDescription);
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setIsRestoringSession(false);
      }
    };
    restoreSession();
  }, []);

  // Save session on changes
  useEffect(() => {
    if (file) {
      // Debounce saving slightly to avoid spamming IndexedDB on rapid mode switches
      const timeoutId = setTimeout(() => {
        saveSession(file, mode, fileDescription);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [file, mode, fileDescription]);

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

  const handleReset = async () => {
    if (confirm("Voulez-vous vraiment fermer ce document et revenir à l'accueil ?")) {
      await clearSession();
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

    const commonProps = {
        file,
        isPremium,
        onShowUpgrade: () => setShowUpgradeModal(true)
    };

    switch (mode) {
      case AppMode.CHAT:
        return <ChatInterface file={file} />;
      case AppMode.QUIZ:
        return <QuizMode {...commonProps} />;
      case AppMode.FLASHCARDS:
        return <FlashcardMode file={file} />;
      case AppMode.GUIDE:
        return <StudyGuide {...commonProps} />;
      case AppMode.HIGHLIGHTS:
        return <Highlights {...commonProps} key="highlights" />;
      case AppMode.STRATEGIC:
        return <Highlights {...commonProps} initialLength="ANALYST" key="strategic" />;
      case AppMode.MINDMAP:
        return <MindmapMode file={file} />;
      case AppMode.QUOTES:
        return <KeyQuotesMode file={file} />;
      case AppMode.FAQ:
        return <FAQMode file={file} />;
      case AppMode.METHODOLOGY:
        return <MethodologyGuide />;
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
            {/* CARD 1: Chat Interface Preview (Replaces old Guide Card) */}
            <div 
              onClick={() => setMode(AppMode.CHAT)}
              onKeyDown={(e) => handleCardKeyDown(e, AppMode.CHAT)}
              role="button"
              tabIndex={0}
              className="col-span-1 md:col-span-2 relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group overflow-hidden flex flex-col focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              {/* Header Mockup */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg">
                        <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Assistant IA</span>
                 </div>
                 <span className="text-xs text-slate-400">En ligne</span>
              </div>

              {/* Chat Body Mockup */}
              <div className="flex-1 p-4 bg-white dark:bg-slate-800 relative">
                 <div className="flex items-start gap-3 mb-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                         <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                     </div>
                     <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-600 dark:text-slate-300">
                         <p>Bonjour ! J'ai analysé <strong>{file.name}</strong>.</p>
                         <p className="mt-1">Je suis prêt à répondre à vos questions ou à générer du contenu.</p>
                     </div>
                 </div>
              </div>

              {/* Footer / CTA */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10 transition-colors">
                 <span className="text-sm text-slate-500 dark:text-slate-400 pl-2">Posez une question...</span>
                 <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-transform group-hover:scale-105">
                    Commencer <ArrowRight className="w-3 h-3" />
                 </span>
              </div>
            </div>

            {/* CARD 2: Guide d'étude (Moved here) */}
            <div 
              onClick={() => setMode(AppMode.GUIDE)}
              onKeyDown={(e) => handleCardKeyDown(e, AppMode.GUIDE)}
              role="button"
              tabIndex={0}
              className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                 <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Guide d'étude</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Générer un résumé structuré</p>
              {!isPremium && <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-600"><Lock className="w-5 h-5" /></div>}
            </div>

            {/* Mindmap Card */}
            <div 
              onClick={() => setMode(AppMode.MINDMAP)}
              onKeyDown={(e) => handleCardKeyDown(e, AppMode.MINDMAP)}
              role="button"
              tabIndex={0}
              className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="bg-pink-100 dark:bg-pink-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
                 <Network className="w-6 h-6 text-pink-600 dark:text-pink-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Mindmap</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Carte mentale visuelle</p>
            </div>

             <div 
               onClick={() => setMode(AppMode.HIGHLIGHTS)}
               onKeyDown={(e) => handleCardKeyDown(e, AppMode.HIGHLIGHTS)}
               role="button"
               tabIndex={0}
               className="relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="bg-yellow-100 dark:bg-yellow-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                 <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Résumé</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Synthèse et points clés (FR/HT)</p>
              {!isPremium && <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-600"><Lock className="w-5 h-5" /></div>}
            </div>

            {/* Quotes Card */}
             <div 
               onClick={() => setMode(AppMode.QUOTES)}
               onKeyDown={(e) => handleCardKeyDown(e, AppMode.QUOTES)}
               role="button"
               tabIndex={0}
               className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="bg-teal-100 dark:bg-teal-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-colors">
                 <Quote className="w-6 h-6 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Citations</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Passages importants</p>
            </div>
            
            <div 
              onClick={() => setMode(AppMode.METHODOLOGY)}
              onKeyDown={(e) => handleCardKeyDown(e, AppMode.METHODOLOGY)}
              role="button"
              tabIndex={0}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            >
              <div className="bg-slate-100 dark:bg-slate-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                 <Compass className="w-6 h-6 text-slate-600 dark:text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Méthodologie</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Guide pédagogique d'étude</p>
            </div>
          </div>
        );
    }
  };

  if (isRestoringSession) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 transition-colors duration-300">
         <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
         <p className="font-medium animate-pulse">Restauration de votre session...</p>
      </div>
    );
  }

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
      
      {/* UPGRADE MODAL */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        onUpgrade={() => setIsPremium(true)}
      />

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
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider pl-4">Synthèse</div>
          <SidebarItem activeMode={AppMode.HIGHLIGHTS} icon={Sparkles} label="Résumé" />
          <SidebarItem activeMode={AppMode.MINDMAP} icon={Network} label="Mindmap" />
          <SidebarItem activeMode={AppMode.QUOTES} icon={Quote} label="Citations Clés" />
          <SidebarItem activeMode={AppMode.STRATEGIC} icon={Target} label="Analyse Stratégique" />
          
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider pl-4">Pratique</div>
          <SidebarItem activeMode={AppMode.CHAT} icon={MessageSquare} label="Discussion" />
          <SidebarItem activeMode={AppMode.QUIZ} icon={GraduationCap} label="Quiz" />
          <SidebarItem activeMode={AppMode.FLASHCARDS} icon={BrainCircuit} label="Flashcards" />
          
          <div className="pt-4 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider pl-4">Ressources</div>
          <SidebarItem activeMode={AppMode.GUIDE} icon={BookOpen} label="Guide d'étude" />
          <SidebarItem activeMode={AppMode.FAQ} icon={CircleHelp} label="Questions & Rép." />
          <SidebarItem activeMode={AppMode.METHODOLOGY} icon={Compass} label="Méthodologie" />
        </nav>

        {/* PREMIUM BANNER */}
        {!isPremium && (
          <div className="p-4 mx-4 mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white text-center shadow-lg">
             <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-300 animate-pulse" />
             <h3 className="font-bold text-sm mb-1">Passer Premium</h3>
             <p className="text-xs text-indigo-100 mb-3">Débloquez l'export et les quiz illimités.</p>
             <button 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-white text-indigo-600 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
             >
                Upgrade
             </button>
          </div>
        )}
        {isPremium && (
            <div className="px-6 py-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold justify-center">
                <Crown className="w-3 h-3" /> Membre Pro
            </div>
        )}

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
           <div className="flex gap-3">
             {!isPremium && <button onClick={() => setShowUpgradeModal(true)} className="text-indigo-600"><Crown className="w-5 h-5" /></button>}
             <button onClick={() => setMode(AppMode.DASHBOARD)} className="text-slate-600 dark:text-slate-300" aria-label="Retour au tableau de bord"><LayoutDashboard /></button>
           </div>
        </div>
        
        <div className="flex-1 overflow-hidden p-4 md:p-8 relative">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
