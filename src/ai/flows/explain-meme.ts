'use server';
/**
 * @fileOverview Explains a meme from a photo.
 *
 * - explainMeme - A function that handles the meme explanation process.
 * - ExplainMemeInput - The input type for the explainMeme function.
 * - ExplainMemeOutput - The return type for the explainMeme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainMemeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a meme, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExplainMemeInput = z.infer<typeof ExplainMemeInputSchema>;

const ExplainMemeOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A witty and informative explanation of the meme.'),
});
export type ExplainMemeOutput = z.infer<typeof ExplainMemeOutputSchema>;

export async function explainMeme(
  input: ExplainMemeInput
): Promise<ExplainMemeOutput> {
  return explainMemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainMemePrompt',
  input: {schema: ExplainMemeInputSchema},
  output: {schema: ExplainMemeOutputSchema},
  prompt: `You are a meme expert with a great sense of humor.

Analyze the provided photo of a meme and provide a witty, short, and snappy explanation. Describe the meme's format, origin (if known), and why it's funny in a concise way.

Photo: {{media url=photoDataUri}}

Output the explanation in the specified JSON format.
`,
});

const explainMemeFlow = ai.defineFlow(
  {
    name: 'explainMemeFlow',
    inputSchema: ExplainMemeInputSchema,
    outputSchema: ExplainMemeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
