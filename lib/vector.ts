/**
 * Vector and math utility functions for Brightwave Knowledge Assistant
 */

export function l2Normalize(vector: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < vector.length; i++) {
    sumSq += vector[i] * vector[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0 || !isFinite(norm)) {
    return vector;
  }
  return vector.map((v) => v / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  // Clamp to valid range [-1, 1] to prevent floating point inaccuracies
  return Math.max(-1, Math.min(1, dot));
}

/**
 * Split text into semantic chunks of roughly 200-300 words.
 * Prefers splitting on markdown headers and paragraph boundaries.
 */
export function chunkDocumentText(text: string, minWords = 150, maxWords = 300): string[] {
  // Normalize line endings
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  
  // Split on section headers (## or ###) or double newlines
  const sections = cleanText.split(/\n(?=## )/g);
  const chunks: string[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const words = trimmed.split(/\s+/);
    if (words.length <= maxWords) {
      // Section is small enough to be its own chunk
      if (words.length >= 40) {
        chunks.push(trimmed);
      } else if (chunks.length > 0) {
        // Very short section, append to previous chunk if it doesn't blow past maxWords
        const prevWords = chunks[chunks.length - 1].split(/\s+/);
        if (prevWords.length + words.length <= maxWords) {
          chunks[chunks.length - 1] += '\n\n' + trimmed;
        } else {
          chunks.push(trimmed);
        }
      } else {
        chunks.push(trimmed);
      }
    } else {
      // Split large section by paragraphs
      const paragraphs = trimmed.split(/\n\n+/);
      let currentChunk = '';
      let currentWordCount = 0;

      for (const para of paragraphs) {
        const paraWords = para.trim().split(/\s+/).length;
        if (currentWordCount + paraWords > maxWords && currentWordCount >= minWords) {
          chunks.push(currentChunk.trim());
          currentChunk = para.trim();
          currentWordCount = paraWords;
        } else {
          if (currentChunk) {
            currentChunk += '\n\n' + para.trim();
          } else {
            currentChunk = para.trim();
          }
          currentWordCount += paraWords;
        }
      }

      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
    }
  }

  // Safety fallback if no chunks produced
  if (chunks.length === 0 && cleanText.length > 0) {
    chunks.push(cleanText);
  }

  return chunks;
}

