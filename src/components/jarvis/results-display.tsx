
'use client';

import { useState } from 'react';
import type { ExtractInformationFromPhotoOutput } from '@/ai/flows/extract-information-from-photo';
import type { CategorizePhotosAndSuggestActionsOutput } from '@/ai/flows/categorize-photos-and-suggest-actions';
import type { ExtractEventDetailsOutput } from '@/ai/flows/extract-event-details';
import { summarizeEventDetails } from '@/ai/flows/summarize-event-details';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Copy,
  Play,
  CalendarPlus,
  Share2,
  Eye,
  Link as LinkIcon,
  Bookmark,
  MapPin,
  Receipt,
  Phone,
  Store,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScannedItem, useAppState } from '@/context/app-state-context';

interface ResultsDisplayProps {
  scannedItem: ScannedItem;
  photoDataUri: string;
  extractionResult: ExtractInformationFromPhotoOutput | null;
  categorizationResult: CategorizePhotosAndSuggestActionsOutput | null;
  eventDetailsResult: ExtractEventDetailsOutput | null;
  eventSummary: string | null;
  hideExtractedText?: boolean;
}

export function ResultsDisplay({
  scannedItem,
  photoDataUri,
  extractionResult,
  categorizationResult,
  eventDetailsResult,
  eventSummary,
  hideExtractedText = false,
}: ResultsDisplayProps) {
  const { toast } = useToast();
  const { addTicketItem, ticketItems, addBillItem, billItems } = useAppState();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentEventSummary, setCurrentEventSummary] = useState(eventSummary);

  const isTicketSaved = ticketItems.some(item => item.id === scannedItem.id);
  const isBillSaved = billItems.some(item => item.id === scannedItem.id);

  const handleQrCodeClick = () => {
    if (categorizationResult?.qrCodeUrl) {
      window.open(categorizationResult.qrCodeUrl, '_blank');
    }
  };

  const handleCalendarClick = () => {
    if (eventDetailsResult) {
      const { title, date, startTime, endTime, location, description } = eventDetailsResult;
      const T = startTime ? `T${startTime}` : '';
      const TEnd = endTime ? `T${endTime}` : '';
      const dates = `${date}${T}/${date}${TEnd}`;
      const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(description || '')}&location=${encodeURIComponent(location || '')}`;
      window.open(calendarUrl, '_blank');
    }
  };

  const handleDirectionsClick = () => {
    let address = eventDetailsResult?.location;
    if (!address) {
      address = extractionResult?.address;
    }
    if (address) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      window.open(mapsUrl, '_blank');
    } else {
      toast({
        variant: 'destructive',
        title: 'No Location Found',
        description: 'Could not find a location or address in the photo.',
      });
    }
  };
  
  const handleContact = () => {
    const phone = extractionResult?.phoneNumber;
    const email = extractionResult?.email;

    if (phone) {
      window.open(`tel:${phone}`);
    } else if (email) {
      window.open(`mailto:${email}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'No Contact Info',
        description: 'Could not find a phone number or email in the photo.',
      });
    }
  };

  const handleWhatsAppClick = () => {
    if (eventDetailsResult) {
      const { title, date, startTime, location } = eventDetailsResult;
      let message = `Check out this event: ${title}`;
      if (date) {
        message += ` on ${date}`;
      }
      if (startTime) {
        message += ` at ${startTime}`;
      }
      if (location) {
        message += ` at ${location}`;
      }
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else {
        const textToShare = extractionResult?.extractedText || "Check this out!";
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
        window.open(whatsappUrl, '_blank');
    }
  };

  const handleCopyText = () => {
    if (extractionResult?.extractedText) {
      navigator.clipboard.writeText(extractionResult.extractedText);
      toast({
        title: "Copied to clipboard",
        description: "The extracted text has been copied.",
      });
    }
  };

  const handleViewDetailsClick = async () => {
    if (!eventDetailsResult) return;
    setIsDetailsDialogOpen(true);
    if (currentEventSummary) return; 

    setIsSummarizing(true);
    try {
      const result = await summarizeEventDetails({ eventDetails: eventDetailsResult });
      setCurrentEventSummary(result.summary);
    } catch (error) {
      console.error("Error summarizing event details:", error);
      setCurrentEventSummary("Could not load event summary.");
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const handleSaveTicket = () => {
    if (scannedItem) {
      addTicketItem(scannedItem);
      toast({
        title: 'Ticket Saved',
        description: 'The ticket has been saved to your tickets page.',
      });
    }
  };

  const handleSaveBill = () => {
    if (scannedItem) {
      addBillItem(scannedItem);
      toast({
        title: 'Bill Saved',
        description: 'The bill has been saved to your bills page.',
      });
    }
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('calendar')) return <CalendarPlus className="mr-2" />;
    if (actionLower.includes('ticket')) return <Bookmark className="mr-2" />;
    if (actionLower.includes('share')) return <Share2 className="mr-2" />;
    if (actionLower.includes('details')) return <Eye className="mr-2" />;
    if (actionLower.includes('scan qr code') || actionLower.includes('open link')) return <LinkIcon className="mr-2" />;
    if (actionLower.includes('direction') || actionLower.includes('go to store')) return <MapPin className="mr-2" />;
    if (actionLower.includes('bill')) return <Receipt className="mr-2" />;
    if (actionLower.includes('contact')) return <Phone className="mr-2" />;
    return null;
  };
  
  const handleActionClick = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('calendar')) {
      handleCalendarClick();
    } else if (actionLower.includes('ticket')) {
      handleSaveTicket();
    } else if (actionLower.includes('bill')) {
      handleSaveBill();
    } else if (actionLower.includes('share')) {
      handleWhatsAppClick();
    } else if (actionLower.includes('details')) {
      handleViewDetailsClick();
    } else if (actionLower.includes('scan qr code') || actionLower.includes('open links')) {
      handleQrCodeClick();
    } else if (actionLower.includes('direction') || actionLower.includes('go to store')) {
      handleDirectionsClick();
    } else if (actionLower.includes('contact')) {
      handleContact();
    } else {
      toast({
        title: 'Action not implemented',
        description: `The action "${action}" is not yet supported.`,
      });
    }
  };

  const hasActions = (categorizationResult && categorizationResult.suggestedActions?.length > 0);

  return (
    <div className="space-y-6 pb-8">
      <Card className="overflow-hidden">
        <div className="relative w-full h-48">
          <Image
            src={photoDataUri}
            alt="Analyzed photo"
            fill
            className="object-cover"
          />
        </div>
      </Card>

      {categorizationResult?.category && (
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-base py-1 px-4 capitalize">
            {categorizationResult.category.replace('_', ' ')}
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {hasActions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="text-primary" />
                <span>Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              {categorizationResult.suggestedActions.map((action, index) => {
                  const actionLower = action.toLowerCase();
                  let isDisabled = false;
                  let buttonText = action;

                  if (actionLower.includes('ticket')) {
                    isDisabled = isTicketSaved;
                    if(isTicketSaved) buttonText = 'Ticket Saved';
                  } else if (actionLower.includes('bill')) {
                    isDisabled = isBillSaved;
                    if(isBillSaved) buttonText = 'Bill Saved';
                  }

                  return (
                    <Button key={index} onClick={() => handleActionClick(action)} variant="outline" className="justify-start" disabled={isDisabled}>
                      {getActionIcon(action)}
                      {buttonText}
                    </Button>
                  )
              })}
            </CardContent>
          </Card>
        )}
        
      </div>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription asChild>
              {isSummarizing ? (
                <div className="flex items-center gap-2 mt-4">
                   <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Generating summary...</span>
                </div>
              ) : (
                <p className="pt-4">{currentEventSummary}</p>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
