export interface ExerciseData {
  id: number;
  exercise: string;
  status: 'Correct' | 'Incorrect';
  confidence: number;
  imageUrl: string;
  timestamp: string;
  feedback?: string;
}

export interface AnalysisResult {
  exercise: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  corrections: string[];
}

export interface AIModel {
  name: string;
  version: string;
  displayName: string;
}

export type ViewState = 'dashboard' | 'training' | 'analyze' | 'settings';

export interface AppSettings {
  apiKey: string;
  selectedModel: string;
  systemInstruction: string;
  theme: 'light' | 'dark';
}
