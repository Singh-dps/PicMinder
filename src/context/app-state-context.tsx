
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
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
  createdAt: number;
}

interface AppState {
  scannedItems: ScannedItem[];
  addScannedItem: (item: Omit<ScannedItem, 'id' | 'createdAt'>) => void;
  removeScannedItem: (id: string) => void;
  ticketItems: ScannedItem[];
  addTicketItem: (item: Omit<ScannedItem, 'id' | 'createdAt'>) => void;
  removeTicketItem: (id: string) => void;
  billItems: ScannedItem[];
  addBillItem: (item: Omit<ScannedItem, 'id' | 'createdAt'>) => void;
  removeBillItem: (id: string) => void;
  documentItems: ScannedItem[];
  addDocumentItem: (item: Omit<ScannedItem, 'id' | 'createdAt'>) => void;
  removeDocumentItem: (id: string) => void;
  isLoaded: boolean;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

const mapDocToItem = (doc: QueryDocumentSnapshot<DocumentData>): ScannedItem => {
  const data = doc.data();
  return {
    id: doc.id,
    photoDataUri: data.photoDataUri,
    extractionResult: data.extractionResult,
    categorizationResult: data.categorizationResult,
    eventDetailsResult: data.eventDetailsResult,
    eventSummary: data.eventSummary,
    createdAt: data.createdAt,
  };
};

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [ticketItems, setTicketItems] = useState<ScannedItem[]>([]);
  const [billItems, setBillItems] = useState<ScannedItem[]>([]);
  const [documentItems, setDocumentItems] = useState<ScannedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribes = [
      onSnapshot(collection(db, 'scannedItems'), (snapshot) => {
        const items = snapshot.docs.map(mapDocToItem).sort((a, b) => b.createdAt - a.createdAt);
        setScannedItems(items);
      }),
      onSnapshot(collection(db, 'ticketItems'), (snapshot) => {
        const items = snapshot.docs.map(mapDocToItem).sort((a, b) => b.createdAt - a.createdAt);
        setTicketItems(items);
      }),
      onSnapshot(collection(db, 'billItems'), (snapshot) => {
        const items = snapshot.docs.map(mapDocToItem).sort((a, b) => b.createdAt - a.createdAt);
        setBillItems(items);
      }),
      onSnapshot(collection(db, 'documentItems'), (snapshot) => {
        const items = snapshot.docs.map(mapDocToItem).sort((a, b) => b.createdAt - a.createdAt);
        setDocumentItems(items);
      }),
    ];

    setIsLoaded(true);

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  const createAddItem = (collectionName: string) => async (item: Omit<ScannedItem, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error(`Error adding item to ${collectionName}:`, error);
    }
  };

  const createRemoveItem = (collectionName: string) => async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Error removing item from ${collectionName}:`, error);
    }
  };

  const addScannedItem = createAddItem('scannedItems');
  const addTicketItem = createAddItem('ticketItems');
  const addBillItem = createAddItem('billItems');
  const addDocumentItem = createAddItem('documentItems');
  
  const removeScannedItem = createRemoveItem('scannedItems');
  const removeTicketItem = createRemoveItem('ticketItems');
  const removeBillItem = createRemoveItem('billItems');
  const removeDocumentItem = createRemoveItem('documentItems');

  return (
    <AppStateContext.Provider value={{ 
      isLoaded, 
      scannedItems, addScannedItem, removeScannedItem, 
      ticketItems, addTicketItem, removeTicketItem, 
      billItems, addBillItem, removeBillItem, 
      documentItems, addDocumentItem, removeDocumentItem 
    }}>
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
