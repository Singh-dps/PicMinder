'use server';
/**
 * @fileOverview Extracts event details from a photo for calendar creation.
 *
 * - extractEventDetails - A function that handles the event detail extraction process.
 * - ExtractEventDetailsInput - The input type for the extractEventDetails function.
 * - ExtractEventDetailsOutput - The return type for the extractEventDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractEventDetailsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an event ticket or invitation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractEventDetailsInput = z.infer<
  typeof ExtractEventDetailsInputSchema
>;

const ExtractEventDetailsOutputSchema = z.object({
  title: z.string().describe('The title of the event.'),
  date: z
    .string()
    .describe(
      'The date of the event in YYYYMMDD format (e.g., 20240726).'
    ),
  startTime: z
    .string()
    .optional()
    .describe(
      'The start time of the event in HHMMSS format (e.g., 183000 for 6:30 PM).'
    ),
  endTime: z
    .string()
    .optional()
    .describe(
      'The end time of the event in HHMMSS format (e.g., 200000 for 8:00 PM).'
    ),
  location: z.string().optional().describe('The location of the event.'),
  description: z.string().optional().describe('A brief description of the event.'),
});
export type ExtractEventDetailsOutput = z.infer<
  typeof ExtractEventDetailsOutputSchema
>;

export async function extractEventDetails(
  input: ExtractEventDetailsInput
): Promise<ExtractEventDetailsOutput> {
  return extractEventDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractEventDetailsPrompt',
  input: {schema: ExtractEventDetailsInputSchema},
  output: {schema: ExtractEventDetailsOutputSchema},
  prompt: `You are an expert AI assistant specializing in extracting event details from images.

You will analyze the provided photo of a ticket or event invitation and extract the following information:
- Event title
- Date (in YYYYMMDD format)
- Start time (in HHMMSS format, 24-hour clock)
- End time (in HHMMSS format, 24-hour clock)
- Location
- A brief description

If a piece of information is not available, leave it out.

Photo: {{media url=photoDataUri}}

Output the extracted details in the specified JSON format.
`,
});

const extractEventDetailsFlow = ai.defineFlow(
  {
    name: 'extractEventDetailsFlow',
    inputSchema: ExtractEventDetailsInputSchema,
    outputSchema: ExtractEventDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
