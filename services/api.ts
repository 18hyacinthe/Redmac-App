import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3001/api';
const TOKEN_KEY = '@auth_token';

class ApiService {
    private token: string | null = null;

    async init() {
        this.token = await AsyncStorage.getItem(TOKEN_KEY);
    }

    async setToken(token: string | null) {
        this.token = token;
        if (token) {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
        }
    }

    getToken() {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

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
    // AUTH
    // ==================

    async login(email: string, password: string) {
        const result = await this.request<{
            user: any;
            access_token: string;
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        await this.setToken(result.access_token);
        return result;
    }

    async register(email: string, password: string, pseudo: string) {
        const result = await this.request<{
            user: any;
            access_token: string;
        }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, pseudo }),
        });
        await this.setToken(result.access_token);
        return result;
    }

    async getProfile() {
        return this.request<any>('/auth/profile');
    }

    async logout() {
        await this.setToken(null);
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
    // USERS (Admin)
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
    // STATS (Admin)
    // ==================

    async getStats() {
        return this.request<any>('/stats');
    }
}

export const api = new ApiService();
export default api;
