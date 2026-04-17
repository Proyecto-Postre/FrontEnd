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
        // Backend returns "1" for Admin. In JS it might be string or number.
        const r = String(u.role ?? '').toLowerCase();
        return r === '1' || r === 'admin';
    },

    get isUser() {
        const u = this.user || loadUser();
        if (!u) return false;
        // Backend returns "0" for Customer.
        const r = String(u.role ?? '').toLowerCase();
        return r === '0' || r === 'customer' || r === 'user';
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
        if (!token) return;
        this.token = token;
        localStorage.setItem(TOKEN_KEY, token);
        this.updateUser(userData);
    },

    updateUser(data) {
        if (!data) return;
        
        // Robust field extraction (Backend PascalCase, legacy snake_case, or JS camelCase)
        const normalized = {
            id:        data.id        || data.Id        || this.user?.id,
            username:  data.username  || data.Username  || this.user?.username,
            firstName: data.firstName || data.FirstName || data.first_name || this.user?.firstName || '',
            lastName:  data.lastName  || data.LastName  || data.last_name  || this.user?.lastName  || '',
            email:     data.email     || data.Email     || data.username   || this.user?.email,
            phone:     data.phone     || data.Phone     || data.phone_number || this.user?.phone || '',
            address:   data.address   || data.Address   || this.user?.address || '',
            // Role Fix: Ensure '0' is not lost. Check for undefined explicitly.
            role:      data.role !== undefined ? data.role : 
                      (data.Role !== undefined ? data.Role : 
                      (data.user_role !== undefined ? data.user_role : this.user?.role))
        };

        // Convert role to string for consistency across the app
        if (normalized.role !== undefined && normalized.role !== null) {
            normalized.role = normalized.role.toString();
        }

        console.log('[AUTH] User data normalized:', normalized);
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
