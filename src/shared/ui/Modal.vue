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
        content: `
            <p>${t('modal.hero_content_1')}</p>
            <p>${t('modal.hero_content_2')}</p>
        `,
        imageColor: "#e6c9b8"
    },
    about: {
        title: t('modal.about_title'),
        content: `
            <p>${t('modal.about_content_1')}</p>
            <p>${t('modal.about_content_2')}</p>
        `,
        imageColor: "#dcdcdc"
    }
}));

const currentContent = computed(() => modalData.value[props.type] || {});

const close = () => {
    emit('close');
};

// Handle Escape Key
const handleKeydown = (e) => {
    if (e.key === 'Escape' && props.isOpen) {
        close();
    }
};

// Handle Body Scroll Lock
watch(() => props.isOpen, (val) => {
    if (val) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

onMounted(() => document.addEventListener('keydown', handleKeydown));
onUnmounted(() => document.removeEventListener('keydown', handleKeydown));
</script>

<template>
    <div class="modal-overlay" :class="{ active: isOpen }" @click.self="close">
        <div class="modal-content">
            <button class="close-modal" @click="close">&times;</button>
            <div class="modal-grid">
                <div class="modal-image-col">
                    <div class="modal-img-placeholder" :style="{ backgroundColor: currentContent.imageColor || '#dcdcdc' }"></div>
                    <!-- Using placeholder or could inject img via data -->
                </div>
                <div class="modal-text-col">
                    <h3>{{ currentContent.title }}</h3>
                    <div v-html="currentContent.content"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    padding: 20px;
}

.modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

.modal-content {
    background-color: #EBE9E4;
    width: 100%;
    max-width: 900px;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    transform: translateY(20px);
    transition: transform 0.4s ease;
}

.modal-overlay.active .modal-content {
    transform: translateY(0);
}

.close-modal {
    position: absolute;
    top: 20px;
    right: 25px;
    background: transparent;
    border: none;
    font-size: 2rem;
    color: #1a1a1a;
    cursor: pointer;
    z-index: 10;
    transition: color 0.3s ease;
}

.close-modal:hover {
    color: #D99578;
}

.modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
}

.modal-image-col {
    height: 500px;
    background-color: #dcdcdc;
    position: relative;
}

.modal-img-placeholder {
    width: 100%;
    height: 100%;
    background-color: #ccc;
    display: block;
}

.modal-text-col {
    padding: 60px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

/* Deep selector for v-html content if needed, but styling is generic usually */
/* Using :deep() to style injected HTML if needed */
.modal-text-col :deep(h3) {
    font-family: var(--heading-font-family);
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    color: #1a1a1a;
}
.modal-text-col h3 {
     font-family: var(--heading-font-family);
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    color: #1a1a1a;
}

.modal-text-col :deep(p) {
    font-size: 1rem;
    line-height: 1.6;
    color: #4a4a4a;
    margin-bottom: 15px;
}

@media (max-width: 768px) {
    .modal-grid {
        grid-template-columns: 1fr;
    }
    .modal-image-col {
        height: 250px;
    }
    .modal-text-col {
        padding: 40px 25px;
    }
    .modal-text-col h3, .modal-text-col :deep(h3) {
        font-size: 1.8rem;
    }
}
</style>
