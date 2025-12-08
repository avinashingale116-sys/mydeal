import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIAnalysisResult, BidSuggestion } from "../types";

// Safely access API key, handling environments where process might be undefined
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing process.env", e);
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The full, official product model name and title (e.g., 'LG 1.5 Ton 5 Star AI Dual Inverter Split AC RS-Q19YNZE')."
    },
    category: {
      type: Type.STRING,
      description: "The general category of the item (e.g., Electronics, Automotive, Home Appliance)."
    },
    specs: {
      type: Type.OBJECT,
      description: "Detailed technical specifications fetched for the specific model.",
      properties: {
        brand: { type: Type.STRING },
        model: { type: Type.STRING },
        capacity_or_size: { type: Type.STRING },
        key_features: { type: Type.STRING },
        star_rating: { type: Type.STRING },
        warranty: { type: Type.STRING }
      }
    },
    estimatedMarketPrice: {
      type: Type.OBJECT,
      properties: {
        min: { type: Type.NUMBER, description: "Minimum current market price online in INR." },
        max: { type: Type.NUMBER, description: "Maximum current market price online in INR." }
      },
      required: ["min", "max"]
    },
    suggestedMaxBudget: {
      type: Type.NUMBER,
      description: "A recommended maximum budget cap for the user in INR."
    }
  },
  required: ["title", "category", "specs", "estimatedMarketPrice", "suggestedMaxBudget"]
};

const bidSuggestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    suggestedPrice: { type: Type.NUMBER, description: "The recommended bid amount to be competitive yet profitable (INR)." },
    reasoning: { type: Type.STRING, description: "A brief explanation of why this price is recommended based on market data and existing bids." },
    winProbability: { type: Type.STRING, description: "Estimated probability of winning with this bid (e.g., 'High', 'Medium', 'Low')." }
  },
  required: ["suggestedPrice", "reasoning", "winProbability"]
};

export const analyzeRequirement = async (userInput: string): Promise<AIAnalysisResult | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User Input: "${userInput}". 
      The user is looking for specifications of a specific product model. 
      Identify the model, retrieve its standard technical specifications from your knowledge base, and estimate its current price in India.
      If the user provides a partial name, infer the most likely popular model.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a product specification expert engine. Your goal is to take a product name or model number and 'fetch' its full technical details, features, and current market price in INR. Be precise with model numbers and specs."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export const getBidSuggestion = async (
  title: string,
  marketPrice: { min: number; max: number },
  currentBids: number[]
): Promise<BidSuggestion | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  try {
    const prompt = `
      I am a seller on a reverse auction platform.
      Product: "${title}"
      Estimated Market Price Range: ₹${marketPrice.min} - ₹${marketPrice.max}
      Current Competitor Bids (lowest first): ${currentBids.length > 0 ? currentBids.sort((a,b)=>a-b).map(b => `₹${b}`).join(', ') : 'No bids yet'}
      
      Suggest an optimal bid price that maximizes my chance of winning while maintaining a reasonable margin.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: bidSuggestionSchema,
        systemInstruction: "You are a strategic pricing AI assistant for sellers. Analyze the competition and market data to suggest a winning bid price in INR."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BidSuggestion;
    }
    return null;
  } catch (error) {
    console.error("Gemini pricing analysis failed:", error);
    return null;
  }
};