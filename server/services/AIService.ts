import Groq from "groq-sdk";
import { performSearch } from "../utils/search.ts";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "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",
});

export type Role = "system" | "user" | "assistant";

export interface Message {
    role: Role;
    content: string | any[];
}

export interface CompletionOptions {
    messages: Message[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" | "text" };
    forcedProvider?: string;
    webSearch?: boolean;
}

export class AIService {
    private static provider: "groq" | "kimi" | "gemini" | "ollama" = (process.env.DEFAULT_AI_PROVIDER as any) || "groq";
    private static NEURAL_TIMEOUT_MS = 600000; // 10-minute limit for high-latency synthesis

    static async complete(options: CompletionOptions) {
        const { messages, model, temperature = 0.7, max_tokens = 4096, response_format, forcedProvider, webSearch } = options;
        const effectiveProvider = (forcedProvider && forcedProvider !== 'auto') ? forcedProvider : this.provider;
        
        let targetModel = model;
        
        // Model Selection Logic
        if (effectiveProvider === 'gemini') {
            if (!targetModel || !targetModel.includes('gemini')) {
                targetModel = 'gemini-2.0-flash'; // ✅ Valid Gemini model
            }
        } else if (effectiveProvider === 'ollama') {
             if (!targetModel || (targetModel.includes('versatile') || targetModel.includes('gemini') || targetModel.includes('groq'))) {
                targetModel = 'llama3.2:3b'; 
             }
        } else if (effectiveProvider === 'groq') {
             if (!targetModel || (!targetModel.includes('70b') && !targetModel.includes('8b'))) {
                 targetModel = 'llama-3.3-70b-versatile';
             }
        }

        const totalChars = messages.reduce((acc, m) => acc + (typeof m.content === 'string' ? m.content.length : 0), 0);
        console.log(`[AIService] Provider: ${effectiveProvider}, Model: ${targetModel}, Context: ${totalChars} chars`);

        if (webSearch && effectiveProvider !== 'gemini' && effectiveProvider !== 'ollama') {
            const lastMsg = messages[messages.length - 1];
            const userQuery = typeof lastMsg.content === 'string' ? lastMsg.content : '';
            if (userQuery) {
                const searchResults = await performSearch(userQuery);
                if (searchResults) {
                    lastMsg.content = `User Query: ${userQuery}\n\n[CONTEXT]\n${searchResults}\n\nINSTRUCTIONS: Use context.`;
                }
            }
        }

        try {
            if (effectiveProvider === "gemini") return await this.geminiComplete(options, targetModel!);
            if (effectiveProvider === "ollama") return await this.ollamaComplete(options, targetModel!);
            if (effectiveProvider === "kimi") return await this.kimiComplete(options, targetModel!);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.NEURAL_TIMEOUT_MS);
            
            const result = await groq.chat.completions.create({
                messages: messages as any,
                model: targetModel || "llama-3.3-70b-versatile",
                temperature,
                max_tokens,
                response_format
            }, { signal: controller.signal });
            
            clearTimeout(timeoutId);
            return result;
        } catch (err: any) {
            console.error(`[AIService Error] Provider=${effectiveProvider}, Model=${targetModel} | ${err.message}`);
            throw err;
        }
    }

    private static async geminiComplete(options: CompletionOptions, targetModel: string) {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

        // Simplified mapping for the overhaul
        const contents = options.messages.filter(m => m.role !== 'system').map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
        }));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.NEURAL_TIMEOUT_MS);

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: options.temperature,
                    maxOutputTokens: options.max_tokens,
                    responseMimeType: options.response_format?.type === "json_object" ? "application/json" : "text/plain"
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        return { choices: [{ message: { content: data.candidates?.[0]?.content?.parts?.[0]?.text } }] };
    }

    private static async kimiComplete(options: CompletionOptions, targetModel: string) {
        const response = await fetch(`${process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1"}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.KIMI_API_KEY}`
            },
            body: JSON.stringify({
                model: targetModel,
                messages: options.messages,
                temperature: options.temperature,
                max_tokens: options.max_tokens,
                response_format: options.response_format
            })
        });
        const data = await response.json();
        return { choices: [{ message: { content: data.choices[0].message.content } }] };
    }

    private static async ollamaComplete(options: CompletionOptions, targetModel: string) {
        // Use OLLAMA_BASE_URL env var only — no hardcoded IPs ever
        const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        console.log(`📡 [Neural Link] Connecting to Ollama at: ${ollamaUrl}`);

        // Fast connectivity check before committing to a full request
        try {
            const healthCheck = await fetch(`${ollamaUrl}/api/tags`, {
                signal: AbortSignal.timeout(15000) // Loosened to 15s for high-latency links
            });
            if (!healthCheck.ok) {
                throw new Error(`Health check returned ${healthCheck.status}`);
            }
        } catch (err: any) {
            console.error(`[Ollama Pre-flight Failure] ${err.message}`);
            throw new Error(`Ollama Unreachable at ${ollamaUrl}. Ensure the AI Node is running and the public IP is correctly set in OLLAMA_BASE_URL. (${err.message})`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.NEURAL_TIMEOUT_MS);

        try {
            const response = await fetch(`${ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: targetModel || 'llama3.2:3b',
                    messages: options.messages,
                    stream: false,
                    format: options.response_format?.type === 'json_object' ? 'json' : undefined,
                    options: {
                        temperature: options.temperature,
                        num_predict: options.max_tokens
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return { choices: [{ message: { content: data.message?.content || '{}' } }] };
        } catch (err: any) {
            clearTimeout(timeoutId);
            console.error(`[Ollama Service Error]`, err.message);
            throw new Error(`Ollama call failed: ${err.message}`);
        }
    }

    static async completeWithFallback(options: CompletionOptions) {
        return this.complete(options);
    }
}
