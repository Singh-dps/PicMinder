
'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PhotoUploader } from '@/components/picminder/photo-uploader';
import { ProcessingView } from '@/components/picminder/processing-view';
import { ResultsDisplay } from '@/components/picminder/results-display';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState, ScannedItem } from '@/context/app-state-context';
import { extractInformationFromPhoto } from '@/ai/flows/extract-information-from-photo';
import { categorizePhotosAndSuggestActions } from '@/ai/flows/categorize-photos-and-suggest-actions';
import { extractEventDetails } from '@/ai/flows/extract-event-details';
import { summarizeEventDetails } from '@/ai/flows/summarize-event-details';

export default function Home() {
  const { addScannedItem } = useAppState();
  const { toast } = useToast();
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentItem, setCurrentItem] = useState<ScannedItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      setPhotoDataUri(dataUri);
      setIsProcessing(true);
      setCurrentItem(null);

      try {
        const [extraction, categorization] = await Promise.all([
          extractInformationFromPhoto({ photoDataUri: dataUri }),
          categorizePhotosAndSuggestActions({ photoDataUri: dataUri }),
        ]);

        const scannedItem: ScannedItem = {
          id: new Date().toISOString(),
          photoDataUri: dataUri,
          extractionResult: extraction,
          categorizationResult: categorization,
          eventDetailsResult: null,
          eventSummary: null,
        };

        if (
          categorization.suggestedActions.includes('View Event Details') ||
          categorization.category === 'Tickets'
        ) {
          const eventDetailsResult = await extractEventDetails({
            photoDataUri: dataUri,
          });
          scannedItem.eventDetailsResult = eventDetailsResult;

          if (eventDetailsResult) {
            const summaryResult = await summarizeEventDetails({
              eventDetails: eventDetailsResult,
            });
            scannedItem.eventSummary = summaryResult.summary;
          }
        }
        
        setCurrentItem(scannedItem);
        addScannedItem(scannedItem);

      } catch (err) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Processing Error',
          description: 'An unexpected error occurred.',
        });
        setPhotoDataUri(null);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setPhotoDataUri(null);
    setIsProcessing(false);
    setCurrentItem(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderContent = () => {
    if (currentItem) {
      return (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Button
            variant="ghost"
            size="sm"
            className="self-start mb-4"
            onClick={handleReset}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Scan Another Photo
          </Button>
          <ResultsDisplay
            scannedItem={currentItem}
          />
        </motion.div>
      );
    }

    if (isProcessing && photoDataUri) {
      return (
        <motion.div
          key="processing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col items-center justify-center w-full"
        >
          <ProcessingView photoDataUri={photoDataUri} />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="uploader"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
        <PhotoUploader
          onPhotoUpload={handlePhotoUpload}
          isProcessing={isProcessing}
          ref={fileInputRef}
        />
      </motion.div>
    );
  };

  return (
    <main className="flex-1 flex flex-col items-center p-4 md:p-6 overflow-y-auto justify-center max-w-md mx-auto w-full">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </main>
  );
}
