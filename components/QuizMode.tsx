
import React, { useState } from 'react';
import { CircleCheck, CircleX, CircleAlert, RefreshCw, ChevronRight, GraduationCap, CirclePlay, Filter, Check, X, List, Lock } from 'lucide-react';
import { generateQuiz } from '../services/geminiService';
import { FileData, QuizQuestion } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface QuizModeProps {
  file: FileData;
  isPremium?: boolean;
  onShowUpgrade?: () => void;
}

type FilterType = 'ALL' | 'CORRECT' | 'INCORRECT';

export const QuizMode: React.FC<QuizModeProps> = ({ file, isPremium = false, onShowUpgrade = () => {} }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  
  // New state for tracking user answers
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  
  // Result filter state
  const [filter, setFilter] = useState<FilterType>('ALL');
  
  // Setup State
  const [isSetup, setIsSetup] = useState(true);
  const [numQuestions, setNumQuestions] = useState(5);

  const loadQuiz = async () => {
    setLoading(true);
    setShowResults(false);
    setCurrentIndex(0);
    setScore(0);
    setQuestions([]);
    setUserAnswers([]);
    setFilter('ALL');
    try {
      const data = await generateQuiz(file, numQuestions);
      setQuestions(data);
      // Initialize empty answers array
      setUserAnswers(new Array(data.length).fill(null));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setIsSetup(false);
    loadQuiz();
  };

  const handleReset = () => {
    setIsSetup(true);
    setShowResults(false);
    setQuestions([]);
    setUserAnswers([]);
  };

  const handleOptionSelect = (index: number) => {
    if (answerSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    setAnswerSubmitted(true);
    
    // Record user answer
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = selectedOption;
    setUserAnswers(newAnswers);

    if (selectedOption === questions[currentIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setAnswerSubmitted(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleCountSelection = (count: number) => {
    if (!isPremium && count > 5) {
        onShowUpgrade();
    } else {
        setNumQuestions(count);
    }
  }

  // 1. SETUP SCREEN
  if (isSetup) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-6 animate-in fade-in duration-500">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full text-center transition-colors">
          <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-8 h-8 text-orange-600 dark:text-orange-400" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Configurer votre Quiz</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Choisissez le nombre de questions pour tester vos connaissances.</p>

          <div className="grid grid-cols-2 gap-4 mb-8" role="group" aria-label="Nombre de questions">
            {[3, 5, 10, 15].map((count) => {
              const isLocked = !isPremium && count > 5;
              return (
                <button
                    key={count}
                    onClick={() => handleCountSelection(count)}
                    aria-pressed={numQuestions === count}
                    className={`
                    relative p-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900
                    ${numQuestions === count 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' 
                        : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-slate-600 dark:text-slate-400'}
                    ${isLocked ? 'opacity-60 cursor-pointer bg-slate-50 dark:bg-slate-800' : ''}
                    `}
                >
                    {count} Questions
                    {isLocked && (
                        <div className="absolute top-2 right-2 text-slate-400">
                            <Lock className="w-4 h-4" />
                        </div>
                    )}
                </button>
              );
            })}
          </div>

          <button
            onClick={startQuiz}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            <CirclePlay className="w-6 h-6" aria-hidden="true" />
            Commencer le Quiz
          </button>
        </div>
      </div>
    );
  }

  // 2. LOADING SCREEN
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-slate-600 dark:text-slate-400 animate-pulse" role="status">
        <RefreshCw className="w-10 h-10 animate-spin mb-4 text-indigo-500 dark:text-indigo-400" aria-hidden="true" />
        <p>Génération de {numQuestions} questions en cours avec Gemini...</p>
      </div>
    );
  }

  // 3. ERROR SCREEN
  if (questions.length === 0) {
    return (
      <div className="text-center p-8" role="alert">
        <CircleAlert className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
        <p className="text-slate-800 dark:text-slate-200">Impossible de générer le quiz. Essayez à nouveau.</p>
        <button onClick={handleReset} className="mt-4 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Retour à la configuration</button>
      </div>
    );
  }

  // 4. RESULTS SCREEN
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const data = [
      { name: 'Correct', value: score },
      { name: 'Incorrect', value: questions.length - score }
    ];

    // Filter Logic
    const questionsToDisplay = questions.map((q, index) => ({
        ...q,
        userAnswerIndex: userAnswers[index],
        originalIndex: index
    })).filter(item => {
        const isCorrect = item.userAnswerIndex === item.correctAnswerIndex;
        if (filter === 'CORRECT') return isCorrect;
        if (filter === 'INCORRECT') return !isCorrect;
        return true;
    });

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 overflow-y-auto h-full animate-in zoom-in duration-300">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-6 md:p-8 mb-8 text-center transition-colors">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Résultats du Quiz</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Vous avez obtenu {score} sur {questions.length}</p>
          
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
            <div className="h-48 w-full md:w-1/2" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: 'currentColor'}} className="text-slate-600 dark:text-slate-300" />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400" aria-label={`Score total : ${percentage} pourcent`}>
              {percentage}%
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            <RefreshCw className="w-5 h-5" aria-hidden="true" />
            Nouveau Quiz
          </button>
        </div>

        {/* REVIEW SECTION */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Filter className="w-5 h-5 text-indigo-500" />
                    Revoir les questions
                </h3>
                <div className="flex bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600 shadow-sm">
                    <button 
                        onClick={() => setFilter('ALL')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    >
                        <List className="w-4 h-4" /> Tout
                    </button>
                    <button 
                        onClick={() => setFilter('CORRECT')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'CORRECT' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    >
                        <Check className="w-4 h-4" /> Correctes
                    </button>
                    <button 
                        onClick={() => setFilter('INCORRECT')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'INCORRECT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                    >
                        <X className="w-4 h-4" /> Incorrectes
                    </button>
                </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {questionsToDisplay.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic">
                        Aucune question ne correspond à ce filtre.
                    </div>
                ) : (
                    questionsToDisplay.map((item) => {
                        const isCorrect = item.userAnswerIndex === item.correctAnswerIndex;
                        return (
                            <div key={item.originalIndex} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-start gap-3 mb-3">
                                    {isCorrect ? (
                                        <CircleCheck className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <CircleX className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Question {item.originalIndex + 1}</span>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-lg mt-1">{item.question}</p>
                                    </div>
                                </div>

                                <div className="ml-9 space-y-2">
                                    <div className={`p-3 rounded-lg text-sm border ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300'}`}>
                                        <span className="font-bold mr-2">Votre réponse :</span> 
                                        {item.userAnswerIndex !== null ? item.options[item.userAnswerIndex] : "Aucune réponse"}
                                    </div>
                                    
                                    {!isCorrect && (
                                        <div className="p-3 rounded-lg text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-300">
                                             <span className="font-bold mr-2">Bonne réponse :</span>
                                             {item.options[item.correctAnswerIndex]}
                                        </div>
                                    )}

                                    <div className="mt-3 text-slate-600 dark:text-slate-300 text-sm italic border-l-2 border-indigo-200 dark:border-indigo-800 pl-3">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 not-italic">Explication : </span>
                                        {item.explanation}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
      </div>
    );
  }

  // 5. QUIZ SCREEN
  const currentQ = questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      {/* Progress Bar Header - Unified and placed at top */}
      <div className="mb-6 px-1">
        <div className="flex justify-between items-center mb-2 font-medium">
          <span id="progress-label" className="text-slate-600 dark:text-slate-400 text-sm">
             Question <span className="font-bold text-slate-800 dark:text-slate-200">{currentIndex + 1}</span> sur <span className="font-bold text-slate-800 dark:text-slate-200">{questions.length}</span>
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">{Math.round(progressPercentage)}%</span>
        </div>
        <div 
          role="progressbar" 
          aria-labelledby="progress-label" 
          aria-valuenow={Math.round(progressPercentage)} 
          aria-valuemin={0} 
          aria-valuemax={100}
          className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden shadow-inner"
        >
          <div 
            className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-500 ease-out rounded-r-full relative" 
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-b from-white/20 to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 flex flex-col transition-colors">
        <div className="p-8 flex-1 overflow-y-auto">
          {/* Question text with improved spacing */}
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 leading-relaxed mt-2">
            {currentQ.question}
          </h3>

          <div className="space-y-3" role="radiogroup" aria-label="Réponses possibles">
            {currentQ.options.map((option, idx) => {
              let stateStyle = "border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700";
              
              if (answerSubmitted) {
                if (idx === currentQ.correctAnswerIndex) {
                  stateStyle = "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500";
                } else if (idx === selectedOption) {
                  stateStyle = "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500";
                } else {
                  stateStyle = "border-slate-200 dark:border-slate-600 opacity-50";
                }
              } else if (selectedOption === idx) {
                stateStyle = "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 ring-1 ring-indigo-600";
              }

              return (
                <button
                  key={idx}
                  role="radio"
                  aria-checked={selectedOption === idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={answerSubmitted}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 ${stateStyle}`}
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{option}</span>
                  {answerSubmitted && idx === currentQ.correctAnswerIndex && (
                    <CircleCheck className="w-5 h-5 text-green-600 dark:text-green-500" aria-label="Bonne réponse" />
                  )}
                  {answerSubmitted && idx === selectedOption && idx !== currentQ.correctAnswerIndex && (
                    <CircleX className="w-5 h-5 text-red-600 dark:text-red-500" aria-label="Mauvaise réponse" />
                  )}
                </button>
              );
            })}
          </div>

          {answerSubmitted && (
             <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 rounded-xl text-sm border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-bottom-2" role="alert">
               <span className="font-bold block mb-1">Explication :</span>
               {currentQ.explanation}
             </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          {!answerSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900"
            >
              Valider
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-slate-400 dark:focus:ring-slate-600"
            >
              {currentIndex === questions.length - 1 ? 'Voir Résultats' : 'Suivant'}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
