import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { PointDeVente, CreatePointInput, FiltersResponse } from '@/types';
import api from '@/services/api';

/**
 * Normalize a point from the backend API to include backward-compat aliases
 */
function normalizePoint(p: any): PointDeVente {
  return {
    ...p,
    // Aliases for backward compatibility with existing UI
    nom_affiche: p.nom || p.nom_affiche || 'Sans nom',
    ville: p.zone || p.ville || '',
    quartier: p.adresse || p.quartier || '',
    statut: p.statut_validation || p.statut || 'EN_ATTENTE',
  };
}

export const [DataProvider, useData] = createContextHook(() => {
  const [points, setPoints] = useState<PointDeVente[]>([]);
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPoints();
    loadFilters();
  }, []);

  const loadPoints = async () => {
    try {
      setIsLoading(true);
      // Load a reasonable batch — 100K+ points would crash mobile
      const response = await api.getPoints({ limit: 500, page: 1 });
      const rawPoints = response.data || [];
      setPoints(rawPoints.map(normalizePoint));
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const f = await api.getFilters();
      setFilters(f);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const addPoint = async (pointData: CreatePointInput): Promise<PointDeVente | null> => {
    try {
      const result = await api.createPoint(pointData);
      // Refresh the list to get the new point with full data
      await loadPoints();
      return normalizePoint({
        id: result.id,
        ...pointData,
        statut_validation: 'EN_ATTENTE',
        date_collecte: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error creating point:', error);
      throw error;
    }
  };

  const uploadImage = async (imageUri: string): Promise<string> => {
    try {
      const result = await api.uploadImage(imageUri);
      return result.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const [serverStats, setServerStats] = useState<any>(null);

  useEffect(() => {
    loadServerStats();
  }, []);

  const loadServerStats = async () => {
    try {
      const stats = await api.getStats();
      setServerStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getStats = useCallback(() => {
    // Use server stats if available (accurate for 100K+ points)
    if (serverStats) {
      const parVille: Record<string, number> = {};
      (serverStats.byCity || []).forEach((c: { name: string; value: number }) => {
        parVille[c.name] = c.value;
      });

      return {
        total: serverStats.total || 0,
        valides: (serverStats.total || 0) - (serverStats.pendingCount || 0),
        enAttente: serverStats.pendingCount || 0,
        rejetes: 0,
        parVille,
      };
    }

    // Fallback: compute from local points
    const total = points.length;
    const valides = points.filter((p) => p.statut === 'VALIDE').length;
    const enAttente = points.filter((p) => p.statut === 'EN_ATTENTE').length;
    const rejetes = points.filter((p) => p.statut === 'REJETE').length;

    const parVille: Record<string, number> = {};
    points.forEach((p) => {
      const city = p.zone || p.ville;
      if (city) {
        parVille[city] = (parVille[city] || 0) + 1;
      }
    });

    return { total, valides, enAttente, rejetes, parVille };
  }, [points, serverStats]);

  const refreshData = async () => {
    await loadPoints();
    await loadServerStats();
  };

  return {
    points,
    filters,
    isLoading,
    addPoint,
    uploadImage,
    getStats,
    refreshData,
  };
});
