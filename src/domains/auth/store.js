import { reactive, watch } from 'vue';

const USER_KEY = 'user';

// Helper: load from localStorage safely
const loadUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const authStore = reactive({
    user: loadUser(),

    // ─── Getters ────────────────────────────────────────────────
    get isLoggedIn() {
        return !!this.user;
    },

    get isAdmin() {
        return this.user?.role === 'admin';
    },

    get displayName() {
        if (!this.user) return '';
        const first = this.user.name?.split(' ')[0] ?? '';
        const last  = this.user.lastName?.split(' ')[0] ?? '';
        return `${first} ${last}`.trim();
    },

    // ─── Actions ────────────────────────────────────────────────
    login(userData) {
        this.user = userData;
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    },

    updateUser(updatedData) {
        this.user = { ...this.user, ...updatedData };
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    },

    logout() {
        this.user = null;
        localStorage.removeItem(USER_KEY);
    }
});
