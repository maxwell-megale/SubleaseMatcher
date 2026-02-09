// API Client for Sublease Matcher Backend
// Base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// ============================================================================
// TypeScript Types (matching backend DTOs)
// ============================================================================

export interface SeekerProfile {
    id: string;
    userId: string;
    bio: string | null;
    available_from: string | null;
    available_to: string | null;
    budgetMin: string | null;  // Decimal as string
    budgetMax: string | null;  // Decimal as string
    city: string | null;
    interests: string[];
    major?: string | null;
    photos?: string[];
    contactEmail: string | null;
    hidden: boolean | null;
}

export interface HostListing {
    id: string;
    hostId: string;
    title: string | null;
    pricePerMonth: string | null;  // Decimal as string
    city: string | null;
    state: string | null;
    availableFrom: string | null;
    availableTo: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'UNLISTED';
    contactEmail?: string | null;
    bio?: string | null;
    photos?: string[];
    roommates?: Roommate[];
}

export interface Roommate {
    id?: string;
    name?: string | null;
    sleepingHabits?: string | null;
    interests?: string[];
    photo_url?: string | null;
    pronouns?: string | null;
    gender?: string | null;
    studyHabits?: string | null;
    cleanliness?: string | null;
    bio?: string | null;
    major?: string | null;
}

export interface SeekerQueueItem {
    id: string;
    bio: string | null;
    term: string | null;
    termYear: number | null;
    budgetMin: string | null;
    budgetMax: string | null;
    city: string | null;
    available_from: string | null;
    available_to: string | null;
    name?: string | null;
    major?: string | null;
    interests?: string[];
    photos?: string[];
}

export interface UserProfile {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string | null;
    show_in_swipe?: boolean | null;
    email_notifications_enabled?: boolean | null;
}

export interface AuthResponse {
    token: string;
    user: UserProfile;
}

export interface ListingQueueItem {
    id: string;
    title: string | null;
    city: string | null;
    state: string | null;
    pricePerMonth: string | null;
    status: 'DRAFT' | 'PUBLISHED' | 'UNLISTED' | null;
    availableFrom: string | null;
    availableTo: string | null;
    bio?: string | null;
    interests?: string[];
    photos?: string[];
    roommates?: Roommate[];
}

export interface Match {
    id: string;
    seeker_id: string;
    listing_id: string;
    status: 'PENDING' | 'MUTUAL';
    score: number | null;
    matched_at: string | null;
    target_profile?: SeekerQueueItem | ListingQueueItem | null;
}

// ============================================================================
// Core HTTP Functions
// ============================================================================

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

// ============================================================================
// API Client - Organized by Feature
// ============================================================================

export const apiClient = {
    // Seeker Profile Management
    seekers: {
        getMyProfile: (token: string) =>
            request<SeekerProfile>('/seekers/me/profile', {}, token),

        updateMyProfile: (token: string, profile: Partial<SeekerProfile>) =>
            request<SeekerProfile>('/seekers/me/profile', {
                method: 'PUT',
                body: JSON.stringify(profile),
            }, token),

        hideProfile: (token: string, hidden: boolean) =>
            request<{ hidden: boolean }>('/profiles/hide', {
                method: 'PATCH',
                body: JSON.stringify({ hidden }),
            }, token),
    },

    // Host Listing Management
    listings: {
        getMyListing: (token: string) =>
            request<HostListing>('/hosts/me/listing', {}, token),

        updateMyListing: (token: string, listing: Partial<HostListing>) =>
            request<HostListing>('/hosts/me/listing', {
                method: 'PUT',
                body: JSON.stringify(listing),
            }, token),

        publishListing: (token: string, listingId: string) =>
            request<HostListing>(`/listings/${listingId}/publish`, {
                method: 'PATCH',
            }, token),
    },

    // Auth
    auth: {
        register: (payload: { email: string; password: string; firstName?: string; lastName?: string }) =>
            request<AuthResponse>('/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload),
            }),

        login: (credentials: { email: string; password: string }) =>
            request<AuthResponse>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            }),

        logout: () =>
            request('/auth/logout', {
                method: 'POST',
            }),
    },

    // User Settings
    users: {
        getMe: (token: string) =>
            request<UserProfile>('/users/me', {}, token),

        updateMe: (token: string, data: { show_in_swipe?: boolean; email_notifications_enabled?: boolean }) =>
            request<UserProfile>('/users/me', {
                method: 'PATCH',
                body: JSON.stringify(data),
            }, token),
    },

    // Swipe Queues (for displaying profiles to swipe on)
    swipes: {
        getSeekerQueue: (token: string) =>
            request<ListingQueueItem[]>('/swipe/queue/seeker', {}, token),

        getHostQueue: (token: string) =>
            request<SeekerQueueItem[]>('/swipe/queue/host', {}, token),

        recordSwipe: (token: string, targetId: string, decision: 'like' | 'pass') =>
            request('/swipe/swipes', {
                method: 'POST',
                body: JSON.stringify({ targetId, decision }),
            }, token),

        undoSwipe: (token: string) =>
            request('/swipe/swipes/undo', {
                method: 'POST',
            }, token),
    },

    // Matches
    matches: {
        getMyMatches: (token: string) =>
            request<Match[]>('/matches', {}, token),
    },

    // Health Check
    health: {
        check: () => request<{ status: string; app_name: string }>('/healthz'),
    },
};
