import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "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",
});

export type Role = "system" | "user" | "assistant";

export interface Message {
    role: Role;
    content: string;
}

import { performSearch } from "../utils/search.ts";

export interface CompletionOptions {
    messages: Message[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" | "text" };
    forcedProvider?: string;
    webSearch?: boolean;
}

const AI = {
    provider: (process.env.DEFAULT_AI_PROVIDER as "groq" | "kimi" | "gemini") || "groq",

    async complete(options: CompletionOptions) {
        return await this.completeWithFallback(options);
    },

    async kimiComplete({ messages, model, temperature, max_tokens, response_format }: CompletionOptions) {
        let kimiModel = model;
        if (model?.includes("llama") || model?.includes("mixtral")) {
            kimiModel = "moonshot-v1-128k";
        }

        const response = await fetch(`${process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1"}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.KIMI_API_KEY}`
            },
            body: JSON.stringify({
                model: kimiModel,
                messages,
                temperature,
                max_tokens,
                response_format
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData: any;
            try { errorData = JSON.parse(errorText); } catch (e) { }
            throw new Error(`Kimi Error: ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            choices: [{
                message: {
                    content: data.choices[0].message.content
                }
            }]
        };
    },

    async geminiComplete({ messages, model, temperature, max_tokens, response_format }: CompletionOptions) {
        const apiKey = process.env.GEMINI_API_KEY;
        const geminiModel = (model && model.includes("gemini")) ? model : "gemini-2.0-flash-exp";

        const contents = messages.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        const isJson = response_format?.type === "json_object";

        const thinkingInstruction = `
        You are a highly advanced AI with real-time reasoning capabilities.
        
        FORMATTING RULE:
        You MUST start every response with a "Thought Process" block to verify your facts, especially for current events.
        
        Example Format:
        **Thought Process:**
        1. Analyze user query: "Who is the US President?"
        2. Check current date: ${new Date().toLocaleDateString()}
        3. Retrieve/Verify real-time info: Elections happened in 2024... Inauguration 2025...
        4. Conclusion: Donald Trump is president.
        
        **Answer:**
        The current President...
        `;

        let systemInstruction: any = undefined;
        if (messages[0]?.role === "system") {
            const systemText = isJson 
                ? messages[0].content + "\n\nCRITICAL: Respond ONLY with valid JSON. Do not wrap in markdown codeblocks. Do not add thinking process text."
                : messages[0].content + "\n\n" + thinkingInstruction;
            systemInstruction = { parts: [{ text: systemText }] };
            contents.shift();
        } else if (!isJson) {
            systemInstruction = { parts: [{ text: thinkingInstruction }] };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                ...(systemInstruction ? { systemInstruction } : {}),
                ...(isJson ? {} : { tools: [{ google_search: {} }] }),
                generationConfig: {
                    temperature,
                    maxOutputTokens: max_tokens,
                    responseMimeType: isJson ? "application/json" : "text/plain"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini Error: ${errorText}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        return {
            choices: [{
                message: {
                    content: content || "Error: Gemini returned no content."
                }
            }]
        };
    },

    // Fallback System: Groq -> Gemini -> Ollama
    async completeWithFallback(options: CompletionOptions & { forcedProvider?: string }) {
        const { messages, model, temperature, max_tokens, response_format, forcedProvider } = options;
        
        // If a specific provider is forced (e.g. from frontend switcher), try mostly that one
        const chain = forcedProvider && forcedProvider !== 'auto'
            ? [forcedProvider, ...['groq', 'gemini', 'ollama'].filter(p => p !== forcedProvider)]
            : ['groq', 'gemini', 'ollama'];

        console.log(`[AI Fallback] Starting chain: ${chain.join(' -> ')}`);

        let lastError: any = null;

        for (const providerName of chain) {
            try {
                console.log(`[AI Fallback] Attempting provider: ${providerName}`);
                this.provider = providerName as any; // Switch internal state

                if (providerName === 'groq') {
                     return await groq.chat.completions.create({
                        messages,
                        model: model || "llama-3.3-70b-versatile",
                        temperature,
                        max_tokens,
                        response_format
                    });
                }

                if (providerName === 'gemini') {
                     if (!process.env.GEMINI_API_KEY) {
                        console.log(`[AI Fallback] Skipping Gemini - no API key configured`);
                        continue;
                    }
                    return await this.geminiComplete({ 
                        messages, 
                        model: model || "gemini-2.0-flash-exp", 
                        temperature, 
                        max_tokens, 
                        response_format 
                    });
                }

                if (providerName === 'ollama') {
                    // Check if Ollama is available
                    // Use OLLAMA_BASE_URL env var only — no hardcoded fallback IPs
                    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
                    console.log(`[AI Fallback] Testing Neural Link to ${ollamaUrl}...`);
                    try {
                        const healthCheck = await fetch(`${ollamaUrl}/api/tags`, { 
                            method: 'GET',
                            signal: AbortSignal.timeout(5000) // Increased to 5s for remote GPU nodes
                        });
                        
                        if (!healthCheck.ok) {
                            console.log(`[AI Fallback] Skipping Ollama - status ${healthCheck.status}`);
                            continue;
                        }

                        console.log(`[AI Fallback] Neural Link Healthy! Accessing Llama...`);
                        return await this.ollamaComplete({
                            messages,
                            model: model || "llama3.2:1b",
                            temperature,
                            max_tokens,
                            response_format
                        });
                    } catch (ollamaError: any) {
                        console.log(`[AI Fallback] Skipping Ollama - Connection Failed: ${ollamaError.message}`);
                        continue;
                    }
                }
                
                // If we get here for 'kimi' or others not explicitly handled above but in the chain
                if (providerName === 'kimi') {
                     return await this.kimiComplete({ messages, model, temperature, max_tokens, response_format });
                }

            } catch (error: any) {
                lastError = error;
                console.warn(`[AI Fallback] Provider ${providerName} failed: ${error.message}`);
                
                // Check if it's a rate limit error
                const isRateLimit = error.status === 429 || error.message?.includes('rate limit');
                if (isRateLimit) {
                    console.log(`[AI Fallback] Rate limit hit on ${providerName}, trying next provider...`);
                    continue;
                }

                // If forced provider failed and it wasn't rate limit, maybe we should stop?
                // But generally fallback is safer. 
                continue;
            }
        }

        throw lastError || new Error("All AI providers failed.");
    },

    async ollamaComplete({ messages, model, temperature, max_tokens, response_format }: CompletionOptions) {
        // Use OLLAMA_BASE_URL env var only — no hardcoded IPs
        const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        
        try {
            const response = await fetch(`${ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model || 'llama3.2:1b',
                    messages: messages,
                    stream: false,
                    format: response_format?.type === 'json_object' ? 'json' : undefined,
                    options: {
                        temperature: temperature,
                        num_predict: max_tokens
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama Error: ${errorText}`);
            }

            const data = await response.json();
            return {
                choices: [{
                    message: {
                        content: data.message?.content || '{}'
                    }
                }]
            };
        } catch (err: any) {
             console.error(`[Ollama Service Error]`, err);
             throw new Error(`Failed to connect to Ollama: ${err.message}. Please verify Ollama is running at ${ollamaUrl}.`);
        }
    }
};

export default AI;
