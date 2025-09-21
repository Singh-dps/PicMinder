
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
  addTicketItem: (item: ScannedItem) => void;
  removeTicketItem: (id: string) => void;
  billItems: ScannedItem[];
  addBillItem: (item: ScannedItem) => void;
  removeBillItem: (id: string) => void;
  documentItems: ScannedItem[];
  addDocumentItem: (item: ScannedItem) => void;
  removeDocumentItem: (id: string) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

const LOCAL_STORAGE_KEY_SCANS = 'jarvisScannedItems';
const LOCAL_STORAGE_KEY_TICKETS = 'jarvisTicketItems';
const LOCAL_STORAGE_KEY_BILLS = 'jarvisBillItems';
const LOCAL_STORAGE_KEY_DOCUMENTS = 'jarvisDocumentItems';


export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [ticketItems, setTicketItems] = useState<ScannedItem[]>([]);
  const [billItems, setBillItems] = useState<ScannedItem[]>([]);
  const [documentItems, setDocumentItems] = useState<ScannedItem[]>([]);
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
      const bills = window.localStorage.getItem(LOCAL_STORAGE_KEY_BILLS);
      if (bills) {
        setBillItems(JSON.parse(bills));
      }
      const documents = window.localStorage.getItem(LOCAL_STORAGE_KEY_DOCUMENTS);
      if (documents) {
        setDocumentItems(JSON.parse(documents));
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
        window.localStorage.setItem(LOCAL_STORAGE_KEY_BILLS, JSON.stringify(billItems));
        window.localStorage.setItem(LOCAL_STORAGE_KEY_DOCUMENTS, JSON.stringify(documentItems));
      } catch (error) {
        console.warn('Error writing to localStorage:', error);
      }
    }
  }, [scannedItems, ticketItems, billItems, documentItems, isLoaded]);

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

  const addBillItem = (item: ScannedItem) => {
    setBillItems((prevItems) => {
      const isDuplicate = prevItems.some(
        (prevItem) => prevItem.photoDataUri === item.photoDataUri
      );
      if (isDuplicate) {
        return prevItems;
      }
      return [item, ...prevItems];
    });
  }

  const addDocumentItem = (item: ScannedItem) => {
    setDocumentItems((prevItems) => {
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

  const removeBillItem = (id: string) => {
    setBillItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const removeDocumentItem = (id: string) => {
    setDocumentItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };
  

  return (
    <AppStateContext.Provider value={{ scannedItems, addScannedItem, removeScannedItem, ticketItems, addTicketItem, removeTicketItem, billItems, addBillItem, removeBillItem, documentItems, addDocumentItem, removeDocumentItem }}>
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
