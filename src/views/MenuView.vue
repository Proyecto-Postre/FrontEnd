<script setup>
import CatalogSection from '../domains/catalog/components/CatalogSection.vue';
</script>

<template>
    <div class="page-view menu-view">
        <div class="page-header">
            <h1>Nuestra Carta</h1>
            <p>Descubre el sabor de la felicidad</p>
        </div>
        <CatalogSection mode="list" />
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
</style>
