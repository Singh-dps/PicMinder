import { BrainCircuit } from 'lucide-react';

export function JarvisHeader() {
  return (
    <header className="flex items-center justify-center p-4 border-b border-border/50">
      <div className="flex items-center gap-3 text-primary">
        <BrainCircuit size={32} />
        <h1 className="text-3xl font-bold tracking-tight">Jarvis</h1>
      </div>
    </header>
  );
}
