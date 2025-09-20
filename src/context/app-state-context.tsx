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
}

interface AppState {
  scannedItems: ScannedItem[];
  addScannedItem: (item: ScannedItem) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'jarvisScannedItems';

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        setScannedItems(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scannedItems));
      } catch (error) {
        console.warn('Error writing to localStorage:', error);
      }
    }
  }, [scannedItems, isLoaded]);

  const addScannedItem = (item: ScannedItem) => {
    setScannedItems((prevItems) => [item, ...prevItems]);
  };

  return (
    <AppStateContext.Provider value={{ scannedItems, addScannedItem }}>
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
