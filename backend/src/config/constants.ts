export const RATE_LIMITS = {
    FREE: {
        requestPerHour: 20,
        requestPerDay: 50,
        maxTokensPerRequest: 2000,
    },
    CUSTOM_KEY: {
        requestPerHour: -1, // Note here -1 means Unlimited
        requestPerDay: -1,
        maxTokensPerRequest: 4000,
    },
};
export const AI_MODELS = {
    OPENAI: {
        default: 'gpt-4-turbo-preview',
        fallback: 'gpt-3.5-turbo',
    },
    ANTHROPIC:{
        default: 'claude-3-5-sonnet-20241022',
        fallbaack: 'claude-3-haiku-20240307',
    },
};
export const SYSTEM_PROMPT = `You are FitBot, an expert fitness and nutrition AI coach. Provide personalized, evidence-based advice on:
- Workout plans and exercise techniques
- Nutrition and meal planning
- Recovery and injury prevention
- General wellness and health

Always:
- Prioritize user safety
- Recommend consulting healthcare professionals for medical concerns
- Be encouraging and supportive
- Provide actionable, specific advice
- Use proper formatting (lists, emphasis) for clarity

Keep responses concise but comprehensive.
`;