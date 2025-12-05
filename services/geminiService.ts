
import { GoogleGenAI, Type } from "@google/genai";
import { FileData, Flashcard, QuizQuestion, Message, QAPair, StudyGuideSection, Quote, Language } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash'; // Fast model for interactive tasks

// Helper to construct the PDF part
const getPdfPart = (file: FileData) => ({
  inlineData: {
    mimeType: file.mimeType,
    data: file.data,
  },
});

// Helper to clean JSON string from Markdown fences
const cleanJsonString = (text: string): string => {
  if (!text) return "[]";
  let cleaned = text.trim();
  // Remove ```json and ``` wrapping if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
};

// Helper for cleaning Mermaid code
const cleanMermaidString = (text: string): string => {
  if (!text) return "";
  
  // Try to extract from code block if present
  const match = text.match(/```(?:mermaid)?\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback cleanup for raw text or unclosed blocks
  return text.trim()
    .replace(/^```(?:mermaid)?\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
};

export const generateStudyGuide = async (file: FileData): Promise<StudyGuideSection[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: "Génère un guide d'étude structuré pour ce document. Divise-le en sections logiques (ex: Résumé Exécutif, Concepts Clés, Analyse, Conclusion). Pour chaque section, fournis un titre clair et le contenu en Markdown." }
        ]
      },
      config: {
        systemInstruction: "Tu es un expert pédagogique. Crée des guides de révision structurés en JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Titre de la section" },
              content: { type: Type.STRING, description: "Contenu de la section en Markdown (listes, gras, etc.)" }
            },
            required: ["title", "content"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJsonString(response.text)) as StudyGuideSection[];
    }
    return [];
  } catch (error) {
    console.error("Guide Gen Error:", error);
    throw error;
  }
};

export type SummaryLength = 'SHORT' | 'MEDIUM' | 'LONG' | 'ANALYST' | 'TEACHER' | 'EXAM' | 'APPLICATIONS' | 'SIMPLE' | 'KEY_POINTS' | 'DESCRIPTIVE';

export const generateHighlights = async (file: FileData, length: SummaryLength = 'MEDIUM', lang: Language = 'fr'): Promise<string> => {
  let promptText = "";
  let sysInstruction = "";
  
  const langInstruction = lang === 'ht' 
    ? " REPONN TOUT AN KREYÒL AYISYEN SÈLMAN. Sèvi ak yon langaj klè ak natirèl." 
    : " Réponds en Français.";

  if (length === 'ANALYST') {
    promptText = lang === 'ht' 
      ? `Aji tankou yon analis estratejik. 
1. **Tèz Prensipal:** Ki sa otè a vle di prensipalman? (Max 2 fraz).
2. **Objektif:** Poukisa dokiman sa a ekri e pou ki moun?
3. **Konklizyon Kle:** Bay 3 pwen enpòtan nou dwe kenbe.`
      : `À partir du document ci-joint, agis comme un analyste et génère une section "HIGHLIGHTS" structurée :
1. **Thèse Principale :** Quel est le message central ? (Max. 2 phrases).
2. **Objectif du Document :** Quel est le but et le public cible ?
3. **Conclusions Clés :** 3 points d'action ou résultats majeurs.`;

    sysInstruction = "Tu es un analyste expert, précis et structuré." + langInstruction;

  } else if (length === 'SIMPLE') {
    promptText = lang === 'ht'
      ? `Fè yon rezime trè senp nan yon sèl paragraf pou yon timoun 12 an ka konprann.`
      : `Fais un résumé très simple, en langage clair (vulgarisation), compréhensible par un collégien. Un seul paragraphe fluide.`;
    sysInstruction = "Tu es un vulgarisateur qui simplifie les concepts complexes." + langInstruction;

  } else if (length === 'KEY_POINTS') {
    promptText = lang === 'ht'
      ? `Bay lis 7 pwen ki pi enpòtan nan tèks la. Itilize 'Bullet points'.`
      : `Liste les 7 à 10 points clés essentiels du document sous forme de liste à puces (Bullet points).`;
    sysInstruction = "Tu es synthétique et vas droit au but." + langInstruction;

  } else if (length === 'DESCRIPTIVE') {
    promptText = lang === 'ht'
      ? `Fè yon rezime deskriptif sou dokiman sa a. Dekri de kisa l ap pale an jeneral, ki jan li òganize, ak ki ton otè a itilize. Pa fè lis, fè paragraf ki byen ekri.`
      : `Génère un résumé descriptif du document. Décris le sujet général, la structure (comment il est organisé) et l'approche de l'auteur. Utilise des paragraphes fluides, évite les listes à puces.`;
    sysInstruction = "Tu es un bibliothécaire expert qui décrit le contenu des ouvrages." + langInstruction;

  } else if (length === 'TEACHER') {
      promptText = lang === 'ht' 
        ? `Aji tankou yon pwofesè. Bay 5 konsèp kle ak definisyon yo nan yon tablo.`
        : `Extrais 5 à 7 concepts fondamentaux avec leur définition courte basée sur le texte. Format Table Markdown.`;
      sysInstruction = "Tu es un professeur pédagogique." + langInstruction;

  } else {
    // Default / Medium / Long
    promptText = lang === 'ht'
      ? `Fè yon rezime konplè sou dokiman sa a. Divize l an Tit ak Paragraf.`
      : `Analyses ce document et fournis une synthèse structurée.`;
    sysInstruction = "Tu es un assistant expert." + langInstruction;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: promptText + " Formatte le résultat en Markdown propre." }
        ]
      },
      config: {
        systemInstruction: sysInstruction
      }
    });
    return response.text || "Impossible d'extraire les points clés.";
  } catch (error) {
    console.error("Highlights Error:", error);
    throw error;
  }
};

