
'use client';

import React, { useRef, ChangeEvent }
from 'react';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface PhotoUploaderProps {
  onPhotoUpload: (file: File) => void;
  isProcessing: boolean;
}

const GooglePhotosIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.0002 11.3469C13.8452 11.3469 15.3472 9.84488 15.3472 7.99988C15.3472 6.15488 13.8452 4.65288 12.0002 4.65288C10.1552 4.65288 8.6532 6.15488 8.6532 7.99988C8.6532 9.84488 10.1552 11.3469 12.0002 11.3469Z" fill="#4285F4"/>
        <path d="M19.3471 12.653C19.3471 10.808 17.8451 9.306 16.0001 9.306C14.1551 9.306 12.6531 10.808 12.6531 12.653C12.6531 14.498 14.1551 16 16.0001 16C17.8451 16 19.3471 14.498 19.3471 12.653Z" fill="#EA4335"/>
        <path d="M11.3468 12.0001C9.50183 12.0001 8.00083 13.5021 8.00083 15.3471C8.00083 17.1921 9.50183 18.6941 11.3468 18.6941C13.1918 18.6941 14.6938 17.1921 14.6938 15.3471C14.6938 13.5021 13.1918 12.0001 11.3468 12.0001Z" fill="#FBBC04"/>
        <path d="M4.65294 11.3469C6.49794 11.3469 7.99994 9.84488 7.99994 7.99988C7.99994 6.15488 6.49794 4.65288 4.65294 4.65288C2.80794 4.65288 1.30594 6.15488 1.30594 7.99988C1.30594 9.84488 2.80794 11.3469 4.65294 11.3469Z" fill="#34A853"/>
    </svg>
);


export const PhotoUploader = React.forwardRef<HTMLInputElement, PhotoUploaderProps>(({ onPhotoUpload, isProcessing }, ref) => {
    const { toast } = useToast();
    const internalRef = useRef<HTMLInputElement>(null);

    // Allow parent component to pass a ref, but also use an internal one
    React.useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

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
  
  const handleGooglePhotosImport = () => {
    toast({
      title: 'Feature in progress',
      description: 'Google Photos integration is not yet implemented.',
    });
  };


  return (
    <>
      <input
        ref={internalRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isProcessing}
      />
        <div className="flex flex-col items-center justify-center flex-1 w-full gap-6">
          <div
            onClick={() => internalRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDrop={handleDrop}
            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300
            border-border hover:border-primary/50 hover:bg-muted/50 p-10
            `}
          >
              <div className="flex flex-col items-center gap-4 text-muted-foreground pointer-events-none">
                <UploadCloud size={48} className="text-primary" />
                <p className="text-lg font-semibold">
                  Drag & drop a photo here
                </p>
                <p className="text-sm">or click to select a file</p>
              </div>
          </div>

          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 border-t border-border/50"></div>
            <p className="text-sm text-muted-foreground">OR</p>
            <div className="flex-1 border-t border-border/50"></div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleGooglePhotosImport}>
            <GooglePhotosIcon />
            Import from Google Photos
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Securely upload and process your photos with AI. We respect your
            privacy.
          </p>
        </div>
    </>
  );
});
PhotoUploader.displayName = 'PhotoUploader';
