'use server';
/**
 * @fileOverview Generates a human-readable summary of event details.
 *
 * - summarizeEventDetails - A function that handles the event summarization process.
 * - SummarizeEventDetailsInput - The input type for the summarizeEventDetails function.
 * - SummarizeEventDetailsOutput - The return type for the summarizeEventDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Re-defining EventDetailsSchema here as it can't be imported from a 'use server' file.
const EventDetailsSchema = z.object({
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


const SummarizeEventDetailsInputSchema = z.object({
  eventDetails: EventDetailsSchema,
});
export type SummarizeEventDetailsInput = z.infer<
  typeof SummarizeEventDetailsInputSchema
>;

const SummarizeEventDetailsOutputSchema = z.object({
  summary: z.string().describe('A concise, human-readable summary of the event.'),
});
export type SummarizeEventDetailsOutput = z.infer<
  typeof SummarizeEventDetailsOutputSchema
>;

export async function summarizeEventDetails(
  input: SummarizeEventDetailsInput
): Promise<SummarizeEventDetailsOutput> {
  return summarizeEventDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeEventDetailsPrompt',
  input: {schema: SummarizeEventDetailsInputSchema},
  output: {schema: SummarizeEventDetailsOutputSchema},
  prompt: `You are an expert AI assistant that creates concise, human-readable summaries of event details.

Given the following event information, create a short paragraph summarizing the event.
- Start with the event title.
- Mention the date and time in a friendly format (e.g., "on July 26th, 2024 from 6:30 PM to 8:00 PM").
- Include the location if available.
- Briefly mention the description if available.

Event Details:
- Title: {{{eventDetails.title}}}
- Date: {{{eventDetails.date}}}
- Start Time: {{{eventDetails.startTime}}}
- End Time: {{{eventDetails.endTime}}}
- Location: {{{eventDetails.location}}}
- Description: {{{eventDetails.description}}}

Generate a summary based on these details.`,
});

const summarizeEventDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeEventDetailsFlow',
    inputSchema: SummarizeEventDetailsInputSchema,
    outputSchema: SummarizeEventDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
