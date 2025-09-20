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
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Separator } from '../ui/separator';

interface ResultsDisplayProps {
  photoDataUri: string;
  extractionResult: ExtractInformationFromPhotoOutput | null;
  categorizationResult: CategorizePhotosAndSuggestActionsOutput | null;
  onFeedback: (
    categoryFeedback: 'correct' | 'incorrect' | 'unsure',
    suggestedActionsFeedback: 'useful' | 'not_useful' | 'irrelevant'
  ) => void;
}

type FeedbackState = {
  category: 'correct' | 'incorrect' | null;
  action: 'useful' | 'not_useful' | null;
};

export function ResultsDisplay({
  photoDataUri,
  extractionResult,
  categorizationResult,
  onFeedback,
}: ResultsDisplayProps) {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    category: null,
    action: null,
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedback = (
    type: 'category' | 'action',
    value: 'correct' | 'incorrect' | 'useful' | 'not_useful'
  ) => {
    const newFeedbackState = { ...feedbackState, [type]: value as any };
    setFeedbackState(newFeedbackState);
  };

  const submitFeedback = () => {
    onFeedback(
      feedbackState.category ?? 'unsure',
      feedbackState.action ?? 'irrelevant'
    );
    setFeedbackSubmitted(true);
  };

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

      {!feedbackSubmitted && (categorizationResult || extractionResult) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Help us improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">
                Was the category correct?
              </p>
              <div className="flex gap-2">
                <Button
                  variant={
                    feedbackState.category === 'correct' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleFeedback('category', 'correct')}
                >
                  <ThumbsUp className="mr-2" /> Correct
                </Button>
                <Button
                  variant={
                    feedbackState.category === 'incorrect'
                      ? 'destructive'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handleFeedback('category', 'incorrect')}
                >
                  <ThumbsDown className="mr-2" /> Incorrect
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">
                Was the action useful?
              </p>
              <div className="flex gap-2">
                <Button
                  variant={
                    feedbackState.action === 'useful' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleFeedback('action', 'useful')}
                >
                  <Check className="mr-2" /> Useful
                </Button>
                <Button
                  variant={
                    feedbackState.action === 'not_useful'
                      ? 'destructive'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handleFeedback('action', 'not_useful')}
                >
                  <X className="mr-2" /> Not Useful
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-accent hover:bg-accent/90"
              onClick={submitFeedback}
              disabled={!feedbackState.category || !feedbackState.action}
            >
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {feedbackSubmitted && (
        <Card className="bg-accent/10 border-accent">
          <CardContent className="p-4 flex items-center justify-center gap-2">
            <Check className="text-accent" />
            <p className="text-sm font-medium text-accent-foreground">
              Thank you for your feedback!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
