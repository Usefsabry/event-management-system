import axios, { type AxiosResponse } from 'axios';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User, Category, CreateCategoryRequest, CategoriesResponse, Event, CreateEventRequest, UpdateEventRequest, EventsResponse, EventFilters, Registration, CreateRegistrationRequest, CancelRegistrationRequest, RegistrationStatus, RegistrationsResponse, EventRegistrationsResponse } from '../types/api';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://event-management-system-p8cd.vercel.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});



export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('authToken', token);
    } else {
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('authToken');
    }
};

// Initialize token from localStorage
const savedToken = localStorage.getItem('authToken');
if (savedToken) {
    setAuthToken(savedToken);
}

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            setAuthToken(null);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Helper function to handle API responses
const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
    return response.data.data;
};

// Authentication API
export const authApi = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
        const authData = handleResponse(response);
        setAuthToken(authData.token);
        return authData;
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
        const authData = handleResponse(response);
        setAuthToken(authData.token);
        return authData;
    },

    getProfile: async (): Promise<{ user: User }> => {
        const response = await api.get<ApiResponse<{ user: User }>>('/auth/profile');
        return handleResponse(response);
    },

    logout: () => {
        setAuthToken(null);
    },
};

// Categories API
export const categoriesApi = {
    getAll: async (params?: { search?: string; page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<CategoriesResponse> => {
        const response = await api.get<ApiResponse<CategoriesResponse>>('/categories', { params });
        return handleResponse(response);
    },

    getActive: async (): Promise<{ categories: Pick<Category, '_id' | 'name' | 'description' | 'slug'>[] }> => {
        const response = await api.get<ApiResponse<{ categories: Category[] }>>('/categories/active');
        return handleResponse(response);
    },

    getById: async (id: string): Promise<{ category: Category }> => {
        const response = await api.get<ApiResponse<{ category: Category }>>(`/categories/${id}`);
        return handleResponse(response);
    },

    create: async (data: CreateCategoryRequest): Promise<{ category: Category }> => {
        const response = await api.post<ApiResponse<{ category: Category }>>('/categories', data);
        return handleResponse(response);
    },

    update: async (id: string, data: Partial<CreateCategoryRequest>): Promise<{ category: Category }> => {
        const response = await api.patch<ApiResponse<{ category: Category }>>(`/categories/${id}`, data);
        return handleResponse(response);
    },

    delete: async (id: string): Promise<{ category: Category }> => {
        const response = await api.delete<ApiResponse<{ category: Category }>>(`/categories/${id}`);
        return handleResponse(response);
    },
};

// Events API
export const eventsApi = {
    getAll: async (filters?: EventFilters): Promise<EventsResponse> => {
        const response = await api.get<ApiResponse<EventsResponse>>('/events', { params: filters });
        return handleResponse(response);
    },

    getUpcoming: async (params?: { limit?: number; category?: string }): Promise<{ events: Partial<Event>[] }> => {
        const response = await api.get<ApiResponse<{ events: Event[] }>>('/events/upcoming', { params });
        return handleResponse(response);
    },

    getMyEvents: async (params?: { status?: string; page?: number; limit?: number }): Promise<EventsResponse> => {
        const response = await api.get<ApiResponse<EventsResponse>>('/events/my-events', { params });
        return handleResponse(response);
    },

    getByCategory: async (categoryId: string, params?: { limit?: number }): Promise<{ category: Category; events: Event[] }> => {
        const response = await api.get<ApiResponse<{ category: Category; events: Event[] }>>(`/events/category/${categoryId}`, { params });
        return handleResponse(response);
    },

    getById: async (id: string): Promise<{ event: Event }> => {
        const response = await api.get<ApiResponse<{ event: Event }>>(`/events/${id}`);
        return handleResponse(response);
    },

    create: async (data: CreateEventRequest): Promise<{ event: Event }> => {
        const response = await api.post<ApiResponse<{ event: Event }>>('/events', data);
        return handleResponse(response);
    },

    update: async (id: string, data: UpdateEventRequest): Promise<{ event: Event }> => {
        const response = await api.patch<ApiResponse<{ event: Event }>>(`/events/${id}`, data);
        return handleResponse(response);
    },

    delete: async (id: string): Promise<{ deletedEvent: { _id: string; title: string; date: string } }> => {
        const response = await api.delete<ApiResponse<{ deletedEvent: any }>>(`/events/${id}`);
        return handleResponse(response);
    },
};

// Registrations API
export const registrationsApi = {
    register: async (eventId: string, data?: CreateRegistrationRequest): Promise<{ registration: Registration }> => {
        const response = await api.post<ApiResponse<{ registration: Registration }>>(`/events/${eventId}/register`, data || {});
        return handleResponse(response);
    },

    cancel: async (eventId: string, data?: CancelRegistrationRequest): Promise<{ registration: Registration }> => {
        const config: any = {
            data: data || {}
        };
        const response = await api.delete<ApiResponse<{ registration: Registration }>>(`/events/${eventId}/register`, config);
        return handleResponse(response);
    },

    getStatus: async (eventId: string): Promise<{ event: Partial<Event>; registrationInfo: RegistrationStatus }> => {
        const response = await api.get<ApiResponse<{ event: Partial<Event>; registrationInfo: RegistrationStatus }>>(`/events/${eventId}/registration-status`);
        return handleResponse(response);
    },

    getMyRegistrations: async (params?: { status?: string; page?: number; limit?: number; upcoming?: boolean }): Promise<RegistrationsResponse> => {
        const response = await api.get<ApiResponse<RegistrationsResponse>>('/registrations/my-registrations', { params });
        return handleResponse(response);
    },

    getEventRegistrations: async (eventId: string, params?: { status?: string; page?: number; limit?: number }): Promise<EventRegistrationsResponse> => {
        const response = await api.get<ApiResponse<EventRegistrationsResponse>>(`/events/${eventId}/registrations`, { params });
        return handleResponse(response);
    },

    updateStatus: async (registrationId: string, data: { status: Registration['status'] }): Promise<{ registration: Registration }> => {
        const response = await api.patch<ApiResponse<{ registration: Registration }>>(`/registrations/${registrationId}`, data);
        return handleResponse(response);
    },
};

// Health check
export const healthCheck = async (): Promise<{ message: string; timestamp: string; environment: string }> => {
    const response = await api.get<ApiResponse<{ message: string; timestamp: string; environment: string }>>('/health');
    return handleResponse(response);
};

export default api;