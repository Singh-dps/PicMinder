
'use client';

import {
  BrainCircuit,
  History,
  Ticket,
  Receipt,
  FileText,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/bills', label: 'Bills', icon: Receipt },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/history', label: 'All Scans', icon: History },
];

export function PicMinderSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r border-border/50 flex flex-col">
      <div className="h-20 flex items-center justify-center px-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 text-primary">
          <BrainCircuit size={32} />
          <h1 className="text-2xl font-bold tracking-tight">PicMinder</h1>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
