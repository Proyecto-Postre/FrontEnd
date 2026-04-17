<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { apiFetch } from '../../../api.js';
import { authStore } from '../../auth/store.js';
import { User, Mail, Phone, MapPin, LogOut, Edit3, X, ShoppingBag } from 'lucide-vue-next';

const { t } = useI18n();
const router = useRouter();

// User state comes reactively from authStore
const user = computed(() => authStore.user);

// Form State
const isEditing = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);

const form = ref({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: ''
});

const orders = ref([]);

const syncFormData = () => {
    const u = authStore.user || {};
    form.value = {
        firstName: u.firstName || '',
        lastName:  u.lastName  || '',
        phone:     u.phone     || '',
        email:     u.email     || u.username || '',
        address:   u.address   || ''
    };
};

onMounted(async () => {
    if (!authStore.isLoggedIn) {
        router.push('/login');
        return;
    }

    try {
        const res = await apiFetch('/api/v1/users/me'); 
        if (res.ok) {
            const freshUser = await res.json();
            authStore.updateUser(freshUser);
        }
    } catch (e) {
        console.warn('[ACCOUNT] Refresh failed:', e);
    } finally {
        isLoading.value = false;
        syncFormData();
    }
});

const toggleEdit = () => {
    if (isEditing.value) syncFormData(); 
    isEditing.value = !isEditing.value;
};

const formatPrice = (p) => `S/ ${(p || 0).toFixed(2)}`;

const saveProfile = async () => {
    if (!form.value.firstName || !form.value.lastName) return;
    isSaving.value = true;
    try {
        const res = await apiFetch(`/api/v1/users/${authStore.user.id}`, {
            method: 'PUT',
            body: JSON.stringify(form.value)
        });
        if (res.ok) {
            const updated = await res.json();
            authStore.updateUser(updated);
            isEditing.value = false;
        }
    } catch (e) {
        console.error('[ACCOUNT] Update error:', e);
    } finally {
        isSaving.value = false;
    }
};

const logout = () => {
    authStore.logout();
    router.push('/');
};
</script>

<template>
    <div class="account-page">
        <div class="account-container container">
            <header class="page-header">
                <div class="header-icon-wrap">
                    <User :size="48" stroke-width="1.5" />
                </div>
                <h1>Mi Cuenta</h1>
                <p class="subtitle">Gestiona tu información personal y pedidos</p>
            </header>

            <div v-if="isLoading" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando tu perfil...</p>
            </div>

            <div v-else class="account-grid">
                <!-- COL 1: PERSONAL DATA -->
                <section class="account-section">
                    <div class="premium-card">
                        <div class="card-title">
                            <div class="title-with-icon">
                                <User :size="20" class="icon-accent" />
                                <h3>Datos Personales</h3>
                            </div>
                            <button v-if="!isEditing" @click="toggleEdit" class="pill-btn btn-outline">
                                <Edit3 :size="16" />
                                Editar
                            </button>
                            <button v-else @click="toggleEdit" class="pill-btn btn-ghost">
                                <X :size="16" />
                                Cancelar
                            </button>
                        </div>

                        <form @submit.prevent="saveProfile" class="modern-form">
                            <div class="form-grid">
                                <div class="field">
                                    <label>Nombre</label>
                                    <input type="text" v-model="form.firstName" :disabled="!isEditing" required>
                                </div>
                                <div class="field">
                                    <label>Apellido</label>
                                    <input type="text" v-model="form.lastName" :disabled="!isEditing" required>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label>Teléfono</label>
                                <div class="input-with-icon">
                                    <Phone :size="18" class="field-icon" />
                                    <input type="tel" v-model="form.phone" :disabled="!isEditing" required placeholder="999-999-999">
                                </div>
                            </div>
                            
                            <div class="field">
                                <label>Email</label>
                                <div class="input-with-icon">
                                    <Mail :size="18" class="field-icon" />
                                    <input type="email" v-model="form.email" disabled class="disabled-input">
                                </div>
                            </div>

                            <div class="field">
                                <label>Dirección de entrega</label>
                                <div class="input-with-icon">
                                    <MapPin :size="18" class="field-icon" />
                                    <input type="text" v-model="form.address" :disabled="!isEditing" placeholder="Tu dirección principal">
                                </div>
                            </div>

                            <button v-if="isEditing" type="submit" class="btn-primary-filled" :disabled="isSaving">
                                {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
                            </button>
                        </form>
                    </div>

                    <div class="logout-section">
                        <button @click="logout" class="logout-link">
                            <LogOut :size="20" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </section>

                <!-- COL 2: ORDER HISTORY -->
                <section class="account-section">
                    <div class="premium-card">
                        <div class="card-title">
                            <div class="title-with-icon">
                                <ShoppingBag :size="20" class="icon-accent" />
                                <h3>Mi Historial</h3>
                            </div>
                        </div>

                        <div v-if="orders.length > 0" class="orders-timeline">
                            <div v-for="order in orders" :key="order.id" class="timeline-item">
                                <div class="timeline-meta">
                                    <span class="date">{{ new Date(order.date || order.timestamp).toLocaleDateString() }}</span>
                                    <span :class="['status-badge', order.status]">{{ order.status }}</span>
                                </div>
                                <div class="order-id">#{{ order.id }}</div>
                                <div class="order-price">{{ formatPrice(order.total) }}</div>
                            </div>
                        </div>
                        <div v-else class="empty-state">
                            <div class="empty-icon"><ShoppingBag :size="48" stroke-width="1.2" /></div>
                            <p>Aún no has realizado pedidos.</p>
                            <RouterLink to="/menu" class="pill-btn btn-outline">Ver Menú Dulce</RouterLink>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
.account-page {
    background-color: #fbf9f6;
    padding: 140px 20px 80px;
    min-height: 100vh;
}

.account-container {
    max-width: 1100px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: 50px;
}

.header-icon-wrap {
    display: inline-flex;
    padding: 24px;
    background: white;
    border-radius: 50%;
    color: #234027;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.page-header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 3rem;
    color: #234027;
    margin-bottom: 12px;
}

.subtitle {
    color: #888;
    font-size: 1.1rem;
}

.account-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 40px;
}

