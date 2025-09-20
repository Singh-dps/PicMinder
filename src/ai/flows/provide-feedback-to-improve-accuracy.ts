'use server';
/**
 * @fileOverview Allows users to provide feedback on the accuracy of categorization and suggested actions.
 *
 * - provideFeedback - A function that handles the feedback submission process.
 * - FeedbackInput - The input type for the provideFeedback function.
 * - FeedbackOutput - The return type for the provideFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FeedbackInputSchema = z.object({
  photoId: z.string().describe('The ID of the photo the feedback is for.'),
  categoryFeedback: z
    .enum(['correct', 'incorrect', 'unsure'])
    .describe('Feedback on the accuracy of the category assigned to the photo.'),
  suggestedActionsFeedback: z
    .enum(['useful', 'not_useful', 'irrelevant'])
    .describe('Feedback on the usefulness of the suggested actions.'),
  comments: z
    .string()
    .optional()
    .describe('Optional comments to provide more detailed feedback.'),
});
export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

const FeedbackOutputSchema = z.object({
  success: z.boolean().describe('Indicates whether the feedback was successfully recorded.'),
  message: z.string().describe('A message indicating the status of the feedback submission.'),
});
export type FeedbackOutput = z.infer<typeof FeedbackOutputSchema>;

export async function provideFeedback(input: FeedbackInput): Promise<FeedbackOutput> {
  return provideFeedbackFlow(input);
}

const provideFeedbackFlow = ai.defineFlow(
  {
    name: 'provideFeedbackFlow',
    inputSchema: FeedbackInputSchema,
    outputSchema: FeedbackOutputSchema,
  },
  async input => {
    // Simulate storing the feedback (replace with actual storage mechanism)
    console.log('Feedback received:', input);

    // For now, just return a success message
    return {
      success: true,
      message: 'Thank you for your feedback! We will use it to improve our services.',
    };
  }
);
