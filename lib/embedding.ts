import { GoogleGenAI } from '@google/genai';
import { l2Normalize } from './vector';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const EMBED_MODEL = process.env.EMBED_MODEL || 'gemini-embedding-001';

export async function embedQuery(query: string): Promise<number[]> {
  const ai = getGeminiClient();

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: EMBED_MODEL,
        contents: query,
        config: {
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: 768,
        },
      });

      const values = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;
      if (!values || !Array.isArray(values) || values.length === 0) {
        throw new Error('No embedding vector returned for query');
      }

      return l2Normalize(values);
    } catch (err: any) {
      if (attempt === 2) throw err;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  throw new Error('Failed to embed query');
}

