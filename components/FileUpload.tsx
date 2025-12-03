import React, { useRef, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileLoaded: (file: FileData) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert("Veuillez télécharger un fichier PDF.");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // remove data:application/pdf;base64, prefix
      const base64Data = result.split(',')[1];
      
      onFileLoaded({
        name: file.name,
        data: base64Data,
        mimeType: file.type
      });
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-in fade-in duration-700">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">StudyGenius PDF</h1>
        <p className="text-slate-600 dark:text-slate-300 text-lg">Transformez vos PDF en conversations, quiz et guides d'étude.</p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Zone de téléchargement de fichier. Cliquez ou glissez un fichier PDF ici."
        onKeyDown={handleKeyDown}
        className={`
          relative group cursor-pointer
          w-full max-w-xl h-64 
          border-2 border-dashed rounded-2xl 
          flex flex-col items-center justify-center
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 scale-105' 
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="application/pdf"
          onChange={(e) => e.target.files && e.target.files[0] && processFile(e.target.files[0])}
          aria-hidden="true"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center text-indigo-600 dark:text-indigo-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" aria-hidden="true" />
            <p className="font-medium" role="status">Traitement du document...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            <div className="bg-white dark:bg-slate-700 p-4 rounded-full shadow-sm mb-4 group-hover:shadow-md transition-shadow">
              <Upload className="w-8 h-8" aria-hidden="true" />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200">Cliquez ou glissez un PDF ici</p>
            <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Jusqu'à 20 MB</p>
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
         {[
           { icon: FileText, title: "Guides Intelligents", desc: "Résumés automatiques" },
           { icon: FileText, title: "Quiz Instantanés", desc: "Testez vos connaissances" },
           { icon: FileText, title: "Chat Interactif", desc: "Posez vos questions" },
         ].map((item, i) => (
           <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
             <item.icon className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mb-3" aria-hidden="true" />
             <h3 className="font-semibold text-slate-800 dark:text-white">{item.title}</h3>
             <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
           </div>
         ))}
      </div>
    </div>
  );
};