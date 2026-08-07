import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DeepHubUser {
    userId: string;
    username: string;
    email: string;
    role: string;
    name?: string;
    age?: number;
    specialization?: string;
    primaryNode?: string;
    priority?: string;
    createdAt?: string;
    firstName?: string;
    lastName?: string;
    dob?: string;
    occupation?: string;
    profilePicture?: string;
    avatar?: string;
    provider?: 'local' | 'google';
    preferences?: {
        turboMode?: boolean;
        autoSave?: boolean;
    };
    stats?: {
        toolsUsed: number;
        lessonsGenerated: number;
        timeSaved: number;
    };
}

interface AuthContextType {
    user: DeepHubUser;
    token: string;
    login: (token: string, user: DeepHubUser) => void;
    logout: () => void;
    updateDeepHubUser: (updates: Partial<DeepHubUser>) => void;
    isLoading: boolean;
}

const DEFAULT_GUEST_USER: DeepHubUser = {
    userId: "usr_guest_01",
    username: "Guest User",
    email: "guest@deephub.ai",
    role: "admin",
    name: "Guest User",
    specialization: "AI & Engineering",
    primaryNode: "Node 1",
    priority: "High",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Guest",
    preferences: {
        turboMode: true,
        autoSave: true,
    },
    stats: {
        toolsUsed: 42,
        lessonsGenerated: 18,
        timeSaved: 120,
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setDeepHubUser] = useState<DeepHubUser>(() => {
        const storedDeepHubUser = localStorage.getItem('user');
        if (storedDeepHubUser) {
            try {
                return JSON.parse(storedDeepHubUser);
            } catch (e) {
                // Ignore parse errors
            }
        }
        return DEFAULT_GUEST_USER;
    });
    const [token, setToken] = useState<string>(() => {
        return localStorage.getItem('token') || 'bypass-token-deephub-2026';
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            localStorage.setItem('token', 'bypass-token-deephub-2026');
        }
        if (!localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(DEFAULT_GUEST_USER));
        }
    }, []);

    const login = (newToken: string, newDeepHubUser: DeepHubUser) => {
        setToken(newToken);
        setDeepHubUser(newDeepHubUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newDeepHubUser));
    };

    const logout = () => {
        setToken('bypass-token-deephub-2026');
        setDeepHubUser(DEFAULT_GUEST_USER);
        localStorage.setItem('token', 'bypass-token-deephub-2026');
        localStorage.setItem('user', JSON.stringify(DEFAULT_GUEST_USER));
    };

    const updateDeepHubUser = (updates: Partial<DeepHubUser>) => {
        const updatedDeepHubUser = { ...user, ...updates };
        setDeepHubUser(updatedDeepHubUser);
        localStorage.setItem('user', JSON.stringify(updatedDeepHubUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateDeepHubUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

