
'use client';

import { JarvisHeader } from '@/components/jarvis/jarvis-header';
import { HistoryView } from '@/components/jarvis/history-view';
import { useAppState } from '@/context/app-state-context';
import { AnimatePresence, motion } from 'framer-motion';

export default function BillsPage() {
  const { billItems } = useAppState();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground antialiased w-full max-w-4xl mx-auto">
      <JarvisHeader />
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key="bills-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-4">Saved Bills</h2>
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
    </div>
  );
}
