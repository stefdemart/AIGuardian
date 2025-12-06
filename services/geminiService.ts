import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize client securely (in a real app, this would be proxied or handled server-side for key safety)
const ai = new GoogleGenAI({ apiKey });

export const analyzeVaultData = async (vaultSummary: string[]): Promise<string> => {
  if (!apiKey) {
    return "Clé API non configurée. Impossible d'analyser le profil.";
  }

  try {
    const prompt = `
      Tu es un expert en analyse de données personnelles sécurisées.
      Voici une liste de résumés de conversations et de données qu'un utilisateur a stockées dans son coffre-fort numérique :
      ${JSON.stringify(vaultSummary)}
      
      Génère une synthèse courte (max 3 phrases) du "Profil de Connaissances" de cet utilisateur.
      Quels sont ses centres d'intérêt principaux basés sur ces données ? 
      Adopte un ton professionnel et rassurant.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analyse indisponible.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erreur lors de l'analyse du profil. Veuillez réessayer plus tard.";
  }
};
