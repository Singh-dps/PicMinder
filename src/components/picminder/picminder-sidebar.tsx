
'use client';

import { useState } from 'react';
import {
  BrainCircuit,
  History,
  Ticket,
  Receipt,
  FileText,
  Home,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/bills', label: 'Bills', icon: Receipt },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/history', label: 'All Scans', icon: History },
];

export function PicMinderSidebar() {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex-shrink-0 bg-card border-r border-border/50 flex flex-col transition-all duration-300',
          isMinimized ? 'w-20' : 'w-64'
        )}
      >
        <div
          className={cn(
            'h-20 flex items-center border-b border-border/50',
            isMinimized ? 'justify-center' : 'justify-center px-4'
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-3 text-primary"
            onClick={(e) => isMinimized && e.preventDefault()}
          >
            <BrainCircuit size={32} />
            <span
              className={cn(
                'text-2xl font-bold tracking-tight',
                isMinimized && 'sr-only'
              )}
            >
              PicMinder
            </span>
          </Link>
        </div>
        <nav className="flex-1 flex flex-col p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const linkContent = (
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                  isMinimized && 'justify-center'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    'transition-opacity',
                    isMinimized && 'sr-only'
                  )}
                >
                  {item.label}
                </span>
              </div>
            );

            return isMinimized ? (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>{linkContent}</Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link key={item.href} href={item.href}>
                {linkContent}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className="w-full justify-center"
          >
            <ChevronLeft
              className={cn(
                'h-5 w-5 transition-transform duration-300',
                isMinimized && 'rotate-180'
              )}
            />
            <span className="sr-only">
              {isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
            </span>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
