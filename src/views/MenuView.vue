<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CatalogSection from '../domains/catalog/components/CatalogSection.vue';

const { t } = useI18n();

// We use keys that match locale structure: catalog.categories.[key]
// 'Todos' maps to 'todos', 'Tortas' -> 'cakes' etc.
// But current implementation of CatalogSection expects "Todos", "Tortas" string match?
// CatalogSection.vue uses: computed filteredProducts based on props.filterCategory
// If we change the value passed to CatalogSection, we must ensure CatalogSection handles it.
// Let's check CatalogSection logic later. For now, assuming UI translation is enough, but value might need to change? 
// Actually, if we translate the BUTTONS, the value passed to `activeFilter` might change to English "Cakes".
// If `CatalogSection` filters by `product.category === activeFilter`, and product.category is in Spanish in DB ("Tortas"),
// then filtering by "Cakes" will fail.
// Strategy: Keep `activeFilter` internal value as the DB value (Spanish?), or map it.
// Simpler: Just translate the LABEL.

const activeFilter = ref('Todos');
const categories = [
    { label: 'catalog.categories.todos', value: 'Todos' },
    { label: 'catalog.categories.cakes', value: 'Tortas' },
    { label: 'catalog.categories.desserts', value: 'Postres' },
    { label: 'catalog.categories.drinks', value: 'Bebidas' }
];

</script>

<template>
    <div class="page-view menu-view">
        <div class="page-header">
            <h1>{{ t('menu.title') }}</h1>
            <p>{{ t('menu.subtitle') }}</p>
        </div>

        <!-- Filter Controls -->
        <div class="container filter-container">
            <span class="filter-label">{{ t('menu.filter_by') }}</span>
            <div class="filter-buttons">
                <button 
                    v-for="cat in categories" 
                    :key="cat.value"
                    class="filter-btn"
                    :class="{ active: activeFilter === cat.value }"
                    @click="activeFilter = cat.value"
                >
                    {{ t(cat.label) }}
                </button>
            </div>
        </div>

        <CatalogSection mode="list" :filterCategory="activeFilter" />
    </div>
</template>

<style scoped>
.page-header {
    background-color: var(--primary-color);
    color: white;
    padding: 60px 0 60px; /* Top padding accounts for fixed header */
    text-align: center;
    border-bottom-left-radius: 50px;
    border-bottom-right-radius: 50px;
    margin-bottom: 40px;
}
.page-header h1 {
    font-size: 3rem;
    font-weight: 700;
}

.filter-container {
    display: flex;
    justify-content: flex-end; /* Right align as requested */
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
    padding-right: 20px; /* Adjust as needed */
}

.filter-label {
    font-weight: 600;
    color: #666;
    font-size: 0.9rem;
}

.filter-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap; /* Safe for mobile */
}

.filter-btn {
    padding: 8px 20px;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: white;
    color: #555;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.filter-btn.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    box-shadow: 0 4px 10px rgba(74, 124, 106, 0.2);
}

@media (max-width: 600px) {
    .filter-container {
        flex-direction: column;
        align-items: flex-start;
        padding-left: 20px;
    }
    .filter-buttons {
         width: 100%;
         overflow-x: auto;
         padding-bottom: 5px; /* For scrollbar space if needed */
    }
    .filter-btn {
        white-space: nowrap;
    }
}
</style>
