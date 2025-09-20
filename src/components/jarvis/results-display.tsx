import type { ExtractInformationFromPhotoOutput } from '@/ai/flows/extract-information-from-photo';
import type { CategorizePhotosAndSuggestActionsOutput } from '@/ai/flows/categorize-photos-and-suggest-actions';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play,
  MapPin,
  CalendarPlus,
} from 'lucide-react';

interface ResultsDisplayProps {
  photoDataUri: string;
  extractionResult: ExtractInformationFromPhotoOutput | null;
  categorizationResult: CategorizePhotosAndSuggestActionsOutput | null;
}

export function ResultsDisplay({
  photoDataUri,
  extractionResult,
  categorizationResult,
}: ResultsDisplayProps) {

  const handleLocationClick = () => {
    if (extractionResult?.address) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(extractionResult.address)}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const handleAddToCalendar = () => {
    if (!extractionResult?.event) return;

    const { title, startTime, endTime, location } = extractionResult.event;

    // Dates in Google Calendar link need to be in YYYYMMDDTHHMMSSZ format, without dashes or colons.
    const formatGCDate = (date: string) => {
      try {
        return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      } catch (e) {
        return '';
      }
    }

    const gcStartTime = formatGCDate(startTime);
    const gcEndTime = endTime ? formatGCDate(endTime) : gcStartTime;


    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${gcStartTime}/${gcEndTime}`,
      details: `Event details extracted from photo.`,
      location: location || extractionResult.address || '',
    });

    const calendarUrl = `https://www.google.com/calendar/render?${params.toString()}`;

    window.open(calendarUrl, '_blank');
  };

  const hasActions = (categorizationResult && categorizationResult.suggestedActions?.length > 0) || extractionResult?.address || extractionResult?.event;


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
            {categorizationResult.category}
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
              {extractionResult?.address && (
                <Button onClick={handleLocationClick} variant="outline" className="justify-start">
                  <MapPin className="mr-2" />
                  Take me to Location
                </Button>
              )}
              {extractionResult?.event && (
                 <Button onClick={handleAddToCalendar} variant="outline" className="justify-start">
                    <CalendarPlus className="mr-2" />
                    Add to Calendar
                 </Button>
              )}
              {categorizationResult?.suggestedActions.map((action, index) => {
                 if (action.toLowerCase() === 'add to calendar' && extractionResult?.event) {
                    return null; // Don't show suggested action if we have a dedicated button
                  }
                return (
                    <Button key={index} variant="outline" className="justify-start">
                    {action}
                    </Button>
                )
                })}

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
