'use client';

import React from 'react';
import { MessageSquare, FileText, Languages, HelpCircle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/state';
import { formatFileSize } from '@/lib/utils';
import { SummaryTool } from '@/components/tools/summary-tool';
import { TranslateTool } from '@/components/tools/translate-tool';
import { QuestionsTool } from '@/components/tools/questions-tool';

export function ToolSelector() {
  const { currentPdf, currentTool, setCurrentTool, clearPdf } = useAppStore();

  if (!currentPdf) return null;

  const tools = [
    {
      id: 'chat' as const,
      name: 'Chat with PDF',
      description: 'Ask questions and get answers from your PDF content using RAG technology',
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      id: 'summarize' as const,
      name: 'AI Summarizer',
      description: 'Generate concise summaries of your PDF documents',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      id: 'translate' as const,
      name: 'Translate PDF',
      description: 'Translate your PDF content to multiple languages',
      icon: Languages,
      color: 'bg-purple-500',
    },
    {
      id: 'questions' as const,
      name: 'Question Generator',
      description: 'Create study questions based on your PDF content',
      icon: HelpCircle,
      color: 'bg-orange-500',
    },
  ];

  const renderToolContent = () => {
    switch (currentTool) {
      case 'summarize':
        return <SummaryTool />;
      case 'translate':
        return <TranslateTool />;
      case 'questions':
        return <QuestionsTool />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* PDF Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-primary p-2">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentPdf.name}</CardTitle>
                <CardDescription>
                  {formatFileSize(currentPdf.size)} • Uploaded {currentPdf.uploadedAt.toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentTool(null)}
                disabled={!currentTool}
              >
                Back to Tools
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearPdf}
              >
                <X className="h-4 w-4 mr-1" />
                Remove PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tool Selection or Tool Content */}
      {!currentTool ? (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Choose an AI Tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                  onClick={() => setCurrentTool(tool.id)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-lg p-3 ${tool.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          {renderToolContent()}
        </div>
      )}
    </div>
  );
}
