<script setup>
import { ref, computed, onMounted } from 'vue';
import ProductCard from './ProductCard.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    mode: {
        type: String,
        default: 'list', // 'list' | 'tabs'
        validator: (value) => ['list', 'tabs'].includes(value)
    }
});

const { t } = useI18n();
const categories = ['Tortas', 'Postres', 'Bebidas'];
const allCategories = ['Todos', ...categories];
const selectedCategory = ref('Todos');
const products = ref([]);
const loading = ref(true);

const fetchProducts = async () => {
    try {
        const response = await fetch('/api/products');
        products.value = await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchProducts();
});

// Helper to filter products by category (LIST MODE)
const getProductsByCategory = (category) => {
    return products.value.filter(product => product.category === category);
};

// Compute filtered products for TABS MODE
const filteredProducts = computed(() => {
    if (selectedCategory.value === 'Todos') {
        return products.value;
    }
    return products.value.filter(product => product.category === selectedCategory.value);
});

// Emulate WhatsApp order redirect
const handleOrder = (product) => {
    const message = t('catalog.order', { product: product.title });
    const url = `https://wa.me/51998265700?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};
</script>

<template>
    <section class="catalog-section" id="catalogo">
        <div class="container">
            
            <!-- HEADER: Only show title if in Tabs mode or if desired -->
            <div v-if="mode === 'tabs'" class="catalog-header">
                <h2 class="section-title">Nuestro Menú</h2>
                <div class="category-tabs">
                    <button 
                        v-for="cat in allCategories" 
                        :key="cat"
                        class="tab-btn"
                        :class="{ active: selectedCategory === cat }"
                        @click="selectedCategory = cat"
                    >
                        {{ cat }}
                    </button>
                </div>
            </div>

            <!-- MODE: LIST (Sequential Categories) -->
            <div v-if="mode === 'list'">
                 <div v-for="category in categories" :key="category" class="category-block">
                    <h3 class="category-title">{{ category }}</h3>
                    <div class="products-grid">
                        <ProductCard 
                            v-for="product in getProductsByCategory(category)" 
                            :key="product.id" 
                            :product="product"
                            @order="() => handleOrder(product)"
                        />
                    </div>
                     <div v-if="getProductsByCategory(category).length === 0" class="empty-state">
                        <p>Pronto tendremos novedades en {{ category }}.</p>
                    </div>
                </div>
            </div>

            <!-- MODE: TABS (Filtered Grid) -->
            <div v-else class="products-grid">
                  <TransitionGroup name="fade">
                    <ProductCard 
                        v-for="product in filteredProducts" 
                        :key="product.id" 
                        :product="product"
                        @order="() => handleOrder(product)"
                    />
                 </TransitionGroup>
            </div>
             <div v-if="mode === 'tabs' && filteredProducts.length === 0" class="empty-state">
                <p>No hay productos en esta categoría.</p>
            </div>

        </div>
    </section>
</template>

<style scoped>
.catalog-section {
    background-color: #f9f8f6;
    padding: 60px 0 100px; 
}

/* Header Styles (Tabs Mode) */
.catalog-header {
    text-align: center;
    margin-bottom: 60px;
}

.section-title {
    font-family: var(--heading-font-family);
    font-size: 3rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 30px;
}

.category-tabs {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
}

.tab-btn {
    padding: 10px 30px;
    border: 2px solid #e0e0e0;
    border-radius: 50px;
    background: transparent;
    font-family: var(--body-font-family);
    font-weight: 600;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tab-btn:hover {
    border-color: #D99578;
    color: #D99578;
}

.tab-btn.active {
    background-color: #D99578;
    border-color: #D99578;
    color: #fff;
}

/* Category Block Styles (List Mode) */
.category-block {
    margin-bottom: 80px; 
}

.category-block:last-child {
    margin-bottom: 0;
}

.category-title {
    font-family: var(--heading-font-family);
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 40px;
    text-align: center; 
    position: relative;
    display: inline-block;
    width: 100%;
}

.category-title::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background-color: var(--accent-color);
    margin: 15px auto 0;
    border-radius: 2px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 40px;
}

/* Animations */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.fade-leave-active {
  position: absolute;
}

@media (max-width: 768px) {
    .section-title {
        font-size: 2.5rem;
    }
    .category-title {
        font-size: 1.8rem;
    }
    .products-grid {
        grid-template-columns: 1fr;
    }
}
</style>
