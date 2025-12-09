<script setup>
import AboutSection from '../domains/brand/components/AboutSection.vue';
</script>

<template>
    <div class="page-view about-view">
         <div class="page-header">
            <h1>Nuestra Historia</h1>
            <p>Pasión por lo dulce desde el primer día</p>
        </div>
        <AboutSection />
    </div>
</template>

<style scoped>
.page-header {
    background-color: var(--primary-color);
    color: white;
    padding: 60px 0 60px;
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
