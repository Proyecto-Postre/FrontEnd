<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import Marquee from './Marquee.vue';

const openModal = inject('openModal');
const { t } = useI18n();

const handleOpenModal = () => {
    if (openModal) {
        openModal('hero');
    }
};
</script>

<template>
    <section class="hero">
        <!-- Image in public/assets -->
        <img src="/assets/ejemplo.avif" alt="Fondo de postres delicioso" class="hero-bg">
        
        <div class="container hero-content">
            <div class="hero-text">
                <h2>{{ $t('hero.title') }}</h2>
                <p>{{ $t('hero.subtitle') }}</p>
                <!-- Using button instead of a href for action -->
                <button class="btn-outline" @click.prevent="handleOpenModal">{{ $t('hero.cta') }}</button>
            </div>
        </div>
        <Marquee />
    </section>
</template>

<style scoped>
.hero {
    height: calc(100vh - 80px); /* Adjust for fixed header */
    display: flex;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    padding-top: 0; /* Handled by global app padding */
    overflow: hidden;
}

.hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
}

.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
}

.hero-content {
    z-index: 2;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    padding-left: 10%;
}

.hero-text {
    text-align: left;
    max-width: 600px;
    margin-bottom: 0;
    transform: translateY(-100px);
}

.hero-text h2 {
    font-size: 2rem;
    margin-bottom: 25px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    color: #fff;
}

.hero-text p {
    font-family: var(--heading-font-family);
    font-size: 1.2rem;
    font-weight: 400;
    margin-bottom: 35px;
    max-width: 500px;
    margin-left: 0;
    margin-right: auto;
    line-height: 1.6;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    color: #fff;
}

@media (max-width: 768px) {
    .hero-text h2 {
        font-size: 2rem;
    }
    .hero-content {
        justify-content: center;
        padding-left: 20px;
        text-align: center;
    }
    .hero-text {
        text-align: center;
        margin-left: auto;
        margin-right: auto;
    }
    .hero-text p {
        margin-left: auto;
        margin-right: auto;
    }
}
</style>
