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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppState } from '@/context/app-state-context';

interface ResultsDisplayProps {
  photoDataUri: string;
  extractionResult: ExtractInformationFromPhotoOutput | null;
  categorizationResult: CategorizePhotosAndSuggestActionsOutput | null;
  eventDetailsResult: ExtractEventDetailsOutput | null;
  eventSummary: string | null;
  hideExtractedText?: boolean;
}

export function ResultsDisplay({
  photoDataUri,
  extractionResult,
  categorizationResult,
  eventDetailsResult,
  eventSummary,
  hideExtractedText = false,
}: ResultsDisplayProps) {
  const { toast } = useToast();
  const { isTicketSaved } = useAppState();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentEventSummary, setCurrentEventSummary] = useState(eventSummary);

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

  const hasActions = (categorizationResult && categorizationResult.suggestedActions?.length > 0);
  const showCalendarAction = categorizationResult?.suggestedActions.includes('Add to Calendar') && eventDetailsResult;
  const showWhatsAppAction = categorizationResult?.suggestedActions.includes('Share on WhatsApp') && eventDetailsResult;
  const showViewDetailsAction = categorizationResult?.suggestedActions.includes('View Event Details') && eventDetailsResult;
  const showOpenLinkAction = categorizationResult?.suggestedActions.includes('Open Link') && categorizationResult?.qrCodeUrl;


  const otherActions = categorizationResult?.suggestedActions.filter(action =>
    action !== 'Add to Calendar' &&
    action !== 'Share on WhatsApp' &&
    action !== 'View Event Details' &&
    action !== 'Open Link' &&
    action !== 'Get Directions' &&
    action !== 'Scan QR Code'
  ) || [];

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
              {showCalendarAction && (
                <Button onClick={handleCalendarClick} variant="outline" className="justify-start">
                  <CalendarPlus className="mr-2" />
                  Add to Calendar
                </Button>
              )}
              {showWhatsAppAction && (
                <Button onClick={handleWhatsAppClick} variant="outline" className="justify-start">
                  <Share2 className="mr-2" />
                  Share on WhatsApp
                </Button>
              )}
               {showViewDetailsAction && (
                <Button onClick={handleViewDetailsClick} variant="outline" className="justify-start">
                  <Eye className="mr-2" />
                  View Event Details
                </Button>
              )}
              {showOpenLinkAction && (
                <Button onClick={handleQrCodeClick} variant="outline" className="justify-start">
                    <LinkIcon className="mr-2" />
                    Open Link
                </Button>
              )}
              {otherActions.map((action, index) => (
                <Button key={index} variant="outline" className="justify-start">
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
        
        {extractionResult?.extractedText && !hideExtractedText && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Copy className="text-primary" />
                  <span>Extracted Text</span>
                </span>
                <Button variant="ghost" size="icon" onClick={handleCopyText}>
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {extractionResult.extractedText}
              </p>
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
