<script setup>
import AboutSection from '../domains/brand/components/AboutSection.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
    <div class="page-view about-view">
         <div class="page-header">
            <h1>{{ t('about_view.title') }}</h1>
            <p>{{ t('about_view.subtitle') }}</p>
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
