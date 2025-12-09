<script setup>
import { ref, onMounted } from 'vue';
import ProductCard from '../../catalog/components/ProductCard.vue';

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
</style>
