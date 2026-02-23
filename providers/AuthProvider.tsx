import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';
import { User } from '@/types';

// Default user - no login required
const DEFAULT_USER: User = {
  id: 'default-user',
  email: 'user@cartema.ma',
  pseudo: 'Utilisateur',
  role: 'ADMIN',
  points: 0,
  is_blocked: false,
  created_at: new Date().toISOString(),
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (_email: string, _password: string): Promise<boolean> => {
    return true;
  };

  const register = async (_email: string, _password: string, _pseudo: string): Promise<boolean> => {
    return true;
  };

  const logout = async () => {
    // Just reset to default user
    setUser(DEFAULT_USER);
  };

  const continueAsGuest = () => {
    setUser(DEFAULT_USER);
  };

  const updateUserPoints = (newPoints: number) => {
    if (user) {
      setUser({ ...user, points: newPoints });
    }
  };

  return {
    user,
    isGuest: false,
    isLoading,
    login,
    register,
    logout,
    continueAsGuest,
    updateUserPoints,
  };
});
