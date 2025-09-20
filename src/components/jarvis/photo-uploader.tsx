'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { UploadCloud, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface PhotoUploaderProps {
  onPhotoUpload: (file: File) => void;
}

export function PhotoUploader({ onPhotoUpload }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadClick = () => {
    if (file) {
      onPhotoUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full gap-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300
        ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }
        ${preview ? 'p-2' : 'p-10'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-muted-foreground pointer-events-none">
            <UploadCloud size={48} className="text-primary" />
            <p className="text-lg font-semibold">
              {isDragActive
                ? 'Drop the photo here...'
                : 'Drag & drop a photo here'}
            </p>
            <p className="text-sm">or click to select a file</p>
          </div>
        )}
      </div>
      {file && !preview && (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
          <FileImage size={20} />
          <span className="text-sm">{file.name}</span>
        </div>
      )}
      <Button
        onClick={handleUploadClick}
        disabled={!file}
        size="lg"
        className="w-full"
      >
        Analyze Photo
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Securely upload and process your photos with AI. We respect your
        privacy.
      </p>
    </div>
  );
}
