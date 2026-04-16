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
        // Resilient role matching: handles role/Role/ROLE and 'admin'/'administrator' or index 1 from Enum
        const rawRole = u.role ?? u.Role ?? u.ROLE ?? '';
        
        // Handle numeric role index from C# Enum (1 = Admin, 0 = Customer)
        if (typeof rawRole === 'number') return rawRole === 1;
        
        const roleStr = rawRole.toString().toLowerCase().trim();
        return roleStr === 'admin' || roleStr === 'administrator';
    },

    get isUser() {
        const u = this.user || loadUser();
        if (!u) return false;
        const rawRole = u.role ?? u.Role ?? u.ROLE ?? '';
        if (typeof rawRole === 'number') return rawRole === 0;
        
        const roleStr = rawRole.toString().toLowerCase().trim();
        return roleStr === 'customer' || roleStr === 'user' || roleStr === 'client';
    },

    get userRole() {
        const u = this.user || loadUser();
        if (!u) return '';
        return (u.role || u.Role || 'customer').toString().toLowerCase();
    },

    get displayName() {
        const u = this.user || loadUser();
        if (!u) return '';
        
        // 1. Prioritize explicitly saved names
        const first = (u.firstName || u.FirstName || '').toString().trim();
        const last  = (u.lastName  || u.LastName  || '').toString().trim();
        if (first || last) return `${first} ${last}`.trim();

        // 2. Specific check for 'admin' string if it's an admin account
        if (this.isAdmin) return 'Admin';

        // 3. Fallback to name or username (any casing)
        const name = (u.name || u.Name || '').toString().trim();
        if (name) return name;

        const email = (u.email || u.Email || '').toString().trim();
        const username = (u.username || u.Username || '').toString().trim();
        const display = username || email;
        
        if (display) return display.split('@')[0]; // Return everything before @ if it's an email

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
