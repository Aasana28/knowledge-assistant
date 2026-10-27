import { NextRequest, NextResponse } from 'next/server';
import { getIndexData } from '@/lib/retrieval';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = getIndexData();
    const chunk = index.chunks.find((c) => c.chunkId === id);

    if (!chunk) {
      return NextResponse.json({ error: 'Chunk not found' }, { status: 404 });
    }

    return NextResponse.json({
      chunkId: chunk.chunkId,
      docId: chunk.docId,
      title: chunk.title,
      category: chunk.category,
      access: chunk.access,
      text: chunk.text,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

