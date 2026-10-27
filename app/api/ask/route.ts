import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Role, AskResponse, PipelineTrace } from '@/types';
import { filterChunksByRole, rankChunksBySimilarity, evaluateRestrictedMatch } from '@/lib/retrieval';
import { embedQuery } from '@/lib/embedding';
import { generateAnswerWithContext } from '@/lib/groq';
import { validateAndEnrichCitations } from '@/lib/validation';

export const maxDuration = 60;

const AskRequestSchema = z.object({
  question: z.string().min(1, 'Question is required').max(1000),
  role: z.enum(['Intern', 'Account Manager', 'Finance Lead', 'Managing Partner']),
});

const DEFAULT_THRESHOLD = 0.50;

export async function POST(req: NextRequest) {
  const overallStart = performance.now();

  try {
    const rawBody = await req.json();
    const parsed = AskRequestSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { question, role } = parsed.data;
    const threshold = process.env.SIMILARITY_THRESHOLD
      ? parseFloat(process.env.SIMILARITY_THRESHOLD)
      : DEFAULT_THRESHOLD;

    // STEP 1: Pre-retrieval access boundary filter
    // Chunks not permitted for the user's role are segregated BEFORE search.
    // They are NEVER passed to the LLM or exposed in citations.
    const {
      allowedChunks,
      restrictedChunks,
      allowedDocCount,
      totalDocCount,
      allowedChunkCount,
    } = filterChunksByRole(role);

    // STEP 2: Embed user query with Gemini (taskType: RETRIEVAL_QUERY, 768 dims, L2-normalized)
    const tEmbedStart = performance.now();
    const queryVector = await embedQuery(question);
    const embedMs = Math.round(performance.now() - tEmbedStart);

    // STEP 3: Cosine similarity ranking over allowed chunks only (top-4)
    const tRetrieveStart = performance.now();
    const topMatches = rankChunksBySimilarity(queryVector, allowedChunks, 4);
    const retrieveMs = Math.round(performance.now() - tRetrieveStart);

    const bestScore = topMatches.length > 0 ? topMatches[0].score : 0;
    const passedThreshold = bestScore >= threshold && topMatches.length > 0;

    // STEP 7 CHECK: Check if restricted docs have a strong match (without leaking text/title/score)
    const restrictedEval = evaluateRestrictedMatch(queryVector, restrictedChunks, threshold);

    // STEP 4: Threshold Gate: if best score is below threshold, return not found without calling LLM
    if (!passedThreshold) {
      const totalMs = Math.round(performance.now() - overallStart);

      const response: AskResponse = {
        found: false,
        answer: "I couldn't find this in the approved documents available to your role.",
        citations: [],
        restrictedMatch: restrictedEval.hasRestrictedMatch,
        restrictedHint: restrictedEval.hasRestrictedMatch
          ? 'This may be covered in a document that needs higher access.'
          : undefined,
        trace: {
          role,
          allowedDocCount,
          totalDocCount,
          allowedChunkCount,
          threshold,
          passedThreshold: false,
          bestScore: Number(bestScore.toFixed(4)),
          modelUsed: 'None (Gated by threshold)',
          retrievedChunks: topMatches.map((m) => ({
            chunkId: m.chunk.chunkId,
            docId: m.chunk.docId,
            title: m.chunk.title,
            category: m.chunk.category,
            access: m.chunk.access,
            score: Number(m.score.toFixed(4)),
            textSnippet: m.chunk.text.slice(0, 160) + '...',
          })),
          timings: {
            embedMs,
            retrieveMs,
            generateMs: 0,
            validateMs: 0,
            totalMs,
          },
          validationResult: {
            originalCitationCount: 0,
            validCitationCount: 0,
            droppedCitations: [],
            downgraded: false,
          },
        },
      };

      return NextResponse.json(response);
    }

    // STEP 5: Generate answer using Groq with retrieved context only
    const tGenerateStart = performance.now();
    const candidateChunks = topMatches.map((m) => m.chunk);
    const { result: llmResult, modelUsed } = await generateAnswerWithContext(
      question,
      candidateChunks
    );
    const generateMs = Math.round(performance.now() - tGenerateStart);

    // STEP 6: Validate citations in code
    // chunkId must be in retrieved set and quote must be a verbatim substring
    const tValidateStart = performance.now();
    const { validCitations, validationSummary, finalFound } = validateAndEnrichCitations(
      llmResult.citations,
      candidateChunks,
      llmResult.found
    );
    const validateMs = Math.round(performance.now() - tValidateStart);

    let finalAnswer = llmResult.answer;
    if (validationSummary.downgraded) {
      finalAnswer = "I couldn't find verified approved information for this question in the documents available to your role.";
    }

    const totalMs = Math.round(performance.now() - overallStart);

    const response: AskResponse = {
      found: finalFound,
      answer: finalAnswer,
      citations: validCitations,
      restrictedMatch: restrictedEval.hasRestrictedMatch,
      restrictedHint: restrictedEval.hasRestrictedMatch
        ? 'This may be covered in a document that needs higher access.'
        : undefined,
      trace: {
        role,
        allowedDocCount,
        totalDocCount,
        allowedChunkCount,
        threshold,
        passedThreshold: true,
        bestScore: Number(bestScore.toFixed(4)),
        modelUsed,
        retrievedChunks: topMatches.map((m) => ({
          chunkId: m.chunk.chunkId,
          docId: m.chunk.docId,
          title: m.chunk.title,
          category: m.chunk.category,
          access: m.chunk.access,
          score: Number(m.score.toFixed(4)),
          textSnippet: m.chunk.text.slice(0, 160) + '...',
        })),
        timings: {
          embedMs,
          retrieveMs,
          generateMs,
          validateMs,
          totalMs,
        },
        validationResult: validationSummary,
      },
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Unhandled API error in /api/ask:', err);
    return NextResponse.json(
      {
        error: true,
        message: 'A temporary service issue occurred while processing your request. Please try again.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}

