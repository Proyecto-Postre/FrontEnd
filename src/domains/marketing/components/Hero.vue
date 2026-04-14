<script setup>
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import Marquee from './Marquee.vue';

const openModal = inject('openModal');
const { t } = useI18n();

const handleOpenModal = () => {
    if (openModal) openModal('hero');
};
</script>

<template>
    <section class="hero">
        <!-- Split layout: image left, text right -->
        <div class="hero-inner container">
            <!-- LEFT: Image -->
            <div class="hero-image-col">
                <div class="hero-image-wrapper">
                    <img src="/assets/ejemplo.avif" alt="Postres artesanales Dulce Fe" class="hero-img" />
                    <!-- Decorative badge -->
                    <div class="hero-badge">
                        <span class="badge-icon">🎂</span>
                        <div>
                            <strong>100%</strong>
                            <span>{{ $t('hero.badge_artisan') }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT: Text -->
            <div class="hero-text-col">
                <p class="hero-eyebrow">✦ {{ $t('hero.eyebrow') }} ✦</p>
                <h1 class="hero-title">{{ $t('hero.title') }}</h1>
                <p class="hero-subtitle">{{ $t('hero.subtitle') }}</p>
                <div class="hero-actions">
                    <RouterLink to="/menu" class="btn-primary">
                        {{ $t('hero.menu_btn') }}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </RouterLink>
                    <button class="btn-outline" @click.prevent="handleOpenModal">
                        {{ $t('hero.cta') }}
                    </button>
                </div>
                <!-- Mini stats -->
                <div class="hero-stats">
                    <div class="stat-chip">
                        <span class="stat-icon">📦</span>
                        <div class="stat-text">
                            <strong>+500</strong>
                            <span>{{ $t('hero.stat_orders') }}</span>
                        </div>
                    </div>
                    <div class="stat-chip">
                        <span class="stat-icon">🌿</span>
                        <div class="stat-text">
                            <strong>100%</strong>
                            <span>{{ $t('hero.stat_natural') }}</span>
                        </div>
                    </div>
                    <div class="stat-chip">
                        <span class="stat-icon">⭐</span>
                        <div class="stat-text">
                            <strong>4.9</strong>
                            <span>{{ $t('hero.stat_rating') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Marquee />
    </section>
</template>

<style scoped>
.hero {
    background-color: var(--bg-color);
    padding: 60px 0 0;
}

.hero-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
    padding-top: 20px;
    padding-bottom: 60px;
}

/* ── Image Column ─────────────────────────────────────────── */
.hero-image-col { position: relative; }

.hero-image-wrapper {
    position: relative;
    border-radius: var(--border-radius-lg);
    overflow: visible;
}

.hero-img {
    width: 100%;
    height: 480px;
    object-fit: cover;
    border-radius: var(--border-radius-lg);
    box-shadow: 0 20px 60px rgba(44, 32, 12, 0.18);
    display: block;
}

.hero-badge {
    position: absolute;
    bottom: -20px;
    right: -20px;
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 24px rgba(44, 32, 12, 0.12);
}

.badge-icon { font-size: 1.8rem; }

.hero-badge div {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.hero-badge strong {
    font-family: var(--body-font-family);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--primary-color);
}

.hero-badge span {
    font-size: 0.75rem;
    color: var(--text-muted);
}

/* ── Text Column ──────────────────────────────────────────── */
.hero-text-col {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.hero-eyebrow {
    font-family: var(--body-font-family);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent-color);
}

.hero-title {
    font-family: var(--heading-font-family);
    font-size: clamp(2rem, 3.5vw, 3.2rem);
    font-weight: 800;
    line-height: 1.15;
    color: var(--primary-color);
}

.hero-subtitle {
    font-family: var(--body-font-family);
    font-size: 1.05rem;
    color: var(--text-muted);
    line-height: 1.7;
    max-width: 440px;
}

.hero-actions {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
}

/* ── Stats ────────────────────────────────────────────────── */
.hero-stats {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-top: 20px;
    margin-top: 10px;
    flex-wrap: wrap;
}

.stat-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--surface);
    padding: 8px 16px;
    border-radius: var(--border-radius-pill);
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 12px var(--shadow-color);
}

.stat-icon {
    font-size: 1.2rem;
}

.stat-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.stat-text strong {
    font-family: var(--body-font-family);
    font-size: 1rem;
    font-weight: 700;
    color: var(--primary-color);
}

.stat-text span {
    font-size: 0.72rem;
    color: var(--text-muted);
}

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 900px) {
    .hero-inner {
        grid-template-columns: 1fr;
        gap: 40px;
        padding-bottom: 40px;
    }

    .hero-img { height: 320px; }

    .hero-badge {
        bottom: -16px;
        right: 10px;
    }

    .hero-title { font-size: 2rem; }
}

@media (max-width: 600px) {
    .hero { padding: 40px 0 0; }
    .hero-img { height: 250px; }
    .hero-stats { 
        gap: 10px; 
        justify-content: center;
        padding-top: 10px;
    }
    .stat-chip {
        padding: 6px 12px;
    }
    .stat-text strong { font-size: 0.9rem; }
}
</style>
