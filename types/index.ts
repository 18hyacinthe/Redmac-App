export type PointStatus = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export type PointCategory =
  | 'EPICERIE'
  | 'KIOSQUE'
  | 'CAFE'
  | 'VENDEUR_AMBULANT'
  | 'AUTRE';

export interface PointDeVente {
  id: string;
  nom_affiche: string;
  categorie: PointCategory;
  statut: PointStatus;
  latitude: number;
  longitude: number;
  ville?: string;
  quartier?: string;
  description?: string;
  repere?: string;
  photo_url?: string;
  horaires?: string;
  validation_comment?: string;
  created_by_device_id?: string;
  created_by_nickname?: string;
  created_at: string;
  updated_at?: string;
}

export interface PointFilters {
  statut?: PointStatus | 'all';
  categorie?: PointCategory | 'all';
}

export interface AppStats {
  total: number;
  valides: number;
  enAttente: number;
  rejetes: number;
  parVille: Record<string, number>;
}
