import type { ExtractInformationFromPhotoOutput } from '@/ai/flows/extract-information-from-photo';
import type { CategorizePhotosAndSuggestActionsOutput } from '@/ai/flows/categorize-photos-and-suggest-actions';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Play,
  MapPin,
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

  const hasActions = (categorizationResult && categorizationResult.suggestedActions?.length > 0) || extractionResult?.address;


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
              {categorizationResult?.suggestedActions.map((action, index) => (
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
