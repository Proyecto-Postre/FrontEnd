<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { workshopStore } from '../workshopStore.js';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const workshop = ref(null);

onMounted(() => {
    const wId = route.params.id;
    const found = workshopStore.getWorkshopById(wId);
    if (found) {
        workshop.value = found;
    } else {
        router.push('/servicios');
    }
});

const goBack = () => {
    router.back();
};

const handleJoin = () => {
    if (!workshop.value) return;
    const text = `Hola! Quiero inscribirme al taller (Workshop): *${workshop.value.title}* del ${workshop.value.date}.`;
    window.open(`https://wa.me/51998265700?text=${encodeURIComponent(text)}`, '_blank');
};
</script>

<template>
    <div class="page-view workshop-detail-view" v-if="workshop">
        
        <!-- Main Image Header -->
        <div class="workshop-header">
            <button class="back-button" @click="goBack" aria-label="Volver">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div class="image-wrapper" :style="{ backgroundImage: `url(${workshop.image})` }"></div>
        </div>

        <!-- Workshop Content -->
        <div class="container workshop-content">
            <div class="info-card">
                <div class="meta-tags">
                    <span class="tag date-tag">📅 {{ workshop.date }}</span>
                    <span class="tag time-tag">🕒 {{ workshop.time }}</span>
                </div>
                
                <h1 class="workshop-title">{{ workshop.title }}</h1>
                <p class="workshop-price">{{ workshop.price }}</p>
                
                <div class="divider"></div>
                
                <div class="description-block">
                    <h3>Detalles del Taller</h3>
                    <p>{{ workshop.description }}</p>
                </div>
                
                <button class="btn-primary join-desktop" @click="handleJoin">Inscribirme ahora</button>
            </div>
        </div>

        <!-- Mobile Sticky Action Bar -->
        <div class="mobile-action-bar">
            <div class="price-info">
                <strong>{{ workshop.price }}</strong>
            </div>
            <button class="btn-primary" @click="handleJoin">Inscribirme</button>
        </div>
    </div>
</template>

<style scoped>
.workshop-detail-view {
    background-color: var(--surface-alt);
    min-height: 100vh;
    padding-bottom: 90px;
}

.workshop-header {
    position: relative;
    width: 100%;
    height: 40vh;
    min-height: 300px;
    background-color: var(--border-color);
}

.image-wrapper {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    position: relative;
}

.image-wrapper::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.4) 100%);
}

.back-button {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    color: var(--text-color);
    transition: transform 0.2s, background 0.2s;
}

.back-button:hover {
    background: white;
    transform: scale(1.05);
}

.workshop-content {
    margin-top: -60px;
    position: relative;
    z-index: 5;
    display: flex;
    justify-content: center;
}

.info-card {
    background: var(--surface);
    width: 100%;
    max-width: 800px;
    border-radius: var(--border-radius-lg);
    padding: 40px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.08);
}

.meta-tags {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.tag {
    background: var(--bg-color);
    padding: 6px 14px;
    border-radius: var(--border-radius-pill);
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

.workshop-title {
    font-family: var(--heading-font-family);
    font-size: 2.2rem;
    color: var(--primary-color);
    margin-bottom: 15px;
    line-height: 1.2;
}

.workshop-price {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--accent-color);
    margin-bottom: 30px;
}

.divider {
    height: 1px;
    background: var(--border-color);
    margin: 30px 0;
}

.description-block h3 {
    font-family: var(--heading-font-family);
    font-size: 1.4rem;
    margin-bottom: 15px;
    color: var(--text-color);
}

.description-block p {
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--text-muted);
}

.join-desktop {
    margin-top: 40px;
    width: 100%;
    font-size: 1.1rem;
    padding: 16px;
}

/* Mobile Sticky Action Bar */
.mobile-action-bar {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    padding: 15px 20px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    z-index: 100;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border-color);
}

.price-info {
    display: flex;
    flex-direction: column;
}

.price-info span {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
}

.price-info strong {
    font-size: 1.25rem;
    color: var(--accent-color);
    font-weight: 800;
}

.mobile-action-bar .btn-primary {
    padding: 12px 24px;
    font-size: 0.95rem;
}

@media (max-width: 768px) {
    .workshop-header {
        height: 35vh;
        border-radius: 0 0 20px 20px;
        overflow: hidden;
    }
    
    .info-card {
        padding: 30px 20px;
        border-radius: 20px;
        box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
    }
    
    .workshop-title { font-size: 1.8rem; }
    
    .join-desktop { display: none; }
    .mobile-action-bar { display: flex; }
    .workshop-detail-view { padding-bottom: 80px; }
}
</style>
