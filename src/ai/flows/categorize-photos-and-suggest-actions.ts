
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
  websiteUrl: z.string().optional().describe('The website URL extracted from the ad or a link, if present.'),
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

- If the image contains an explicit URL or a QR code, extract the URL for the websiteUrl or qrCodeUrl field respectively and suggest "Open link" as an action.
- If the image contains a logo, product, or text that implies an advertiser (e.g., "Coca-Cola", "Blitzit"), infer the most probable website URL (e.g., "coca-cola.com", "blitzit.com"), populate the websiteUrl field, and suggest "Open link" or "Visit Website" as an action.

- If the image is a bill or invoice, categorize it as "bills".
- If the image is a ticket or event invitation, categorize it as "Tickets".
- If the image appears to be an advertisement, categorize it as "Ads".
- If the image is a meme or humorous internet image, categorize it as "Memes".
- If the image is a general document, letter, or form, categorize it as "documents".
- If a QR code is present, extract its URL for the qrCodeUrl field, but categorize the image based on its primary content (e.g., a ticket with a QR code is still a "Tickets").

Based on the determined category, suggest appropriate actions.
- If the category is "bills", you MUST suggest the following 5 actions: "Save Bill", "Contact Store", "Go to store", "Open links", "Share Via whatsapp".
- If the category is "Tickets", you MUST suggest the following actions: "Save Ticket", "Add to Calendar", "View Event Details", "Contact Organizer", "Get Directions", "Share on WhatsApp". If a QR code is present, also suggest "Scan QR Code".
- If the category is "Ads", you must analyze the content of the image to identify the most relevant product, brand, or company. Based on this, determine the most likely website URL. For example, if the ad is for a company named "Blitzit," you should infer the website is "blitzit.com". Populate the websiteUrl field with this URL and suggest "Visit Website" as an action.
- If the category is "Memes", you MUST suggest the following action: "Explain Meme".
- For all other categories, you can suggest a list of up to 5 appropriate actions (e.g., "Share", "Save Image").

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

