<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ProductCard from '../../catalog/components/ProductCard.vue';
import { authStore } from '../../auth/store.js';

const recommendations = ref([]);

// ✅ Reactive user from authStore
const user = computed(() => authStore.user);

onMounted(async () => {
    // 2. Fetch recommendations
    try {
        const res = await fetch('/api/products');
        const allProducts = await res.json();
        
        // Simple shuffle for simulation
        recommendations.value = allProducts.sort(() => 0.5 - Math.random()).slice(0, 3);
    } catch (e) {
        console.error("Error loading profile data", e);
    }
});

</script>

<template>
    <div class="page-view profile-view">
        <!-- Artisan Page Header -->
        <div class="page-header" v-if="user">
            <div class="container page-header-inner">
                <p class="page-eyebrow">✦ Dulce Fe ✦</p>
                <h2 class="page-title">{{ $t('profile.welcome', { name: user.name }) }}</h2>
                <p class="page-subtitle">{{ $t('profile.welcome_sub') }}</p>
                <div class="page-divider"></div>
            </div>
        </div>

        <div class="container profile-content">
            <!-- Section: Recommendations (Para Ti) -->
            <section class="section-block">
                <h3 class="section-title text-dark">{{ $t('profile.recommendations_title') }}</h3>
                <p class="subtitle">{{ $t('profile.recommendations_sub') }}</p>
                
                <div class="products-grid">
                    <ProductCard 
                        v-for="product in recommendations" 
                        :key="product.id" 
                        :product="product"
                    />
                </div>
            </section>

            <!-- Section: My Coupons -->
            <section class="section-block">
                <h3 class="section-title text-dark">{{ $t('profile.my_coupons') }}</h3>
                
                <div v-if="user && user.coupons && user.coupons.length > 0" class="promotions-grid">
                    <div v-for="coupon in user.coupons" :key="coupon.id" class="promo-card">
                        <div class="promo-content">
                            <h4>{{ (coupon.value * 100).toFixed(0) }}% OFF</h4>
                            <p>{{ coupon.desc }}</p>
                            <div class="promo-code">
                                 {{ coupon.code }}
                            </div>
                            <span class="expiry-note" v-if="coupon.expiry">Vence: {{ new Date(coupon.expiry).toLocaleDateString() }}</span>
                        </div>
                        <div class="circles"></div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <p>{{ $t('profile.no_coupons') }}</p>
                    <RouterLink to="/menu" class="btn-link">Ir a pedir algo</RouterLink>
                </div>
            </section>
        </div>
    </div>
</template>

<style scoped>
/* ── Page Header ──────────────────────────────────────── */
.page-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    padding: 48px 0 44px;
    text-align: center;
    position: relative;
    overflow: hidden;
    border-bottom: 3px solid var(--accent-color);
    margin-bottom: 50px;
}

.page-header::after {
    content: 'Dulce Fe';
    position: absolute;
    right: 4%;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--heading-font-family);
    font-size: 7rem;
    font-style: italic;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.05);
    pointer-events: none;
    white-space: nowrap;
    line-height: 1;
}

.page-header-inner {
    position: relative;
    z-index: 1;
}

.page-eyebrow {
    font-family: var(--body-font-family);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent-color);
    margin-bottom: 14px;
}

.page-title {
    font-family: var(--heading-font-family);
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    font-weight: 700;
    color: white;
    line-height: 1.15;
    margin-bottom: 10px;
}

.page-subtitle {
    font-family: var(--body-font-family);
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.72);
    font-style: italic;
}

.page-divider { display: none; }

.profile-content {
    min-height: 60vh;
    padding-bottom: 60px;
}

.section-block {
    margin-bottom: 80px;
}

.section-title {
    font-family: var(--heading-font-family);
    font-size: 1.8rem;
    color: var(--text-color);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.subtitle {
    color: #888;
    margin-bottom: 30px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 30px;
}

/* ... Existing styles for promo cards ... */
.empty-state {
    background: #f9f8f6;
    padding: 40px;
    border-radius: 20px;
    text-align: center;
    color: #666;
}

.btn-link {
    display: inline-block;
    margin-top: 15px;
    color: var(--accent-color);
    font-weight: 700;
    text-decoration: none;
}

.promotions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
}

.promo-card {
    background: linear-gradient(135deg, var(--primary-color) 0%, #7d9685 100%);
    color: white;
    padding: 25px;
    border-radius: 15px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(105, 126, 113, 0.3);
    transition: transform 0.3s;
}

.promo-card:hover {
    transform: translateY(-5px);
}

.promo-content h4 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 10px;
}

.promo-content p {
    font-size: 0.95rem;
    margin-bottom: 20px;
    opacity: 0.9;
}

.promo-code {
    background: rgba(255,255,255,0.2);
    padding: 8px 15px;
    border-radius: 8px;
    font-family: monospace;
    font-weight: 700;
    display: inline-block;
    border: 1px dashed white;
    margin-right: 15px;
}

.circles {
    position: absolute;
    top: -20px;
    right: -20px;
    /* Standard container width instead of breakout to prevent layout issues */
    width: 100%;
    margin-bottom: 40px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
}
</style>
