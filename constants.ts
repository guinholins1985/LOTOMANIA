// WARNING: Storing API keys in client-side code is insecure.
// This is for demonstration purposes only. In a real application,
// this key should be handled by a backend server.
export const OPENROUTER_API_KEY = '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';

export const AI_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// After extensive performance analysis, switching to Google's latest Flash model.
// It provides the optimal balance of speed, accuracy, and web-search capability.
export const AI_MODEL = 'google/gemini-flash-1.5';

// HTTP Referer required by some models on OpenRouter
export const HTTP_REFERER = 'https://lotomania-ultra-system.web.app';