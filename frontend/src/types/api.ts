// Base API Response Types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Array<{
        field: string;
        message: string;
        value?: any;
    }>;
    stack?: string;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// User Types
export interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Category Types
export interface Category {
    _id: string;
    name: string;
    description?: string;
    slug: string;
    isActive: boolean;
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
}

export interface CategoriesResponse {
    categories: Category[];
    pagination: PaginationMeta & {
        totalCategories: number;
    };
}

// Event Types
export interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number;
    currentRegistrations: number;
    category: Category;
    createdBy: User;
    status: 'active' | 'cancelled' | 'completed' | 'draft';
    slug: string;
    price: number;
    isPaid: boolean;
    tags: string[];
    startTime: string;
    endTime: string;
    registrationDeadline?: string;
    isRegistrationOpen: boolean;
    createdAt: string;
    updatedAt: string;
    // Virtual fields
    availableSpots: number;
    isFull: boolean;
    canRegister: boolean;
    isUpcoming: boolean;
    isPast: boolean;
}

export interface CreateEventRequest {
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number;
    category: string;
    startTime: string;
    endTime: string;
    price?: number;
    isPaid?: boolean;
    tags?: string[];
    registrationDeadline?: string;
    isRegistrationOpen?: boolean;
}

export interface UpdateEventRequest {
    title?: string;
    description?: string;
    date?: string;
    location?: string;
    capacity?: number;
    category?: string;
    startTime?: string;
    endTime?: string;
    price?: number;
    isPaid?: boolean;
    tags?: string[];
    status?: Event['status'];
    isRegistrationOpen?: boolean;
}

export interface EventsResponse {
    events: Event[];
    pagination: PaginationMeta & {
        totalEvents: number;
    };
    filters: {
        search?: string;
        category?: string;
        status: string;
        location?: string;
        dateRange: {
            startDate?: string;
            endDate?: string;
        };
        priceRange: {
            minPrice?: string;
            maxPrice?: string;
        };
    };
}

export interface EventFilters {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
    location?: string;
    isPaid?: boolean;
    minPrice?: number;
    maxPrice?: number;
    upcoming?: boolean;
    available?: boolean;
}

// Registration Types
export interface Registration {
    _id: string;
    user: User;
    event: Event;
    status: 'confirmed' | 'cancelled' | 'waitlist' | 'attended' | 'no-show';
    registeredAt: string;
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | 'not_required';
    paymentAmount: number;
    notes?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt: string;
    updatedAt: string;
    // Virtual fields
    canCancel: boolean;
    daysUntilEvent: number;
}

export interface CreateRegistrationRequest {
    notes?: string;
}

export interface CancelRegistrationRequest {
    reason?: string;
}

export interface RegistrationStatus {
    isRegistered: boolean;
    canRegister: boolean;
    registrationStatus?: Registration['status'];
    registrationId?: string;
    canCancel: boolean;
    eventStatus: Event['status'];
    availableSpots: number;
    isFull: boolean;
    isEventOwner: boolean;
}

export interface RegistrationsResponse {
    registrations: Registration[];
    pagination: PaginationMeta & {
        totalRegistrations: number;
    };
}

export interface EventRegistrationsResponse {
    event: {
        _id: string;
        title: string;
        date: string;
        capacity: number;
        currentRegistrations: number;
    };
    registrations: Registration[];
    statistics: {
        confirmed: number;
        cancelled: number;
        waitlist: number;
        attended: number;
        noShow: number;
        total: number;
        availableSpots: number;
    };
    pagination: PaginationMeta & {
        totalRegistrations: number;
    };
}