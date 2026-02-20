import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { User } from '@/types';
import api from '@/services/api';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      await api.init();
      const token = api.getToken();
      if (token) {
        const profile = await api.getProfile();
        setUser(profile);
      }
    } catch (error) {
      // Token expired or invalid
      await api.setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await api.login(email, password);
      setUser(result.user);
      setIsGuest(false);
      return true;
    } catch (error: any) {
      console.error('Login error:', error.message);
      return false;
    }
  };

  const register = async (email: string, password: string, pseudo: string): Promise<boolean> => {
    try {
      const result = await api.register(email, password, pseudo);
      setUser(result.user);
      setIsGuest(false);
      return true;
    } catch (error: any) {
      console.error('Register error:', error.message);
      return false;
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setIsGuest(false);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };

  const updateUserPoints = (newPoints: number) => {
    if (user) {
      setUser({ ...user, points: newPoints });
    }
  };

  return {
    user,
    isGuest,
    isLoading,
    login,
    register,
    logout,
    continueAsGuest,
    updateUserPoints,
  };
});
