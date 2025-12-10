<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { cart } from '../../domains/cart/store.js';
import { catalog } from '../../domains/catalog/store.js';

const { t, locale } = useI18n();
const router = useRouter();
const isMenuOpen = ref(false);
const user = ref(null);
const searchQuery = ref('');
const showSuggestions = ref(false);

// Ensure catalog is loaded
onMounted(async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        user.value = JSON.parse(storedUser);
    }
    await catalog.fetchProducts();
});

const suggestions = computed(() => {
    if (!searchQuery.value.trim()) return [];
    return catalog.items.filter(product => 
        product.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
});

const displayName = computed(() => {
    if (!user.value) return '';
    const name = user.value.name ? user.value.name.split(' ')[0] : '';
    const lastName = user.value.lastName ? user.value.lastName.split(' ')[0] : '';
    return `${name} ${lastName}`;
});

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
    isMenuOpen.value = false;
};

const toggleLanguage = () => {
    locale.value = locale.value === 'es' ? 'en' : 'es';
};

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({ path: '/menu', query: { q: searchQuery.value } });
        searchQuery.value = ''; // Optional: clear after search
    }
};
</script>

<template>
    <header class="site-header">
        <!-- Top Row: Brand & Tools -->
        <div class="container header-top">
            <div class="logo">
                <RouterLink to="/">
                    <h1>Dulce Fe</h1>
                </RouterLink>
            </div>
            
            <div class="search-bar">
            <div class="search-bar">
                <input 
                    type="text" 
                    :placeholder="$t('header.search_placeholder')" 
                    v-model="searchQuery"
                    @keyup.enter="handleSearch"
                />
                <button class="search-btn" @click="handleSearch">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
            </div>
            </div>

            <div class="header-icons">
                <button class="icon-btn lang-btn" @click="toggleLanguage" title="Cambiar idioma">
                    {{ locale.toUpperCase() }}
                </button>
                <RouterLink :to="user ? '/cuenta' : '/login'" class="icon-btn" title="Cuenta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span v-if="user" style="margin-left: 5px; font-size: 0.8rem; font-weight: 700;">{{ displayName }}</span>
                </RouterLink>
                <RouterLink to="/carrito" class="icon-btn cart-btn-wrapper" title="Carrito">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    <span v-if="cart.totalItems > 0" class="cart-badge">{{ cart.totalItems }}</span>
                </RouterLink>
                <div class="mobile-toggle">
                     <button class="hamburger-btn" @click="toggleMenu" aria-label="Menu">
                        <span :class="{ 'open': isMenuOpen }"></span>
                        <span :class="{ 'open': isMenuOpen }"></span>
                        <span :class="{ 'open': isMenuOpen }"></span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Bottom Row: Navigation (Green Bar) -->
        <nav class="main-nav" :class="{ 'mobile-active': isMenuOpen }">
            <div class="container nav-container">
                <RouterLink to="/menu" class="special-nav-btn" @click="closeMenu">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                     {{ $t('header.menu_btn') }}
                </RouterLink>
                <!-- Navigation Links -->
                <nav class="nav-links"> <!-- hidden on mobile, shown on desktop -->
                    <RouterLink to="/" class="nav-item">{{ $t('header.home') }}</RouterLink>
                    
                    <!-- Admin Only Link -->
                    <RouterLink v-if="user && user.role === 'admin'" to="/admin" class="nav-item highlight">
                        PANEL ADMIN
                    </RouterLink>

                    <!-- User Only Links -->
                    <template v-else>
                        <RouterLink to="/nosotros" class="nav-item">{{ $t('header.about') }}</RouterLink>
                        <RouterLink v-if="user" to="/para-ti" class="nav-item">{{ $t('header.for_you') }}</RouterLink>
                        <RouterLink to="/contacto" class="nav-item">{{ $t('header.contact') }}</RouterLink>
                    </template>
                </nav>
            </div>
        </nav>
    </header>
</template>

