
'use client';

import { useState, useMemo } from 'react';
import { HistoryView } from '@/components/picminder/history-view';
import { useAppState } from '@/context/app-state-context';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function DocumentsPage() {
  const { documentItems } = useAppState();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = useMemo(() => {
    if (!searchQuery) {
      return documentItems;
    }
    return documentItems.filter((item) =>
      item.extractionResult?.extractedText
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [documentItems, searchQuery]);

  return (
    <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
      <motion.div
        key="documents-view"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold self-start">Saved Documents</h1>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
              key={searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col"
          >
            {filteredDocuments.length > 0 ? (
              <HistoryView scannedItems={filteredDocuments} />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground">
                {documentItems.length > 0 ? (
                   <>
                      <p className="text-lg">No documents found.</p>
                      <p>Try a different search term.</p>
                  </>
                ) : (
                  <>
                      <p className="text-lg">No saved documents yet.</p>
                      <p>Upload a photo of a document to save it here.</p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
