import { PointCategory } from '@/types';

export const CATEGORIES: { value: PointCategory; label: string }[] = [
  { value: 'EPICERIE', label: 'Épicerie' },
  { value: 'KIOSQUE', label: 'Kiosque' },
  { value: 'CAFE', label: 'Café' },
  { value: 'VENDEUR_AMBULANT', label: 'Vendeur ambulant' },
  { value: 'AUTRE', label: 'Autre' },
];

export const getCategoryLabel = (category: PointCategory): string => {
  return CATEGORIES.find(c => c.value === category)?.label || category;
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'VALIDE': return 'Validé';
    case 'EN_ATTENTE': return 'En attente';
    case 'REJETE': return 'Rejeté';
    default: return status;
  }
};

export const getActivityLabel = (type: string): string => {
  switch (type) {
    case 'SUBMISSION': return 'Point ajouté';
    case 'VALIDATION_ACCEPTED': return 'Point validé';
    case 'VALIDATION_REJECTED': return 'Point rejeté';
    case 'BONUS_PHOTO': return 'Bonus photo';
    default: return type;
  }
};

export const MOROCCO_CENTER = {
  latitude: 31.7917,
  longitude: -7.0926,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export const MAX_SUBMISSIONS_PER_DAY = 10;
export const DUPLICATE_RADIUS_METERS = 30;
