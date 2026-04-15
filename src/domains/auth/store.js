import { reactive } from 'vue';

const USER_KEY  = 'dulcefe_user';
const TOKEN_KEY = 'dulcefe_token';

// ── Helpers ──────────────────────────────────────────────────────────────────
const loadUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const loadToken = () => localStorage.getItem(TOKEN_KEY) ?? null;

// ── Store ─────────────────────────────────────────────────────────────────────
export const authStore = reactive({
    user:  loadUser(),
    token: loadToken(),

    // ─── Getters ────────────────────────────────────────────────
    get isLoggedIn() {
        // More robust check: both state and direct localStorage as backup
        const hasToken = this.token || localStorage.getItem(TOKEN_KEY);
        const hasUser  = this.user  || localStorage.getItem(USER_KEY);
        return !!hasToken && !!hasUser;
    },

    get isAdmin() {
        // Robust role checking (casing and nesting)
        const u = this.user || loadUser();
        if (!u) return false;
        const role = (u.role || u.Role || '').toString().toLowerCase();
        return role === 'admin';
    },

    get displayName() {
        if (!this.user) return '';
        // Resilient access to firstName/FirstName
        const first = (this.user.firstName || this.user.FirstName || this.user.name || this.user.username || this.user.Username || '').toString().split(' ')[0];
        const last  = (this.user.lastName  || this.user.LastName || '').toString().split(' ')[0];
        return `${first} ${last}`.trim();
    },

    /** Returns the Authorization header object ready to spread into fetch options */
    get authHeaders() {
        if (!this.token) return {};
        return { 'Authorization': `Bearer ${this.token}` };
    },

    // ─── Actions ────────────────────────────────────────────────
    /**
     * Called after a successful sign-in.
     * @param {object} userData  - Full user profile from GET /api/v1/users/me
     * @param {string} token     - JWT token from sign-in response
     */
    login(userData, token) {
        this.user  = userData;
        this.token = token;
        localStorage.setItem(USER_KEY,  JSON.stringify(userData));
        localStorage.setItem(TOKEN_KEY, token);
    },

    updateUser(updatedData) {
        this.user = { ...this.user, ...updatedData };
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    },

    logout() {
        this.user  = null;
        this.token = null;
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
    }
});
