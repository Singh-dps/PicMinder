'use server';
/**
 * @fileOverview Categorizes photos and suggests relevant actions.
 *
 * - categorizePhotosAndSuggestActions - A function that categorizes photos and suggests actions.
 * - CategorizePhotosAndSuggestActionsInput - The input type for the categorizePhotosAndSuggestActions function.
 * - CategorizePhotosAndSuggestActionsOutput - The return type for the categorizePhotosAndSuggestActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizePhotosAndSuggestActionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CategorizePhotosAndSuggestActionsInput = z.infer<typeof CategorizePhotosAndSuggestActionsInputSchema>;

const CategorizePhotosAndSuggestActionsOutputSchema = z.object({
  category: z.string().describe('The category of the photo (e.g., "bill", "ticket", "event", "qr_code", "receipt", "business_card", "document", "other").'),
  suggestedActions: z.array(z.string()).describe('A list of up to 5 suggested actions based on the photo (e.g., "Add to Calendar", "Save Ticket", "Pay Bill").'),
  qrCodeUrl: z.string().optional().describe('The URL extracted from the QR code, if present.'),
});
export type CategorizePhotosAndSuggestActionsOutput = z.infer<typeof CategorizePhotosAndSuggestActionsOutputSchema>;

export async function categorizePhotosAndSuggestActions(input: CategorizePhotosAndSuggestActionsInput): Promise<CategorizePhotosAndSuggestActionsOutput> {
  return categorizePhotosAndSuggestActionsFlow(input);
}

const categorizePhotosAndSuggestActionsPrompt = ai.definePrompt({
  name: 'categorizePhotosAndSuggestActionsPrompt',
  input: {schema: CategorizePhotosAndSuggestActionsInputSchema},
  output: {schema: CategorizePhotosAndSuggestActionsOutputSchema},
  prompt: `You are an expert AI assistant designed to accurately categorize photos and suggest relevant actions.

Your primary goal is to analyze the photo and determine its most fitting category. Possible categories include: "bill", "ticket", "receipt", "event", "business_card", "document", "qr_code", or "other".

Based on the determined category, suggest a list of up to 5 appropriate actions.

- If, and only if, a QR code is clearly visible and scannable in the photo, set the category to "qr_code", extract the URL from it, and populate the qrCodeUrl field. Do not categorize an image as a QR code if it contains other primary content like a bill or a ticket, even if a small QR code is present. In such cases, categorize based on the main subject.
- If the image is a bill or invoice, suggest actions like "Pay Bill" or "Set Reminder".
- If the image is a ticket or event invitation, suggest actions like "Save Ticket" and "Add to Calendar".

Analyze the photo carefully before making a decision.

Photo: {{media url=photoDataUri}}
  `,
});

const categorizePhotosAndSuggestActionsFlow = ai.defineFlow(
  {
    name: 'categorizePhotosAndSuggestActionsFlow',
    inputSchema: CategorizePhotosAndSuggestActionsInputSchema,
    outputSchema: CategorizePhotosAndSuggestActionsOutputSchema,
  },
  async input => {
    const {output} = await categorizePhotosAndSuggestActionsPrompt(input);
    return output!;
  }
);
