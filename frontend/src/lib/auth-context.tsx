'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User;
}

const defaultUser: User = {
    id: '1',
    name: 'Admin',
    email: 'admin@dhimahi.com',
    role: 'ADMIN',
};

const AuthContext = createContext<AuthContextType>({
    user: defaultUser,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <AuthContext.Provider value={{ user: defaultUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
