'use client';

import React, { useState } from 'react';
import { FileText, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/state';
import { formatFileSize, truncateText } from '@/lib/utils';

export function PdfViewer() {
  const { currentPdf } = useAppStore();
  const [textZoom, setTextZoom] = useState(100);

  if (!currentPdf) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <p>No PDF loaded</p>
        </div>
      </div>
    );
  }

  const handleZoomIn = () => {
    setTextZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setTextZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setTextZoom(100);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-primary p-2">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {truncateText(currentPdf.name, 30)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(currentPdf.size)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={textZoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs px-2 py-1 bg-muted rounded">
              {textZoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={textZoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div 
          className="prose prose-sm max-w-none"
          style={{ fontSize: `${textZoom}%` }}
        >
          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
            {currentPdf.text}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {currentPdf.text.length.toLocaleString()} characters
          </span>
          <span>
            Uploaded {currentPdf.uploadedAt.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
