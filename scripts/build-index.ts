import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GoogleGenAI } from '@google/genai';
import { DocMetadata, DocumentChunk, IndexData, DocCategory, AccessLevel } from '../types';
import { chunkDocumentText, l2Normalize } from '../lib/vector';

// Load .env.local without exposing/printing values
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('Error: GEMINI_API_KEY environment variable is missing.');
  process.exit(1);
}

const embedModel = process.env.EMBED_MODEL || 'gemini-embedding-001';
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function embedChunkWithRetry(text: string, title: string, retries = 3): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Include title in content for richer document semantic context
      const contentToEmbed = `Title: ${title}\n\n${text}`;
      
      const response = await ai.models.embedContent({
        model: embedModel,
        contents: contentToEmbed,
        config: {
          taskType: 'RETRIEVAL_DOCUMENT',
          outputDimensionality: 768,
        },
      });

      const values = (response as any).embedding?.values || (response as any).embeddings?.[0]?.values;
      if (!values || !Array.isArray(values) || values.length === 0) {
        throw new Error('No embedding values returned from Gemini API');
      }

      // L2-normalize every 768-dim vector as required
      return l2Normalize(values);
    } catch (err: any) {
      console.warn(`[Attempt ${attempt}/${retries}] Embedding failed: ${err.message}`);
      if (attempt === retries) throw err;
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error('Failed to embed chunk after retries');
}

async function main() {
  console.log('--- Brightwave Digital Knowledge Base Indexer ---');
  console.log(`Using embedding model: ${embedModel} (768 dims, L2-normalized)`);

  const docsDir = path.resolve(process.cwd(), 'data/docs');
  if (!fs.existsSync(docsDir)) {
    console.error(`Docs directory not found at: ${docsDir}`);
    process.exit(1);
  }

  const fileNames = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'));
  console.log(`Found ${fileNames.length} documents in ${docsDir}`);

  const documents: DocMetadata[] = [];
  const chunks: DocumentChunk[] = [];

  for (const fileName of fileNames) {
    const filePath = path.join(docsDir, fileName);
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(rawContent);

    const docMeta: DocMetadata = {
      id: frontmatter.id || path.basename(fileName, '.md'),
      title: frontmatter.title || 'Untitled Document',
      category: frontmatter.category as DocCategory,
      access: frontmatter.access as AccessLevel,
      owner: frontmatter.owner || 'Unknown',
      updated: frontmatter.updated || '2026-09-01',
      status: frontmatter.status || 'approved',
    };
    documents.push(docMeta);

    // Chunk text
    const textChunks = chunkDocumentText(content);
    console.log(`Processing "${docMeta.title}" (${docMeta.access}) -> ${textChunks.length} chunks`);

    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i];
      const chunkId = `${docMeta.id}-c${i}`;
      
      console.log(`  Embedding chunk ${chunkId}...`);
      const embedding = await embedChunkWithRetry(chunkText, docMeta.title);

      chunks.push({
        chunkId,
        docId: docMeta.id,
        title: docMeta.title,
        category: docMeta.category,
        access: docMeta.access,
        text: chunkText,
        embedding,
      });

      // Brief delay between calls to stay well within free tier rate limits
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const indexData: IndexData = {
    documents,
    chunks,
    totalChunks: chunks.length,
    embeddedAt: new Date().toISOString(),
    model: embedModel,
  };

  const outputPath = path.resolve(process.cwd(), 'data/index.json');
  fs.writeFileSync(outputPath, JSON.stringify(indexData, null, 2), 'utf8');
  console.log(`\nSuccessfully created index at ${outputPath}`);
  console.log(`Total documents: ${documents.length}`);
  console.log(`Total indexed chunks: ${chunks.length}`);
}

main().catch((err) => {
  console.error('Fatal error building index:', err);
  process.exit(1);
});

