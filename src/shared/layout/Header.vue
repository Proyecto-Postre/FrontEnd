<template>
    <header class="site-header">
        <!-- Top Row: Brand -->
        <div class="header-brand">
            <RouterLink to="/" class="brand-link">
                <h1 class="brand-name">Dulce Fe</h1>
            </RouterLink>
        </div>

        <!-- Bottom Row: Nav + Search + Icons -->
        <div class="header-nav-row">
            <div class="container nav-inner">

                <!-- Search Bar (Desktop) -->
                <div class="search-bar">
                    <div class="input-wrapper">
                        <SearchIcon :size="16" class="search-icon" />
                        <input
                            type="text"
                            :placeholder="$t('header.search_placeholder')"
                            v-model="searchQuery"
                            @keyup.enter="handleSearch"
                            @focus="showSuggestions = true"
                            @blur="setTimeout(() => showSuggestions = false, 200)"
                        />
                    </div>
                    <!-- Suggestions -->
                    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
                        <div
                            v-for="item in suggestions"
                            :key="item.id"
                            class="suggestion-item"
                            @click="router.push({ path: '/menu', query: { q: item.title } }); searchQuery = item.title; showSuggestions = false"
                        >
                            {{ item.title }}
                        </div>
                    </div>
                </div>

                <!-- Nav Links (Center) -->
                <nav class="nav-links" :class="{ 'mobile-active': isMenuOpen }">
                    <!-- Mobile header inside menu -->
                    <div class="mobile-menu-header">
                        <span class="brand-name-mobile">Dulce Fe</span>
                        <button class="close-menu-btn" @click="closeMenu">✕</button>
                    </div>

                    <RouterLink to="/" class="nav-item" @click="closeMenu">{{ $t('header.home') }}</RouterLink>
                    <RouterLink to="/menu" class="nav-item nav-item--featured" @click="closeMenu">{{ $t('header.menu_btn') }}</RouterLink>
                    <RouterLink to="/servicios" class="nav-item" @click="closeMenu">{{ $t('header.services') }}</RouterLink>
                    <RouterLink v-if="!authStore.isAdmin" to="/nosotros" class="nav-item" @click="closeMenu">{{ $t('header.about') }}</RouterLink>
                    <RouterLink v-if="!authStore.isAdmin" to="/contacto" class="nav-item" @click="closeMenu">{{ $t('header.contact') }}</RouterLink>
                    <RouterLink v-if="authStore.isAdmin" to="/admin" class="nav-item nav-item--admin" @click="closeMenu">PANEL DE CONTROL</RouterLink>
                    <RouterLink v-if="authStore.isLoggedIn && !authStore.isAdmin" to="/para-ti" class="nav-item" @click="closeMenu">{{ $t('header.for_you') }}</RouterLink>
                </nav>

                <!-- Right Icons -->
                <div class="header-icons-left mobile-only">
                    <!-- Language toggle -->
                    <button class="icon-btn lang-btn" @click="toggleLanguage" :title="$t('header.language')">
                        {{ locale.toUpperCase() }}
                    </button>

                    <!-- User / Auth -->
                    <template v-if="!authStore.isLoggedIn">
                        <RouterLink to="/login" class="nav-item">Iniciar</RouterLink>
                    </template>
                    <div v-else class="user-dropdown-container">
                        <button class="icon-btn" @click="isUserMenuOpen = !isUserMenuOpen">
                            <User :size="22" />
                            <span class="user-name">{{ displayName }}</span>
                        </button>
                    </div>
                </div>

                <div class="header-icons">
                    <!-- Language toggle (Desktop hidden on mobile left) -->
                    <button class="icon-btn lang-btn desktop-only" @click="toggleLanguage" :title="$t('header.language')">
                        {{ locale.toUpperCase() }}
                    </button>

                    <!-- User / Auth (Desktop) -->
                    <div v-if="!authStore.isLoggedIn" class="auth-buttons desktop-only">
                        <RouterLink to="/login" class="btn-auth-outline">Iniciar</RouterLink>
                        <RouterLink to="/registro" class="btn-auth-filled">Registrar</RouterLink>
                    </div>
                    
                    <div v-else class="user-dropdown-container desktop-only">
                        <button class="icon-btn" @click="toggleUserMenu" @blur="closeUserMenu">
                            <User :size="22" />
                            <span class="user-name">{{ displayName }}</span>
                            <ChevronDown :size="14" class="chevron" :class="{ open: isUserMenuOpen }" />
                        </button>
                        
                        <div v-if="isUserMenuOpen" class="user-dropdown-menu">
                            <RouterLink to="/cuenta" class="dropdown-item">
                                <User :size="16" />
                                Mi Perfil
                            </RouterLink>

                            <RouterLink v-if="authStore.isAdmin" to="/admin" class="dropdown-item admin-link">
                                <LayoutDashboard :size="16" />
                                Panel de Control
                            </RouterLink>

                            <button @click="handleLogout" class="dropdown-item logout">
                                <LogOut :size="16" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>

                    <!-- Cart -->
                    <RouterLink to="/carrito" class="icon-btn cart-btn" title="Carrito">
                        <ShoppingCart :size="22" />
                        <span v-if="cart.totalItems > 0" class="cart-badge">{{ cart.totalItems }}</span>
                    </RouterLink>

                    <!-- Hamburger -->
                    <button class="hamburger-btn" @click="toggleMenu" aria-label="Menu">
                        <MenuIcon v-if="!isMenuOpen" :size="24" />
                        <X v-else :size="24" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile overlay -->
        <div class="mobile-overlay" :class="{ active: isMenuOpen }" @click="closeMenu"></div>
    </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { cart } from '../../domains/cart/store.js';
