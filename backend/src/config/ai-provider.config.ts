import { AI_MODELS } from "./constants";

export const getAiConfig = (provider:'openai' | 'anthropic')=>  {
    const configs = {
        openai: {
            models: AI_MODELS.OPENAI.default,
            temperature: 0.7,
            maxTokens: 2000,
        },
        anthropic: {
            model: AI_MODELS.ANTHROPIC.default,
            temperature: 0.7,
            maxTokens: 2000,
        }
    };
    return configs[provider];
};