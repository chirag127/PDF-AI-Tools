'use client';

import React, { useState } from 'react';
import { Languages, Loader2, Copy, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/state';
import { API_ENDPOINTS, UI_CONSTANTS, SUPPORTED_LANGUAGES } from '@/lib/constants';
import { getFromLocalStorage } from '@/lib/utils';
import { STORAGE_KEYS } from '@/lib/constants';

export function TranslateTool() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[1].code); // Spanish as default
  
  const { currentPdf, settings } = useAppStore();

  const translateContent = async () => {
    if (!currentPdf) return;

    const apiKey = getFromLocalStorage(STORAGE_KEYS.GEMINI_API_KEY);
    if (!apiKey) {
      setError(UI_CONSTANTS.ERROR_MESSAGES.NO_API_KEY);
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.GEMINI.TRANSLATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentPdf.text,
          targetLanguage: selectedLanguage,
          apiKey,
          model: settings.selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to translate content');
      }

      const data = await response.json();
      setTranslation(data.translatedText);

    } catch (error) {
      console.error('Translation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async () => {
    if (translation) {
      try {
        await navigator.clipboard.writeText(translation);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const downloadTranslation = () => {
    if (translation && currentPdf) {
      const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);
      const blob = new Blob([translation], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentPdf.name.replace('.pdf', '')}_${selectedLang?.name || selectedLanguage}.txt`;
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
            <Languages className="h-5 w-5" />
            <span>Translate PDF</span>
          </CardTitle>
          <CardDescription>
            Translate your PDF content to different languages using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!translation && !isTranslating && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Target Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  {SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en').map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center py-8">
                <Languages className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Translate</h3>
                <p className="text-muted-foreground mb-6">
                  Click the button below to translate your PDF content to {
                    SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name
                  }.
                </p>
                <Button onClick={translateContent} size="lg">
                  Translate Content
                </Button>
              </div>
            </div>
          )}

          {isTranslating && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-lg font-semibold mb-2">Translating Content</h3>
              <p className="text-muted-foreground">
                AI is translating your PDF content to {
                  SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name
                }...
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

          {translation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Translation ({SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name})
                </h3>
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
                    onClick={downloadTranslation}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={translateContent}
                  >
                    Retranslate
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-auto">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-foreground">
                    {translation}
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
