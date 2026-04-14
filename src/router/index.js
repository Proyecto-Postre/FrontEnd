import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MenuView from '../views/MenuView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'
import { authStore } from '../domains/auth/store.js'

// ─── Guards ──────────────────────────────────────────────────────────────────

/** Requires the user to be logged in. Redirects to /login if not. */
const requireAuth = () => {
    if (!authStore.isLoggedIn) {
        return { name: 'login' };
    }
};

/** Requires the user to have the 'admin' role. Redirects to / if not. */
const requireAdmin = () => {
    if (!authStore.isLoggedIn) return { name: 'login' };
    if (!authStore.isAdmin)    return { name: 'home' };
};

/** Redirect already-logged-in users away from the login page. */
const redirectIfLoggedIn = () => {
    if (authStore.isLoggedIn) return { name: 'home' };
};

// ─── Routes ──────────────────────────────────────────────────────────────────

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/menu',
            name: 'menu',
            component: MenuView
        },
        {
            path: '/producto/:id',
            name: 'product-detail',
            component: () => import('../domains/catalog/views/ProductDetailView.vue')
        },
        {
            path: '/taller/:id',
            name: 'workshop-detail',
            component: () => import('../domains/catalog/views/WorkshopDetailView.vue')
        },
        {
            path: '/servicios',
            name: 'services',
            component: () => import('../views/ServicesView.vue')
        },
        {
            path: '/nosotros',
            name: 'about',
            component: AboutView
        },
        {
            path: '/contacto',
            name: 'contact',
            component: ContactView
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../domains/auth/views/AuthView.vue'),
            beforeEnter: redirectIfLoggedIn   // Don't show login to logged-in users
        },
        {
            path: '/para-ti',
            name: 'profile',
            component: () => import('../domains/user/views/ProfileView.vue'),
            beforeEnter: requireAuth          // Must be logged in
        },
        {
            path: '/cuenta',
            name: 'account',
            component: () => import('../domains/user/views/UserAccountView.vue'),
            beforeEnter: requireAuth          // Must be logged in
        },
        {
            path: '/carrito',
            name: 'cart',
            component: () => import('../domains/cart/views/CartView.vue')
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../domains/admin/views/AdminDashboard.vue'),
            beforeEnter: requireAdmin         // Must be admin
        },
        {
            // Catch-all: redirect unknown routes to home
            path: '/:pathMatch(.*)*',
            redirect: { name: 'home' }
        }
    ],
    scrollBehavior() {
        return { top: 0 }
    }
})

export default router
