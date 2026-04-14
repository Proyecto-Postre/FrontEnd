<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const activeTab = ref('catering'); // 'catering' | 'workshops'

// State for Catering Form
const form = ref({
    date: '',
    guests: '',
    type: 'Boda', // Initial Value
    customType: '', // For 'Otro' specification
    message: ''
});

// Mock Data for Workshops (Ideally this comes from DB too, but for speed we keep static or minimal translation)
// For fully dynamic i18n on mock data, we could use keys, but let's assume specific Workshops are in Spanish for now 
// OR we can make a titleKey. Given user request "absolutely everything", I should try.
const workshops = [
    {
        id: 1,
        title: "Masterclass: Decoración de Tortas",
        date: "20 Diciembre, 2024",
        time: "10:00 AM - 2:00 PM",
        price: "S/ 150.00",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Aprende técnicas avanzadas de alisado, bordes perfectos y uso de boquillas."
    },
    {
        id: 2,
        title: "Taller de Barismo en Casa",
        date: "28 Diciembre, 2024",
        time: "4:00 PM - 7:00 PM",
        price: "S/ 80.00",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Descubre cómo preparar el café perfecto sin máquinas costosas."
    }
];

// Actions
const sendCateringRequest = () => {
    const text = `Hola Dulce Fé! 🥂 Quisiera cotizar un evento:
📅 ${t('services.date')}: ${form.value.date}
👥 ${t('services.guests')}: ${form.value.guests}
🎉 ${t('services.type')}: ${form.value.type === 'Otro' ? form.value.customType : form.value.type}
💬 ${t('services.details')}: ${form.value.message || 'Sin detalles adicionales'}`;
    
    window.open(`https://wa.me/51998265700?text=${encodeURIComponent(text)}`, '_blank');
};

const joinWorkshop = (workshop) => {
    const text = `Hola! Quiero inscribirme al taller (Workshop): *${workshop.title}* del ${workshop.date}.`;
    window.open(`https://wa.me/51998265700?text=${encodeURIComponent(text)}`, '_blank');
};
</script>

<template>
    <div class="services-page">
        <!-- Artisan Page Header -->
        <div class="page-header">
            <div class="container page-header-inner">
                <p class="page-eyebrow">✦ Dulce Fe ✦</p>
                <h1 class="page-title">{{ t('services.hero_title') }}</h1>
                <p class="page-subtitle">{{ t('services.hero_sub') }}</p>
                <div class="page-divider"></div>
            </div>
        </div>

        <div class="container main-content">
            
            <!-- TABS NAVIGATION -->
             <div class="tabs-container">
                <button 
                    class="tab-btn" 
                    :class="{ active: activeTab === 'catering' }"
                    @click="activeTab = 'catering'"
                >
                    {{ t('services.tab_catering') }}
                </button>
                <button 
                    class="tab-btn" 
                    :class="{ active: activeTab === 'workshops' }"
                    @click="activeTab = 'workshops'"
                >
                    {{ t('services.tab_workshops') }}
                </button>
            </div>

            <!-- SECCIÓN 1: CATERING & EVENTOS -->
            <transition name="fade" mode="out-in">
                <div v-if="activeTab === 'catering'" key="catering" class="section-block catering-section">
                    <div class="text-side">
                        <h2>{{ t('services.catering_title') }}</h2>
                        <p class="subtitle">{{ t('services.catering_sub') }}</p>
                        <ul class="features-list">
                            <li>{{ t('services.feat_1') }}</li>
                            <li>{{ t('services.feat_2') }}</li>
                            <li>{{ t('services.feat_3') }}</li>
                        </ul>
                    </div>
                    
                    <div class="form-side">
                        <div class="glass-form">
                            <h3>{{ t('services.form_title') }}</h3>
                            <form @submit.prevent="sendCateringRequest">
                                <div class="form-group">
                                    <label>{{ t('services.date') }}</label>
                                    <input type="date" v-model="form.date" required>
                                </div>
                                <div class="form-group">
                                    <label>{{ t('services.guests') }}</label>
                                    <input type="number" v-model="form.guests" placeholder="50" required>
                                </div>
                                <div class="form-group">
                                    <label>{{ t('services.type') }}</label>
                                    <select v-model="form.type">
                                        <option value="Boda">{{ t('services.types.wedding') }}</option>
                                        <option value="Cumpleaños">{{ t('services.types.birthday') }}</option>
                                        <option value="Corporativo">{{ t('services.types.corporate') }}</option>
                                        <option value="Otro">{{ t('services.types.other') }}</option>
                                    </select>
                                </div>
                                <div v-if="form.type === 'Otro'" class="form-group fade-in">
                                    <label>{{ t('services.other_type') }}</label>
                                    <input type="text" v-model="form.customType" :placeholder="t('services.ph_other')" required>
                                </div>
                                <div class="form-group">
                                    <label>{{ t('services.details') }}</label>
                                    <textarea v-model="form.message" rows="3" :placeholder="t('services.ph_details')"></textarea>
                                </div>
                                <button type="submit" class="btn-submit">{{ t('services.btn_submit') }}</button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 2: TALLERES (WORKSHOPS) -->
                <div v-else key="workshops" class="section-block workshops-section">
                    <div class="section-header">
                        <h2>{{ t('services.workshops_title') }}</h2>
                        <p>{{ t('services.workshops_sub') }}</p>
                    </div>

                    <div class="workshops-grid">
                        <div v-for="workshop in workshops" :key="workshop.id" class="workshop-card">
                            <div class="card-img" :style="{ backgroundImage: `url(${workshop.image})` }"></div>
                            <div class="card-info">
                                <div class="date-badge">{{ workshop.date }}</div>
                                <h3>{{ workshop.title }}</h3>
                                <p class="desc">{{ workshop.description }}</p>
                                <div class="meta">
                                    <span>🕒 {{ workshop.time }}</span>
                                    <span class="price-highlight">{{ workshop.price }}</span>
                                </div>
                                <button class="btn-join" @click="joinWorkshop(workshop)">
                                    {{ t('services.btn_join') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>

        </div>
    </div>
</template>

<style scoped>
.services-page {
    background-color: var(--bg-color);
    min-height: 100vh;
}

/* HERO */
/* ── Page Header ──────────────────────────────────────── */
.page-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    padding: 48px 0 44px;
    text-align: center;
    position: relative;
    overflow: hidden;
    border-bottom: 3px solid var(--accent-color);
    margin-bottom: 0;
}

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

/* TABS */
.tabs-container {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin: 36px 0 40px;
}

.tab-btn {
    background: transparent;
    border: 2px solid var(--primary-color);
    color: var(--primary-color);
    padding: 11px 28px;
    border-radius: var(--border-radius-pill);
    font-size: 0.95rem;
    font-family: var(--body-font-family);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
}

.tab-btn.active {
    background: var(--primary-color);
    color: var(--white);
    box-shadow: 0 5px 15px rgba(44, 85, 48, 0.2);
}

.tab-btn:hover:not(.active) {
    background: rgba(44, 85, 48, 0.08);
}

.main-content {
    padding-bottom: 80px;
}

/* ANIMATION */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* SECTIONS */
.section-block {
    margin-bottom: 0; /* Handled by container padding */
}

/* CATERING */
.catering-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}

