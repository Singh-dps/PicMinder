
import { BrainCircuit, History, Ticket, Receipt, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function JarvisHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border/50">
      <Link href="/" className="flex items-center gap-3 text-primary">
        <BrainCircuit size={32} />
        <h1 className="text-3xl font-bold tracking-tight">Jarvis</h1>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/documents" passHref>
            <Button variant="ghost" size="icon">
                <FileText className="h-5 w-5" />
                <span className="sr-only">Documents</span>
            </Button>
        </Link>
        <Link href="/bills" passHref>
            <Button variant="ghost" size="icon">
                <Receipt className="h-5 w-5" />
                <span className="sr-only">Bills</span>
            </Button>
        </Link>
        <Link href="/tickets" passHref>
            <Button variant="ghost" size="icon">
                <Ticket className="h-5 w-5" />
                <span className="sr-only">Tickets</span>
            </Button>
        </Link>
        <Link href="/history" passHref>
          <Button variant="ghost" size="icon">
            <History className="h-5 w-5" />
            <span className="sr-only">History</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
