import fs from 'fs';
import path from 'path';
import { Role, ROLE_ACCESS_MAP, DocumentChunk, IndexData, RetrievedChunkInfo } from '../types';
import { cosineSimilarity } from './vector';

let cachedIndex: IndexData | null = null;

export function getIndexData(): IndexData {
  if (cachedIndex) return cachedIndex;

  const indexPath = path.resolve(process.cwd(), 'data/index.json');
  if (!fs.existsSync(indexPath)) {
    throw new Error('Index file data/index.json not found. Run npm run build-index first.');
  }

  const raw = fs.readFileSync(indexPath, 'utf8');
  cachedIndex = JSON.parse(raw) as IndexData;
  return cachedIndex;
}

export function filterChunksByRole(role: Role) {
  const index = getIndexData();
  const allowedLevels = ROLE_ACCESS_MAP[role] || ['public'];

  const allowedChunks: DocumentChunk[] = [];
  const restrictedChunks: DocumentChunk[] = [];
  const allowedDocIds = new Set<string>();

  for (const chunk of index.chunks) {
    if (allowedLevels.includes(chunk.access)) {
      allowedChunks.push(chunk);
      allowedDocIds.add(chunk.docId);
    } else {
      restrictedChunks.push(chunk);
    }
  }

  return {
    allowedChunks,
    restrictedChunks,
    allowedDocCount: allowedDocIds.size,
    totalDocCount: index.documents.length,
    allowedChunkCount: allowedChunks.length,
  };
}

export function rankChunksBySimilarity(
  queryVector: number[],
  chunks: DocumentChunk[],
  topK: number = 4
): { chunk: DocumentChunk; score: number }[] {
  const scored = chunks.map((chunk) => {
    const score = cosineSimilarity(queryVector, chunk.embedding);
    return { chunk, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

export function evaluateRestrictedMatch(
  queryVector: number[],
  restrictedChunks: DocumentChunk[],
  threshold: number
): { hasRestrictedMatch: boolean; bestScore: number } {
  if (restrictedChunks.length === 0) {
    return { hasRestrictedMatch: false, bestScore: 0 };
  }

  let bestScore = -1;
  for (const chunk of restrictedChunks) {
    const score = cosineSimilarity(queryVector, chunk.embedding);
    if (score > bestScore) {
      bestScore = score;
    }
  }

  return {
    hasRestrictedMatch: bestScore >= threshold,
    bestScore,
  };
}

