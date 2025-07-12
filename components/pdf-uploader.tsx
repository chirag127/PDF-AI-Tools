'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/lib/state';
import { validatePdfFile, formatFileSize } from '@/lib/utils';
import { API_ENDPOINTS, UI_CONSTANTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PdfUploaderProps {
  onUploadComplete?: () => void;
}

export function PdfUploader({ onUploadComplete }: PdfUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const { 
    setPdf, 
    setProcessingPdf, 
    setPdfError, 
    isProcessingPdf, 
    pdfError,
    clearPdf 
  } = useAppStore();

  const processPdf = async (file: File) => {
    setProcessingPdf(true);
    setPdfError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_ENDPOINTS.PROCESS_PDF, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const data = await response.json();
      
      setPdf({
        name: file.name,
        size: file.size,
        text: data.text,
        chunks: data.chunks || [],
        uploadedAt: new Date(),
      });

      onUploadComplete?.();
    } catch (error) {
      console.error('Error processing PDF:', error);
      setPdfError(error instanceof Error ? error.message : 'Failed to process PDF');
    } finally {
      setProcessingPdf(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      setPdfError(validation.error || 'Invalid file');
      return;
    }

    await processPdf(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled: isProcessingPdf,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validatePdfFile(file);
      if (!validation.isValid) {
        setPdfError(validation.error || 'Invalid file');
        return;
      }
      processPdf(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={cn(
              'flex flex-col items-center justify-center space-y-4 cursor-pointer transition-colors',
              (isDragActive || dropzoneActive) && 'bg-muted/50',
              isProcessingPdf && 'cursor-not-allowed opacity-50'
            )}
          >
            <input {...getInputProps()} />
            
            {isProcessingPdf ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <div className="text-center">
                  <p className="text-lg font-medium">Processing PDF...</p>
                  <p className="text-sm text-muted-foreground">
                    Extracting text content and preparing for AI analysis
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Upload your PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 25MB
                  </p>
                </div>

                <Button variant="outline" disabled={isProcessingPdf}>
                  <FileText className="mr-2 h-4 w-4" />
                  Choose PDF File
                </Button>
              </>
            )}
          </div>

          {pdfError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center space-x-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-destructive mt-1">{pdfError}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setPdfError(null)}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Alternative file input for browsers that don't support drag and drop */}
          <div className="mt-4 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-file-input"
              disabled={isProcessingPdf}
            />
            <label
              htmlFor="pdf-file-input"
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer underline"
            >
              Or click here to select a file
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
