import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { chunkText } from '@/lib/utils';
import { FILE_CONSTRAINTS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size must be less than ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF
    const data = await pdf(buffer);
    const text = data.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content found in PDF' },
        { status: 400 }
      );
    }

    // Chunk the text for RAG processing
    const chunks = chunkText(text);

    return NextResponse.json({
      text,
      chunks,
      metadata: {
        pages: data.numpages,
        info: data.info,
      },
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // Handle specific PDF parsing errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        return NextResponse.json(
          { error: 'Invalid PDF file format' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Password')) {
        return NextResponse.json(
          { error: 'Password-protected PDFs are not supported' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process PDF file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
