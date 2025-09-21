
'use client';

import { useState } from 'react';
import type { ExtractInformationFromPhotoOutput } from '@/ai/flows/extract-information-from-photo';
import type { CategorizePhotosAndSuggestActionsOutput } from '@/ai/flows/categorize-photos-and-suggest-actions';
import type { ExtractEventDetailsOutput } from '@/ai/flows/extract-event-details';
import { extractInformationFromPhoto } from '@/ai/flows/extract-information-from-photo';
import { categorizePhotosAndSuggestActions } from '@/ai/flows/categorize-photos-and-suggest-actions';
import { extractEventDetails } from '@/ai/flows/extract-event-details';
import { summarizeEventDetails } from '@/ai/flows/summarize-event-details';
import { useToast } from '@/hooks/use-toast';
import { JarvisHeader } from '@/components/jarvis/jarvis-header';
import { PhotoUploader } from '@/components/jarvis/photo-uploader';
import { ProcessingView } from '@/components/jarvis/processing-view';
import { ResultsDisplay } from '@/components/jarvis/results-display';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState, ScannedItem } from '@/context/app-state-context';

export default function Home() {
  const { addScannedItem } = useAppState();

  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [activeScannedItem, setActiveScannedItem] = useState<ScannedItem | null>(null);

  const { toast } = useToast();

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      setPhotoDataUri(dataUri);
      setError(null);
      setActiveScannedItem(null);
      setIsProcessing(true);

      try {
        // Run initial analysis in parallel
        const [extraction, categorization] = await Promise.all([
          extractInformationFromPhoto({ photoDataUri: dataUri }),
          categorizePhotosAndSuggestActions({ photoDataUri: dataUri }),
        ]);

        const newItem: ScannedItem = {
          id: new Date().toISOString(),
          photoDataUri: dataUri,
          extractionResult: extraction,
          categorizationResult: categorization,
          eventDetailsResult: null,
          eventSummary: null,
        };

        setActiveScannedItem(newItem);
        addScannedItem(newItem);
        setIsProcessing(false); // Show initial results now

        // If it's a ticket, run event extraction and summarization in the background
        if (categorization.suggestedActions.includes('View Event Details')) {
          const eventDetails = await extractEventDetails({ photoDataUri: dataUri });
          
          if (eventDetails) {
            setActiveScannedItem(prev => prev ? { ...prev, eventDetailsResult: eventDetails } : null);
            
            // Now summarize
            const summaryResult = await summarizeEventDetails({ eventDetails });
            setActiveScannedItem(prev => prev ? { ...prev, eventSummary: summaryResult.summary } : null);
          }
        }

      } catch (err) {
        console.error(err);
        setError('Failed to process the photo. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Processing Error',
          description:
            'An unexpected error occurred while analyzing your photo.',
        });
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };


  const handleReset = () => {
    setPhotoDataUri(null);
    setIsProcessing(false);
    setError(null);
    setActiveScannedItem(null);
  };

  const currentView = () => {
    if (isProcessing) {
      return 'processing';
    }
    if (activeScannedItem) {
      return 'results';
    }
    return 'uploader';
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground antialiased w-full max-w-md mx-auto">
      <JarvisHeader />
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            {currentView() === 'uploader' && (
              <PhotoUploader onPhotoUpload={handlePhotoUpload} isProcessing={isProcessing}/>
            )}
            {currentView() === 'processing' && photoDataUri && (
              <ProcessingView photoDataUri={photoDataUri} />
            )}
            {currentView() === 'results' &&
              activeScannedItem && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start mb-4"
                    onClick={handleReset}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Upload another photo
                  </Button>
                  <ResultsDisplay
                    scannedItem={activeScannedItem}
                  />
                </>
              )}
            {error && !isProcessing && (
              <div className="text-destructive text-center p-4">
                <p>{error}</p>
                <Button onClick={handleReset} className="mt-4">
                  Try Again
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
