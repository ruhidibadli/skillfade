import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
    // Check if user is admin from localStorage
    const adminFlag = localStorage.getItem('is_admin');
    setIsAdmin(adminFlag === 'true');
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await auth.login(email, password);
    const isAdminUser = (response.data as any).is_admin || false;
    localStorage.setItem('is_admin', String(isAdminUser));
    setIsAuthenticated(true);
    setIsAdmin(isAdminUser);
  };

  const logout = () => {
    auth.logout();
    localStorage.removeItem('is_admin');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout, loading }}>
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
