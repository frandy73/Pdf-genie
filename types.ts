
export enum AppMode {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  GUIDE = 'GUIDE',
  QUIZ = 'QUIZ',
  FLASHCARDS = 'FLASHCARDS',
  HIGHLIGHTS = 'HIGHLIGHTS',
  FAQ = 'FAQ',
  METHODOLOGY = 'METHODOLOGY',
  STRATEGIC = 'STRATEGIC',
  MINDMAP = 'MINDMAP',
  QUOTES = 'QUOTES'
}

export interface FileData {
  name: string;
  data: string; // Base64
  mimeType: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface QAPair {
  question: string;
  answer: string;
}

export interface StudyGuideSection {
  title: string;
  content: string;
}

export interface Quote {
  text: string;
  author?: string;
  context: string;
  page?: string;
}

export type Language = 'fr' | 'ht'; // Français ou Créole Haïtien
