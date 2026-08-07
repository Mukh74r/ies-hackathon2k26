import express from "express";
import AI from "../config/ai_config.ts";
import { SYSTEM_PROMPTS } from "../config/prompts.js";
import { sanitizePrompt, isOwnerQuestion, getOwnerResponse } from "../utils/helpers.ts";
import { broadcast } from "../utils/broadcast.ts";

const router = express.Router();

router.post("/", async (req, res) => {
    const { message: providedMessage, messages = [], mode = "normal" } = req.body;

    const message = providedMessage || (messages.length > 0 ? messages[messages.length - 1].content : "");

    if (!message && (!messages || messages.length === 0)) {
        console.error("DEBUG: Chat API 400 - Missing content", req.body);
        return res.status(400).json({ error: "Message missing" });
    }

    // BROADCAST OUTBOUND (Global monitoring)
    broadcast({
        status: "OUTBOUND_NEURAL_LINK",
        ip: req.ip || "REMOTE_ADDR",
        content: message,
        type: "outbound"
    });

    if (isOwnerQuestion(message)) {
        return res.json({ response: getOwnerResponse(mode) });
    }

    const requestedProvider = (req.body as any).provider || AI.provider;
    const isSearchEnabled = (requestedProvider === 'gemini') || 
                           ((req.body as any).webSearch && requestedProvider !== 'ollama');

    const basePrompt = (SYSTEM_PROMPTS as any)[mode] || SYSTEM_PROMPTS.normal;
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    let dynamicInstructions = "";

    if (isSearchEnabled) {
        dynamicInstructions = `
    Current Date: ${currentDate}
    
    CRITICAL INSTRUCTIONS:
    1. REAL-TIME SEARCH: You have access to Google Search. For ANY question about current events, people, or dynamic topics, you MUST use the search tool.
    2. IGNORE TRAINING DATA: If your training data conflicts with search results (e.g., President of US), TRUST THE SEARCH RESULTS.
    3. HIDDEN VERIFICATION: Internally verify facts against the 2026 date.
        `;
    } else {
        dynamicInstructions = `
    Current System Date: ${currentDate} (For Context Only)
    
    CRITICAL INSTRUCTIONS:
    1. DEEP RESEARCH MODE: You are optimized for exhaustive analysis, code generation, and technical depth.
    2. KNOWLEDGE CUTOFF: You do NOT have real-time internet access.
    3. HONESTY: If asked about events after your training data, state your knowledge cutoff clearly.
    4. STRENGTH: Focus on providing comprehensive technical explanations, architectural insights, and production-ready code.
        `;
    }

    const systemPrompt = `
    ${basePrompt}
    ${dynamicInstructions}
    GENERAL RULES:
    1. PERSISTENCE: Maintain context.
    2. TECHNICAL DEPTH: Provide production-ready code.
    3. FORMATTING: Use Markdown.
    4. PERSONALITY: You are Turbo. Be helpful and intelligent.
  `;

    try {
        let history = [];
        if (messages && messages.length > 0) {
            history = messages.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: sanitizePrompt(msg.content)
            }));
        } else {
            history = [{ role: "user", content: sanitizePrompt(message) }];
        }

        const completion = await AI.complete({
            forcedProvider: (req.body as any).provider === 'auto' ? undefined : (req.body as any).provider,
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                ...history
            ] as any,
            temperature: 0.7,
            max_tokens: 4096,
            webSearch: (req.body as any).webSearch
        });

        // BROADCAST INBOUND
        broadcast({
            status: "INCOMING_NEURAL_RESPONSE",
            ip: "NEURAL_CORE",
            content: completion.choices[0].message.content,
            type: "inbound"
        });

        res.json({
            response: completion.choices[0].message.content,
        });

    } catch (err: any) {
        const statusCode = err.status || err.statusCode || (err.message && err.message.includes("429") ? 429 : 500);
        const detailedError = (err.error && err.error.message) || err.message || "Unknown error";
        
        console.error(`[CHAT_API] Neural Failure (${statusCode}):`, detailedError);
        
        // Handle Rate Limits (Groq/Gemini/Ollama)
        const errorContent = JSON.stringify(err.error || err) + " " + detailedError;
        const scanStr = errorContent.toLowerCase();
        
        const isRateLimit = statusCode === 429 ||
                           scanStr.includes("429") || 
                           scanStr.includes("rate limit") || 
                           scanStr.includes("quota exceeded") ||
                           scanStr.includes("tokens_per_day");

        if (isRateLimit) {
            // Regex for all known formats including long fractional seconds from Groq
            const timeMatch = scanStr.match(/try again in ([\d\w\.]+s)/i) || 
                             scanStr.match(/after ([\d\w\.]+s)/i) ||
                             scanStr.match(/replenish in ([\d\w\.]+s)/i) ||
                             scanStr.match(/in ([\d]+m[\d\.]+s)/i);
            
            const retryAfter = timeMatch ? timeMatch[1] : "60s";
            console.log(`[RATE_LIMIT] Final extraction: ${retryAfter}`);

            // NOTIFY ADMIN
            broadcast({
                status: "NEURAL_LIMIT_REACHED",
                ip: "SYNDICATE_OVERSEED",
                content: `RATE_LIMIT: provider ${requestedProvider} exhausted. Restoration: ${retryAfter}`,
                type: "alert"
            });

            return res.status(429).json({
                error: "RATE_LIMIT_EXCEEDED",
                retryAfter: retryAfter,
                details: detailedError,
                provider: requestedProvider
            });
        }

        res.status(500).json({
            error: "AI_OFFLINE",
            details: detailedError,
            provider: requestedProvider || AI.provider
        });
    }
});

export default router;
