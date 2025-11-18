export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    tokenUsed: number;
}
export interface ChatRequest {
    message: string;
    conversationId?: string;
    provider?: 'openai' | 'anthropic';
    customApiKey?: string;
}
export interface ChatResponse {
    reply: string;
    conversationId: string;
    tokenUsed: number;
    provider: string;
}
export interface UsageStats {
    used: number;
    limit: number;
    resetAt: Date;
}
export interface ValidateKeyRequest {
    apiKey: string;
    provider: 'openai'|'anthropic';
}
export interface AiServiceRequest {
    messages: Array<{role: string; content: string}>;
    provider: 'openai' | 'anthropic';
    apiKey?: string;
    maxToken?: number;
}
export interface AiServiceResponse {
    content: string;
    tokensUsed: number;
    provider: string;
}