import type { ExtractInformationFromPhotoOutput } from '@/ai/flows/extract-information-from-photo';
import type { CategorizePhotosAndSuggestActionsOutput } from '@/ai/flows/categorize-photos-and-suggest-actions';
import type { ExtractEventDetailsOutput } from '@/ai/flows/extract-event-details';
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
  eventDetailsResult: ExtractEventDetailsOutput | null;
}

export function ResultsDisplay({
  photoDataUri,
  extractionResult,
  categorizationResult,
  eventDetailsResult,
}: ResultsDisplayProps) {

  const handleLocationClick = () => {
    if (extractionResult?.address) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(extractionResult.address)}`;
      window.open(googleMapsUrl, '_blank');
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

  const hasActions = (categorizationResult && categorizationResult.suggestedActions?.length > 0) || extractionResult?.address;
  const showCalendarAction = categorizationResult?.suggestedActions.includes('Add to Calendar') && eventDetailsResult;

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
              {showCalendarAction && (
                <Button onClick={handleCalendarClick} variant="outline" className="justify-start">
                  <CalendarPlus className="mr-2" />
                  Add to Calendar
                </Button>
              )}
              {categorizationResult?.suggestedActions.filter(action => action !== 'Add to Calendar').map((action, index) => (
                    <Button key={index} variant="outline" className="justify-start">
                    {action}
                    </Button>
                ))}

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
