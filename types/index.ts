export type PointStatus = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export type PointCategory = string;

export interface PointDeVente {
  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  categorie: string;
  type: string;
  zone: string;
  image_url?: string | null;
  source: string;
  collecteur_id?: number | null;
  statut_validation: PointStatus;
  date_collecte: string;
  updated_at?: string;

  // Aliases for backward compatibility with existing UI code
  nom_affiche?: string;
  ville?: string;
  quartier?: string;
  statut?: PointStatus;
  description?: string;
}

export interface PaginatedResponse {
  data: PointDeVente[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FiltersResponse {
  categories: string[];
  zones: string[];
  types: string[];
}

export interface StatsResponse {
  total: number;
  byType: { name: string; value: number }[];
  byCity: { name: string; value: number }[];
  zonesCount: number;
  recent: PointDeVente[];
  pendingCount: number;
  agentsCount: number;
}

export interface PointFilters {
  statut?: PointStatus | string | null;
  categorie?: string | null;
}

export interface AppStats {
  total: number;
  valides: number;
  enAttente: number;
  rejetes: number;
  parVille: Record<string, number>;
}

export interface CreatePointInput {
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  categorie?: string;
  type?: string;
  zone?: string;
  image_url?: string;
  source?: string;
}
