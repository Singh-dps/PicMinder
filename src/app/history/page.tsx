'use client';

import { HistoryView } from '@/components/picminder/history-view';
import { useAppState } from '@/context/app-state-context';
import { AnimatePresence, motion } from 'framer-motion';

export default function HistoryPage() {
  const { scannedItems } = useAppState();

  return (
    <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key="history-view"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Scanned Photos</h1>
          <HistoryView scannedItems={scannedItems} />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
