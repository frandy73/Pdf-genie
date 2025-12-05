
import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { generateMindmap } from '../services/geminiService';
import { FileData } from '../types';
import { Loader2, Network, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MindmapModeProps {
  file: FileData;
}

export const MindmapMode: React.FC<MindmapModeProps> = ({ file }) => {
  const [chartCode, setChartCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    
    mermaid.initialize({ 
      startOnLoad: false,
      theme: isDark ? 'dark' : 'base',
      securityLevel: 'loose',
      fontFamily: '"Inter", sans-serif',
      flowchart: {
        useMaxWidth: false, // Empêche le graphique de rétrécir trop
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
        nodeSpacing: 50,
        rankSpacing: 50,
      },
      themeVariables: {
        fontSize: '20px', // Police beaucoup plus grande
        fontFamily: '"Inter", sans-serif',
        
        // Couleurs Nœuds
        primaryColor: isDark ? '#1e293b' : '#ffffff', // Fond du nœud
        primaryTextColor: isDark ? '#e2e8f0' : '#1e293b', // Texte
        primaryBorderColor: '#6366f1', // Bordure Indigo
        
        // Couleurs Lignes
        lineColor: isDark ? '#818cf8' : '#4f46e5',
        
        // Couleurs Secondaires (pour les sous-nœuds si le thème l'utilise)
        secondaryColor: isDark ? '#334155' : '#f8fafc',
        tertiaryColor: isDark ? '#0f172a' : '#fff',
      }
    });

    const fetchMindmap = async () => {
      setLoading(true);
      setError(false);
      try {
        const code = await generateMindmap(file);
        setChartCode(code);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMindmap();
  }, [file]);

  useEffect(() => {
    const renderChart = async () => {
      if (chartCode && containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
          // Ajout d'une div wrapper pour centrer si nécessaire
          const id = `mermaid-${Date.now()}`;
          const { svg } = await mermaid.render(id, chartCode);
          containerRef.current.innerHTML = svg;
          
          // Hack pour s'assurer que le SVG prend de la place et est lisible
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgElement.style.height = '100%';
            svgElement.style.maxWidth = 'none';
          }
        } catch (e) {
          console.error("Mermaid Render Error", e);
          containerRef.current.innerHTML = '<div class="text-red-500 text-center p-4">Erreur de rendu graphique. Essayez de régénérer.</div>';
        }
      }
    };
    
    if (!loading && chartCode) {
      renderChart();
    }
  }, [chartCode, loading]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleResetZoom = () => setZoom(1);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-600" />
        <p>Génération de la carte mentale (Mindmap)...</p>
      </div>
    );
  }

  if (error || !chartCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <p>Impossible de générer la carte mentale.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        <button onClick={handleZoomIn} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"><ZoomIn className="w-5 h-5" /></button>
        <button onClick={handleResetZoom} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"><RotateCcw className="w-5 h-5" /></button>
        <button onClick={handleZoomOut} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"><ZoomOut className="w-5 h-5" /></button>
      </div>

      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                <Network className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-white">Mindmap</h2>
        </div>
        <p className="text-xs text-slate-500 hidden sm:block">Utilisez le zoom pour voir les détails</p>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 cursor-grab active:cursor-grabbing">
         <div 
            ref={containerRef} 
            className="transition-transform origin-center duration-200"
            style={{ transform: `scale(${zoom})` }}
         />
      </div>
    </div>
  );
};
