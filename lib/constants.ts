// API Endpoints Configuration
export const API_ENDPOINTS = {
  PROCESS_PDF: '/api/process-pdf',
  GEMINI: {
    CHAT: '/api/gemini/chat',
    SUMMARIZE: '/api/gemini/summarize',
    TRANSLATE: '/api/gemini/translate',
    GENERATE_QUESTIONS: '/api/gemini/generate-questions',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  GEMINI_API_KEY: 'gemini_api_key',
  SELECTED_MODEL: 'selected_gemini_model',
} as const;

// Available Gemini Models
export const GEMINI_MODELS = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient model for most tasks',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Most capable model for complex reasoning',
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    description: 'Reliable model for general tasks',
  },
] as const;

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  MAX_SIZE_MB: 25,
  ALLOWED_TYPES: ['application/pdf'],
  MAX_SIZE_BYTES: 25 * 1024 * 1024, // 25MB in bytes
} as const;

// Text Processing Constants
export const TEXT_PROCESSING = {
  CHUNK_SIZE: 4000,
  CHUNK_OVERLAP: 200,
  MAX_CONTEXT_CHUNKS: 5,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  LOADING_MESSAGES: [
    'Processing your PDF...',
    'Extracting text content...',
    'Preparing AI analysis...',
    'Almost ready...',
  ],
  ERROR_MESSAGES: {
    NO_API_KEY: 'Please set your Gemini API key in Settings first.',
    INVALID_FILE: 'Please upload a valid PDF file.',
    FILE_TOO_LARGE: `File size must be less than ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB.`,
    PROCESSING_ERROR: 'Error processing your request. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  },
} as const;

// Supported Languages for Translation
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
] as const;
