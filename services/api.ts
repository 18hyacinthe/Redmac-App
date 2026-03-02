import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

function getApiUrl(): string {
    if (Platform.OS === 'web') {
        return 'http://localhost:3001/api';
    }

    const debuggerHost = Constants.expoConfig?.hostUri
        || Constants.manifest2?.extra?.expoGo?.debuggerHost
        || Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:3001/api`;
    }

    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3001/api';
    }

    return 'http://localhost:3001/api';
}

const API_URL = getApiUrl();
const DEVICE_ID_KEY = '@cartema_device_id';

class CarteMaAPI {
    private deviceId: string | null = null;

    private async getDeviceId(): Promise<string> {
        if (this.deviceId) return this.deviceId;
        try {
            this.deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        } catch (e) {
            // ignore
        }
        return this.deviceId || 'anonymous';
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const deviceId = await this.getDeviceId();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Device-Id': deviceId,
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
                message: data.message || 'An error occurred',
                data,
            };
        }

        return data as T;
    }

    // ==================
    // PUBLIC ENDPOINTS
    // ==================

    async getPointsPublic() {
        return this.request<any[]>('/points/public');
    }

    async getPoint(id: string) {
        return this.request<any>(`/points/${id}`);
    }

    async getStats() {
        return this.request<any>('/stats');
    }

    // ==================
    // ANONYMOUS CONTRIBUTION
    // ==================

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
}

export const api = new CarteMaAPI();
export default api;
