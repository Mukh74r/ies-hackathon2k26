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
