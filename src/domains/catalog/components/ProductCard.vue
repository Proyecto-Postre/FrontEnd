<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { cart } from '../../cart/store';

const props = defineProps({
    product: {
        type: Object,
        required: true
    }
});

const isAdded = ref(false);
const router = useRouter();

const goToDetail = () => {
    router.push(`/producto/${props.product.id}`);
};

const handleOrder = (event) => {
    event.stopPropagation(); // Prevenir que abra la tarjeta al hacer click en el botón de escritorio
    cart.addToCart(props.product);
    isAdded.value = true;
    setTimeout(() => { isAdded.value = false; }, 2000);
};
</script>

<template>
    <div class="product-card" @click="goToDetail" role="button" tabindex="0">
        <!-- Image -->
        <div class="card-image">
            <img :src="product.image || '/assets/ejemplo.avif'" :alt="$t(`db_products.${product.id}.title`, product.title)" loading="lazy" />
            <span class="product-category">{{ $t(`catalog.categories.${product.category.toLowerCase()}`, product.category) }}</span>
        </div>

        <!-- Content -->
        <div class="card-content">
            <h3 class="card-title">{{ $t(`db_products.${product.id}.title`, product.title) }}</h3>
            <p class="card-price">{{ product.price }}</p>
            <p class="card-description">{{ $t(`db_products.${product.id}.desc`, product.description) }}</p>

            <button
                class="btn-agregar"
                :class="{ 'is-added': isAdded }"
                @click.stop="handleOrder"
                :disabled="isAdded"
            >
                <svg v-if="!isAdded" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {{ isAdded ? $t('catalog.added') : $t('catalog.add_to_cart') }}
            </button>
        </div>
    </div>
</template>

<style scoped>
/* ── Card Shell ────────────────────────────────────────────── */
.product-card {
    background: var(--surface);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 12px var(--shadow-color);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
}

.product-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(44, 32, 12, 0.13);
}

/* ── Image ─────────────────────────────────────────────────── */
.card-image {
    position: relative;
    height: 200px;
    background: var(--surface-alt);
    overflow: hidden;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    display: block;
}

.product-card:hover .card-image img {
    transform: scale(1.06);
}

.product-category {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(248, 244, 238, 0.92);
    backdrop-filter: blur(4px);
    color: var(--primary-color);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: var(--border-radius-pill);
    border: 1px solid var(--border-color);
}

/* ── Content ───────────────────────────────────────────────── */
.card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 8px;
}

.card-title {
    font-family: var(--heading-font-family);
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--text-color);
    line-height: 1.3;
}

.card-price {
    font-family: var(--body-font-family);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--primary-color);
    display: flex;
    align-items: baseline;
    gap: 6px;
}



.card-description {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.5;
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* ── Button ────────────────────────────────────────────────── */
.btn-agregar {
    margin-top: 6px;
    width: 100%;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius-pill);
    padding: 11px 18px;
    font-family: var(--body-font-family);
    font-size: 0.88rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background-color 0.25s ease, transform 0.2s ease;
}

.btn-agregar:hover:not(:disabled) {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
}

.btn-agregar.is-added {
    background-color: var(--accent-color);
    cursor: default;
    transform: none;
}

/* ── Mobile ────────────────────────────────────────────────── */
@media (max-width: 768px) {
    .card-image { 
        height: auto; 
        aspect-ratio: 4 / 3; 
    }

    .card-content { 
        padding: 20px 15px; 
        gap: 10px;
        align-items: center; 
        text-align: center;
    }

    .card-title { 
        font-size: 1.3rem; 
        line-height: 1.3;
    }
    
    .card-price {
        font-size: 1.2rem;
        justify-content: center;
    }

    /* Ocultamos descripción y botón porque al hacer clic lleva al detalle (estilo AliExpress simplificado) */
    .card-description {
        display: none !important;
    }

    .btn-agregar {
        display: none !important;
    }
}
</style>
