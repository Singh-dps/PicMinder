
'use client';

import { ScannedItem, useAppState } from '@/context/app-state-context';
import Image from 'next/image';
import { Card, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ResultsDisplay } from './results-display';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface HistoryViewProps {
  scannedItems: ScannedItem[];
}

export function HistoryView({ scannedItems }: HistoryViewProps) {
  const { removeScannedItem, removeTicketItem, removeBillItem, removeDocumentItem } = useAppState();
  const isMobile = useIsMobile();
  const [isSheetOpen, setSheetOpen] = useState(false);

  if (scannedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground">
        <p className="text-lg">No items to display.</p>
        <p>Go back to the main page to upload a photo.</p>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent, item: ScannedItem) => {
    e.stopPropagation();
    // Remove from all lists
    removeScannedItem(item.id);
    if(item.categorizationResult?.category === 'Tickets') {
      removeTicketItem(item.id);
    }
    if(item.categorizationResult?.category === 'bills') {
      removeBillItem(item.id);
    }
    if(item.categorizationResult?.category === 'documents') {
      removeDocumentItem(item.id);
    }
  };

  const formatScanTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const renderContent = (item: ScannedItem) => (
    <div className="max-h-[80vh] overflow-y-auto mt-4 pr-2">
      <ResultsDisplay scannedItem={item} />
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {scannedItems.map((item) => (
         isMobile ? (
            <Sheet key={item.id} open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative group flex flex-col">
                  {renderCardContent(item, handleDelete)}
                </Card>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh]">
                <SheetHeader>
                  <SheetTitle>Scan Results</SheetTitle>
                </SheetHeader>
                {renderContent(item)}
              </SheetContent>
            </Sheet>
          ) : (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative group flex flex-col">
                  {renderCardContent(item, handleDelete)}
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Scan Results</DialogTitle>
                </DialogHeader>
                {renderContent(item)}
              </DialogContent>
            </Dialog>
          )
      ))}
    </div>
  );
}

const renderCardContent = (item: ScannedItem, handleDelete: (e: React.MouseEvent, item: ScannedItem) => void) => (
  <>
    <Button
      variant="destructive"
      size="icon"
      className="absolute top-2 right-2 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={(e) => handleDelete(e, item)}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
    <div className="relative w-full aspect-square">
      <Image
        src={item.photoDataUri}
        alt="Scanned photo"
        fill
        className="object-cover"
      />
    </div>
    <CardFooter className="p-2 justify-center">
        <p className="text-xs text-muted-foreground">{new Date(item.id).toLocaleString()}</p>
    </CardFooter>
  </>
);
