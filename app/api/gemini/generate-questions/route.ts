import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, apiKey, model, questionCount = 10 } = body;

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

    // Validate question count
    if (questionCount && (typeof questionCount !== 'number' || questionCount < 1 || questionCount > 20)) {
      return NextResponse.json(
        { error: 'Question count must be a number between 1 and 20' },
        { status: 400 }
      );
    }

    // Generate questions using Gemini API
    const questions = await generateQuestions(apiKey, model, content);
    
    // Limit to requested number of questions
    const limitedQuestions = questions.slice(0, questionCount);
    
    return NextResponse.json({
      questions: limitedQuestions,
      totalGenerated: questions.length,
      requested: questionCount,
      contentLength: content.length,
    });

  } catch (error) {
    console.error('Generate Questions API error:', error);
    
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
          { error: 'Content is too long for question generation. Please try with a smaller document.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate questions. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate questions.' },
    { status: 405 }
  );
}
