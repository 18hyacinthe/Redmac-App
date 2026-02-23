import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Auto-detect the backend URL based on platform
function getApiUrl(): string {
    // On web, localhost works fine
    if (Platform.OS === 'web') {
        return 'http://localhost:3001/api';
    }

    // On mobile (Android/iOS), we need the machine's IP
    // Expo provides the debugger host which contains the IP
    const debuggerHost = Constants.expoConfig?.hostUri
        || Constants.manifest2?.extra?.expoGo?.debuggerHost
        || Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:3001/api`;
    }

    // Fallback — try 10.0.2.2 for Android emulator (points to host machine)
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3001/api';
    }

    return 'http://localhost:3001/api';
}

const API_URL = getApiUrl();

console.log('🔗 API URL:', API_URL);

class ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'Une erreur est survenue',
                data,
            };
        }

        return data as T;
    }

    // ==================
    // POINTS DE VENTE
    // ==================

    async getPoints() {
        return this.request<any[]>('/points');
    }

    async getPointsPublic() {
        return this.request<any[]>('/points/public');
    }

    async getPoint(id: string) {
        return this.request<any>(`/points/${id}`);
    }

    async createPoint(data: {
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
    }) {
        return this.request<any>('/points', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updatePoint(
        id: string,
        data: {
            nom_affiche?: string;
            description?: string;
            repere?: string;
            horaires?: string;
            photo_url?: string;
        },
    ) {
        return this.request<any>(`/points/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async validatePoint(
        id: string,
        action: 'VALIDE' | 'REJETE',
        comment?: string,
    ) {
        return this.request<any>(`/points/${id}/validate`, {
            method: 'PATCH',
            body: JSON.stringify({ action, comment }),
        });
    }

    async getPointsToValidate(ville?: string) {
        const params = ville ? `?ville=${encodeURIComponent(ville)}` : '';
        return this.request<any[]>(`/points/to-validate${params}`);
    }

    // ==================
    // ACTIVITIES
    // ==================

    async getMyActivities() {
        return this.request<any[]>('/activities/me');
    }

    // ==================
    // USERS
    // ==================

    async getUsers() {
        return this.request<any[]>('/users');
    }

    async updateUserRole(userId: string, role: string) {
        return this.request<any>(`/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        });
    }

    async blockUser(userId: string, blocked: boolean) {
        return this.request<any>(`/users/${userId}/block`, {
            method: 'PATCH',
            body: JSON.stringify({ blocked }),
        });
    }

    // ==================
    // STATS
    // ==================

    async getStats() {
        return this.request<any>('/stats');
    }
}

export const api = new ApiService();
export default api;
