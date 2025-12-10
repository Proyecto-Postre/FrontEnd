<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ProductCard from '../../catalog/components/ProductCard.vue';
import { cart } from '../../cart/store.js';

const router = useRouter();
const user = ref(null);
const recommendations = ref([]);
const recentOrders = ref([]);

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
        
        recentOrders.value = []; 
    } catch (e) {
        console.error("Error loading profile data", e);
    }
});

const promotions = [
    { id: 1, titleKey: 'promo.first_buy_title', descKey: 'promo.first_buy_desc', code: 'NUEVO15' },
    { id: 2, titleKey: 'promo.loyal_title', descKey: 'promo.loyal_desc', code: 'DULCE20' }
];

const applyPromo = (code) => {
    const success = cart.applyCoupon(code);
    if (success) {
        alert(`¡Cupón ${code} aplicado exitosamente!`);
        router.push('/menu');
    }
};
</script>

<template>
    <div class="profile-container container">
        <div class="profile-header" v-if="user">
            <h2>{{ $t('profile.welcome', { name: user.name }) }}</h2>
            <p>{{ $t('profile.welcome_sub') }}</p>
        </div>

        <!-- Section: Recommendations (Para Ti) -->
        <section class="section-block">
            <h3 class="section-title">{{ $t('profile.recommendations_title') }}</h3>
            <p class="subtitle">{{ $t('profile.recommendations_sub') }}</p>
            
            <div class="products-grid">
                <ProductCard 
                    v-for="product in recommendations" 
                    :key="product.id" 
                    :product="product"
                />
            </div>
        </section>

        <!-- Section: Promotions -->
        <section class="section-block">
            <h3 class="section-title">{{ $t('profile.promotions_title') }}</h3>
            <p class="subtitle">{{ $t('profile.promotions_sub') }}</p>

            <div class="promotions-grid">
                <div v-for="promo in promotions" :key="promo.id" class="promo-card">
                    <div class="promo-content">
                        <h4>{{ $t(promo.titleKey) }}</h4>
                        <p>{{ $t(promo.descKey) }}</p>
                        <div class="promo-code">
                             {{ $t('promo.code', { code: promo.code }) }}
                        </div>
                        <button 
                            class="btn-apply" 
                            :class="{ 'active': cart.coupon && cart.coupon.code === promo.code }"
                            :disabled="cart.coupon && cart.coupon.code === promo.code"
                            @click="applyPromo(promo.code)"
                        >
                            {{ (cart.coupon && cart.coupon.code === promo.code) ? 'En uso' : 'Usar ahora' }}
                        </button>
                    </div>
                    <div class="circles"></div>
                </div>
            </div>
        </section>

        <!-- Section: Recent Orders -->
        <section class="section-block">
            <h3 class="section-title">{{ $t('profile.recent_orders') }}</h3>
            <div v-if="recentOrders.length > 0" class="orders-list">
                <!-- Order items would go here -->
            </div>
            <div v-else class="empty-state">
                <p>{{ $t('profile.no_orders') }}</p>
                <RouterLink to="/menu" class="btn-link">{{ $t('profile.go_menu') }}</RouterLink>
            </div>
        </section>
    </div>
</template>

<style scoped>
.profile-container {
    padding: 60px 20px;
    min-height: 70vh;
}

.profile-header {
    text-align: center;
    margin-bottom: 60px;
}

.profile-header h2 {
    font-family: var(--heading-font-family);
    font-size: 2.5rem;
    color: var(--text-color);
}

.highlight {
    color: var(--primary-color);
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

/* Promotions Styles */
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

.btn-apply {
    background-color: white;
    color: var(--primary-color);
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn-apply:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.btn-apply.active {
    background-color: rgba(255, 255, 255, 0.5);
    cursor: default;
    transform: none;
    box-shadow: none;
}


.circles {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 100px;
    height: 100px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
}
</style>
