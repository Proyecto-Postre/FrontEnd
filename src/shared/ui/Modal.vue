<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    isOpen: Boolean,
    type: String
});

const emit = defineEmits(['close']);
const { t } = useI18n();

const modalData = computed(() => ({
    hero: {
        title: t('modal.hero_title'),
        eyebrow: 'Nuestra Filosofía',
        content: `
            <p>${t('modal.hero_content_1')}</p>
            <p>${t('modal.hero_content_2')}</p>
        `,
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    about: {
        title: t('modal.about_title'),
        eyebrow: 'Nuestra Historia',
        content: `
            <p>${t('modal.about_content_1')}</p>
            <p>${t('modal.about_content_2')}</p>
        `,
        image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
}));

const currentContent = computed(() => modalData.value[props.type] || {});

const close = () => emit('close');

const handleKeydown = (e) => {
    if (e.key === 'Escape' && props.isOpen) close();
};

watch(() => props.isOpen, (val) => {
    document.body.style.overflow = val ? 'hidden' : '';
});

onMounted(() => document.addEventListener('keydown', handleKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
</script>

<template>
    <div class="modal-overlay" :class="{ active: isOpen }" @click.self="close">
        <div class="modal-content">
            <!-- Close Button -->
            <button class="close-btn" @click="close" aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>

            <div class="modal-grid">
                <!-- Image Column -->
                <div class="modal-image-col">
                    <img
                        :src="currentContent.image"
                        :alt="currentContent.title"
                        class="modal-img"
                    />
                    <!-- Decorative overlay with leaf motif -->
                    <div class="modal-img-overlay">
                        <span class="modal-leaf">🌿</span>
                    </div>
                </div>

                <!-- Text Column -->
                <div class="modal-text-col">
                    <p class="modal-eyebrow">✦ {{ currentContent.eyebrow }} ✦</p>
                    <h3 class="modal-title">{{ currentContent.title }}</h3>
                    <div class="modal-divider"></div>
                    <div class="modal-body" v-html="currentContent.content"></div>
                    <button class="modal-cta" @click="close">Entendido</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────── */
.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(26, 20, 12, 0.72);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.35s ease, visibility 0.35s ease;
    padding: 20px;
}

.modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

/* ── Modal Card ──────────────────────────────────────────── */
.modal-content {
    background-color: var(--surface-alt);
    width: 100%;
    max-width: 860px;
    border-radius: var(--border-radius-lg);
    position: relative;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(26, 20, 12, 0.35);
    transform: translateY(28px) scale(0.97);
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-overlay.active .modal-content {
    transform: translateY(0) scale(1);
}

/* ── Close Button ────────────────────────────────────────── */
.close-btn {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 36px;
    height: 36px;
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    cursor: pointer;
    z-index: 10;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.close-btn:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

/* ── Grid Layout ─────────────────────────────────────────── */
.modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 420px;
}

/* ── Image Column ────────────────────────────────────────── */
.modal-image-col {
    position: relative;
    overflow: hidden;
}

.modal-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 6s ease;
}

.modal-overlay.active .modal-img {
    transform: scale(1.04);
}

.modal-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
        135deg,
        rgba(44, 85, 48, 0.55) 0%,
        rgba(26, 20, 12, 0.2) 100%
    );
    display: flex;
    align-items: flex-end;
    padding: 24px;
}

.modal-leaf {
    font-size: 2.4rem;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
}

/* ── Text Column ─────────────────────────────────────────── */
.modal-text-col {
    padding: 52px 44px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
}

.modal-eyebrow {
    font-family: var(--body-font-family);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent-color);
}

.modal-title {
    font-family: var(--heading-font-family);
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1.15;
}

.modal-divider {
    width: 40px;
    height: 3px;
    background-color: var(--accent-color);
    border-radius: 2px;
}

.modal-body {
    flex: 1;
}

.modal-body :deep(p) {
    font-family: var(--body-font-family);
    font-size: 0.97rem;
    line-height: 1.75;
    color: var(--text-muted);
    margin-bottom: 14px;
}

.modal-cta {
    align-self: flex-start;
    padding: 11px 28px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--border-radius-pill);
    font-family: var(--body-font-family);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.25s ease, transform 0.2s ease;
}

.modal-cta:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 680px) {
    .modal-grid {
        grid-template-columns: 1fr;
    }
    .modal-image-col {
        height: 220px;
    }
    .modal-text-col {
        padding: 36px 28px;
        gap: 14px;
    }
    .modal-title {
        font-size: 1.7rem;
    }
}
</style>
