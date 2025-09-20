'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { ExtractInformationFromPhotoOutput } from '@/ai/flows/extract-information-from-photo';
import type { CategorizePhotosAndSuggestActionsOutput } from '@/ai/flows/categorize-photos-and-suggest-actions';
import type { ExtractEventDetailsOutput } from '@/ai/flows/extract-event-details';

export interface ScannedItem {
  id: string;
  photoDataUri: string;
  extractionResult: ExtractInformationFromPhotoOutput | null;
  categorizationResult: CategorizePhotosAndSuggestActionsOutput | null;
  eventDetailsResult: ExtractEventDetailsOutput | null;
  eventSummary: string | null;
}

interface AppState {
  scannedItems: ScannedItem[];
  addScannedItem: (item: ScannedItem) => void;
  removeScannedItem: (id: string) => void;
  ticketItems: ScannedItem[];
  removeTicketItem: (id: string) => void;
  addTicketItem: (item: ScannedItem) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

const LOCAL_STORAGE_KEY_SCANS = 'jarvisScannedItems';
const LOCAL_STORAGE_KEY_TICKETS = 'jarvisTicketItems';


export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [ticketItems, setTicketItems] = useState<ScannedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const scans = window.localStorage.getItem(LOCAL_STORAGE_KEY_SCANS);
      if (scans) {
        setScannedItems(JSON.parse(scans));
      }
      const tickets = window.localStorage.getItem(LOCAL_STORAGE_KEY_TICKETS);
      if (tickets) {
        setTicketItems(JSON.parse(tickets));
      }
    } catch (error) {
      console.warn('Error reading localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY_SCANS, JSON.stringify(scannedItems));
        window.localStorage.setItem(LOCAL_STORAGE_KEY_TICKETS, JSON.stringify(ticketItems));
      } catch (error) {
        console.warn('Error writing to localStorage:', error);
      }
    }
  }, [scannedItems, ticketItems, isLoaded]);

  const addScannedItem = (item: ScannedItem) => {
    setScannedItems((prevItems) => {
      const isDuplicate = prevItems.some(
        (prevItem) => prevItem.photoDataUri === item.photoDataUri
      );

      if (isDuplicate) {
        return prevItems;
      }
      return [item, ...prevItems];
    });
  };

  const addTicketItem = (item: ScannedItem) => {
    setTicketItems((prevItems) => {
      const isDuplicate = prevItems.some(
        (prevItem) => prevItem.photoDataUri === item.photoDataUri
      );
      if (isDuplicate) {
        return prevItems;
      }
      return [item, ...prevItems];
    });
  }

  const removeScannedItem = (id: string) => {
    setScannedItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const removeTicketItem = (id: string) => {
    setTicketItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };
  

  return (
    <AppStateContext.Provider value={{ scannedItems, addScannedItem, removeScannedItem, ticketItems, addTicketItem, removeTicketItem }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppState => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
