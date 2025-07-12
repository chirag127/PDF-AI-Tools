'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Key, Brain, Save, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/state';
import { GEMINI_MODELS, STORAGE_KEYS } from '@/lib/constants';
import { getFromLocalStorage, setToLocalStorage } from '@/lib/utils';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);

  const { settings, updateSettings } = useAppStore();

  useEffect(() => {
    // Load settings from localStorage on component mount
    const storedApiKey = getFromLocalStorage(STORAGE_KEYS.GEMINI_API_KEY);
    const storedModel = getFromLocalStorage(STORAGE_KEYS.SELECTED_MODEL);
    
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    if (storedModel) {
      setSelectedModel(storedModel);
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setSaveStatus('idle');

    try {
      // Validate API key format (basic validation)
      if (!apiKey.trim()) {
        throw new Error('API key is required');
      }

      if (!apiKey.startsWith('AI') || apiKey.length < 20) {
        throw new Error('Invalid API key format. Please check your Gemini API key.');
      }

      // Save to localStorage
      const apiKeySaved = setToLocalStorage(STORAGE_KEYS.GEMINI_API_KEY, apiKey.trim());
      const modelSaved = setToLocalStorage(STORAGE_KEYS.SELECTED_MODEL, selectedModel);

      if (!apiKeySaved || !modelSaved) {
        throw new Error('Failed to save settings to browser storage');
      }

      // Update app state
      updateSettings({
        apiKey: apiKey.trim(),
        selectedModel,
      });

      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);

    } catch (error) {
      console.error('Settings save error:', error);
      setSaveStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your Gemini API key and preferences for PDF AI Tools
          </p>
        </div>

        <div className="space-y-6">
          {/* API Key Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Gemini API Key</span>
              </CardTitle>
              <CardDescription>
                Your API key is stored securely in your browser and never sent to our servers.
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center ml-2 text-primary hover:underline"
                >
                  Get your API key <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide' : 'Show'}
                  </Button>
                </div>
                {apiKey && !showApiKey && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {maskApiKey(apiKey)}
                  </p>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Privacy & Security</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your API key is stored only in your browser's local storage</li>
                  <li>• We never send your API key to our servers</li>
                  <li>• API calls are made directly from your browser to Google's servers</li>
                  <li>• You can clear your API key anytime by clearing browser data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Model Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Model Selection</span>
              </CardTitle>
              <CardDescription>
                Choose which Gemini model to use for AI operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Gemini Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  {GEMINI_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Save Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Settings are automatically saved to your browser
                  </p>
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isLoading || !apiKey.trim()}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>

              {/* Status Messages */}
              {saveStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Settings saved successfully!</span>
                  </div>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-center space-x-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Failed to save settings. Please try again.</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Get your free Gemini API key from Google AI Studio</li>
                <li>Enter your API key in the field above</li>
                <li>Select your preferred Gemini model</li>
                <li>Save your settings</li>
                <li>Go back to the main page and upload a PDF to start using AI tools</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
