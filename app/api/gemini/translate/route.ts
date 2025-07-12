import { NextRequest, NextResponse } from 'next/server';
import { translateContent } from '@/lib/gemini';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, targetLanguage, apiKey, model } = body;

    // Validate required fields
    if (!content || !targetLanguage || !apiKey || !model) {
      return NextResponse.json(
        { error: 'Missing required fields: content, targetLanguage, apiKey, model' },
        { status: 400 }
      );
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate target language
    const supportedLanguageCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);
    const supportedLanguageNames = SUPPORTED_LANGUAGES.map(lang => lang.name);
    
    if (!supportedLanguageCodes.includes(targetLanguage) && 
        !supportedLanguageNames.includes(targetLanguage)) {
      return NextResponse.json(
        { 
          error: 'Unsupported target language',
          supportedLanguages: SUPPORTED_LANGUAGES 
        },
        { status: 400 }
      );
    }

    // Find the language name if code was provided
    const languageEntry = SUPPORTED_LANGUAGES.find(
      lang => lang.code === targetLanguage || lang.name === targetLanguage
    );
    const languageName = languageEntry?.name || targetLanguage;

    // Translate content using Gemini API
    const translatedText = await translateContent(apiKey, model, content, languageName);
    
    return NextResponse.json({
      translatedText,
      sourceLanguage: 'auto-detected',
      targetLanguage: languageName,
      originalLength: content.length,
      translatedLength: translatedText.length,
    });

  } catch (error) {
    console.error('Translate API error:', error);
    
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
          { error: 'Content is too long for translation. Please try with a smaller document.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to translate content. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed. Use POST to translate content.',
      supportedLanguages: SUPPORTED_LANGUAGES 
    },
    { status: 405 }
  );
}
