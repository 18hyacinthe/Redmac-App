import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    PointDeVente, PaginatedResponse, FiltersResponse, StatsResponse,
    CreatePointInput, User, LoginResponse, RegisterResponse,
    MyPointsResponse, RankingAgent, Voucher
} from '@/types';

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
const TOKEN_KEY = '@geocommercial_jwt_token';

console.log('🔗 API URL:', API_URL);

class GeoCommercialAPI {
    private token: string | null = null;

    // Token management
    async setToken(token: string | null) {
        this.token = token;
        if (token) {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
        }
    }

    async getToken(): Promise<string | null> {
        if (this.token) return this.token;
        try {
            this.token = await AsyncStorage.getItem(TOKEN_KEY);
        } catch (e) { /* ignore */ }
        return this.token;
    }

    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return !!token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const token = await this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'X-API-KEY': 'geocommercial_2026_access_secure_key',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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

    // ==================
    // AUTH
    // ==================

    /**
     * POST /api/auth/request-otp — Send OTP code via SMS
     */
    async requestOtp(phone_number: string): Promise<{ message: string }> {
        return this.request<{ message: string }>('/auth/request-otp', {
            method: 'POST',
            body: JSON.stringify({ phone_number }),
        });
    }

    /**
     * POST /api/auth/verify-otp — Verify OTP and login
     */
    async verifyOtp(phone_number: string, code: string): Promise<LoginResponse> {
        return this.request<LoginResponse>('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone_number, code }),
        });
    }

    /**
     * POST /api/auth/register — Create a new user account
     */
    async register(data: { email: string; password: string; name: string }): Promise<RegisterResponse> {
        return this.request<RegisterResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * POST /api/auth/login — Login with email/password
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        return this.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    /**
     * GET /api/auth/me — Get current user profile
     */
    async getMe(): Promise<User> {
        return this.request<User>('/auth/me');
    }

    /**
     * GET /api/points/my-points — Get agent's collected points + stats
     */
    async getMyPoints(params?: { page?: number; limit?: number; status?: string }): Promise<MyPointsResponse> {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.status) query.set('status', params.status);
        const qs = query.toString();
        return this.request<MyPointsResponse>(`/points/my-points${qs ? `?${qs}` : ''}`);
    }

    /**
     * GET /api/auth/vouchers — Get collected vouchers for the agent
     */
    async getVouchers(): Promise<Voucher[]> {
        return this.request<Voucher[]>('/auth/vouchers');
    }

    /**
     * POST /api/auth/vouchers/exchange — Exchange points for a voucher
     */
    async exchangeVoucher(cost: number, partner: string): Promise<{ message?: string; voucher?: Voucher }> {
        return this.request<{ message?: string; voucher?: Voucher }>('/auth/vouchers/exchange', {
            method: 'POST',
            body: JSON.stringify({ cost, partner }),
        });
    }

    /**
     * GET /api/auth/ranking — Leaderboard of agents
     */
    async getRanking(): Promise<RankingAgent[]> {
        return this.request<RankingAgent[]>('/auth/ranking');
    }

    /**
     * Logout — Clear stored token
     */
    async logout(): Promise<void> {
        await this.setToken(null);
    }
}

export const api = new GeoCommercialAPI();
export default api;
