import React, { createContext, useContext } from 'react';

export interface AuthContextType {
    checkPermission: (permission?: string | string[]) => boolean;
    checkRole: (role?: string | string[]) => boolean;
}

const defaultAuthContext: AuthContextType = {
    checkPermission: () => true, // 默认有权限
    checkRole: () => true,       // 默认有角色
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{
    children: React.ReactNode;
    value: AuthContextType;
}> = ({ children, value }) => {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
