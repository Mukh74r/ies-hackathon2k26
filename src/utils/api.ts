/**
 * Centralized API utility for DeepHub AI
 * Handles base URL selection based on environment
 */

const IS_DEMO_MODE = false;

const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (import.meta.env.PROD) {
    return envUrl || ""; 
  }
  
  return envUrl || "http://localhost:3001";
};

export const API_BASE_URL = getApiUrl();

/**
 * Helper to construct full API endpoints
 */
export const apiEndpoint = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  if (!cleanBase && !cleanPath.startsWith('/api')) {
      return `/api${cleanPath}`;
  }
  
  return `${cleanBase}${cleanPath}`;
};

/**
 * Safe JSON parser to handle SPA HTML fallback responses gracefully
 */
export const safeFetchJson = async <T = any>(response: Response): Promise<{ ok: boolean; data: T | null; isHtml: boolean }> => {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return { ok: false, data: null, isHtml: true };
    }
    try {
        const data = await response.json();
        return { ok: response.ok, data, isHtml: false };
    } catch {
        return { ok: false, data: null, isHtml: false };
    }
};

/**
 * Direct client-side inference using Groq Cloud API when backend is in static hosting mode
 */
export const callDirectGroqInference = async (
    messages: { role: string; content: string }[],
    systemPrompt = "You are DeepHub AI, a high-performance frontier neural assistant specialized in education, engineering, and coding."
): Promise<string | null> => {
    const groqKey = import.meta.env.VITE_GROQ_API_KEY || 
                    import.meta.env.GROQ_API_KEY || 
                    localStorage.getItem('GROQ_API_KEY') ||
                    "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";
    
    if (!groqKey) return null;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${groqKey.trim()}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
                ],
                temperature: 0.6,
                max_tokens: 2048
            })
        });

        if (res.ok) {
            const json = await res.json();
            return json.choices?.[0]?.message?.content || null;
        }
    } catch (err) {
        console.warn("Direct Groq inference fallback error:", err);
    }
    return null;
};

/**
 * Helper to get authentication headers
 */
export const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Mock responses for Demo Mode
 */
export const getMockResponse = (path: string) => {
    if (path.includes('/auth/login') || path.includes('/auth/signup')) {
        return {
            token: 'demo_token_' + Date.now(),
            user: {
                userId: 'user_demo_123',
                username: 'Agent001',
                email: 'demo@deephub.ai',
                role: 'Neural Architect',
                name: 'Demo User',
                profilePicture: 'https://github.com/shadcn.png'
            }
        };
    }
    
    if (path.includes('/solve-paper')) {
        return {
            success: true,
            solutions: [
                {
                    question_no: 1,
                    question: "Define Quantum Entanglement in the context of neural computing.",
                    answer: "A physical phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle of the group cannot be described independently of the state of the others.",
                    explanation: "In neural computing, this mimics high-fidelity synchronization between distributed nodes."
                }
            ]
        };
    }

    if (path.includes('/ppt/generate')) {
        return {
            success: true,
            slides: [
                { type: 'title', title: 'The Future of Neural Education', bullets: ['Exploring Collective Intelligence', 'Neural Orchestration Platform'] },
                { type: 'bullets', title: 'Architecture Overview', bullets: ['Distributed Node Systems', 'Quantum-Safe Encryption', 'Neural SSE Feed'] }
            ]
        };
    }

    if (path.includes('/generate-homework') || path.includes('/lesson-plan/generate')) {
        return {
            success: true,
            content: "### Neural Course Overview\n\n1. **Integration**: Seamlessly bridge frontend and core nodes.\n2. **Optimization**: Maximize neural bandwidth for peak efficiency.",
            metadata: { generatedAt: new Date().toISOString() }
        };
    }

    if (path.includes('/generate-questions')) {
        return {
            success: true,
            isJSON: true,
            questionPaper: JSON.stringify({
                sections: [
                    {
                        name: "Section A",
                        description: "Theoretical Foundation",
                        questions: [
                            { question: "Explain the role of neural bridges in distributed systems.", marks: 5 },
                            { question: "How does latent space optimization affect inference speed?", marks: 5 }
                        ]
                    }
                ]
            })
        };
    }

    if (path.includes('/library/save')) {
        return { success: true, message: "Archived successfully in neural persistent storage." };
    }

    return { success: true, message: "Demo mode active - returning simulated data." };
};

export const useDemoMode = () => IS_DEMO_MODE;

// Re-export Turbo Brain local cache architecture
export * from './turboBrain';