import { catalog } from '../../domains/catalog/store.js';
import { authStore } from '../../domains/auth/store.js';
import { 
  Leaf, 
  Search as SearchIcon, 
  User, 
  ChevronDown, 
  ShoppingCart, 
  Menu as MenuIcon,
  X,
  LayoutDashboard,
  LogOut
} from 'lucide-vue-next';

const { t, locale } = useI18n();
const router = useRouter();
const isMenuOpen = ref(false);
const searchQuery = ref('');
const showSuggestions = ref(false);

onMounted(async () => {
    await catalog.fetchProducts();
});

const suggestions = computed(() => {
    if (!searchQuery.value.trim()) return [];
    return catalog.items.filter(product =>
        product.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    ).slice(0, 5);
});

const user = computed(() => authStore.user);
const displayName = computed(() => authStore.displayName);

const toggleMenu = () => { isMenuOpen.value = !isMenuOpen.value; };
const closeMenu  = () => { isMenuOpen.value = false; };

const isUserMenuOpen = ref(false);

const toggleUserMenu = () => { isUserMenuOpen.value = !isUserMenuOpen.value; };
const closeUserMenu  = () => { setTimeout(() => { isUserMenuOpen.value = false; }, 200); };

const handleLogout = () => {
    authStore.logout();
    router.push('/');
};

const toggleLanguage = () => {
    locale.value = locale.value === 'es' ? 'en' : 'es';
};

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({ path: '/menu', query: { q: searchQuery.value } });
        searchQuery.value = '';
        closeMenu();
    }
};
</script>

<style scoped>
/* ── Brand top bar ─────────────────────────────────────────── */
.site-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background-color: var(--surface);
    box-shadow: 0 1px 0 var(--border-color), 0 4px 20px rgba(28, 25, 23, 0.06);
}

.header-brand {
    background-color: var(--bg-color);
    border-bottom: 1px solid var(--border-color);
    text-align: center;
    padding: 14px 20px 10px;
}

.brand-link {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 12px;
}

.brand-name {
    font-family: var(--heading-font-family);
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    letter-spacing: 0.04em;
    line-height: 1;
}

.brand-leaf {
    font-size: 1rem;
    opacity: 0.7;
}

/* ── Nav row ───────────────────────────────────────────────── */
.header-nav-row {
    background-color: var(--surface);
    padding: 0;
}

.nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    height: 52px;
    padding: 0 20px;
}

/* ── Search ────────────────────────────────────────────────── */
.search-bar {
    position: relative;
    flex-shrink: 0;
    width: 220px;
}

.input-wrapper {
    display: flex;
    align-items: center;
    background: var(--bg-color);
    border: 1.5px solid var(--border-color);
    border-radius: var(--border-radius-pill);
    padding: 7px 14px;
    gap: 8px;
    transition: border-color 0.2s;
}

.input-wrapper:focus-within {
    border-color: var(--primary-color);
}

.search-icon {
    color: var(--text-muted);
    flex-shrink: 0;
}

.input-wrapper input {
    border: none;
    background: transparent;
    font-family: var(--body-font-family);
    font-size: 0.88rem;
    color: var(--text-color);
    outline: none;
    width: 100%;
}

.input-wrapper input::placeholder { color: var(--text-light); }

.suggestions-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: 0 8px 24px rgba(28, 25, 23, 0.12);
    padding: 6px 0;
    z-index: 110;
}

.suggestion-item {
    padding: 9px 16px;
    font-size: 0.9rem;
    cursor: pointer;
    color: var(--text-color);
    transition: background 0.15s;
}

.suggestion-item:hover {
    background: var(--bg-color);
    color: var(--primary-color);
}

/* ── Nav Links ─────────────────────────────────────────────── */
.nav-links {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-grow: 1;
    justify-content: center;
}

