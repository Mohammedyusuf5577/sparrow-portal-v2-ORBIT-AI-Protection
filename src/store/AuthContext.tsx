import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AuthResponse } from '../types';

interface AuthContextType {
    user: AuthResponse | null;
    token: string | null;
    login: (data: AuthResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'orbit_token';
const USER_KEY = 'orbit_user';

interface Session {
    token: string | null;
    user: AuthResponse | null;
}

const EMPTY_SESSION: Session = { token: null, user: null };

/**
 * True only when the JWT carries an `exp` that is already in the past.
 * Anything unreadable is left for the server to judge (the 401 interceptor handles it).
 */
const isTokenExpired = (token: string): boolean => {
    try {
        const payload = token.split('.')[1];
        if (!payload) return false;
        const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        return typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now();
    } catch {
        return false;
    }
};

const clearStoredSession = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch {
        /* storage unavailable */
    }
};

/**
 * Restores the saved session SYNCHRONOUSLY.
 *
 * It has to be ready on the very first render: ProtectedRoute decides on that render, so restoring
 * the session later in an effect sent every page refresh to the login page.
 * Corrupted, partial or expired data is discarded so the app never keeps half a session.
 */
const readSavedSession = (): Session => {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        const rawUser = localStorage.getItem(USER_KEY);
        if (token && rawUser && !isTokenExpired(token)) {
            return { token, user: JSON.parse(rawUser) as AuthResponse };
        }
    } catch {
        /* corrupted JSON or storage blocked: fall through and start logged out */
    }
    clearStoredSession();
    return EMPTY_SESSION;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session>(readSavedSession);

    const login = useCallback((data: AuthResponse) => {
        setSession({ token: data.token, user: data });
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
    }, []);

    const logout = useCallback(() => {
        setSession(EMPTY_SESSION);
        clearStoredSession();
    }, []);

    const value = useMemo<AuthContextType>(
        () => ({ user: session.user, token: session.token, login, logout, isAuthenticated: !!session.token }),
        [session, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};