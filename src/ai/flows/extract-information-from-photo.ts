'use server';

/**
 * @fileOverview Extracts text, entities, and visual features from a photo.
 *
 * - extractInformationFromPhoto - A function that handles the information extraction process.
 * - ExtractInformationFromPhotoInput - The input type for the extractInformationFromPhoto function.
 * - ExtractInformationFromPhotoOutput - The return type for the extractInformationFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInformationFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractInformationFromPhotoInput = z.infer<typeof ExtractInformationFromPhotoInputSchema>;

const ExtractInformationFromPhotoOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the photo.'),
  entities: z.array(z.string()).describe('The identified entities in the photo.'),
  visualFeatures: z.array(z.string()).describe('The identified visual features in the photo.'),
});
export type ExtractInformationFromPhotoOutput = z.infer<typeof ExtractInformationFromPhotoOutputSchema>;

export async function extractInformationFromPhoto(input: ExtractInformationFromPhotoInput): Promise<ExtractInformationFromPhotoOutput> {
  return extractInformationFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractInformationFromPhotoPrompt',
  input: {schema: ExtractInformationFromPhotoInputSchema},
  output: {schema: ExtractInformationFromPhotoOutputSchema},
  prompt: `You are an expert AI assistant specializing in extracting information from photos.

You will analyze the photo and extract the text, identify entities, and recognize visual features.

Photo: {{media url=photoDataUri}}

Output the extracted text, entities, and visual features in the specified JSON format.
`,
});

const extractInformationFromPhotoFlow = ai.defineFlow(
  {
    name: 'extractInformationFromPhotoFlow',
    inputSchema: ExtractInformationFromPhotoInputSchema,
    outputSchema: ExtractInformationFromPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
