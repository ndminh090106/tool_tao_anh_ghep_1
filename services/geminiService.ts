import { GoogleGenAI, Type } from "@google/genai";
import { Point, ImageCategory } from "../types";

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface AnalysisResult {
  focalPoint: Point;
  category: ImageCategory;
  description: string;
}

export const analyzeImageWithGemini = async (file: File): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key missing, returning default center focus.");
    return { focalPoint: { x: 0.5, y: 0.5 }, category: 'other', description: "No API Key" };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `Analyze this real estate/product image. 
            1. Identify the primary focal point (x,y) normalized 0-1.
            2. Classify the image into EXACTLY ONE of these categories: 
               - 'house' (exterior facade, whole building)
               - 'living_room' (sofa, TV area)
               - 'kitchen' (cooking area, dining)
               - 'bedroom' (bed)
               - 'bathroom' (toilet, shower)
               - 'alley' (street outside, car access, road)
               - 'rooftop' (terrace, balcony, view from top)
               - 'other' (anything else)
            3. Provide a 5-word description.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focalPoint: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
              },
              required: ["x", "y"]
            },
            category: { 
              type: Type.STRING, 
              enum: ['house', 'living_room', 'kitchen', 'bedroom', 'alley', 'rooftop', 'bathroom', 'other'] 
            },
            description: { type: Type.STRING }
          },
          required: ["focalPoint", "category", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Sometimes models include markdown formatting like ```json ... ``` which breaks JSON.parse
    const cleanedText = text.replace(/```json\n?|```/g, '').trim();
    
    return JSON.parse(cleanedText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback so the app doesn't crash
    return { focalPoint: { x: 0.5, y: 0.5 }, category: 'other', description: "Analysis failed" };
  }
};