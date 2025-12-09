import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MenuView from '../views/MenuView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'

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
            path: '/nosotros', // Changed from /about to /nosotros for Spanish URL
            name: 'about',
            component: AboutView
        },
        {
            path: '/contacto',
            name: 'contact',
            component: ContactView
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        // Always scroll to top on route change
        return { top: 0 }
    }
})

export default router
