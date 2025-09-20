# **App Name**: Jarvis

## Core Features:

- Photo Upload & Processing: Securely upload photos to the backend for AI processing, and preprocess to ensure high quality processing results.
- Multimodal AI Extraction: Leverage Gemini to extract text, entities, and visual features from photos.
- Intelligent Categorization & Action Engine: Automatically sort photos into predefined categories (e.g., bills, tickets) and identify actionable items (e.g., events, reminders). The action engine acts as a tool; the LLM decides when and whether to suggest an action, and which action to take.
- Notification System: Generate and push reminders, actionable tasks, or deep links to the user's device, integrating with external services when necessary.
- User Feedback Loop: Enable users to provide feedback on categorization accuracy and suggested actions to continually improve AI model performance.
- Actionable Item Display: Display extracted information in a clear, concise, and actionable format within the user interface.
- Category and tag exploration: UI element to let users browse suggested categories and associated items, or tags, derived from identified keywords.

## Style Guidelines:

- Primary color: Vivid blue (#4299E1) to represent intelligence, clarity, and trustworthiness. A good complement to the blues and greys often found in photos of screens.
- Background color: Light blue-gray (#F7FAFC), a desaturated and light version of the primary to ensure readability and focus on content.
- Accent color: Emerald green (#48BB78), analogous to the primary yet distinct in brightness and saturation, used for highlighting actionable items and positive feedback.
- Body and headline font: 'Inter', a grotesque-style sans-serif font with a modern, machined, objective, neutral look, is used both in headlines and body.
- Use minimalist, line-based icons to represent categories, actions, and settings. Ensure consistency in style and size for a clean and intuitive user experience.
- Implement a card-based layout using Chakra UI to present extracted information and actionable items. Use consistent spacing and alignment to maintain a visually appealing and organized interface.
- Employ subtle animations for transitions and feedback, such as fading in extracted data or highlighting actionable items. Keep animations brief and purposeful to enhance user engagement without being distracting.
- It is an mobile based web app so make ui accordingly