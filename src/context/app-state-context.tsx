'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

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
