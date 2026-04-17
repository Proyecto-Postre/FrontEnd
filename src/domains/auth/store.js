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
        return !!(this.token || localStorage.getItem(TOKEN_KEY));
    },

    get isAdmin() {
        const u = this.user || loadUser();
        if (!u) return false;
        const r = (u.role !== undefined ? u.role : (u.Role ?? u.user_role ?? '')).toString();
        return r === '1' || r.toLowerCase() === 'admin';
    },

    get isUser() {
        const u = this.user || loadUser();
        if (!u) return false;
        const r = (u.role !== undefined ? u.role : (u.Role ?? u.user_role ?? '')).toString();
        return r === '0' || r.toLowerCase() === 'customer' || r.toLowerCase() === 'user';
    },

    get displayName() {
        const u = this.user || loadUser();
        if (!u) return 'Usuario';
        
        const first = u.firstName || u.FirstName || u.first_name || '';
        const last  = u.lastName || u.LastName || u.last_name || '';
        
        if (first.trim() || last.trim()) return `${first} ${last}`.trim();
        return (u.username || u.Username || 'Usuario').split('@')[0];
    },

    get authHeaders() {
        const t = this.token || loadToken();
        return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : {};
    },

    // ─── Actions ────────────────────────────────────────────────
    login(userData, token) {
        this.token = token;
        this.updateUser(userData);
        localStorage.setItem(TOKEN_KEY, token);
    },

    updateUser(data) {
        if (!data) return;
        // Normalize fields to ensure JS consistency
        const normalized = {
            id: data.id || data.Id || this.user?.id,
            username: data.username || data.Username || this.user?.username,
            firstName: data.firstName || data.FirstName || data.first_name || this.user?.firstName,
            lastName: data.lastName || data.LastName || data.last_name || this.user?.lastName,
            email: data.email || data.Email || data.username || this.user?.email,
            phone: data.phone || data.Phone || data.phone_number || this.user?.phone,
            role: data.role !== undefined ? data.role : (data.Role !== undefined ? data.Role : this.user?.role)
        };
        this.user = normalized;
        localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    },

    logout() {
        console.log('[AUTH] Logging out...');
        this.user  = null;
        this.token = null;
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
    }
});
