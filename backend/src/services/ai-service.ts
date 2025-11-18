import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { AiServiceRequest, AiServiceResponse } from "../types";
import { SYSTEM_PROMPT } from "../config/constants";
import { getAiConfig } from "../config/ai-provider.config";
import { logger } from "../utils/logger";
export class AiService {
    private defaultOpenAi: OpenAI;
    private defaultAnthropic: Anthropic;
    constructor (){
        this.defaultOpenAi = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.defaultAnthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }
    async generateResponse(request: AiServiceRequest): Promise<AiServiceResponse> {
        const { messages, provider, apiKey, maxToken = 2000} = request;
        const config = getAiConfig(provider);

        // Now add the sytem prompt first
        const sytemMessage = { role: 'system', content: SYSTEM_PROMPT};
        const fullMessges = [ sytemMessage, ...messages];
        try {
            if(provider === 'openai'){
                return await this.generateOpenAiResponse(fullMessges,apiKey,maxToken,config);
            } else if(provider === 'anthropic'){
                return await this.generateAnthropicResponse(messages,apiKey,maxToken,config);
            }
            throw new Error('Unsupported Ai provider');
        } catch(error: any){
            logger.error(`AI Service Error (${provider})`,error);
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }
    async streamResonse(
        request: AiServiceRequest,
        res: Response
    ): Promise<void> {
        const { messages, provider, apiKey, maxToken=2000} = request;
        const config = getAiConfig(provider);
        res.setHeader('Content-Type','text/event-stream');
        res.setHeader('Cache-Control','no-cache');
        res.setHeader('Connection','keep-alive');
        try{
            if(provider === 'openai'){
                await this.streamOpenAiResponse(messages,apiKey,maxToken,config,res);
            } else if( provider === 'anthropic'){
                await this.streamAnthropicResponse(messages, apiKey,maxToken,config,res);
            } else {
                throw new Error('Unsupported AI provider');
            }
            res.write('data: [DONE]\n\n');
            res.end();
        } catch( error: any){
            logger.error(`Streaming Error (${provider})`,error);
            res.write(`data: ${JSON.stringify({error: error.message})}`);
        }
    }
    private async generateOpenAiResponse(
        message: Array <{role: string; content: string}>,
        apiKey: string | undefined,
        maxToken: number,
        config: any
    ): Promise<AiServiceResponse> {
        const client = apiKey ? new OpenAI({ apiKey }) : this.defaultOpenAi;
        const completion = await client.chat.completions.create({
            model: config.model,
            messages: message as any,
            max_tokens: maxToken,
            temperature: config.temperature,
        });
        return {
            content: completion.choices[0]?.message?.content || '',
            tokensUsed: completion.usage?.total_tokens || 0,
            provider: apiKey ? 'openai-custom' : 'openai',
        };
    }
    private async streamOpenAiResponse(
        message: Array<{role: string,content: string}>,
        apiKey: string | undefined,
        maxToken: number,
        config: any,
        res: Response
    ):Promise<void>{
        const client = apiKey ? new OpenAI({apiKey}): this.defaultOpenAi;
        const sytemMessage = { role: 'system', content: SYSTEM_PROMPT};
        const fullMessges = [sytemMessage, ...message];
        const stream =  await client.chat.completions.create({
            model: config.model,
            messages:fullMessges as any,
            max_tokens: maxToken,
            temperature: config.temperature,
            stream: true,
        });
        for await (const chunk of stream){
            const content = chunk.choices[0]?.delta?.content || '';
            if(content){
                res.write(`data: ${JSON.stringify({content})}\n\n`);
            }
        }
    }
    private async generateAnthropicResponse(
        messages: Array<{role: string, content: string}>,
        apiKey: string | undefined,
        maxToken: number,
        config: any
    ): Promise<AiServiceResponse> {
        const client = apiKey ? new Anthropic({ apiKey }) : this.defaultAnthropic;
        const anthropicMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content
        }));
        const message = await client.messages.create({
            model: config.model,
            max_tokens: maxToken,
            system: SYSTEM_PROMPT,
            messages: anthropicMessages,
        });
        const content = message.content[0];
        return {
            content: content.type === 'text' ? content.text : '',
            tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
            provider: apiKey ? 'anthropic-custom' : 'anthropic',
        };
    }
    private async streamAnthropicResponse(
        message: Array<{role: string, content: string}>,
        apiKey: string | undefined,
        maxToken: number,
        config: any,
        res: Response
    ):Promise<void>{
        const client = apiKey ? new Anthropic({apiKey}): this.defaultAnthropic;
        const anthropicMessages = message.filter(m=> m.role !== 'system').map(m=> ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));
        const stream = await client.messages.stream({
            model: config.model,
            max_tokens: maxToken,
            system: SYSTEM_PROMPT,
            messages: anthropicMessages,
        });
        for await (const chunk of stream){
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta'){
                res.write(`data: ${JSON.stringify({ content: chunk.delta.text})}\n\n`);
            }
        }
    }
    async validateApiKey(apiKey: string, provider: 'openai' | 'anthropic'): Promise<boolean>{
        try {
            if(provider === 'openai'){
                const client = new OpenAI({apiKey});
                await client.models.list();
                return true;
            } else if(provider === 'anthropic'){
                const client = new Anthropic({apiKey});
                await client.messages.create({
                    model:'claude-3-haiku-20240307',
                    max_tokens: 10,
                    messages: [{role: 'user',content: 'Hi'}],
                });
                return true;
            }
            return false;
        } catch(error){
            logger.error(`API key validatation failed for ${provider}`,error);
            return false;
        }
    }
}
export const aiService = new AiService();