.nav-item {
    font-family: var(--body-font-family);
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--text-muted);
    padding: 6px 10px;
    border-radius: var(--border-radius-sm);
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
}

.nav-item:hover,
.nav-item.router-link-active {
    color: var(--primary-color);
    background: rgba(44, 85, 48, 0.07);
}

.nav-item--featured {
    color: var(--primary-color);
    background: rgba(44, 85, 48, 0.1);
    font-weight: 700;
}

.nav-item--admin {
    color: var(--accent-color);
}

/* ── Header Icons ──────────────────────────────────────────── */
.header-icons, .header-icons-left {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.mobile-only { display: none; }

.icon-btn {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: var(--border-radius-sm);
    font-family: var(--body-font-family);
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s, background 0.2s;
}

.icon-btn:hover { color: var(--primary-color); background: rgba(44, 85, 48, 0.07); }

.lang-btn {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    border: 1.5px solid var(--border-color);
    border-radius: 6px;
    padding: 4px 8px;
}

.user-name {
    font-size: 0.8rem;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chevron {
    transition: transform 0.3s;
    opacity: 0.5;
}
.chevron.open { transform: rotate(180deg); }

/* Drodown Menu */
.user-dropdown-container {
    position: relative;
}

.user-dropdown-menu {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    min-width: 180px;
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 1100;
    animation: dropdownPush 0.2s ease-out;
}

@keyframes dropdownPush {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    font-size: 0.88rem;
    color: var(--text-color);
    text-decoration: none;
    border-radius: var(--border-radius-sm);
    transition: all 0.2s;
    font-weight: 500;
}

.dropdown-item:hover {
    background: var(--bg-color);
    color: var(--primary-color);
}

.dropdown-item.logout {
    border: none;
    background: none;
    cursor: pointer;
    width: 100%;
    color: #c53030;
    margin-top: 4px;
    border-top: 1px solid var(--border-color);
    border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
    padding-top: 12px;
}

.dropdown-item.logout:hover {
    background: #fff5f5;
}

.cart-btn { position: relative; }

.cart-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background-color: var(--accent-color);
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid var(--surface);
}

/* ── Auth Buttons ────────────────────────────────────────── */
.auth-buttons {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-auth-outline, .btn-auth-filled {
    font-family: var(--body-font-family);
    font-size: 0.8rem;
    font-weight: 700;
    padding: 7px 16px;
    border-radius: var(--border-radius-pill);
    text-decoration: none;
    transition: all 0.2s;
    letter-spacing: 0.02em;
}

.btn-auth-outline {
    color: var(--primary-color);
    border: 1.5px solid var(--primary-color);
}

.btn-auth-outline:hover {
    background: rgba(44, 85, 48, 0.05);
}

.btn-auth-filled {
    background: var(--primary-color);
    color: white;
    border: 1.5px solid var(--primary-color);
}

.btn-auth-filled:hover {
    background: #1e3d23;
    border-color: #1e3d23;
    transform: translateY(-1px);
}

/* ── Hamburger ─────────────────────────────────────────────── */
.hamburger-btn {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 22px;
    height: 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
}

.hamburger-btn span {
    display: block;
    width: 100%;
    height: 2px;
    background-color: var(--text-color);
    border-radius: 2px;
    transition: all 0.3s ease;
}

/* ── Mobile ────────────────────────────────────────────────── */
@media (max-width: 900px) {
    .desktop-only { display: none; }
    .mobile-only { display: flex; }
    
    .nav-inner {
        justify-content: space-between;
    }

    .search-bar { display: none; }
    .hamburger-btn { display: flex; }

    .nav-links {
        position: fixed;
        top: 0;
        right: -100%;
        width: min(320px, 85vw);
        height: 100dvh;
        background: var(--surface);
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 0;
        padding: 0;
        transition: right 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
        box-shadow: -8px 0 32px rgba(28, 25, 23, 0.15);
        z-index: 200;
        overflow-y: auto;
    }

    .nav-links.mobile-active { right: 0; }

    .mobile-menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid var(--border-color);
        width: 100%;
        background: var(--bg-color);
    }

    .brand-name-mobile {
        font-family: var(--heading-font-family);
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--primary-color);
    }

    .close-menu-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--text-muted);
        padding: 4px 8px;
    }

    .nav-item {
        width: 100%;
        padding: 16px 24px;
        border-radius: 0;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.9rem;
        letter-spacing: 0.04em;
    }

    .mobile-overlay {
        position: fixed;
        inset: 0;
        background: rgba(28, 25, 23, 0.45);
        z-index: 199;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
    }

    .mobile-overlay.active {
        opacity: 1;
        pointer-events: all;
    }
}

@media (min-width: 901px) {
    .mobile-menu-header { display: none; }
    .mobile-overlay { display: none; }
}
</style>