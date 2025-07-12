'use client';

import React, { useState } from 'react';
import { HelpCircle, Loader2, Copy, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/state';
import { API_ENDPOINTS, UI_CONSTANTS } from '@/lib/constants';
import { getFromLocalStorage } from '@/lib/utils';
import { STORAGE_KEYS } from '@/lib/constants';

export function QuestionsTool() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  
  const { currentPdf, settings } = useAppStore();

  const generateQuestions = async () => {
    if (!currentPdf) return;

    const apiKey = getFromLocalStorage(STORAGE_KEYS.GEMINI_API_KEY);
    if (!apiKey) {
      setError(UI_CONSTANTS.ERROR_MESSAGES.NO_API_KEY);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.GEMINI.GENERATE_QUESTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentPdf.text,
          questionCount,
          apiKey,
          model: settings.selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);

    } catch (error) {
      console.error('Question generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (questions) {
      const questionsText = questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
      try {
        await navigator.clipboard.writeText(questionsText);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const downloadQuestions = () => {
    if (questions && currentPdf) {
      const questionsText = questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
      const blob = new Blob([questionsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentPdf.name.replace('.pdf', '')}_questions.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>AI Question Generator</span>
          </CardTitle>
          <CardDescription>
            Generate study questions based on your PDF content using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!questions && !isGenerating && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  {[5, 10, 15, 20].map((count) => (
                    <option key={count} value={count}>
                      {count} questions
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Generate Questions</h3>
                <p className="text-muted-foreground mb-6">
                  Click the button below to generate {questionCount} study questions based on your PDF content.
                </p>
                <Button onClick={generateQuestions} size="lg">
                  Generate Questions
                </Button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-lg font-semibold mb-2">Generating Questions</h3>
              <p className="text-muted-foreground">
                AI is analyzing your PDF content and creating {questionCount} thoughtful questions...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-destructive mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setError(null)}
              >
                Try Again
              </Button>
            </div>
          )}

          {questions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Generated Questions ({questions.length})
                </h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQuestions}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateQuestions}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-foreground">{question}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
