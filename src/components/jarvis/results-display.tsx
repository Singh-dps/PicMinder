import type { ExtractInformationFromPhotoOutput } from '@/ai/flows/extract-information-from-photo';
import type { CategorizePhotosAndSuggestActionsOutput } from '@/ai/flows/categorize-photos-and-suggest-actions';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  Tag,
  BookText,
  Shapes,
  Sparkles,
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
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Suggested Action
              </h3>
              <p className="font-semibold text-accent-foreground bg-accent/20 border border-accent rounded-md p-3">
                {categorizationResult.suggestedAction}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {extractionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              <span>Extracted Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {extractionResult.extractedText && (
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <BookText size={18} />
                  Extracted Text
                </h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                  {extractionResult.extractedText}
                </p>
              </div>
            )}
            {extractionResult.entities &&
              extractionResult.entities.length > 0 && (
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Tag size={18} />
                    Entities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {extractionResult.entities.map((entity) => (
                      <Badge key={entity}>{entity}</Badge>
                    ))}
                  </div>
                </div>
              )}
            {extractionResult.visualFeatures &&
              extractionResult.visualFeatures.length > 0 && (
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-2">
                    <Shapes size={18} />
                    Visual Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {extractionResult.visualFeatures.map((feature) => (
                      <Badge variant="outline" key={feature}>
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
