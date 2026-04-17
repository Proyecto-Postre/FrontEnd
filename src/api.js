import { authStore } from './domains/auth/store.js';

export const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-q47c.onrender.com';

/**
 * Centered fetch helper that automatically includes Auth headers
 * and ensures the correct v1 prefix is applied if missing.
 */
export const apiFetch = async (endpoint, options = {}) => {
    let url = endpoint;
    
    // Ensure we have the base URL
    if (!url.startsWith('http')) {
        // Handle /api/v1 cleanup
        if (url.startsWith('/api') && !url.startsWith('/api/v1')) {
            url = url.replace('/api', '/api/v1');
        } else if (!url.startsWith('/api/v1')) {
            url = `/api/v1${url.startsWith('/') ? '' : '/'}${url}`;
        }
        url = `${API_BASE}${url}`;
    }

    const mergedOptions = {
        ...options,
        headers: {
            ...authStore.authHeaders,
            ...(options.headers || {})
        }
    };

    console.log(`[API] Fetching: ${url}`, mergedOptions.method || 'GET');
    return fetch(url, mergedOptions);
};
