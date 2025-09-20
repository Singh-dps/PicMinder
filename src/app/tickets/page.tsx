'use client';

import { JarvisHeader } from '@/components/jarvis/jarvis-header';
import { HistoryView } from '@/components/jarvis/history-view';
import { useAppState, ScannedItem } from '@/context/app-state-context';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type EventStatus = 'Upcoming' | 'Ongoing' | 'Past';

export default function TicketsPage() {
  const { scannedItems } = useAppState();
  const [categorizedTickets, setCategorizedTickets] = useState<{
    [key in EventStatus]: ScannedItem[];
  }>({
    Upcoming: [],
    Ongoing: [],
    Past: [],
  });

  useEffect(() => {
    const ticketItems = scannedItems.filter(
      (item) => item.categorizationResult?.category.toLowerCase() === 'ticket'
    );

    const now = new Date();

    const getEventDate = (item: ScannedItem): [Date | null, Date | null] => {
      const details = item.eventDetailsResult;
      if (!details || !details.date) return [null, null];

      const year = parseInt(details.date.substring(0, 4), 10);
      const month = parseInt(details.date.substring(4, 6), 10) - 1;
      const day = parseInt(details.date.substring(6, 8), 10);

      const getFullDate = (timeStr: string | undefined): Date | null => {
        if (!timeStr) return new Date(year, month, day);
        const hours = parseInt(timeStr.substring(0, 2), 10);
        const minutes = parseInt(timeStr.substring(2, 4), 10);
        const seconds = parseInt(timeStr.substring(4, 6), 10);
        return new Date(year, month, day, hours, minutes, seconds);
      };

      const startDate = getFullDate(details.startTime);
      const endDate = details.endTime ? getFullDate(details.endTime) : null;
      
      return [startDate, endDate];
    };

    const upcoming: ScannedItem[] = [];
    const ongoing: ScannedItem[] = [];
    const past: ScannedItem[] = [];

    ticketItems.forEach((item) => {
      const [startDate, endDate] = getEventDate(item);

      if (!startDate) {
        past.push(item); // If no date, assume it's past
        return;
      }

      if (endDate) {
        if (now < startDate) {
          upcoming.push(item);
        } else if (now > endDate) {
          past.push(item);
        } else {
          ongoing.push(item);
        }
      } else {
        // If no end date, consider it a full-day event or ongoing for the start day
        const endOfDay = new Date(startDate);
        endOfDay.setHours(23, 59, 59, 999);

        if (now < startDate) {
          upcoming.push(item);
        } else if (now > endOfDay) {
          past.push(item);
        } else {
          ongoing.push(item);
        }
      }
    });
    
    setCategorizedTickets({
      Upcoming: upcoming,
      Ongoing: ongoing,
      Past: past,
    });
  }, [scannedItems]);

  const ticketItems = scannedItems.filter(
    (item) => item.categorizationResult?.category.toLowerCase() === 'ticket'
  );


  return (
    <div className="flex flex-col h-screen bg-background text-foreground antialiased w-full max-w-4xl mx-auto">
      <JarvisHeader />
      <main className="flex-1 flex flex-col p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key="tickets-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-4">Saved Tickets</h2>
            {ticketItems.length > 0 ? (
               <Tabs defaultValue="Upcoming" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="Upcoming">Upcoming ({categorizedTickets.Upcoming.length})</TabsTrigger>
                  <TabsTrigger value="Ongoing">Ongoing ({categorizedTickets.Ongoing.length})</TabsTrigger>
                  <TabsTrigger value="Past">Past ({categorizedTickets.Past.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="Upcoming" className="flex-1 mt-4">
                  <HistoryView scannedItems={categorizedTickets.Upcoming} />
                </TabsContent>
                <TabsContent value="Ongoing" className="flex-1 mt-4">
                  <HistoryView scannedItems={categorizedTickets.Ongoing} />
                </TabsContent>
                <TabsContent value="Past" className="flex-1 mt-4">
                  <HistoryView scannedItems={categorizedTickets.Past} />
                </TabsContent>
              </Tabs>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground">
                    <p className="text-lg">No saved tickets yet.</p>
                    <p>Upload a photo of a ticket to save it here.</p>
                </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
