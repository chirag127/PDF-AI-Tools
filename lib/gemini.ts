import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Creates a Gemini AI client instance
 */
export function createGeminiClient(apiKey: string) {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generates a chat response using RAG (Retrieval Augmented Generation)
 */
export async function generateChatResponse(
  apiKey: string,
  model: string,
  query: string,
  context: string
): Promise<string> {
  const genAI = createGeminiClient(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const prompt = `You are a helpful AI assistant that answers questions about PDF documents. 
Use the following context from the PDF to answer the user's question. If the answer cannot be found in the context, say so clearly.

Context from PDF:
${context}

User Question: ${query}

Please provide a helpful and accurate answer based on the context provided:`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response from Gemini API');
  }
}

/**
 * Generates a summary of the PDF content
 */
export async function generateSummary(
  apiKey: string,
  model: string,
  content: string
): Promise<string> {
  const genAI = createGeminiClient(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const prompt = `Please provide a comprehensive summary of the following PDF content. 
Focus on the main points, key findings, and important information. 
Make the summary clear, concise, and well-structured:

${content}

Summary:`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary from Gemini API');
  }
}

/**
 * Translates PDF content to a target language
 */
export async function translateContent(
  apiKey: string,
  model: string,
  content: string,
  targetLanguage: string
): Promise<string> {
  const genAI = createGeminiClient(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const prompt = `Please translate the following text to ${targetLanguage}. 
Maintain the original meaning, tone, and structure as much as possible. 
If there are technical terms or proper nouns, keep them in their original form if appropriate:

${content}

Translation:`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error translating content:', error);
    throw new Error('Failed to translate content using Gemini API');
  }
}

/**
 * Generates questions based on PDF content
 */
export async function generateQuestions(
  apiKey: string,
  model: string,
  content: string
): Promise<string[]> {
  const genAI = createGeminiClient(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const prompt = `Based on the following PDF content, generate 10 thoughtful and relevant questions that would help someone understand and engage with the material. 
Include a mix of factual, analytical, and critical thinking questions. 
Format your response as a numbered list:

${content}

Questions:`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the numbered list into an array
    const questions = text
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(question => question.length > 0);
    
    return questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Failed to generate questions from Gemini API');
  }
}

/**
 * Streams a chat response for real-time display
 */
export async function* streamChatResponse(
  apiKey: string,
  model: string,
  query: string,
  context: string
): AsyncGenerator<string, void, unknown> {
  const genAI = createGeminiClient(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  const prompt = `You are a helpful AI assistant that answers questions about PDF documents. 
Use the following context from the PDF to answer the user's question. If the answer cannot be found in the context, say so clearly.

Context from PDF:
${context}

User Question: ${query}

Please provide a helpful and accurate answer based on the context provided:`;

  try {
    const result = await geminiModel.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error('Error streaming chat response:', error);
    throw new Error('Failed to stream response from Gemini API');
  }
}
