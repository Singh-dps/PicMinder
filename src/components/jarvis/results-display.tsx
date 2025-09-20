import type { ExtractInformationFromPhotoOutput } from '@/ai/flows/extract-information-from-photo';
import type { CategorizePhotosAndSuggestActionsOutput } from '@/ai/flows/categorize-photos-and-suggest-actions';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  Tag,
  BookText,
  Shapes,
  Sparkles,
  Play,
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
        {categorizationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-primary" />
                <span>Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Category
                </h3>
                <Badge variant="secondary" className="text-lg py-1 px-3">
                  {categorizationResult.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {categorizationResult && categorizationResult.suggestedActions?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="text-primary" />
                <span>Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              {categorizationResult.suggestedActions.map((action, index) => (
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
