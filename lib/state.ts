import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS, GEMINI_MODELS } from './constants';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ProcessedPDF {
  name: string;
  size: number;
  text: string;
  chunks: string[];
  uploadedAt: Date;
}

export interface AppSettings {
  apiKey: string;
  selectedModel: string;
}

// Main App State
interface AppState {
  // PDF State
  currentPdf: ProcessedPDF | null;
  isProcessingPdf: boolean;
  pdfError: string | null;
  
  // Chat State
  chatMessages: ChatMessage[];
  isGeneratingResponse: boolean;
  chatError: string | null;
  
  // AI Tools State
  currentTool: 'chat' | 'summarize' | 'translate' | 'questions' | null;
  toolResults: {
    summary: string | null;
    translation: string | null;
    questions: string[] | null;
  };
  isProcessingTool: boolean;
  toolError: string | null;
  
  // Settings State (persisted)
  settings: AppSettings;
  
  // Actions
  setPdf: (pdf: ProcessedPDF) => void;
  clearPdf: () => void;
  setProcessingPdf: (isProcessing: boolean) => void;
  setPdfError: (error: string | null) => void;
  
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;
  setGeneratingResponse: (isGenerating: boolean) => void;
  setChatError: (error: string | null) => void;
  
  setCurrentTool: (tool: AppState['currentTool']) => void;
  setToolResult: (tool: keyof AppState['toolResults'], result: any) => void;
  clearToolResults: () => void;
  setProcessingTool: (isProcessing: boolean) => void;
  setToolError: (error: string | null) => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
}

// Create the store with persistence for settings
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPdf: null,
      isProcessingPdf: false,
      pdfError: null,
      
      chatMessages: [],
      isGeneratingResponse: false,
      chatError: null,
      
      currentTool: null,
      toolResults: {
        summary: null,
        translation: null,
        questions: null,
      },
      isProcessingTool: false,
      toolError: null,
      
      settings: {
        apiKey: '',
        selectedModel: GEMINI_MODELS[0].id,
      },
      
      // PDF Actions
      setPdf: (pdf) => set({ currentPdf: pdf, pdfError: null }),
      clearPdf: () => set({ 
        currentPdf: null, 
        chatMessages: [], 
        toolResults: { summary: null, translation: null, questions: null },
        currentTool: null,
        pdfError: null,
        chatError: null,
        toolError: null,
      }),
      setProcessingPdf: (isProcessing) => set({ isProcessingPdf: isProcessing }),
      setPdfError: (error) => set({ pdfError: error, isProcessingPdf: false }),
      
      // Chat Actions
      addChatMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, newMessage],
          chatError: null,
        }));
      },
      clearChatMessages: () => set({ chatMessages: [], chatError: null }),
      setGeneratingResponse: (isGenerating) => set({ isGeneratingResponse: isGenerating }),
      setChatError: (error) => set({ chatError: error, isGeneratingResponse: false }),
      
      // Tool Actions
      setCurrentTool: (tool) => set({ currentTool: tool, toolError: null }),
      setToolResult: (tool, result) => set((state) => ({
        toolResults: { ...state.toolResults, [tool]: result },
        toolError: null,
      })),
      clearToolResults: () => set({
        toolResults: { summary: null, translation: null, questions: null },
        toolError: null,
      }),
      setProcessingTool: (isProcessing) => set({ isProcessingTool: isProcessing }),
      setToolError: (error) => set({ toolError: error, isProcessingTool: false }),
      
      // Settings Actions
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
    }),
    {
      name: 'pdf-ai-tools-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

// Selectors for easier state access
export const useSettings = () => useAppStore((state) => state.settings);
export const usePdf = () => useAppStore((state) => ({
  currentPdf: state.currentPdf,
  isProcessingPdf: state.isProcessingPdf,
  pdfError: state.pdfError,
}));
export const useChat = () => useAppStore((state) => ({
  messages: state.chatMessages,
  isGenerating: state.isGeneratingResponse,
  error: state.chatError,
}));
export const useTools = () => useAppStore((state) => ({
  currentTool: state.currentTool,
  results: state.toolResults,
  isProcessing: state.isProcessingTool,
  error: state.toolError,
}));
