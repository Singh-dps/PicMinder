
'use client';

import { HistoryView } from '@/components/picminder/history-view';
import { useAppState } from '@/context/app-state-context';
import { AnimatePresence, motion } from 'framer-motion';

export default function BillsPage() {
  const { billItems } = useAppState();

  return (
    <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key="bills-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Saved Bills</h1>
          {billItems.length > 0 ? (
              <HistoryView scannedItems={billItems} />
          ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground">
                  <p className="text-lg">No saved bills yet.</p>
                  <p>Upload a photo of a bill to save it here.</p>
              </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
