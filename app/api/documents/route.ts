import { NextResponse } from 'next/server';
import { getIndexData } from '@/lib/retrieval';

export async function GET() {
  try {
    const index = getIndexData();
    const docSummary = index.documents.map((doc) => {
      const docChunks = index.chunks.filter((c) => c.docId === doc.id);
      return {
        ...doc,
        chunkCount: docChunks.length,
      };
    });

    return NextResponse.json({
      documents: docSummary,
      totalDocuments: docSummary.length,
      totalChunks: index.chunks.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to load documents catalog', message: err.message },
      { status: 500 }
    );
  }
}

