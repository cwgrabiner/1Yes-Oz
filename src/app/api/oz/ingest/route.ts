import { NextRequest, NextResponse } from 'next/server';
import { extractText } from '@/lib/ingest/extractText';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 200 }
      );
    }

    // Validate mime type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, DOCX, TXT, and MD supported' },
        { status: 200 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text
    const result = await extractText(buffer, file.type);

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { text: result.text },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ingest API error:', error);
    return NextResponse.json(
      { error: "Couldn't read this file type" },
      { status: 200 }
    );
  }
}
