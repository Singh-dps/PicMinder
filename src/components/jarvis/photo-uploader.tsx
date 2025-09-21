'use client';

import { useRef, ChangeEvent }
from 'react';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploaderProps {
  onPhotoUpload: (file: File) => void;
  isProcessing: boolean;
}

export function PhotoUploader({ onPhotoUpload, isProcessing }: PhotoUploaderProps) {
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null | undefined) => {
    if (isProcessing) return;
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB size limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }
      onPhotoUpload(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0]);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };


  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full gap-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDrop={handleDrop}
        className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300
        border-border hover:border-primary/50 hover:bg-muted/50 p-10
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
        
          <div className="flex flex-col items-center gap-4 text-muted-foreground pointer-events-none">
            <UploadCloud size={48} className="text-primary" />
            <p className="text-lg font-semibold">
              Drag & drop a photo here
            </p>
            <p className="text-sm">or click to select a file</p>
          </div>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Securely upload and process your photos with AI. We respect your
        privacy.
      </p>
    </div>
  );
}
