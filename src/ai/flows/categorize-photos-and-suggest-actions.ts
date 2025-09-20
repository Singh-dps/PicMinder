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
  category: z.string().describe('The category of the photo (e.g., "bills", "Tickets", "Ads", "Memes", "documents").'),
  suggestedActions: z.array(z.string()).describe('A list of up to 5 suggested actions based on the photo.'),
  qrCodeUrl: z.string().optional().describe('The URL extracted from the QR code, if present.'),
  websiteUrl: z.string().optional().describe('The website URL extracted from the ad, if present.'),
});
export type CategorizePhotosAndSuggestActionsOutput = z.infer<typeof CategorizePhotosAndSuggestActionsOutputSchema>;

export async function categorizePhotosAndSuggestActions(input: CategorizePhotosAndSuggestActionsInput): Promise<CategorizePhotosAndSuggestActionsOutput> {
  return categorizePhotosAndSuggestActionsFlow(input);
}

const categorizePhotosAndSuggestActionsPrompt = ai.definePrompt({
  name: 'categorizePhotosAndSuggestActionsPrompt',
  input: {schema: CategorizePhotosAndSuggestActionsInputSchema},
  output: {schema: CategorizePhotosAndSuggestActionsOutputSchema},
  prompt: `You are an expert AI assistant designed to accurately categorize photos.

Your primary goal is to analyze the photo and determine its most fitting category from the following list: "bills", "Tickets", "Ads", "Memes", "documents".

- If the image is a bill or invoice, categorize it as "bills".
- If the image is a ticket or event invitation, categorize it as "Tickets".
- If the image appears to be an advertisement, categorize it as "Ads".
- If the image is a meme or humorous internet image, categorize it as "Memes".
- If the image is a general document, letter, or form, categorize it as "documents".
- If a QR code is present, extract its URL for the qrCodeUrl field, but categorize the image based on its primary content (e.g., a ticket with a QR code is still a "Tickets").
- If the category is "Ads", identify the website of the product or service being advertised and put it in the websiteUrl field.

Based on the determined category, suggest appropriate actions.
- If the category is "bills", you MUST suggest the following 5 actions: "Save Bill", "Contact Store", "Go to store", "Open links", "Share Via whatsapp".
- If the category is "Tickets", you MUST suggest the following actions: "Save Ticket", "Add to Calendar", "View Event Details", "Contact Organizer", "Get Directions", "Share on WhatsApp". If a QR code is present, also suggest "Scan QR Code".
- If the category is "Ads", you MUST suggest "Visit Website". You can also suggest "Share".
- If the category is "Memes", you MUST suggest the following action: "Explain Meme".
- For all other categories, you can suggest a list of up to 5 appropriate actions (e.g., "Share").

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
