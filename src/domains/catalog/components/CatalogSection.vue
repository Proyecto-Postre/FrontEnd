<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import ProductCard from './ProductCard.vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { catalog } from '../store.js';

const props = defineProps({
    mode: {
        type: String,
        default: 'list', // 'list' | 'tabs' | 'featured'
        validator: (value) => ['list', 'tabs', 'featured'].includes(value)
    },
    filterCategory: {
        type: String,
        default: null
    }
});

const { t } = useI18n();
const route = useRoute();
const categories = ['Tortas', 'Postres', 'Bebidas'];
const allCategories = ['Todos', ...categories];
const selectedCategory = ref('Todos');
const searchQuery = ref('');

// Watch for URL query changes
watch(() => route.query.q, (newQ) => {
    searchQuery.value = newQ || '';
}, { immediate: true });

onMounted(async () => {
    await catalog.fetchProducts();
});

// Helper to filter products by category (LIST MODE)
const getProductsByCategory = (category) => {
    return catalog.items.filter(product => product.category === category);
};

// Computed categories to display in LIST mode
const displayedCategories = computed(() => {
    if (props.mode === 'list' && props.filterCategory && props.filterCategory !== 'Todos') {
        return [props.filterCategory];
    }
    return categories;
});

// Compute filtered products for TABS MODE & SEARCH
const filteredProducts = computed(() => {
    let result = catalog.items;

    // IF SEARCH ACTIVE: Ignore categories, search ALL items
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        return result.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query)
        );
    }

    if (props.mode === 'featured') {
        // Pure Dynamic: Sort by Sales Descending
        const sortedBySales = [...result].sort((a, b) => (b.sales || 0) - (a.sales || 0));
        
        // slice top 5
        return sortedBySales.slice(0, 5);
    }

    // IF NO SEARCH: Apply Category Filter
    if (selectedCategory.value !== 'Todos') {
        result = result.filter(product => product.category === selectedCategory.value);
    }

    return result;
});

