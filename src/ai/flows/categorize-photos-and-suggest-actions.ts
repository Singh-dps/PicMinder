
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
  storeName: z.string().optional().describe('The name of the store, extracted from a bill or ad.'),
});
export type CategorizePhotosAndSuggestActionsOutput = z.infer<typeof CategorizePhotosAndSuggestActionsOutputSchema>;

export async function categorizePhotosAndSuggestActions(input: CategorizePhotosAndSuggestActionsInput): Promise<CategorizePhotosAndSuggestActionsOutput> {
  return categorizePhotosAndSuggestActionsFlow(input);
}

const categorizePhotosAndSuggestActionsPrompt = ai.definePrompt({
  name: 'categorizePhotosAndSuggestActionsPrompt',
  input: {schema: CategorizePhotosAndSuggestActionsInputSchema},
  output: {schema: CategorizePhotosAndSuggestActionsOutputSchema},
  prompt: `You are an expert AI assistant designed to accurately categorize photos with a focus on providing Indian-relevant information.

Your primary goal is to analyze the photo and determine its most fitting category from the following list: "bills", "Tickets", "Ads", "Memes", "documents".

When inferring a website URL from a logo, product, or text, you MUST prioritize the Indian version of the site for all multinational brands (e.g., for "Coca-Cola", infer "coca-cola.in"; for "Amazon", infer "amazon.in"; for "McDonald's", infer "mcdonaldsindia.com"). Populate the websiteUrl field with this URL.

- If the image contains an explicit URL or a QR code, extract the URL for the websiteUrl or qrCodeUrl field respectively and suggest "Open link" as an action.
- If the image is a bill or invoice, categorize it as "bills". Also extract the store name and populate the storeName field. You MUST suggest the following 5 actions: "Save Bill", "Contact Store", "Go to store", "Open links", "Share Via whatsapp".
- If the image is a ticket or event invitation, categorize it as "Tickets". You MUST suggest the following actions: "Save Ticket", "Add to Calendar", "View Event Details", "Contact Organizer", "Get Directions", "Share on WhatsApp". If a QR code is present, also suggest "Scan QR Code".
- If the image appears to be an advertisement, categorize it as "Ads". Infer the brand or store name from the ad content. If the brand has physical locations (e.g., McDonald's, a local supermarket), you MUST extract the store/brand name into the 'storeName' field and suggest "Find nearest store". Also, infer the most relevant website, prioritizing the Indian domain, and suggest "Visit Website".
- If the image is a meme or humorous internet image, categorize it as "Memes". You MUST suggest the following action: "Explain Meme".
- If the image is a general document, letter, or form, categorize it as "documents".
- If a QR code is present, extract its URL for the qrCodeUrl field, but categorize the image based on its primary content (e.g., a ticket with a QR code is still categorized as "Tickets").

For all categories, if a website, logo, or brand is identifiable, infer the Indian-relevant website URL and populate the websiteUrl field.

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
