
import { z } from 'genkit';
import { ScannedItem } from '@/context/app-state-context';

// Define schemas for messages
const MediaPartSchema = z.object({
  url: z.string().describe('The data URI of the media.'),
});

const TextPartSchema = z.object({
  text: z.string(),
});

const ContentPartSchema = z.union([
  TextPartSchema,
  z.object({ media: MediaPartSchema }),
]);

export const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(ContentPartSchema),
});
export type Message = z.infer<typeof MessageSchema>;


// Jarvis Chat Flow
export const JarvisChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
});
export type JarvisChatRequest = z.infer<typeof JarvisChatRequestSchema>;

export const JarvisChatResponseSchema = z.object({
    response: MessageSchema,
    scannedItem: z.custom<ScannedItem>().nullable(),
    history: z.custom<ScannedItem[]>().nullable(),
});
export type JarvisChatResponse = z.infer<typeof JarvisChatResponseSchema>;