// Recommendations when no results found
const suggestedProducts = computed(() => {
    if (!catalog.items.length) return [];
    // Shuffle and pick 3
    const shuffled = [...catalog.items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
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
            
            <!-- SEARCH MODE TITLE -->
            <div v-if="searchQuery" class="catalog-header">
                 <h2 class="section-title">{{ t('catalog.search_results') }}</h2>
            </div>

            <!-- TABS HEADER: Only show if NOT searching and in TABS mode -->
            <div v-else-if="mode === 'tabs' || mode === 'featured'" class="catalog-header">
                <h2 class="section-title">{{ mode === 'featured' ? t('catalog.featured_title') : t('catalog.title') }}</h2>
                <div v-if="mode === 'tabs'" class="category-tabs">
                    <button 
                        v-for="cat in allCategories" 
                        :key="cat"
                        class="tab-btn"
                        :class="{ active: selectedCategory === cat }"
                        @click="selectedCategory = cat"
                    >
                        {{ t(`catalog.categories.${cat.toLowerCase()}`) || cat }}
                    </button>
                </div>
            </div>

            <!-- SEARCH RESULTS MESSAGE & SUGGESTIONS -->
            <div v-if="searchQuery" class="search-results-wrapper" style="margin-bottom: 40px;">
                <p v-if="filteredProducts.length > 0" style="text-align:center; font-size:1.1rem; margin-bottom:30px;">
                    {{ t('catalog.found_matches', { count: filteredProducts.length, query: searchQuery }) }}
                </p>
                
                <div v-else class="empty-search-state" style="text-align:center;">
                    <div style="margin-bottom: 50px;">
                        <p style="font-size: 1.2rem; margin-bottom: 20px;">
                            {{ t('catalog.no_matches', { query: searchQuery }) }}
                        </p>
                        <button @click="$router.push({ query: {} })" class="btn-link" style="border:none; background:none; cursor:pointer; color:var(--primary-color); text-decoration:underline;">
                            {{ t('catalog.view_full_menu') }}
                        </button>
                    </div>

                    <!-- SUGGESTIONS SECTION -->
                    <div class="suggestions-section">
                        <h3 class="category-title" style="font-size:1.5rem;">{{ t('catalog.might_interest') }}</h3>
                        <div class="products-grid">
                            <ProductCard 
                                v-for="product in suggestedProducts" 
                                :key="'sugg-'+product.id" 
                                :product="product"
                                @order="() => handleOrder(product)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- LOADING STATE -->
            <div v-if="catalog.loading" style="text-align:center; padding: 50px;">
                <p>{{ t('catalog.loading') }}</p>
            </div>

            <!-- CONTENT DISPLAY -->
            <template v-else-if="filteredProducts.length > 0">
                
                <!-- SEARCH RESULT GRID (Overrides everything) -->
                <div v-if="searchQuery" class="products-grid">
                    <ProductCard 
                        v-for="product in filteredProducts" 
                        :key="product.id" 
                        :product="product"
                        @order="() => handleOrder(product)"
                    />
                </div>

                <!-- MODE: LIST (Sequential Categories) - Only if NO search -->
                <div v-else-if="mode === 'list'">
                     <div v-for="category in displayedCategories" :key="category" class="category-block">
                        <h3 class="category-title">{{ category }}</h3>
                        <div class="products-grid">
                            <ProductCard 
                                v-for="product in getProductsByCategory(category)" 
                                :key="product.id" 
                                :product="product"
                                @order="() => handleOrder(product)"
                            />
                        </div>
                    </div>
                </div>



                <!-- MODE: FEATURED (Grid + Button) -->
                <div v-else-if="mode === 'featured'" class="featured-wrapper">
                    <div class="products-grid featured-grid">
                        <div 
                            v-for="product in filteredProducts" 
                            :key="product.id"
                            class="featured-card-container"
                        >
                            <ProductCard 
                                :product="product"
                                @order="() => handleOrder(product)"
                            />
                        </div>
                    </div>
                     <div class="view-menu-container">
                        <RouterLink to="/menu" class="btn-primary view-menu-btn">
                            {{ t('catalog.view_menu') }}
                        </RouterLink>
                    </div>
                </div>

                <!-- MODE: TABS (Filtered Grid) - Only if NO search -->
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

            </template>
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
/* Animations */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 
   POSITION ABSOLUTE is key for the "Displacement" (Move) effect to work on siblings.
   We hide the leaving element quickly (opacity/z-index) to avoid visual collisions.
*/
.fade-leave-active {
  position: absolute;
  z-index: -1; /* Keep it behind moving items */
  width: 100%; /* Try to maintain some shape context if needed, though in grid it's tricky */
  max-width: 300px; /* Constraints to prevent exploding */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}



/* GLOBAL STYLES (Moved out of media query) */

/* FEATURED CARD CONTAINER (The Aura Host) */
.featured-card-container {
    position: relative;
    border-radius: 20px; /* Matches card radius */
    z-index: 1; /* Establishes stacking context */
}

/* The Glowing Gradient Aura */
.featured-card-container::before {
    content: "";
    position: absolute;
    inset: -5px; /* Aura extends 5px OUTSIDE the card */
    z-index: -1; /* Behind the card */
    background: linear-gradient(45deg, #FFD700, #ff5e62, #42e695, #00f2fe);
    filter: blur(15px);
    border-radius: 25px; /* Slightly larger than card */
    opacity: 0.7;
    transition: all 0.4s ease;
}

/* Hover Sync: When hovering the CONTAINER, boost the aura */
.featured-card-container:hover::before {
    opacity: 1;
    filter: blur(20px);
    inset: -8px; /* Grows slightly */
}

/* Ensure the card itself sits on top and doesn't have shadows conflicting */
.featured-grid :deep(.product-card) {
    height: 100%;
    transform: none !important; /* Disable card's internal move to handle it here if needed, or let them compose */
    transition: transform 0.4s ease;
}

/* Move both container and aura together on hover for the "Lift" effect */
.featured-card-container:hover {
    transform: translateY(-5px);
    transition: transform 0.4s ease;
}

.view-menu-container {
    width: 100%;
    display: flex;
    justify-content: center; /* Center horizontally */
    align-items: center;
    margin-top: 50px; /* More space */
    padding-bottom: 20px;
}

.view-menu-btn {
    padding: 12px 40px;
    font-size: 1.1rem;
    font-weight: 700;
}


/* MEDIA QUERY */
@media (max-width: 768px) {
    .section-title {
        font-size: 2.5rem;
    }
    .category-title {
        font-size: 1.8rem;
    }

    .products-grid {
        grid-template-columns: repeat(2, 1fr); /* 2 columns for better visibility */
        gap: 15px; /* Reduced gap for mobile */
    }
    
    .catalog-section {
        padding: 40px 0 60px;
    }
    
    .container {
        padding-left: 15px;
        padding-right: 15px;
    }
}


</style>