.text-side h2 {
    font-size: 3rem;
    color: var(--primary-color);
    margin-bottom: 15px;
    font-family: var(--heading-font-family);
}

.subtitle {
    font-size: 1.2rem;
    color: var(--text-color);
    margin-bottom: 30px;
    opacity: 0.8;
}

.features-list {
    list-style: none;
    padding: 0;
}

.features-list li {
    font-size: 1.2rem;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    color: var(--text-color);
}

/* GLASS FORM */
.glass-form {
    background: var(--surface);
    padding: 36px;
    border-radius: var(--border-radius-lg);
    box-shadow: 0 8px 32px var(--shadow-color);
    border: 1px solid var(--border-color);
}

.glass-form h3 {
    text-align: center;
    margin-bottom: 25px;
    color: var(--primary-color);
    font-family: var(--heading-font-family);
    font-size: 1.6rem;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-color);
}

.form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid var(--border-color);
    background: var(--bg-color);
    border-radius: var(--border-radius);
    font-family: var(--body-font-family);
    font-size: 0.95rem;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
    color: var(--text-color);
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    border-color: var(--primary-color);
    background: var(--surface);
    outline: none;
    box-shadow: 0 0 0 3px rgba(44, 85, 48, 0.1);
}

.btn-submit {
    width: 100%;
    background: var(--primary-color);
    color: var(--white);
    padding: 14px;
    border: none;
    border-radius: var(--border-radius-pill);
    font-weight: 700;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 10px;
    transition: background-color 0.25s ease, transform 0.2s ease;
    box-shadow: 0 5px 15px rgba(44, 85, 48, 0.2);
}

.btn-submit:hover {
    transform: translateY(-2px);
    background-color: var(--primary-dark);
}

/* WORKSHOPS */
.workshops-section .section-header {
    text-align: center;
    margin-bottom: 50px;
}

.workshops-section h2 {
    font-size: 3rem;
    color: var(--primary-color);
    margin-bottom: 10px;
}
.workshops-section p {
    font-size: 1.2rem;
    color: var(--text-color);
}

.workshops-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 40px;
}

.workshop-card {
    background: var(--surface);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    box-shadow: 0 4px 20px var(--shadow-color);
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid var(--border-color);
}

.workshop-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(44, 85, 48, 0.14);
}

.card-img {
    height: 220px;
    background-size: cover;
    background-position: center;
}

.card-info {
    padding: 30px;
}

.date-badge {
    display: inline-block;
    background: rgba(44, 85, 48, 0.08);
    color: var(--primary-color);
    padding: 5px 12px;
    border-radius: var(--border-radius-pill);
    font-size: 0.82rem;
    font-weight: 700;
    margin-bottom: 14px;
}

.card-info h3 {
    margin-bottom: 10px;
    font-size: 1.4rem;
    color: var(--text-color);
}

.card-info .desc {
    color: #666;
    margin-bottom: 20px;
    font-size: 1rem;
    line-height: 1.6;
}

.meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    font-size: 0.95rem;
    color: #555;
    font-weight: 600;
}

.price-highlight {
    color: var(--accent-color);
    font-size: 1.2rem;
    font-weight: 800;
}

.btn-join {
    width: 100%;
    padding: 12px;
    border: 2px solid var(--primary-color);
    background: transparent;
    border-radius: var(--border-radius-pill);
    font-weight: 600;
    color: var(--primary-color);
    cursor: pointer;
    transition: all 0.25s;
    font-size: 0.95rem;
    font-family: var(--body-font-family);
}

.btn-join:hover {
    background: var(--primary-color);
    color: var(--white);
}

/* RESPONSIVE */
@media (max-width: 900px) {
    .catering-section {
        grid-template-columns: 1fr;
        gap: 40px;
    }
    .hero-content h1 {
        font-size: 2.2rem;
    }
    .services-hero {
        border-radius: 0 0 30px 30px;
        height: 280px;
    }
    .tabs-container {
        flex-direction: column;
        padding: 0 20px;
    }
    .main-content {
        padding-left: 15px;
        padding-right: 15px;
    }
}
</style>
