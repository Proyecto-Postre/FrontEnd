<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CatalogSection from '../domains/catalog/components/CatalogSection.vue';

const { t } = useI18n();

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
        <!-- Artisan Page Header -->
        <div class="page-header">
            <div class="container page-header-inner">
                <p class="page-eyebrow">✦ Dulce Fe ✦</p>
                <h1 class="page-title">{{ t('menu.title') }}</h1>
                <p class="page-subtitle">{{ t('menu.subtitle') }}</p>
                <div class="page-divider"></div>
            </div>
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
/* ── Page Header ─────────────────────────────────────────── */
.page-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    padding: 48px 0 44px;
    text-align: center;
    position: relative;
    overflow: hidden;
    border-bottom: 3px solid var(--accent-color);
    margin-bottom: 0;
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
    font-size: clamp(2.2rem, 4vw, 3rem);
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

/* ── Filter Bar ──────────────────────────────────────────── */
.filter-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 14px;
    margin: 28px 0 8px;
    padding-right: 20px;
}

.filter-label {
    font-family: var(--body-font-family);
    font-weight: 600;
    color: var(--text-muted);
    font-size: 0.85rem;
}

.filter-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 7px 18px;
    border: 1.5px solid var(--border-color);
    border-radius: var(--border-radius-pill);
    background: var(--surface);
    color: var(--text-muted);
    font-family: var(--body-font-family);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
}

.filter-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: rgba(44, 85, 48, 0.05);
}

.filter-btn.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    box-shadow: 0 4px 12px rgba(44, 85, 48, 0.2);
}

@media (max-width: 600px) {
    .filter-container {
        flex-direction: column;
        align-items: flex-start;
        padding-left: 20px;
        padding-right: 20px;
    }
    .filter-buttons {
        width: 100%;
        overflow-x: auto;
        padding-bottom: 4px;
    }
    .filter-btn {
        white-space: nowrap;
    }
}
</style>
