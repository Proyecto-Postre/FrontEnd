import { reactive } from 'vue';

const USER_KEY  = 'dulcefe_user';
const TOKEN_KEY = 'dulcefe_token';

// ── Helpers ──────────────────────────────────────────────────────────────────
const loadUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw || raw === 'undefined') return null;
        return JSON.parse(raw);
    } catch (e) {
        console.error('[AUTH] Corrupted user data in localStorage, clearing...');
        localStorage.removeItem(USER_KEY);
        return null;
    }
};

const loadToken = () => {
    const t = localStorage.getItem(TOKEN_KEY);
    return (t && t !== 'undefined') ? t : null;
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const authStore = reactive({
    user:  loadUser(),
    token: loadToken(),

    // ─── Getters ────────────────────────────────────────────────
    get isLoggedIn() {
        // FOOLPROOF: Check both state and direct storage to prevent race conditions during routing
        const hasToken = !!(this.token || localStorage.getItem(TOKEN_KEY));
        const hasUser  = !!(this.user  || localStorage.getItem(USER_KEY));
        return hasToken && hasUser;
    },

    get isAdmin() {
        const u = this.user || loadUser();
        if (!u) return false;
        // Resilient role matching: handles role/Role/ROLE and 'admin'/'administrator'
        const rawRole = u.role || u.Role || u.ROLE || '';
        const roleStr = rawRole.toString().toLowerCase().trim();
        return roleStr === 'admin' || roleStr === 'administrator';
    },

    get isUser() {
        const u = this.user || loadUser();
        if (!u) return false;
        const rawRole = u.role || u.Role || u.ROLE || '';
        const roleStr = rawRole.toString().toLowerCase().trim();
        return roleStr === 'customer' || roleStr === 'user' || roleStr === 'client';
    },

    get displayName() {
        const u = this.user || loadUser();
        if (!u) return '';
        
        // 1. Prioritize firstName + lastName (case insensitive search)
        const first = (u.firstName || u.FirstName || '').toString().trim();
        const last  = (u.lastName  || u.LastName  || '').toString().trim();
        if (first || last) return `${first} ${last}`.trim();

        // 2. Fallback to name or username
        const name = (u.name || u.Name || '').toString().trim();
        if (name) return name;

        const user = (u.username || u.Username || '').toString().trim();
        if (user) return user;

        return 'Usuario';
    },

    get authHeaders() {
        const token = this.token || loadToken();
        if (!token) return {};
        return { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    },

    // ─── Actions ────────────────────────────────────────────────
    login(userData, token) {
        console.log('[AUTH] Logging in user:', userData.username, 'with role:', (userData.role || userData.Role || 'user'));
        this.user  = userData;
        this.token = token;
        localStorage.setItem(USER_KEY,  JSON.stringify(userData));
        localStorage.setItem(TOKEN_KEY, token);
    },

    updateUser(updatedData) {
        if (!updatedData) return;
        // Merge without losing existing critical info if missing in update
        this.user = { 
            ...(this.user || {}), 
            ...updatedData 
        };
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    },

    logout() {
        console.log('[AUTH] Logging out...');
        this.user  = null;
        this.token = null;
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
    }
});
