'use client';

import { ScannedItem } from '@/context/app-state-context';
import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ResultsDisplay } from './results-display';

interface HistoryViewProps {
  scannedItems: ScannedItem[];
}

export function HistoryView({ scannedItems }: HistoryViewProps) {
  if (scannedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground">
        <p className="text-lg">No scanned photos yet.</p>
        <p>Go back to the main page to upload a photo.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {scannedItems.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative w-full aspect-square">
                <Image
                  src={item.photoDataUri}
                  alt="Scanned photo"
                  fill
                  className="object-cover"
                />
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Results</DialogTitle>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto mt-4 pr-2">
                <ResultsDisplay
                    photoDataUri={item.photoDataUri}
                    extractionResult={item.extractionResult}
                    categorizationResult={item.categorizationResult}
                    eventDetailsResult={item.eventDetailsResult}
                />
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
