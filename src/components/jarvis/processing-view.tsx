import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProcessingViewProps {
  photoDataUri: string;
}

export function ProcessingView({ photoDataUri }: ProcessingViewProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full gap-6 text-center">
      <div className="relative w-full h-64">
        <Image
          src={photoDataUri}
          alt="Processing"
          fill
          className="object-contain rounded-xl"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Analyzing your photo...</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Extracting text, identifying objects, and suggesting actions.
        </p>
      </motion.div>
    </div>
  );
}
