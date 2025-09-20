import { config } from 'dotenv';
config();

import '@/ai/flows/extract-information-from-photo.ts';
import '@/ai/flows/provide-feedback-to-improve-accuracy.ts';
import '@/ai/flows/categorize-photos-and-suggest-actions.ts';
import '@/ai/flows/extract-event-details.ts';
import '@/ai/flows/summarize-event-details.ts';
