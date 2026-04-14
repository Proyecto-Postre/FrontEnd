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
        return !!this.user && !!this.token;
    },

    get isAdmin() {
        // Backend returns role as string 'Admin' (PascalCase)
        return this.user?.role === 'Admin' || this.user?.role === 'admin';
    },

    get displayName() {
        if (!this.user) return '';
        const first = (this.user.firstName || this.user.name || '').split(' ')[0];
        const last  = (this.user.lastName  || '').split(' ')[0];
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
