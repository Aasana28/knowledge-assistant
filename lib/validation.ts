import { Citation, DocumentChunk, ValidationSummary } from '../types';

export function normalizeTextForSearch(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\w\s\u20B9₹%.,-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateAndEnrichCitations(
  rawCitations: { chunkId: string; quote: string }[],
  retrievedChunks: DocumentChunk[],
  found: boolean
): {
  validCitations: Citation[];
  validationSummary: ValidationSummary;
  finalFound: boolean;
  adjustedAnswerModifier?: string;
} {
  const chunkMap = new Map<string, DocumentChunk>();
  for (const c of retrievedChunks) {
    chunkMap.set(c.chunkId, c);
  }

  const validCitations: Citation[] = [];
  const droppedCitations: string[] = [];

  for (const item of rawCitations) {
    const chunk = chunkMap.get(item.chunkId);
    if (!chunk) {
      droppedCitations.push(`Chunk [${item.chunkId}] not in allowed retrieved set`);
      continue;
    }

    const normChunkText = normalizeTextForSearch(chunk.text);
    const normQuote = normalizeTextForSearch(item.quote);

    if (normQuote.length < 5) {
      droppedCitations.push(`Quote too short to verify: "${item.quote}"`);
      continue;
    }

    if (normChunkText.includes(normQuote)) {
      validCitations.push({
        chunkId: chunk.chunkId,
        quote: item.quote.trim(),
        docTitle: chunk.title,
        category: chunk.category,
        access: chunk.access,
      });
    } else {
      // Try sub-phrase matching (if quote has minor word variations)
      const words = normQuote.split(' ');
      let matched = false;
      if (words.length >= 6) {
        const sub = words.slice(0, 5).join(' ');
        if (normChunkText.includes(sub)) {
          validCitations.push({
            chunkId: chunk.chunkId,
            quote: item.quote.trim(),
            docTitle: chunk.title,
            category: chunk.category,
            access: chunk.access,
          });
          matched = true;
        }
      }

      if (!matched) {
        droppedCitations.push(`Quote not found as substring in [${chunk.chunkId}]: "${item.quote}"`);
      }
    }
  }

  let finalFound = found;
  let downgraded = false;

  // Requirement: "If found is true but no valid citation remains, downgrade to not found."
  if (found && validCitations.length === 0) {
    finalFound = false;
    downgraded = true;
  }

  return {
    validCitations,
    validationSummary: {
      originalCitationCount: rawCitations.length,
      validCitationCount: validCitations.length,
      droppedCitations,
      downgraded,
    },
    finalFound,
  };
}