@media (max-width: 900px) {
    .account-grid { grid-template-columns: 1fr; }
}

.premium-card {
    background: white;
    border-radius: 28px;
    padding: 40px;
    border: 1px solid #eee;
    box-shadow: 0 4px 25px rgba(0,0,0,0.03);
}

.card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 35px;
    border-bottom: 1px solid #f5f5f5;
    padding-bottom: 24px;
}

.title-with-icon { display: flex; align-items: center; gap: 14px; }
.card-title h3 { font-family: 'Playfair Display', serif; font-size: 1.4rem; color: #234027; margin: 0; }
.icon-accent { color: #234027; }

.pill-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: 0.3s;
}

.btn-outline { background: transparent; border: 1.5px solid #234027; color: #234027; }
.btn-outline:hover { background: #234027; color: white; }

.btn-ghost { background: transparent; border: none; color: #999; }

.btn-primary-filled {
    background: #234027; color: white; border: none; padding: 16px;
    border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.3s;
    width: 100%; margin-top: 20px;
}
.btn-primary-filled:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(35, 64, 39, 0.2); }
.btn-primary-filled:disabled { opacity: 0.6; cursor: wait; }

.modern-form { display: flex; flex-direction: column; gap: 24px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

.field { display: flex; flex-direction: column; gap: 10px; }
.field label { font-size: 0.75rem; font-weight: 800; color: #aaa; text-transform: uppercase; letter-spacing: 1px; }

.input-with-icon { position: relative; }
.field-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #ccc; }
.input-with-icon input { padding-left: 48px !important; }

.field input {
    width: 100%; padding: 14px 18px; border: 1.5px solid #eee; border-radius: 12px;
    font-family: inherit; transition: 0.3s; font-size: 0.95rem;
}
.field input:focus { border-color: #234027; outline: none; background: #fff; }
.disabled-input { background: #f9f9f9; color: #999; cursor: not-allowed; border-color: #f0f0f0; }

.orders-timeline { display: flex; flex-direction: column; gap: 20px; }
.timeline-item { position: relative; padding-left: 24px; border-left: 2px solid #f0f0f0; }
.timeline-item::before { content: ''; position: absolute; left: -7px; top: 0; width: 12px; height: 12px; border-radius: 50%; background: #234027; border: 2px solid white; }

.timeline-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.date { font-size: 0.8rem; font-weight: 600; color: #999; }
.status-badge { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; }
.status-badge.atendido { background: #e6fffa; color: #2c7a7b; }
.status-badge.pendiente { background: #fffaf0; color: #b7791f; }

.order-id { font-weight: 700; color: #234027; margin-bottom: 2px; }
.order-price { color: #234027; font-weight: 800; font-size: 1.1rem; }

.logout-section { margin-top: 30px; text-align: center; }
.logout-link { background: none; border: none; color: #c53030; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; cursor: pointer; padding: 12px 24px; border-radius: 50px; transition: 0.3s; }
.logout-link:hover { background: #fff5f5; }

.loading-state { text-align: center; padding: 100px 0; }
.spinner { width: 40px; height: 40px; border: 4px solid #eee; border-top-color: #234027; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { text-align: center; padding: 40px 0; }
.empty-icon { font-size: 3.5rem; margin-bottom: 20px; }
</style>
