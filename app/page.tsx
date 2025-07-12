'use client';

import React from 'react';
import { PdfUploader } from '@/components/pdf-uploader';
import { ToolSelector } from '@/components/tool-selector';
import { ChatWindow } from '@/components/chat-window';
import { PdfViewer } from '@/components/pdf-viewer';
import { useAppStore } from '@/lib/state';

export default function Home() {
  const { currentPdf, currentTool } = useAppStore();

  if (!currentPdf) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to PDF AI Tools
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Upload a PDF and unlock powerful AI-driven analysis tools
            </p>
            <p className="text-sm text-muted-foreground">
              Chat with your documents, generate summaries, translate content, and create questions
            </p>
          </div>

          <PdfUploader />

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-semibold mb-6">Available AI Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Chat with PDF</h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions and get answers from your PDF content using RAG technology
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">AI Summarizer</h3>
                <p className="text-sm text-muted-foreground">
                  Generate concise summaries of your PDF documents
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Translate PDF</h3>
                <p className="text-sm text-muted-foreground">
                  Translate your PDF content to multiple languages
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="font-semibold mb-2">Question Generator</h3>
                <p className="text-sm text-muted-foreground">
                  Create study questions based on your PDF content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentTool === 'chat') {
    return (
      <div className="h-[calc(100vh-4rem)] flex">
        <div className="w-1/2 border-r">
          <PdfViewer />
        </div>
        <div className="w-1/2">
          <ChatWindow />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <ToolSelector />
      </div>
    </div>
  );
}