<style scoped>
.site-header {
    background-color: var(--white);
    position: relative;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

/* Top Row */
.header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    gap: 20px;
}

.logo h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-color); /* Coral logo */
    text-decoration: none;
    line-height: 1;
}

.logo a {
    text-decoration: none;
}

.search-bar {
    flex-grow: 1;
    max-width: 500px;
    position: relative;
    display: flex;
    align-items: center;
}

.search-bar input {
    width: 100%;
    padding: 10px 20px;
    padding-right: 40px;
    border: 2px solid #e0e0e0;
    border-radius: 50px;
    font-family: var(--body-font-family);
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.3s;
}

.search-bar input:focus {
    border-color: var(--primary-color);
}

.search-btn {
    position: absolute;
    right: 15px;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
}

.header-icons {
    display: flex;
    align-items: center;
    gap: 15px;
}

.icon-btn {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    transition: color 0.3s;
    display: flex;
    align-items: center;
}

.icon-btn:hover {
    color: var(--primary-color);
}

/* Bottom Row (Nav) */
.main-nav {
    background-color: var(--white); /* Let's keep white but maybe green links? Or full green bar? */
    /* Let's Try Full Green Bar for fun look */
    background-color: var(--primary-color); 
    padding: 0;
}

.nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between; /* To separate special btn and links */
    padding: 0 20px; /* Reset internal container padding */
}

.special-nav-btn {
    background-color: var(--accent-color);
    color: white;
    padding: 15px 30px;
    font-weight: 700;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 10px;
    border-top-right-radius: 20px; /* Playful shape tab */
    font-size: 0.9rem;
    transition: background-color 0.3s;
}

.nav-links {
    display: flex;
    gap: 80px;
    margin-left: 60px;
    flex-grow: 1;
    justify-content: center;
    list-style: none;
}

.nav-links a {
    color: white;
    font-weight: 600;
    text-decoration: none;
    font-size: 0.9rem;
    padding: 10px 0;
    position: relative;
}

.nav-links a:hover {
    opacity: 0.9;
}

.nav-links a::after {
    content: '';
    position: absolute;
    bottom: 5px;
    left: 0;
    width: 0%;
    height: 2px;
    background-color: var(--accent-color);
    transition: width 0.3s;
}

.nav-links a:hover::after {
    width: 100%;
}

/* Active state for Header Icons (Top Row) - Green */
.header-icons .router-link-active {
    color: var(--primary-color) !important;
}

/* Active state for Navigation Links (Bottom Row) - Keep White/Visible */
.nav-links .router-link-active {
    color: white !important;
    font-weight: 700;
}

/* Mobile Toggle */
.mobile-toggle {
    display: none;
}

.hamburger-btn {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 24px;
    height: 18px;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 102; 
}

.hamburger-btn span {
    display: block;
    width: 100%;
    height: 2px;
    background-color: var(--text-color);
    transition: all 0.3s ease;
    border-radius: 2px;
}

/* Mobile Responsive */
@media (max-width: 900px) {
    .search-bar {
        display: none; /* Hide search on mobile for simplicity or move it */
    }
    
    .mobile-toggle {
        display: block;
    }

    .main-nav {
        position: fixed;
        top: 70px; /* Below header */
        left: 0;
        width: 100%;
        height: calc(100vh - 70px);
        background-color: var(--primary-color);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding-top: 40px;
        z-index: 99;
    }

    .main-nav.mobile-active {
        transform: translateX(0);
    }

    .nav-container {
        flex-direction: column;
        gap: 30px;
    }

    .nav-links {
        flex-direction: column;
        align-items: center;
        margin: 0;
        gap: 20px;
    }
    
    .nav-links a {
        font-size: 1.2rem;
    }

    .special-nav-btn {
        width: 100%;
        justify-content: center;
        border-radius: 50px;
    }
}

.cart-btn-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-color);
}

.cart-btn-wrapper:hover {
    color: var(--primary-color);
}

.cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: var(--accent-color);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
}

</style>
