import { ApiResponse, TokenResponse, LoginRequest, RegisterRequest } from '@/shared/types/api';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

export class ApiClient {
    private baseUrl: string = '/api/v1';
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private refreshPromise: Promise<void> | null = null;

    constructor() {
        this.loadTokensFromStorage();
    }

    private loadTokensFromStorage() {
        try {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (storedAccessToken && storedRefreshToken) {
                this.accessToken = storedAccessToken;
                this.refreshToken = storedRefreshToken;
            }
        } catch (error) {
            console.warn('Failed to load tokens from localStorage:', error);
        }
    }

    async fetch<T>(
        endpoint: string,
        options: RequestInit & {
            params?: Record<string, any>;
            responseType?: 'json' | 'blob';
        } = {}
    ): Promise<T> {
        let url = `${this.baseUrl}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        // Добавляем параметры запроса
        if (options.params) {
            const searchParams = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401 && this.refreshToken) {
            try {
                await this.refreshTokens();

                // Повторяем запрос с новым токеном
                headers.Authorization = `Bearer ${this.accessToken}`;
                const retryResponse = await fetch(url, { ...options, headers });
                if (!retryResponse.ok) {
                    throw new ApiError(retryResponse.status, 'Ошибка запроса после обновления токена');
                }
                return retryResponse.json();
            } catch (error) {
                this.clearTokens();
                throw error;
            }
        }

        if (!response.ok) {
            let errorMessage = 'Ошибка запроса';
            try {
                const error = await response.json();
                errorMessage = error.message || errorMessage;
            } catch (e) {
                // Если не удалось распарсить JSON, используем текст ответа
                try {
                    errorMessage = await response.text();
                } catch (textError) {
                    // Оставляем дефолтное сообщение
                }
            }
            throw new ApiError(response.status, errorMessage);
        }

        if (options.responseType === 'blob') {
            return response.blob() as Promise<T>;
        }

        const data = await response.json();
        return {
            data: data.data || data,
            message: data.message,
        } as T;
    }

    setTokens(tokens: TokenResponse['data']) {
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        // Сохраняем в localStorage для персистентности
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    async refreshTokens(): Promise<void> {
        // Если уже идет обновление токена, ждем его завершения
        if (this.refreshPromise) {
            await this.refreshPromise;
            return;
        }

        // Создаем новый промис для обновления токена
        this.refreshPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken: this.refreshToken })
                });

                if (!response.ok) {
                    throw new ApiError(response.status, 'Ошибка обновления токена');
                }

                const { data } = await response.json();
                this.setTokens(data);
                resolve();
            } catch (error) {
                this.clearTokens();
                reject(error);
            } finally {
                this.refreshPromise = null;
            }
        });

        await this.refreshPromise;
    }

    async login(data: LoginRequest): Promise<ApiResponse<TokenResponse['data']>> {
        const response = await this.fetch<ApiResponse<TokenResponse['data']>>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setTokens(response.data);
        return response;
    }

    async register(data: RegisterRequest): Promise<ApiResponse<TokenResponse['data']>> {
        const response = await this.fetch<ApiResponse<TokenResponse['data']>>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        this.setTokens(response.data);
        return response;
    }

    async logout() {
        if (this.refreshToken) {
            try {
                await this.fetch('/auth/logout', {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken: this.refreshToken })
                });
            } catch (error) {
                // Игнорируем ошибки при logout
            }
        }
        this.clearTokens();
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
        return this.fetch<ApiResponse<{ success: boolean }>>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    // Инициализация клиента
    async initialize() {
        this.loadTokensFromStorage();
        return this.hasTokens();
    }

    // Проверка наличия токенов
    hasTokens(): boolean {
        return !!(this.accessToken && this.refreshToken);
    }
}

export const api = new ApiClient();
// Токены загружаются в конструкторе