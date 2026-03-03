import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { PointDeVente, PaginatedResponse, FiltersResponse, StatsResponse, CreatePointInput } from '@/types';

// ============================================================
// 🔧 BACKEND URL — MODIFIEZ ICI QUAND LE TUNNEL CHANGE
// ============================================================
// Option 1: ngrok tunnel (pour accès depuis mobile / APK)
// const BACKEND_BASE = 'https://akiko-trivial-brandon.ngrok-free.dev';
//
// Option 2: Auto-détection pour développement local
// ============================================================

function getBackendUrl(): string {
    // 🔧 Ngrok tunnel — active pour accès mobile / APK
    return 'https://akiko-trivial-brandon.ngrok-free.dev/api';

    // ⬇️ Dé-commentez ci-dessous et commentez la ligne au-dessus pour dev local
    // if (Platform.OS === 'web') {
    //     return 'http://localhost:3001/api';
    // }
    // const debuggerHost = Constants.expoConfig?.hostUri
    //     || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost
    //     || (Constants as any).manifest?.debuggerHost;
    // if (debuggerHost) {
    //     const ip = debuggerHost.split(':')[0];
    //     return `http://${ip}:3001/api`;
    // }
    // if (Platform.OS === 'android') {
    //     return 'http://10.0.2.2:3001/api';
    // }
    // return 'http://localhost:3001/api';
}

const API_URL = getBackendUrl();

console.log('🔗 API URL:', API_URL);

class GeoCommercialAPI {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            // ngrok free tier requires this header to skip the warning page
            'ngrok-skip-browser-warning': 'true',
            // API Key for write operations (POST, PATCH)
            'X-API-KEY': 'geocommercial_2026_access_secure_key',
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

    // Helper to upload as multipart (no Content-Type header, let browser set it)
    private async uploadRequest<T>(
        endpoint: string,
        formData: FormData,
    ): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            body: formData,
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'X-API-KEY': 'geocommercial_2026_access_secure_key',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'Erreur upload',
                data,
            };
        }

        return data as T;
    }

    // ==================
    // POINTS
    // ==================

    /**
     * GET /api/points — Paginated list with filters
     */
    async getPoints(params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        zone?: string;
        type?: string;
        export?: string;
    }): Promise<PaginatedResponse> {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.search) query.set('search', params.search);
        if (params?.category) query.set('category', params.category);
        if (params?.zone) query.set('zone', params.zone);
        if (params?.type) query.set('type', params.type);
        if (params?.export) query.set('export', params.export);

        const qs = query.toString();
        return this.request<PaginatedResponse>(`/points${qs ? `?${qs}` : ''}`);
    }

    /**
     * GET /api/points — Get ALL points (export mode, no pagination)
     */
    async getAllPoints(): Promise<PointDeVente[]> {
        const res = await this.request<any>('/points?export=true&limit=10000');
        // export mode might return { data: [...] } or just [...]
        return Array.isArray(res) ? res : (res.data || []);
    }

    /**
     * POST /api/points — Create a new point
     */
    async createPoint(data: CreatePointInput): Promise<{ message: string; id: number }> {
        return this.request<{ message: string; id: number }>('/points', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * GET /api/points/filters — Get distinct filter values
     */
    async getFilters(): Promise<FiltersResponse> {
        return this.request<FiltersResponse>('/points/filters');
    }

    /**
     * POST /api/points/upload — Upload an image
     */
    async uploadImage(imageUri: string): Promise<{ imageUrl: string }> {
        const formData = new FormData();

        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri: imageUri,
            name: filename,
            type: mimeType,
        } as any);

        return this.uploadRequest<{ imageUrl: string }>('/points/upload', formData);
    }

    /**
     * PATCH /api/points/:id/status — Update validation status
     */
    async updatePointStatus(id: number, status: string): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/points/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    // ==================
    // STATS
    // ==================

    /**
     * GET /api/points/stats — Global statistics
     */
    async getStats(): Promise<StatsResponse> {
        return this.request<StatsResponse>('/points/stats');
    }

    // ==================
    // CHAT
    // ==================

    /**
     * POST /api/chat — Send a message to the AI assistant
     */
    async sendChatMessage(
        message: string,
        history?: { role: string; content: string }[],
    ): Promise<{ content: string; isLocal: boolean }> {
        return this.request<{ content: string; isLocal: boolean }>('/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history: history || [] }),
        });
    }
}

export const api = new GeoCommercialAPI();
export default api;
