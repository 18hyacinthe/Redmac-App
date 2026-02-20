export type UserRole = 'UTILISATEUR' | 'KAMDEM' | 'ADMIN';

export type PointStatus = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export type PointCategory =
  | 'EPICERIE'
  | 'KIOSQUE'
  | 'CAFE'
  | 'VENDEUR_AMBULANT'
  | 'AUTRE';

export interface User {
  id: string;
  email: string;
  pseudo: string;
  role: UserRole;
  points: number;
  ville_assignee?: string;
  created_at: string;
  is_blocked: boolean;
}

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
  created_by_user_id?: string;
  created_by?: {
    id: string;
    pseudo: string;
  };
  validated_by_user_id?: string;
  validated_by?: {
    id: string;
    pseudo: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface Activity {
  id: string;
  type: 'SUBMISSION' | 'VALIDATION_ACCEPTED' | 'VALIDATION_REJECTED' | 'BONUS_PHOTO';
  delta_points: number;
  user_id: string;
  point_id?: string;
  point?: {
    id: string;
    nom_affiche: string;
    categorie: PointCategory;
  };
  created_at: string;
}

export interface PointFilters {
  statut?: PointStatus | 'all';
  categorie?: PointCategory | 'all';
}
