'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const GooglePhotosIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.0002 11.3469C13.8452 11.3469 15.3472 9.84488 15.3472 7.99988C15.3472 6.15488 13.8452 4.65288 12.0002 4.65288C10.1552 4.65288 8.6532 6.15488 8.6532 7.99988C8.6532 9.84488 10.1552 11.3469 12.0002 11.3469Z" fill="#4285F4"/>
        <path d="M19.3471 12.653C19.3471 10.808 17.8451 9.306 16.0001 9.306C14.1551 9.306 12.6531 10.808 12.6531 12.653C12.6531 14.498 14.1551 16 16.0001 16C17.8451 16 19.3471 14.498 19.3471 12.653Z" fill="#EA4335"/>
        <path d="M11.3468 12.0001C9.50183 12.0001 8.00083 13.5021 8.00083 15.3471C8.00083 17.1921 9.50183 18.6941 11.3468 18.6941C13.1918 18.6941 14.6938 17.1921 14.6938 15.3471C14.6938 13.5021 13.1918 12.0001 11.3468 12.0001Z" fill="#FBBC04"/>
        <path d="M4.65294 11.3469C6.49794 11.3469 7.99994 9.84488 7.99994 7.99988C7.99994 6.15488 6.49794 4.65288 4.65294 4.65288C2.80794 4.65288 1.30594 6.15488 1.30594 7.99988C1.30594 9.84488 2.80794 11.3469 4.65294 11.3469Z" fill="#34A853"/>
    </svg>
);

export default function MemoriesPage() {
  const { toast } = useToast();

  const handleConnect = () => {
    toast({
        title: 'Feature in progress',
        description: 'Google Photos integration is not yet implemented.',
    });
  };

  return (
    <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
      <motion.div
        key="memories-view"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col"
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Memories</h1>
        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground bg-card p-8 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Connect to Google Photos</h2>
            <p className="mb-6 max-w-sm">
                Securely connect your Google Photos account to import and view your memories directly within PicMinder.
            </p>
            <Button onClick={handleConnect}>
                <GooglePhotosIcon />
                Connect Google Photos
            </Button>
        </div>
      </motion.div>
    </main>
  );
}
