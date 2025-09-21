
'use client';

import { useState, useEffect } from 'react';
import type { ExtractInformationFromPhotoOutput } from '@/ai/flows/extract-information-from-photo';
import type { CategorizePhotosAndSuggestActionsOutput } from '@/ai/flows/categorize-photos-and-suggest-actions';
import type { ExtractEventDetailsOutput } from '@/ai/flows/extract-event-details';
import { explainMeme } from '@/ai/flows/explain-meme';
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
  HelpCircle,
  Globe,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScannedItem, useAppState } from '@/context/app-state-context';

interface ResultsDisplayProps {
  scannedItem: ScannedItem;
}

export function ResultsDisplay({
  scannedItem,
}: ResultsDisplayProps) {
  const { 
    photoDataUri,
    extractionResult,
    categorizationResult,
    eventDetailsResult,
    eventSummary 
  } = scannedItem;

  const { toast } = useToast();
  const { addTicketItem, ticketItems, addBillItem, billItems, addDocumentItem, documentItems } = useAppState();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentEventSummary, setCurrentEventSummary] = useState(eventSummary);
  const [isMemeExplanationOpen, setIsMemeExplanationOpen] = useState(false);
  const [memeExplanation, setMemeExplanation] = useState<string | null>(null);
  const [isExplainingMeme, setIsExplainingMeme] = useState(false);

  useEffect(() => {
    setCurrentEventSummary(eventSummary);
  }, [eventSummary]);

  const isTicketSaved = ticketItems.some(item => item.photoDataUri === scannedItem.photoDataUri);
  const isBillSaved = billItems.some(item => item.photoDataUri === scannedItem.photoDataUri);
  const isDocumentSaved = documentItems.some(item => item.photoDataUri === scannedItem.photoDataUri);

  const handleOpenLink = () => {
    let url = categorizationResult?.websiteUrl || categorizationResult?.qrCodeUrl;
    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      window.open(url, '_blank');
    } else {
      toast({
        variant: 'destructive',
        title: 'No Link Found',
        description: 'Could not find a link in the photo.',
      });
    }
  };

  const handleVisitWebsite = () => {
    let url = categorizationResult?.websiteUrl;
    if (url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      window.open(url, '_blank');
    } else {
       toast({
        variant: 'destructive',
        title: 'No Website Found',
        description: 'Could not find a website in the ad.',
      });
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
    let address = eventDetailsResult?.location || extractionResult?.address;

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
  
  const handleGoToStore = () => {
    const storeName = categorizationResult?.storeName;
    if (!storeName) {
       toast({
        variant: 'destructive',
        title: 'No Store Name Found',
        description: 'The AI could not identify a store in the photo.',
      });
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const query = `${storeName} near me`;
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&ll=${latitude},${longitude}`;
          window.open(mapsUrl, '_blank');
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description: 'Could not get your location. Searching for the store without it.',
          });
          // Fallback to searching without location
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName)}`;
          window.open(mapsUrl, '_blank');
        }
      );
    } else {
      toast({
        title: 'Location Not Supported',
        description: "Your browser doesn't support geolocation. Searching for the store without it.",
      });
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeName)}`;
      window.open(mapsUrl, '_blank');
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

  const handleViewDetailsClick = () => {
    if (eventDetailsResult) {
      setIsDetailsDialogOpen(true);
    } else {
      toast({
        title: 'Details Not Ready',
        description: 'Event details are still being extracted. Please wait a moment.',
      });
    }
  };
  
  const handleSaveTicket = () => {
    const { id, createdAt, ...item } = scannedItem;
    addTicketItem(item);
    toast({
      title: 'Ticket Saved',
      description: 'The ticket has been saved to your tickets page.',
    });
  };

  const handleSaveBill = () => {
    const { id, createdAt, ...item } = scannedItem;
    addBillItem(item);
    toast({
      title: 'Bill Saved',
      description: 'The bill has been saved to your bills page.',
    });
  };

  const handleSaveDocument = () => {
    const { id, createdAt, ...item } = scannedItem;
    addDocumentItem(item);
    toast({
      title: 'Document Saved',
      description: 'The document has been saved to your documents page.',
    });
  };

  const handleExplainMemeClick = async () => {
    setIsMemeExplanationOpen(true);
    if (memeExplanation) return;

    setIsExplainingMeme(true);
    try {
      const result = await explainMeme({ photoDataUri });
      setMemeExplanation(result.explanation);
    } catch (error) {
      console.error("Error explaining meme:", error);
      setMemeExplanation("Could not get an explanation for this meme.");
    } finally {
      setIsExplainingMeme(false);
    }
  };

  const handleShareImage = async () => {
    try {
      const response = await fetch(photoDataUri);
      const blob = await response.blob();
      const file = new File([blob], 'meme.png', { type: blob.type });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Check out this meme!',
          text: 'Sent from PicMinder',
        });
      } else {
        // Fallback for browsers that don't support Web Share API or file sharing
        handleWhatsAppClick();
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      toast({
        variant: 'destructive',
        title: 'Sharing Failed',
        description: 'Could not share the image.',
      });
      // Fallback to text sharing
      handleWhatsAppClick();
    }
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('calendar')) return <CalendarPlus className="mr-2" />;
    if (actionLower.includes('ticket')) return <Bookmark className="mr-2" />;
    if (actionLower.includes('share')) return <Share2 className="mr-2" />;
    if (actionLower.includes('details')) return <Eye className="mr-2" />;
    if (actionLower.includes('scan qr code') || actionLower.includes('open link')) return <LinkIcon className="mr-2" />;
    if (actionLower.includes('direction')) return <MapPin className="mr-2" />;
    if (actionLower.includes('go to store') || actionLower.includes('find nearest store')) return <Store className="mr-2" />;
    if (actionLower.includes('bill')) return <Receipt className="mr-2" />;
    if (actionLower.includes('document')) return <FileText className="mr-2" />;
    if (actionLower.includes('contact')) return <Phone className="mr-2" />;
    if (actionLower.includes('explain meme')) return <HelpCircle className="mr-2" />;
    if (actionLower.includes('visit website')) return <Globe className="mr-2" />;
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
    } else if (actionLower.includes('document')) {
      handleSaveDocument();
    } else if (actionLower.includes('share')) {
        handleWhatsAppClick();
    } else if (actionLower.includes('details')) {
      handleViewDetailsClick();
    } else if (actionLower.includes('scan qr code')) {
      handleOpenLink();
    } else if (actionLower.includes('open link')) {
      handleOpenLink();
    } else if (actionLower.includes('direction')) {
      handleDirectionsClick();
    } else if (actionLower.includes('go to store') || actionLower.includes('find nearest store')) {
      handleGoToStore();
    } else if (actionLower.includes('contact')) {
      handleContact();
    } else if (actionLower.includes('explain meme')) {
      handleExplainMemeClick();
    } else if (actionLower.includes('visit website')) {
      handleVisitWebsite();
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
                  } else if (actionLower.includes('document')) {
                    isDisabled = isDocumentSaved;
                    if(isDocumentSaved) buttonText = 'Document Saved';
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
              {!currentEventSummary ? (
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
      <Dialog open={isMemeExplanationOpen} onOpenChange={setIsMemeExplanationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meme Explanation</DialogTitle>
            <DialogDescription asChild>
              {isExplainingMeme ? (
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Thinking of a witty explanation...</span>
                </div>
              ) : (
                <p className="pt-4">{memeExplanation}</p>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
