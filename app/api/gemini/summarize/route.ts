import { NextRequest, NextResponse } from 'next/server';
import { generateSummary } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, apiKey, model } = body;

    // Validate required fields
    if (!content || !apiKey || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: content, apiKey, model' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content must be a non-empty string' },
        { status: 400 }
      );
    }

    // Generate summary using Gemini API
    const summary = await generateSummary(apiKey, model, content);
    
    return NextResponse.json({
      summary,
      originalLength: content.length,
      summaryLength: summary.length,
    });

  } catch (error) {
    console.error('Summarize API error:', error);
    
    if (error instanceof Error) {
      // Handle specific Gemini API errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Gemini API key.' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('model')) {
        return NextResponse.json(
          { error: 'Invalid model specified. Please check the model name.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('content too long')) {
        return NextResponse.json(
          { error: 'Content is too long for summarization. Please try with a smaller document.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate summaries.' },
    { status: 405 }
  );
}
