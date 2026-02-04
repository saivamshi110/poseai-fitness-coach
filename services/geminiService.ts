import { GoogleGenAI, Type } from "@google/genai";
import { AIModel, AnalysisResult } from "../types";

// Helper to convert URL to Base64 (handles CORS issues by attempting fetch, falls back to error)
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("CORS or Fetch Error:", error);
    throw new Error("Could not process image URL directly due to browser security (CORS). Please use a Data URI or upload a file.");
  }
};

export const fetchSupportedModels = async (apiKey: string): Promise<AIModel[]> => {
  if (!apiKey) return [];
  const cleanKey = apiKey.trim();
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
    if (!response.ok) {
      // If listing fails, we return empty list so the UI falls back to default hardcoded models
      // rather than breaking the application flow.
      console.warn(`Failed to list models: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    
    // Filter for gemini models
    return (data.models || [])
      .filter((m: any) => m.name.includes('gemini'))
      .map((m: any) => ({
        name: m.name.replace('models/', ''),
        version: m.version,
        displayName: m.displayName
      }));
  } catch (error: any) {
    console.error("Model fetch error:", error);
    // Return empty array to allow fallback
    return [];
  }
};

export const analyzePoseWithGemini = async (
  apiKey: string,
  modelName: string,
  imageBase64: string,
  systemInstruction: string
): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  // Ensure strict adherence to guidelines: explicit new constructor
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      exercise: { type: Type.STRING },
      isCorrect: { type: Type.BOOLEAN },
      score: { type: Type.NUMBER },
      feedback: { type: Type.STRING },
      corrections: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ["exercise", "isCorrect", "score", "feedback", "corrections"]
  };
  
  const prompt = `
    Analyze this fitness image. 
    1. Identify the exercise being performed.
    2. Determine if the form is "Correct" or "Incorrect".
    3. Give a confidence score (0-100) based on posture quality.
    4. Provide brief feedback.
    5. List up to 3 specific corrections if incorrect, or key points if correct.
  `;

  // Use a valid model from the guidelines if none provided or if previous defaults were invalid
  const targetModel = modelName || 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AnalysisResult;
    return result;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // Enhance error message for common 404s regarding model names
    if (error.message?.includes("404") || error.toString().includes("not found")) {
      throw new Error(`Model '${targetModel}' not found or not supported. Please select a valid model in Settings (e.g., gemini-3-flash-preview).`);
    }
    throw error;
  }
};