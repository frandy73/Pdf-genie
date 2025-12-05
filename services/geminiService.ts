import { GoogleGenAI, Type } from "@google/genai";
import { FileData, Flashcard, QuizQuestion, Message, QAPair, StudyGuideSection } from "../types";

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

export type SummaryLength = 'SHORT' | 'MEDIUM' | 'LONG' | 'ANALYST' | 'TEACHER' | 'EXAM' | 'APPLICATIONS';

export const generateHighlights = async (file: FileData, length: SummaryLength = 'MEDIUM'): Promise<string> => {
  let promptText = "";
  let sysInstruction = "Tu es un assistant analytique expert capable d'extraire l'essence d'un document complexe.";

  if (length === 'ANALYST') {
    promptText = `À partir du document ci-joint, agis comme un analyste et génère une section "HIGHLIGHTS" structurée, se concentrant uniquement sur les éléments suivants :

1. **Thèse Principale :** Quel est le message central ou l'argument majeur que l'auteur veut transmettre ? (Max. 2 phrases).
2. **Objectif du Document :** Quel est le but de ce texte (informer, convaincre, guider, etc.) et à qui s'adresse-t-il (public cible) ?
3. **Conclusions Clés :** Quels sont les trois principaux points d'action ou résultats que l'on doit retenir à la fin de la lecture ?

Formatte la sortie sous forme de liste à puce claire en Markdown.`;
    sysInstruction = "Tu es un analyste expert, précis et structuré.";

  } else if (length === 'TEACHER') {
    promptText = `À partir du document ci-joint, agis comme un professeur préparant un guide d'étude.

1. **Concepts Essentiels :** Extrais et liste les 5 à 7 concepts ou principes les plus fondamentaux (ex : Intégrité, Vision, Persévérance) mentionnés. Pour chacun, donne une **définition courte** basée *strictement* sur le texte.
2. **Faits/Exemples Cruciaux :** Liste 3 à 5 faits, noms, ou exemples que l'auteur utilise pour appuyer sa thèse.

Le résultat doit être une table Markdown avec deux colonnes : "Concept/Fait" et "Définition/Description".`;
    sysInstruction = "Tu es un professeur pédagogique qui structure l'information pour l'apprentissage.";

  } else if (length === 'EXAM') {
    promptText = `À partir du document ci-joint, génère un ensemble de matériel de révision :

**PARTIE A : Flashcards (Terme/Définition)**
Crée 5 paires "Recto/Verso" basées sur les définitions les plus importantes du texte.
Format souhaité par carte :
* **Recto (Terme) :** [Mot-clé]
* **Verso (Définition) :** [Définition complète extraite ou synthétisée du texte]

**PARTIE B : Questions à Choix Multiples (QCM)**
Génère 3 questions à choix multiples (QCM) basées sur des faits précis du document. Pour chaque question :
* Fournis la **Question**.
* Indique la **Bonne Réponse**.
* Génère **trois distracteurs** qui sont plausibles mais incorrects selon le texte.

Formatte le résultat en Markdown clair avec des titres de section (##).`;
    sysInstruction = "Tu es un examinateur expert qui crée du matériel de révision précis.";

  } else if (length === 'APPLICATIONS') {
    promptText = `À partir du document ci-joint, analyse les relations et les applications pratiques du contenu :

1. **Relations Clés :** Identifie un lien de cause à effet crucial (ex : "Comment la Vision Mène-t-elle à la Discipline ?"). Décris cette relation en une courte phrase.
2. **Application Pratique :** Formule une question d'application concrète : "Comment puis-je utiliser le concept de [INSÉRER UN CONCEPT CLÉ DU TEXTE] dans une situation de travail réelle ?"

Le résultat doit être directement utilisable comme sujet de discussion ou exercice de réflexion pour l'utilisateur. Formatte en Markdown propre.`;
    sysInstruction = "Tu es un coach professionnel axé sur la mise en pratique des connaissances.";

  } else {
    let lengthInstruction = "";
    switch (length) {
      case 'SHORT':
        lengthInstruction = "Un résumé très court et concis (maximum 3 phrases) qui va droit au but.";
        break;
      case 'LONG':
        lengthInstruction = "Un résumé détaillé et approfondi en plusieurs paragraphes couvrant tous les aspects importants.";
        break;
      case 'MEDIUM':
      default:
        lengthInstruction = "Un paragraphe de résumé standard, équilibré et clair.";
        break;
    }
    promptText = `Analyses ce document et fournis une synthèse structurée :\n\n## 📝 Résumé Exécutif\n${lengthInstruction}\n\n## ✨ Highlights (Points Clés)\nUne liste des 7 à 10 points les plus cruciaux et importants du document.\n\nFormate le tout en Markdown propre.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          getPdfPart(file),
          { text: promptText }
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