export const generateMindmap = async (file: FileData): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: "Génère un diagramme Mermaid 'graph TD' pour ce document. \n\nCRITÈRES DE LISIBILITÉ :\n1. Utilise des labels TRÈS COURTS (max 3-5 mots par nœud).\n2. Évite les phrases complètes, utilise des mots-clés.\n3. Structure hiérarchique claire.\n\nRÈGLES TECHNIQUES :\n1. Commence par 'graph TD'.\n2. PAS de 'classDef' avant le graphe.\n3. PAS de styles CSS complexes, je gère le style côté client." }
        ]
      },
      config: {
        systemInstruction: "Tu es un expert en synthèse visuelle. Tu crées des Mindmaps Mermaid claires, lisibles et concises.",
      }
    });
    return cleanMermaidString(response.text || "");
  } catch (error) {
    console.error("Mindmap Gen Error:", error);
    throw error;
  }
};

export const generateKeyQuotes = async (file: FileData): Promise<Quote[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: "Extrais 5 à 8 citations textuelles marquantes (verbatim) de ce document. Pour chaque citation, fournis le contexte (de quoi ça parle) et si possible l'auteur ou la section." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "La citation exacte entre guillemets" },
              author: { type: Type.STRING, description: "Auteur ou Interlocuteur" },
              context: { type: Type.STRING, description: "Le contexte ou le sujet de la citation" }
            },
            required: ["text", "context"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJsonString(response.text)) as Quote[];
    }
    return [];
  } catch (error) {
    console.error("Quotes Gen Error:", error);
    throw error;
  }
};

export const generateQuiz = async (file: FileData, numQuestions: number = 5): Promise<QuizQuestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: `Crée un quiz de ${numQuestions} questions à choix multiples basé sur ce document.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER, description: "Zero-based index of the correct option" },
              explanation: { type: Type.STRING, description: "Short explanation of why the answer is correct" }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(cleanJsonString(response.text)) as QuizQuestion[];
    }
    return [];
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    throw error;
  }
};

export const generateFlashcards = async (file: FileData): Promise<Flashcard[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: "Crée 10 flashcards (cartes mémoire) pour étudier ce document. Chaque carte doit avoir une question/concept au recto (front) et la réponse/définition au verso (back)." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJsonString(response.text)) as Flashcard[];
    }
    return [];
  } catch (error) {
    console.error("Flashcard Gen Error:", error);
    throw error;
  }
};

export const generateFAQ = async (file: FileData): Promise<QAPair[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: "Génère une liste de 8 Questions et Réponses (FAQ) essentielles pour comprendre ce document. Les réponses doivent être complètes mais concises." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["question", "answer"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJsonString(response.text)) as QAPair[];
    }
    return [];
  } catch (error) {
    console.error("FAQ Gen Error:", error);
    throw error;
  }
};

export const generateFileDescription = async (file: FileData): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: "Génère une description très concise (1 à 2 phrases maximum) du sujet principal et du type de ce document." }
        ]
      }
    });
    return response.text || "Description indisponible.";
  } catch (error) {
    console.error("Description Gen Error:", error);
    return "Impossible de générer la description.";
  }
};

export const generateSuggestedQuestions = async (file: FileData): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: "Suggère 3 questions courtes, intrigantes et pertinentes (max 12 mots) que l'utilisateur pourrait poser pour démarrer une conversation sur ce document." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(cleanJsonString(response.text)) as string[];
    }
    return [];
  } catch (error) {
    console.error("Suggested Questions Error:", error);
    return [];
  }
};

export const sendChatMessage = async (
  file: FileData, 
  history: Message[], 
  newMessage: string
): Promise<string> => {
  try {
    // Construct the history for the stateless API call
    const contents = [
      {
        role: 'user',
        parts: [getPdfPart(file), { text: "Voici le document de référence pour notre conversation." }]
      },
      {
        role: 'model',
        parts: [{ text: "Bien reçu. Je suis prêt à répondre à vos questions sur ce document." }]
      },
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: newMessage }]
      }
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
         systemInstruction: "Réponds de manière concise et précise en français en te basant sur le document fourni."
      }
    });

    return response.text || "Désolé, je n'ai pas pu générer de réponse.";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};
