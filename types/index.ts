export type Role = 'Intern' | 'Account Manager' | 'Finance Lead' | 'Managing Partner';

export type AccessLevel = 'public' | 'internal' | 'finance' | 'management';

export type DocCategory = 'SOP' | 'Service' | 'Pricing' | 'FAQ' | 'Project';

export const ROLE_ACCESS_MAP: Record<Role, AccessLevel[]> = {
  'Intern': ['public'],
  'Account Manager': ['public', 'internal'],
  'Finance Lead': ['public', 'internal', 'finance'],
  'Managing Partner': ['public', 'internal', 'finance', 'management'],
};

export interface DocMetadata {
  id: string;
  title: string;
  category: DocCategory;
  access: AccessLevel;
  owner: string;
  updated: string;
  status: string;
}

export interface DocumentChunk {
  chunkId: string;
  docId: string;
  title: string;
  category: DocCategory;
  access: AccessLevel;
  text: string;
  embedding: number[];
}

export interface IndexData {
  documents: DocMetadata[];
  chunks: DocumentChunk[];
  totalChunks: number;
  embeddedAt: string;
  model: string;
}

export interface Citation {
  chunkId: string;
  quote: string;
  docTitle?: string;
  category?: DocCategory;
  access?: AccessLevel;
}

export interface RetrievedChunkInfo {
  chunkId: string;
  docId: string;
  title: string;
  category: DocCategory;
  access: AccessLevel;
  score: number;
  textSnippet: string;
}

export interface StageTimings {
  embedMs: number;
  retrieveMs: number;
  generateMs: number;
  validateMs: number;
  totalMs: number;
}

export interface ValidationSummary {
  originalCitationCount: number;
  validCitationCount: number;
  droppedCitations: string[];
  downgraded: boolean;
}

export interface PipelineTrace {
  role: Role;
  allowedDocCount: number;
  totalDocCount: number;
  allowedChunkCount: number;
  threshold: number;
  passedThreshold: boolean;
  bestScore: number;
  modelUsed: string;
  retrievedChunks: RetrievedChunkInfo[];
  timings: StageTimings;
  validationResult: ValidationSummary;
}

export interface AskResponse {
  found: boolean;
  answer: string;
  citations: Citation[];
  restrictedMatch: boolean;
  restrictedHint?: string;
  trace: PipelineTrace;
}

