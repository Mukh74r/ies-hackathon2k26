/**
 * DeepHub AI — Turbo Brain Local Caching & Memory Architecture
 * Caches what the user inputs, prompts, queries, and generates across all Turbo Studio tools.
 * Provides instant prompt recall, auto-suggestions, and context-aware continuity across sessions.
 */

export interface TurboBrainMemory {
    id: string;
    toolId: string;
    userPrompt: string;
    timestamp: number;
    metadata?: {
        subject?: string;
        gradeLevel?: string;
        difficulty?: string;
        board?: string;
        title?: string;
        topic?: string;
        tags?: string[];
        [key: string]: any;
    };
    generatedSnippet?: string;
}

export interface TurboBrainState {
    memories: TurboBrainMemory[];
    lastPrompt: string;
    frequentKeywords: Record<string, number>;
    preferences: Record<string, any>;
}

const STORAGE_KEY = "deephub_turbo_brain_cache";
const PREFERENCES_KEY = "deephub_turbo_brain_preferences";
const MAX_MEMORIES = 100;

// In-Memory Fast Cache
let memoryStore: TurboBrainMemory[] = [];
let isInitialized = false;

/**
 * Initialize Turbo Brain from localStorage
 */
const initTurboBrain = () => {
    if (isInitialized) return;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            memoryStore = JSON.parse(raw);
        }
    } catch (e) {
        console.warn("Turbo Brain init warning:", e);
        memoryStore = [];
    }
    isInitialized = true;
};

/**
 * Save Turbo Brain state to localStorage
 */
const persistTurboBrain = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore.slice(0, MAX_MEMORIES)));
    } catch (e) {
        console.warn("Turbo Brain persist warning:", e);
    }
};

export const turboBrain = {
    /**
     * Cache what the user says/types/prompts in any Turbo tool
     */
    rememberUserPrompt(
        toolId: string,
        userPrompt: string,
        metadata: TurboBrainMemory["metadata"] = {},
        generatedSnippet?: string
    ): TurboBrainMemory {
        initTurboBrain();
        if (!userPrompt || !userPrompt.trim()) {
            return memoryStore[0] || ({} as TurboBrainMemory);
        }

        const cleanPrompt = userPrompt.trim();

        // Avoid exact duplicate adjacent memories
        const existingIdx = memoryStore.findIndex(
            (m) => m.toolId === toolId && m.userPrompt.toLowerCase() === cleanPrompt.toLowerCase()
        );

        if (existingIdx >= 0) {
            // Move to top and refresh timestamp
            const [existing] = memoryStore.splice(existingIdx, 1);
            existing.timestamp = Date.now();
            existing.metadata = { ...existing.metadata, ...metadata };
            if (generatedSnippet) existing.generatedSnippet = generatedSnippet;
            memoryStore.unshift(existing);
            persistTurboBrain();
            return existing;
        }

        const newMemory: TurboBrainMemory = {
            id: `tb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            toolId,
            userPrompt: cleanPrompt,
            timestamp: Date.now(),
            metadata: {
                ...metadata,
                topic: metadata?.topic || cleanPrompt.slice(0, 40),
            },
            generatedSnippet,
        };

        memoryStore.unshift(newMemory);
        if (memoryStore.length > MAX_MEMORIES) {
            memoryStore = memoryStore.slice(0, MAX_MEMORIES);
        }

        persistTurboBrain();
        return newMemory;
    },

    /**
     * Get recent user prompts for a tool or globally across Turbo tools
     */
    getRecentPrompts(toolId?: string, limit: number = 8): TurboBrainMemory[] {
        initTurboBrain();
        if (toolId) {
            return memoryStore.filter((m) => m.toolId === toolId).slice(0, limit);
        }
        return memoryStore.slice(0, limit);
    },

    /**
     * Get all cached what the user said for search or auto-complete
     */
    searchMemories(query: string, toolId?: string): TurboBrainMemory[] {
        initTurboBrain();
        const q = query.toLowerCase().trim();
        if (!q) return this.getRecentPrompts(toolId, 6);

        return memoryStore
            .filter((m) => {
                const matchesTool = !toolId || m.toolId === toolId;
                const matchesQuery =
                    m.userPrompt.toLowerCase().includes(q) ||
                    m.metadata?.subject?.toLowerCase().includes(q) ||
                    m.metadata?.topic?.toLowerCase().includes(q);
                return matchesTool && matchesQuery;
            })
            .slice(0, 10);
    },

    /**
     * Get contextual summary from Turbo Brain to feed into AI system prompt
     */
    getContextForAI(toolId: string): string {
        initTurboBrain();
        const toolMemories = memoryStore.filter((m) => m.toolId === toolId).slice(0, 3);
        if (toolMemories.length === 0) return "";

        const promptList = toolMemories.map((m) => `• "${m.userPrompt}"`).join("\n");
        return `\n[Turbo Brain Continuity Context: User recently generated items on:\n${promptList}\nEnsure consistent academic tone and terminology.]`;
    },

    /**
     * Set a persistent educator preference in Turbo Brain
     */
    setPreference(key: string, value: any): void {
        try {
            const raw = localStorage.getItem(PREFERENCES_KEY) || "{}";
            const prefs = JSON.parse(raw);
            prefs[key] = value;
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
        } catch (e) {
            console.warn("Turbo Brain setPreference error:", e);
        }
    },

    /**
     * Get a persistent educator preference
     */
    getPreference<T = any>(key: string, defaultValue?: T): T {
        try {
            const raw = localStorage.getItem(PREFERENCES_KEY) || "{}";
            const prefs = JSON.parse(raw);
            return prefs[key] !== undefined ? prefs[key] : (defaultValue as T);
        } catch {
            return defaultValue as T;
        }
    },

    /**
     * Clear all cached Turbo Brain memories
     */
    clearMemories(): void {
        memoryStore = [];
        localStorage.removeItem(STORAGE_KEY);
    },

    /**
     * Get memory count
     */
    getCount(): number {
        initTurboBrain();
        return memoryStore.length;
    }
};

/**
 * React Hook for seamless Turbo Brain caching in components
 */
import { useState, useEffect, useCallback } from "react";

export function useTurboBrain(toolId: string) {
    const [recentMemories, setRecentMemories] = useState<TurboBrainMemory[]>([]);

    const refreshMemories = useCallback(() => {
        setRecentMemories(turboBrain.getRecentPrompts(toolId, 6));
    }, [toolId]);

    useEffect(() => {
        refreshMemories();
    }, [refreshMemories]);

    const rememberPrompt = useCallback(
        (prompt: string, metadata?: TurboBrainMemory["metadata"], snippet?: string) => {
            const saved = turboBrain.rememberUserPrompt(toolId, prompt, metadata, snippet);
            refreshMemories();
            return saved;
        },
        [toolId, refreshMemories]
    );

    const clearBrain = useCallback(() => {
        turboBrain.clearMemories();
        refreshMemories();
    }, [refreshMemories]);

    return {
        recentMemories,
        rememberPrompt,
        refreshMemories,
        clearBrain,
        aiContext: turboBrain.getContextForAI(toolId),
        getPreference: turboBrain.getPreference,
        setPreference: turboBrain.setPreference,
    };
}
