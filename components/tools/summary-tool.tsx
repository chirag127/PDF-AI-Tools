'use client';

import React, { useState } from 'react';
import { FileText, Loader2, Copy, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/state';
import { API_ENDPOINTS, UI_CONSTANTS } from '@/lib/constants';
import { getFromLocalStorage } from '@/lib/utils';
import { STORAGE_KEYS } from '@/lib/constants';

export function SummaryTool() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  
  const { currentPdf, settings } = useAppStore();

  const generateSummary = async () => {
    if (!currentPdf) return;

    const apiKey = getFromLocalStorage(STORAGE_KEYS.GEMINI_API_KEY);
    if (!apiKey) {
      setError(UI_CONSTANTS.ERROR_MESSAGES.NO_API_KEY);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.GEMINI.SUMMARIZE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentPdf.text,
          apiKey,
          model: settings.selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);

    } catch (error) {
      console.error('Summary generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (summary) {
      try {
        await navigator.clipboard.writeText(summary);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const downloadSummary = () => {
    if (summary && currentPdf) {
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentPdf.name.replace('.pdf', '')}_summary.txt`;
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
            <FileText className="h-5 w-5" />
            <span>AI PDF Summarizer</span>
          </CardTitle>
          <CardDescription>
            Generate a comprehensive summary of your PDF content using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!summary && !isGenerating && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Ready to Summarize</h3>
              <p className="text-muted-foreground mb-6">
                Click the button below to generate an AI-powered summary of your PDF content.
              </p>
              <Button onClick={generateSummary} size="lg">
                Generate Summary
              </Button>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-lg font-semibold mb-2">Generating Summary</h3>
              <p className="text-muted-foreground">
                AI is analyzing your PDF content and creating a comprehensive summary...
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

          {summary && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Summary</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadSummary}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSummary}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-foreground">
                    {summary}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
