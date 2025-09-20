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
import { useAppState } from '@/context/app-state-context';

export default function Home() {
  const { addScannedItem, addTicketItem } = useAppState();

  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] =
    useState<ExtractInformationFromPhotoOutput | null>(null);
  const [categorizationResult, setCategorizationResult] =
    useState<CategorizePhotosAndSuggestActionsOutput | null>(null);
  const [eventDetailsResult, setEventDetailsResult] =
    useState<ExtractEventDetailsOutput | null>(null);
  const [eventSummary, setEventSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      setPhotoDataUri(dataUri);
      setError(null);
      setExtractionResult(null);
      setCategorizationResult(null);
      setEventDetailsResult(null);
      setEventSummary(null);
      setIsProcessing(true);

      try {
        const [extraction, categorization] = await Promise.all([
          extractInformationFromPhoto({ photoDataUri: dataUri }),
          categorizePhotosAndSuggestActions({ photoDataUri: dataUri }),
        ]);

        setExtractionResult(extraction);
        setCategorizationResult(categorization);

        let eventDetails: ExtractEventDetailsOutput | null = null;
        let summary: string | null = null;

        if (categorization.suggestedActions.includes('View Event Details')) {
          // Now we run this in parallel with the above
          const eventDetailsPromise = extractEventDetails({ photoDataUri: dataUri });
          
          // Show initial results first
          setIsProcessing(false);

          eventDetails = await eventDetailsPromise;
          setEventDetailsResult(eventDetails);

          if (eventDetails) {
            const summaryResult = await summarizeEventDetails({ eventDetails });
            summary = summaryResult.summary;
            setEventSummary(summary);
          }
        }

        const newItem = {
          id: new Date().toISOString(),
          photoDataUri: dataUri,
          extractionResult: extraction,
          categorizationResult: categorization,
          eventDetailsResult: eventDetails,
          eventSummary: summary,
        };

        addScannedItem(newItem);
        if (categorization.category === 'ticket') {
          addTicketItem(newItem);
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
      } finally {
        // This might be set to false earlier now
        if (isProcessing) {
          setIsProcessing(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };


  const handleReset = () => {
    setPhotoDataUri(null);
    setExtractionResult(null);
    setCategorizationResult(null);
    setEventDetailsResult(null);
    setEventSummary(null);
    setIsProcessing(false);
    setError(null);
  };

  const currentView = () => {
    if (isProcessing) {
      return 'processing';
    }
    if (photoDataUri && (extractionResult || categorizationResult || error)) {
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
              <PhotoUploader onPhotoUpload={handlePhotoUpload} />
            )}
            {currentView() === 'processing' && photoDataUri && (
              <ProcessingView photoDataUri={photoDataUri} />
            )}
            {currentView() === 'results' &&
              photoDataUri &&
              (extractionResult || categorizationResult) && (
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
                    photoDataUri={photoDataUri}
                    extractionResult={extractionResult}
                    categorizationResult={categorizationResult}
                    eventDetailsResult={eventDetailsResult}
                    eventSummary={eventSummary}
                  />
                </>
              )}
            {error && (
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
