import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { PointDeVente, Activity, User } from '@/types';
import { useAuth } from './AuthProvider';
import api from '@/services/api';

export const [DataProvider, useData] = createContextHook(() => {
  const { user, isGuest } = useAuth();
  const [points, setPoints] = useState<PointDeVente[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load points when user is available or guest mode
  useEffect(() => {
    if (user) {
      loadPoints();
      loadActivities();
      if (user.role === 'ADMIN') {
        loadUsers();
      }
    } else if (isGuest) {
      loadPointsPublic();
    }
  }, [user, isGuest]);

  const loadPoints = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPoints();
      setPoints(data);
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPointsPublic = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPointsPublic();
      setPoints(data);
    } catch (error) {
      console.error('Error loading public points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const data = await api.getMyActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const addPoint = async (pointData: {
    categorie: string;
    latitude: number;
    longitude: number;
    nom_affiche?: string;
    ville?: string;
    quartier?: string;
    description?: string;
    repere?: string;
    photo_url?: string;
    horaires?: string;
  }): Promise<PointDeVente | null> => {
    try {
      const newPoint = await api.createPoint(pointData);
      setPoints((prev) => [newPoint, ...prev]);
      // Reload activities to include the new SUBMISSION
      loadActivities();
      return newPoint;
    } catch (error: any) {
      if (error.data?.duplicate) {
        throw error; // Let the caller handle duplicate detection
      }
      console.error('Error creating point:', error);
      return null;
    }
  };

  const updatePoint = async (
    pointId: string,
    data: {
      nom_affiche?: string;
      description?: string;
    },
  ): Promise<boolean> => {
    try {
      const updated = await api.updatePoint(pointId, data);
      setPoints((prev) =>
        prev.map((p) => (p.id === pointId ? { ...p, ...updated } : p)),
      );
      return true;
    } catch (error) {
      console.error('Error updating point:', error);
      return false;
    }
  };

  const validatePoint = async (
    pointId: string,
    action: 'VALIDE' | 'REJETE',
    comment?: string,
  ): Promise<boolean> => {
    try {
      const updated = await api.validatePoint(pointId, action, comment);
      setPoints((prev) =>
        prev.map((p) => (p.id === pointId ? { ...p, ...updated } : p)),
      );
      // Reload activities
      loadActivities();
      return true;
    } catch (error) {
      console.error('Error validating point:', error);
      return false;
    }
  };

  const getPointsToValidate = useCallback(
    (villeAssignee?: string) => {
      return points.filter((p) => {
        if (p.statut !== 'EN_ATTENTE') return false;
        if (villeAssignee && p.ville !== villeAssignee) return false;
        return true;
      });
    },
    [points],
  );

  const getUserActivities = useCallback(
    (userId?: string) => {
      if (!userId) return activities;
      return activities.filter((a) => a.user_id === userId);
    },
    [activities],
  );

  const getStats = useCallback(() => {
    const total = points.length;
    const valides = points.filter((p) => p.statut === 'VALIDE').length;
    const enAttente = points.filter((p) => p.statut === 'EN_ATTENTE').length;
    const rejetes = points.filter((p) => p.statut === 'REJETE').length;

    const parVille: Record<string, number> = {};
    points.forEach((p) => {
      if (p.ville) {
        parVille[p.ville] = (parVille[p.ville] || 0) + 1;
      }
    });

    return { total, valides, enAttente, rejetes, parVille };
  }, [points]);

  const updateUserRole = async (userId: string, role: string): Promise<boolean> => {
    try {
      await api.updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: role as any } : u)),
      );
      return true;
    } catch (error) {
      console.error('Error updating role:', error);
      return false;
    }
  };

  const blockUser = async (userId: string, blocked: boolean): Promise<boolean> => {
    try {
      await api.blockUser(userId, blocked);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_blocked: blocked } : u)),
      );
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  };

  const refreshData = async () => {
    await Promise.all([loadPoints(), loadActivities()]);
    if (user?.role === 'ADMIN') {
      await loadUsers();
    }
  };

  return {
    points,
    activities,
    users,
    isLoading,
    addPoint,
    updatePoint,
    validatePoint,
    getPointsToValidate,
    getUserActivities,
    getStats,
    updateUserRole,
    blockUser,
    refreshData,
  };
});
