<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
    <section class="about-section" id="acerca">
        <div class="container about-grid">
            <div class="about-left-col">
                <div class="about-text-content">
                    <h2 class="section-title" v-html="t('brand.title')"></h2>
                    <p>{{ t('brand.description') }}</p>
                </div>
                <!-- Images using empty boxes with src="" as requested -->
                <div class="about-image-wide">
                    <img src="/assets/about_wide.png" alt="Interior Pastelera" class="about-img-placeholder">
                </div>
            </div>

            <div class="about-right-col">
                <div class="about-image-tall">
                    <img src="/assets/about_tall.png" alt="Decoración Artesanal" class="about-img-placeholder">
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.about-section {
    background-color: var(--surface-alt);
    color: var(--text-color);
    padding: 90px 0;
    overflow: hidden;
}

.about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: flex-start;
}

.about-left-col {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 50px;
}

.about-text-content {
    align-self: flex-start;
    max-width: 100%;
}

.about-text-content .section-title {
    margin-bottom: 30px;
    line-height: 1.1;
    font-size: 3.5rem;
    letter-spacing: -1.5px;
    text-align: left;
    font-family: var(--heading-font-family);
    font-weight: 700;
}

.about-text-content p {
    font-size: 1rem;
    color: var(--text-muted);
    line-height: 1.7;
    margin-bottom: 35px;
    max-width: 90%;
}

.about-text-content .btn-primary {
    /* Styles inherited from global unless overridden */
     display: inline-block;
}

.about-image-wide {
    width: 100%;
    height: 280px;
    background-color: var(--border-color);
    margin-top: 100px;
    border-radius: var(--border-radius);
    overflow: hidden;
    position: relative;
    display: block;
}

.about-right-col {
    display: block;
    margin-top: 0;
}

.about-image-tall {
    width: 100%;
    height: 480px;
    background-color: var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    position: relative;
    display: block;
}

.about-img-placeholder {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    opacity: 0; /* Hide broken image icon */
}

@media (max-width: 900px) {
    .about-grid {
        grid-template-columns: 1fr;
        gap: 50px;
    }
    .about-right-col {
        margin-top: 0;
        order: -1;
    }
    .about-image-tall {
        height: 400px;
    }
    .about-text-content .section-title {
        text-align: center;
        font-size: 2.5rem;
    }
    .about-text-content {
        text-align: center;
        align-items: center;
        display: flex;
        flex-direction: column;
    }
    .about-image-wide {
        margin-top: 0;
    }
}
</style>
