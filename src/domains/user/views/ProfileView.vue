<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ProductCard from '../../catalog/components/ProductCard.vue';
import { cart } from '../../cart/store.js';

const router = useRouter();
const user = ref(null);
const recommendations = ref([]);


onMounted(async () => {
    // 1. Get user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        user.value = JSON.parse(storedUser);
    }

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
        <!-- Unified Header Style matching About/Services -->
        <div class="page-header" v-if="user">
            <h2>{{ $t('profile.welcome', { name: user.name }) }}</h2>
            <p>{{ $t('profile.welcome_sub') }}</p>
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
                <h3 class="section-title text-dark">{{ $t('profile.my_coupons') }} 🎟️</h3>
                
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
/* Page Header - Unified Flat Green Style */
.page-header {
    background-color: var(--primary-color);
    color: white;
    padding: 60px 0 60px;
    text-align: center;
    border-bottom-left-radius: 50px;
    border-bottom-right-radius: 50px;
    margin-bottom: 60px;
}

.page-header h2 {
    font-family: var(--heading-font-family);
    font-size: 2.5rem;
    font-weight: 700;
}

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
