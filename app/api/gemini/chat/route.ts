import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, streamChatResponse } from '@/lib/gemini';
import { findRelevantChunks } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, chunks, apiKey, model, stream = false } = body;

    // Validate required fields
    if (!query || !chunks || !apiKey || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: query, chunks, apiKey, model' },
        { status: 400 }
      );
    }

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json(
        { error: 'Chunks must be a non-empty array' },
        { status: 400 }
      );
    }

    // Find relevant chunks for the query
    const relevantChunks = findRelevantChunks(query, chunks);
    const context = relevantChunks.join('\n\n');

    if (stream) {
      // Return streaming response
      const encoder = new TextEncoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamChatResponse(apiKey, model, query, context)) {
              const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
            
            // Send end signal
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            const errorData = `data: ${JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown error' 
            })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Return regular response
      const response = await generateChatResponse(apiKey, model, query, context);
      
      return NextResponse.json({
        response,
        relevantChunks: relevantChunks.length,
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    
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
    }

    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send chat messages.' },
    { status: 405 }
  );
}
