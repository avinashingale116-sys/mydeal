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
      description: "A concise, professional title for the product request (e.g., 'LG 1.5 Ton Inverter Split AC')."
    },
    category: {
      type: Type.STRING,
      description: "The general category of the item (e.g., Electronics, Automotive, Home Appliance)."
    },
    specs: {
      type: Type.OBJECT,
      description: "Key technical specifications extracted or inferred from the user input.",
      properties: {
        brand: { type: Type.STRING },
        modelYear: { type: Type.STRING },
        capacity: { type: Type.STRING },
        features: { type: Type.STRING },
        condition: { type: Type.STRING, description: "New or Used" }
      }
    },
    estimatedMarketPrice: {
      type: Type.OBJECT,
      properties: {
        min: { type: Type.NUMBER, description: "Minimum realistic market price." },
        max: { type: Type.NUMBER, description: "Maximum realistic market price." }
      },
      required: ["min", "max"]
    },
    suggestedMaxBudget: {
      type: Type.NUMBER,
      description: "A recommended maximum budget cap for the user."
    }
  },
  required: ["title", "category", "specs", "estimatedMarketPrice", "suggestedMaxBudget"]
};

const bidSuggestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    suggestedPrice: { type: Type.NUMBER, description: "The recommended bid amount to be competitive yet profitable." },
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
      contents: `The user wants to buy a product but might not know the technical details or best price. 
      Analyze this input: "${userInput}". 
      Extract specifications, infer missing standard details for a good purchase, and estimate current market price in USD.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a helpful procurement assistant. Your goal is to turn vague buyer requests into structured, professional Request for Quotations (RFQs) that sellers can easily bid on. Be realistic with price estimates."
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
      Estimated Market Price Range: $${marketPrice.min} - $${marketPrice.max}
      Current Competitor Bids (lowest first): ${currentBids.length > 0 ? currentBids.sort((a,b)=>a-b).map(b => `$${b}`).join(', ') : 'No bids yet'}
      
      Suggest an optimal bid price that maximizes my chance of winning while maintaining a reasonable margin.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: bidSuggestionSchema,
        systemInstruction: "You are a strategic pricing AI assistant for sellers. Analyze the competition and market data to suggest a winning bid price."
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