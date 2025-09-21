
'use server';
/**
 * @fileOverview A conversational chat agent for the Jarvis app.
 *
 * - jarvisChat - The main chat function.
 * - JarvisChatRequest - The input type for the chat function.
 * - JarvisChatResponse - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ScannedItem } from '@/context/app-state-context';
import { JarvisChatRequestSchema, JarvisChatResponseSchema, JarvisChatRequest, JarvisChatResponse, Message } from './jarvis-chat-types';

import { categorizePhotosAndSuggestActions } from './categorize-photos-and-suggest-actions';
import { extractEventDetails } from './extract-event-details';
import { summarizeEventDetails } from './summarize-event-details';
import { extractInformationFromPhoto } from './extract-information-from-photo';
import { explainMeme } from './explain-meme';


// Tool to analyze a photo
const analyzePhotoTool = ai.defineTool(
  {
    name: 'analyzePhoto',
    description: 'Analyzes a photo to extract text, categorize it, and suggest actions. Use this when the user uploads a photo or asks to analyze one.',
    inputSchema: z.object({
      photoDataUri: z.string().describe("A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
    }),
    outputSchema: z.custom<ScannedItem>(),
  },
  async ({ photoDataUri }) => {
    // This function runs all the necessary analysis flows in parallel and sequentially.
    const [extraction, categorization] = await Promise.all([
      extractInformationFromPhoto({ photoDataUri }),
      categorizePhotosAndSuggestActions({ photoDataUri }),
    ]);

    let eventDetailsResult = null;
    let eventSummary = null;

    if (categorization.suggestedActions.includes('View Event Details') || categorization.category === 'Tickets') {
      eventDetailsResult = await extractEventDetails({ photoDataUri });
      if (eventDetailsResult) {
        const summaryResult = await summarizeEventDetails({ eventDetails: eventDetailsResult });
        eventSummary = summaryResult.summary;
      }
    }

    const scannedItem: ScannedItem = {
      id: new Date().toISOString(),
      photoDataUri: photoDataUri,
      extractionResult: extraction,
      categorizationResult: categorization,
      eventDetailsResult,
      eventSummary,
    };
    return scannedItem;
  }
);

// Tool to get saved items from local storage
const getSavedItemsTool = ai.defineTool(
    {
        name: 'getSavedItems',
        description: 'Retrieves saved items like bills, tickets, or documents. Use this when the user asks to see their saved items.',
        inputSchema: z.object({
            category: z.enum(['bills', 'tickets', 'documents', 'all']).describe('The category of items to retrieve.')
        }),
        outputSchema: z.object({
            // This is a placeholder. The actual data is handled client-side.
            // We return the category to signal the client.
            category: z.string(),
        })
    },
    async ({ category }) => {
        // The actual logic for retrieving from localStorage is on the client.
        // This tool's purpose is to signal to the LLM that this action is possible
        // and to return a structured response that the client can act upon.
        return { category };
    }
);

// Tool to search documents
const searchDocumentsTool = ai.defineTool(
    {
        name: 'searchDocuments',
        description: 'Searches through the extracted text of saved documents. Use this when a user wants to find a specific document.',
        inputSchema: z.object({
            query: z.string().describe('The search term to look for in the documents.')
        }),
        outputSchema: z.object({
            // Placeholder, client handles search.
            query: z.string(),
        })
    },
    async ({ query }) => {
        return { query };
    }
);


const jarvisChatPrompt = ai.definePrompt({
    name: 'jarvisChatPrompt',
    input: { schema: JarvisChatRequestSchema },
    output: { schema: z.any() },
    tools: [analyzePhotoTool, getSavedItemsTool, searchDocumentsTool, explainMeme],
    prompt: `You are Jarvis, a friendly and highly skilled AI assistant. Your goal is to assist users with their requests in a conversational and intuitive manner.

    - If the user provides a photo, call the 'analyzePhoto' tool to process it.
    - If the user asks to see their saved items (e.g., "show my tickets", "view my bills"), use the 'getSavedItems' tool.
    - If the user wants to search their documents, use the 'searchDocuments' tool.
    - If the user provides a meme and asks for an explanation, use the 'explainMeme' tool.
    - For general conversation, respond in a friendly and helpful tone.
    - Do not invent tools or functions. Only use the tools provided.
    
    Here is the conversation history:
    {{#each messages}}
      {{role}}:
      {{#each content}}
        {{#if text}}{{text}}{{/if}}
        {{#if media}}<media url="{{media.url}}" />{{/if}}
      {{/each}}
    {{/each}}
    `,
});

const jarvisChatFlow = ai.defineFlow(
    {
        name: 'jarvisChatFlow',
        inputSchema: JarvisChatRequestSchema,
        outputSchema: JarvisChatResponseSchema,
    },
    async (request) => {
        const llmResponse = await jarvisChatPrompt(request);
        const toolCalls = llmResponse.toolCalls();

        let scannedItem: ScannedItem | null = null;
        let historyCategory: string | null = null;
        let responseMessage: Message;

        if (toolCalls.length > 0) {
            const toolCall = toolCalls[0];
            const toolResponse = await toolCall.run();

            if (toolCall.tool.name === 'analyzePhoto') {
                scannedItem = toolResponse as ScannedItem;
                responseMessage = {
                    role: 'model',
                    content: [{ text: "Here's what I found. You can perform actions on it below." }],
                };
            } else if (toolCall.tool.name === 'getSavedItems') {
                // The client will handle fetching from local storage
                const { category } = toolResponse as { category: string };
                historyCategory = category;
                 responseMessage = {
                    role: 'model',
                    content: [{ text: `Fetching your saved ${category}. I'll display them below.` }],
                 };
            } else if (toolCall.tool.name === 'searchDocuments') {
                const { query } = toolResponse as { query: string };
                responseMessage = {
                    role: 'model',
                    content: [{ text: `I'm searching your documents for "${query}". I'll display the results below.` }],
                };
            } else if (toolCall.tool.name === 'explainMeme') {
                 const { explanation } = toolResponse as { explanation: string };
                 responseMessage = {
                     role: 'model',
                     content: [{ text: explanation }],
                 };
            }
            else {
                 responseMessage = {
                    role: 'model',
                    content: [{ text: "I'm not sure how to handle that tool's response." }],
                };
            }

        } else {
             responseMessage = {
                role: 'model',
                content: [{ text: llmResponse.text }],
            };
        }

        return {
            response: responseMessage,
            scannedItem: scannedItem,
            historyCategory: historyCategory
        };
    }
);

export async function jarvisChat(
  request: JarvisChatRequest
): Promise<JarvisChatResponse> {
  return jarvisChatFlow(request);
}
