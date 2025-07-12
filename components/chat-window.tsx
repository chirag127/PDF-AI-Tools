'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/state';
import { API_ENDPOINTS, UI_CONSTANTS } from '@/lib/constants';
import { getFromLocalStorage } from '@/lib/utils';
import { STORAGE_KEYS } from '@/lib/constants';

export function ChatWindow() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    currentPdf,
    chatMessages,
    isGeneratingResponse,
    chatError,
    addChatMessage,
    setGeneratingResponse,
    setChatError,
    settings,
  } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isGeneratingResponse]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentPdf || isGeneratingResponse) return;

    const apiKey = getFromLocalStorage(STORAGE_KEYS.GEMINI_API_KEY);
    if (!apiKey) {
      setChatError(UI_CONSTANTS.ERROR_MESSAGES.NO_API_KEY);
      return;
    }

    const userMessage = message.trim();
    setMessage('');
    
    // Add user message
    addChatMessage({
      role: 'user',
      content: userMessage,
    });

    setGeneratingResponse(true);
    setChatError(null);

    try {
      const response = await fetch(API_ENDPOINTS.GEMINI.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          chunks: currentPdf.chunks,
          apiKey,
          model: settings.selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      // Add assistant message
      addChatMessage({
        role: 'assistant',
        content: data.response,
      });

    } catch (error) {
      console.error('Chat error:', error);
      setChatError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setGeneratingResponse(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentPdf) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Bot className="h-12 w-12 mx-auto mb-4" />
          <p>Upload a PDF to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>Chat with PDF</span>
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-8 w-8 mx-auto mb-4" />
            <p className="mb-2">Start a conversation with your PDF!</p>
            <p className="text-sm">Ask questions about the content and I'll help you find answers.</p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className="flex items-start space-x-2">
                {msg.role === 'assistant' && (
                  <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                {msg.role === 'user' && (
                  <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isGeneratingResponse && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {chatError && (
          <div className="flex justify-center">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center space-x-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{chatError}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your PDF..."
            disabled={isGeneratingResponse}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isGeneratingResponse}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
