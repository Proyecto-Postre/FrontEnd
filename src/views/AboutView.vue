<script setup>
import AboutSection from '../domains/brand/components/AboutSection.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
    <div class="page-view about-view">
        <div class="page-header">
            <div class="container page-header-inner">
                <p class="page-eyebrow">✦ Dulce Fe ✦</p>
                <h1 class="page-title">{{ t('about_view.title') }}</h1>
                <p class="page-subtitle">{{ t('about_view.subtitle') }}</p>
                <div class="page-divider"></div>
            </div>
        </div>
        <AboutSection />
    </div>
</template>

<style scoped>
.page-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    padding: 48px 0 44px;
    text-align: center;
    position: relative;
    overflow: hidden;
    border-bottom: 3px solid var(--accent-color);
    margin-bottom: 0;
}

/* Ghost decorative text */
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

@media (max-width: 900px) {
    .page-header::after {
        display: none;
    }
}
</style>
