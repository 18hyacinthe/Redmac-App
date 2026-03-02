import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { PointDeVente } from '@/types';
import api from '@/services/api';

export const [DataProvider, useData] = createContextHook(() => {
  const [points, setPoints] = useState<PointDeVente[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPointsPublic();
      setPoints(data);
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setIsLoading(false);
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
      return newPoint;
    } catch (error: any) {
      if (error.data?.duplicate) {
        throw error;
      }
      console.error('Error creating point:', error);
      return null;
    }
  };

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

  const refreshData = async () => {
    await loadPoints();
  };

  return {
    points,
    isLoading,
    addPoint,
    getStats,
    refreshData,
  };
});
