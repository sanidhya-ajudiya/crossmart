import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '../utils/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'delivery';
  vehicleType?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string) => Promise<UserProfile>;
  loginDelivery: (email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hydrate auth state from localStorage on load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Verify session integrity with backend
          if (parsedUser.role !== 'delivery') {
            const data = await apiFetch('/auth/me');
            if (data.user) {
              const updatedUser = { ...parsedUser, ...data.user };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          }
        } catch (error) {
          console.error('Failed to restore authentication session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Standard User or Admin Login
  const login = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        bodyData: { email, password }
      });

      const profile: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(profile));
      setToken(data.token);
      setUser(profile);
      setLoading(false);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Standard User Registration
  const register = async (name: string, email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        bodyData: { name, email, password }
      });

      const profile: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(profile));
      setToken(data.token);
      setUser(profile);
      setLoading(false);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Delivery Partner Login
  const loginDelivery = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const data = await apiFetch('/delivery/login', {
        method: 'POST',
        bodyData: { email, password }
      });

      const profile: UserProfile = {
        id: data.partner._id || data.partner.id,
        name: data.partner.name,
        email: data.partner.email,
        phone: data.partner.phone,
        vehicleType: data.partner.vehicleType,
        role: 'delivery'
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(profile));
      setToken(data.token);
      setUser(profile);
      setLoading(false);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, loginDelivery, logout }}>
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
