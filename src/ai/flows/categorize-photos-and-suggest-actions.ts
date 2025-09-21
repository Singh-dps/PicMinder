
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
  prompt: `You are an expert AI assistant designed to accurately categorize photos. Your primary goal is to analyze the photo and determine its most fitting category from the following list: "bills", "Tickets", "Ads", "Memes", "documents".

You MUST adhere to the following rules for categorization and action suggestion:

1.  **URL Inference**: When inferring a website URL, you MUST prioritize Indian domains for multinational brands (e.g., "coca-cola.in", "amazon.in"). Populate the \`websiteUrl\` field.
2.  **QR Codes**: If a QR code is present, extract its URL into the \`qrCodeUrl\` field. The image category should be based on the rest of the content (e.g., a ticket with a QR code is "Tickets"). If a QR code is present, always suggest "Open link".

**Categorization Rules:**

-   **Bills**: If the image is a bill or invoice, categorize it as "bills".
    -   You MUST extract the store's name into the \`storeName\` field.
    -   You MUST suggest these 5 actions: "Save Bill", "Contact Store", "Go to store", "Open links", "Share Via whatsapp".

-   **Tickets**: If the image is a ticket or event invitation, categorize it as "Tickets".
    -   You MUST suggest these actions: "Save Ticket", "Add to Calendar", "View Event Details", "Contact Organizer", "Get Directions", "Share on WhatsApp".

-   **Advertisements (Ads)**:
    -   If the image is an advertisement for a brand with physical stores (e.g., McDonald's), categorize it as "Ads". You MUST extract the brand/store name into the \`storeName\` field and suggest "Find nearest store", "Visit Website", and "Share on WhatsApp".
    -   If the image contains a Fast-Moving Consumer Good (FMCG) product (e.g., shampoo, soap, snacks), categorize it as "Ads". Extract the brand name into the \`storeName\` field. You MUST suggest "Find Nearest Store". This action should help the user find the nearest chemist, supermarket, or kirana store.

-   **Memes**: If the image is a humorous internet meme, categorize it as "Memes".
    -   You MUST suggest these actions: "Explain Meme", "Share on WhatsApp".

-   **Documents**: If the image is a general document, letter, or form that does not fit other categories, categorize it as "documents".
    -   You MUST suggest "Save Document".

Analyze the photo carefully and follow these instructions precisely.

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
