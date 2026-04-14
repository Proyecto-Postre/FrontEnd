<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { catalog } from '../store';
import { cart } from '../../cart/store';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const product = ref(null);
const isAdded = ref(false);

onMounted(async () => {
    // If we haven't loaded items, fetch them first
    if (!catalog.items || catalog.items.length === 0) {
        await catalog.fetchProducts();
    }
    
    // Find the product by ID from route
    const id = route.params.id;
    const found = catalog.items.find(p => p.id == id);
    if (found) {
        product.value = found;
    } else {
        // Handle not found
        router.push('/menu'); // fallback to menu
    }
});

const handleOrder = () => {
    if (product.value) {
        cart.addToCart(product.value);
        isAdded.value = true;
        setTimeout(() => { isAdded.value = false; }, 2000);
    }
};
</script>

<template>
    <div v-if="product" class="product-detail-view">
        <div class="detail-container">
            <!-- Breadcrumbs / Back button -->
            <button class="back-button" @click="$router.back()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                {{ t('common.back', 'Volver') }}
            </button>

            <div class="product-grid">
                <!-- Large Image -->
                <div class="image-section">
                    <img :src="product.image || '/assets/ejemplo.avif'" :alt="$t(`db_products.${product.id}.title`, product.title)" class="main-image"/>
                    <span class="detail-category">{{ $t(`catalog.categories.${product.category.toLowerCase()}`, product.category) }}</span>
                </div>

                <!-- Product Info -->
                <div class="info-section">
                    <h1 class="detail-title">{{ $t(`db_products.${product.id}.title`, product.title) }}</h1>
                    <p class="detail-price">{{ product.price }}</p>
                    
                    <div class="divider"></div>
                    
                    <h3 class="description-title">Descripción del Producto</h3>
                    <p class="detail-description">{{ $t(`db_products.${product.id}.desc`, product.description) }}</p>

                    <!-- Large Mobile-Friendly Actions -->
                    <div class="action-bar">
                        <button
                            class="btn-primary detail-add-btn"
                            :class="{ 'is-added': isAdded }"
                            @click="handleOrder"
                            :disabled="isAdded"
                        >
                            <svg v-if="!isAdded" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            {{ isAdded ? $t('catalog.added', 'Agregado') : $t('catalog.add_to_cart', 'Agregar al carrito') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="loading-state">
        <p>Cargando producto...</p>
    </div>
</template>

<style scoped>
.product-detail-view {
    padding: 60px 0;
    min-height: 80vh;
}

.detail-container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 24px;
    transition: color 0.2s;
}

.back-button:hover {
    color: var(--primary-color);
}

.product-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
    background: var(--surface);
    border-radius: var(--border-radius-lg);
    padding: 40px;
    box-shadow: 0 4px 20px var(--shadow-color);
}

.image-section {
    position: relative;
    border-radius: var(--border-radius);
    overflow: hidden;
    background: var(--surface-alt);
    aspect-ratio: 1 / 1;
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.detail-category {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(248, 244, 238, 0.95);
    color: var(--primary-color);
    padding: 8px 16px;
    border-radius: var(--border-radius-pill);
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.info-section {
    display: flex;
    flex-direction: column;
}

.detail-title {
    font-family: var(--heading-font-family);
    font-size: 2.8rem;
    color: var(--text-color);
    line-height: 1.1;
    margin-bottom: 16px;
}

.detail-price {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 30px;
}

.divider {
    height: 1px;
    background: var(--border-color);
    margin-bottom: 30px;
}

.description-title {
    font-size: 1.2rem;
    color: var(--text-color);
    margin-bottom: 12px;
}

.detail-description {
    font-size: 1.05rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 40px;
}

.detail-add-btn {
    width: 100%;
    padding: 16px;
    font-size: 1.1rem;
    border-radius: var(--border-radius-lg);
}

.detail-add-btn.is-added {
    background-color: var(--accent-color);
    border-color: var(--accent-color);
}

.loading-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60vh;
    font-size: 1.2rem;
    color: var(--text-muted);
}

/* ── Mobile Responsive ────────────────────────────────────────── */
@media (max-width: 768px) {
    .product-detail-view {
        padding: 20px 0 80px; /* Extra bottom padding for floating action bar if needed */
    }

    .detail-container {
        width: 100%; /* Edge to edge on mobile */
    }

    .back-button {
        padding-left: 20px;
    }

    .product-grid {
        grid-template-columns: 1fr;
        gap: 30px;
        padding: 0;
        box-shadow: none;
        background: transparent;
    }

    .image-section {
        border-radius: 0;
        aspect-ratio: 4/3; /* Adjust ratio for mobile */
    }

    .info-section {
        padding: 0 20px;
    }

    .detail-title {
        font-size: 2rem;
    }

    .detail-price {
        font-size: 1.4rem;
        margin-bottom: 20px;
    }

    .detail-description {
        font-size: 1rem;
        margin-bottom: 30px;
    }

    /* Fixed bottom action bar on mobile like AliExpress */
    .action-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--surface);
        padding: 15px 20px;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        z-index: 100;
        display: flex;
        justify-content: center;
    }

    .detail-add-btn {
        margin: 0;
        border-radius: var(--border-radius-pill);
    }
}
</style>
