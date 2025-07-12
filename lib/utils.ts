import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TEXT_PROCESSING, FILE_CONSTRAINTS } from './constants';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates if a file is a valid PDF
 */
export function validatePdfFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'File must be a PDF' };
  }

  if (file.size > FILE_CONSTRAINTS.MAX_SIZE_BYTES) {
    return { 
      isValid: false, 
      error: `File size must be less than ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB` 
    };
  }

  return { isValid: true };
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Chunks text into smaller pieces for RAG processing
 */
export function chunkText(text: string): string[] {
  const { CHUNK_SIZE, CHUNK_OVERLAP } = TEXT_PROCESSING;
  const chunks: string[] = [];
  
  if (text.length <= CHUNK_SIZE) {
    return [text];
  }

  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let chunk = text.slice(start, end);
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastSentenceEnd = Math.max(
        chunk.lastIndexOf('.'),
        chunk.lastIndexOf('!'),
        chunk.lastIndexOf('?')
      );
      
      if (lastSentenceEnd > CHUNK_SIZE * 0.7) {
        chunk = chunk.slice(0, lastSentenceEnd + 1);
      }
    }
    
    chunks.push(chunk.trim());
    start = start + CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks.filter(chunk => chunk.length > 0);
}

/**
 * Finds the most relevant text chunks for a query using simple keyword matching
 */
export function findRelevantChunks(query: string, chunks: string[]): string[] {
  const queryWords = query.toLowerCase().split(/\s+/);
  const { MAX_CONTEXT_CHUNKS } = TEXT_PROCESSING;
  
  const scoredChunks = chunks.map(chunk => {
    const chunkLower = chunk.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      const matches = (chunkLower.match(new RegExp(word, 'g')) || []).length;
      return acc + matches;
    }, 0);
    
    return { chunk, score };
  });

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CONTEXT_CHUNKS)
    .map(item => item.chunk);
}

/**
 * Safely gets an item from localStorage
 */
export function getFromLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Safely sets an item in localStorage
 */
export function setToLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
}

/**
 * Debounce function to limit API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generates a unique ID for components
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
